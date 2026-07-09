/**
 * src/utils/storage.js
 * ─────────────────────────────────────────────────────────────────────────────
 * LifeTracker — API для роботи з даними (SQLite).
 *
 * Колекції:
 *   'calories'   → таблиця calories
 *   'weight'     → таблиця weight_log
 *   'tasks'      → таблиця tasks
 *   'notes'      → таблиця notes
 */

import { run, query } from './db'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function getCurrentUser() {
  return localStorage.getItem('lifetracker_session')
}

export function setCurrentUser(id) {
  if (id) {
    localStorage.setItem('lifetracker_session', id)
  } else {
    localStorage.removeItem('lifetracker_session')
  }
}

export async function loginUser(username, password) {
  const hash = await hashPassword(password)
  const rows = query('SELECT id FROM users WHERE username = ? AND password_hash = ?', [username, hash])
  if (rows.length > 0) {
    setCurrentUser(rows[0].id)
    return { ok: true }
  }
  return { ok: false, message: 'Invalid username or password' }
}

export async function registerUser(username, password) {
  const exists = query('SELECT id FROM users WHERE username = ?', [username])
  if (exists.length > 0) {
    return { ok: false, message: 'Username already exists' }
  }

  const hash = await hashPassword(password)
  const userId = uid()
  
  // Перевіряємо, чи це перший користувач
  const userCount = query('SELECT COUNT(*) as c FROM users')[0]?.c ?? 0
  
  run('INSERT INTO users (id, username, password_hash) VALUES (?,?,?)', [userId, username, hash])
  
  if (userCount === 0) {
    // Міграція існуючих даних на першого користувача
    const tables = ['calories', 'weight_log', 'tasks', 'notes', 'habit_defs', 'habit_log', 'settings', 'activity_log', 'workouts']
    for (const table of tables) {
      // Ігноруємо помилки якщо таблиця чомусь не існує або не має user_id
      try {
        run(`UPDATE ${table} SET user_id = ? WHERE user_id = 'default' OR user_id IS NULL`, [userId])
      } catch(e) {}
    }
  }
  
  setCurrentUser(userId)
  return { ok: true }
}

export function logoutUser() {
  setCurrentUser(null)
}

// ─── CRUD Config ──────────────────────────────────────────────────────────────

const TABLE = {
  calories: 'calories',
  weight:   'weight_log',
  tasks:    'tasks',
  notes:    'notes',
}

const SELECT_COLS = {
  calories:   'id, date, name, calories, protein, fat, carbs, photo',
  weight_log: 'id, date, weight',
  tasks:      'id, date, title, completed',
  notes:      'id, date, content',
}

function normalizeRow(collection, row) {
  if (collection === 'tasks') {
    return { ...row, completed: row.completed === 1 }
  }
  return row
}

// ─── Auto Workouts ────────────────────────────────────────────────────────────

const WORKOUT_KEYWORDS = ['run', 'gym', 'workout', 'тренировка', 'пробежка', 'зарядка', 'фітнес', 'тренування']

function detectWorkout(text, date, sourceId) {
  if (!text) return
  const lower = text.toLowerCase()
  const matched = WORKOUT_KEYWORDS.some(kw => lower.includes(kw))
  if (matched) {
    const userId = getCurrentUser()
    if (!userId) return
    // Перевіряємо чи вже є тренування з цього джерела
    const exists = query('SELECT id FROM workouts WHERE source_id = ?', [sourceId])
    if (exists.length === 0) {
      run('INSERT INTO workouts (id, date, title, calories_burned, source_id, user_id) VALUES (?,?,?,?,?,?)', 
        [uid(), date, text.substring(0, 50), 300, sourceId, userId]) // 300 kcal як дефолт
    } else {
      run('UPDATE workouts SET title = ?, date = ? WHERE source_id = ?', [text.substring(0, 50), date, sourceId])
    }
  }
}

function removeWorkoutBySource(sourceId) {
  run('DELETE FROM workouts WHERE source_id = ?', [sourceId])
}


// ─── Загальні CRUD ────────────────────────────────────────────────────────────

export async function getEntries(collection, filterFn = null) {
  const userId = getCurrentUser()
  const table = TABLE[collection]
  if (!table) throw new Error(`[Storage] Невідома колекція: ${collection}`)
  const cols = SELECT_COLS[table] ?? '*'
  const rows = query(`SELECT ${cols} FROM ${table} WHERE user_id = ? ORDER BY date DESC`, [userId])
  const normalized = rows.map(r => normalizeRow(collection, r))
  return filterFn ? normalized.filter(filterFn) : normalized
}

export async function addEntry(collection, entry) {
  const userId = getCurrentUser()
  const newEntry = { id: uid(), date: todayStr(), ...entry }

  switch (collection) {
    case 'calories':
      run(
        `INSERT INTO calories (id, date, name, calories, protein, fat, carbs, photo, user_id) VALUES (?,?,?,?,?,?,?,?,?)`,
        [newEntry.id, newEntry.date, newEntry.name ?? '', Number(newEntry.calories) || 0, Number(newEntry.protein) || 0, Number(newEntry.fat) || 0, Number(newEntry.carbs) || 0, newEntry.photo ?? null, userId]
      )
      break
    case 'weight':
      run(
        `INSERT OR REPLACE INTO weight_log (id, date, weight, user_id) VALUES (?,?,?,?)`,
        [newEntry.id, newEntry.date, Number(newEntry.weight ?? newEntry.val) || 0, userId]
      )
      break
    case 'tasks':
      run(
        `INSERT INTO tasks (id, date, title, completed, user_id) VALUES (?,?,?,?,?)`,
        [newEntry.id, newEntry.date, newEntry.title ?? '', newEntry.completed ? 1 : 0, userId]
      )
      detectWorkout(newEntry.title, newEntry.date, newEntry.id)
      break
    case 'notes':
      run(
        `INSERT INTO notes (id, date, content, user_id) VALUES (?,?,?,?)`,
        [newEntry.id, newEntry.date, newEntry.content ?? '', userId]
      )
      detectWorkout(newEntry.content, newEntry.date, newEntry.id)
      break
    default:
      throw new Error(`[Storage] addEntry: невідома колекція "${collection}"`)
  }

  return newEntry
}

export async function updateEntry(collection, id, updates) {
  const userId = getCurrentUser()
  switch (collection) {
    case 'calories': {
      const fields = [], vals = []
      const allowed = ['name', 'calories', 'protein', 'fat', 'carbs', 'photo', 'date']
      for (const [k, v] of Object.entries(updates)) {
        if (allowed.includes(k)) { fields.push(`${k} = ?`); vals.push(v) }
      }
      if (!fields.length) return null
      vals.push(id, userId)
      run(`UPDATE calories SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, vals)
      break
    }
    case 'weight': {
      if (updates.weight !== undefined || updates.val !== undefined) {
        run(`UPDATE weight_log SET weight = ? WHERE id = ? AND user_id = ?`, [Number(updates.weight ?? updates.val), id, userId])
      }
      break
    }
    case 'tasks': {
      const fields = [], vals = []
      if (updates.title !== undefined) { fields.push('title = ?'); vals.push(updates.title) }
      if (updates.completed !== undefined) { fields.push('completed = ?'); vals.push(updates.completed ? 1 : 0) }
      if (updates.date !== undefined) { fields.push('date = ?'); vals.push(updates.date) }
      if (!fields.length) return null
      vals.push(id, userId)
      run(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, vals)
      
      const rows = query('SELECT title, date FROM tasks WHERE id = ?', [id])
      if (rows.length) {
        detectWorkout(rows[0].title, rows[0].date, id)
      }
      break
    }
    case 'notes': {
      const fields = [], vals = []
      if (updates.content !== undefined) { fields.push('content = ?'); vals.push(updates.content) }
      if (updates.date !== undefined) { fields.push('date = ?'); vals.push(updates.date) }
      if (!fields.length) return null
      vals.push(id, userId)
      run(`UPDATE notes SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, vals)
      
      const rows = query('SELECT content, date FROM notes WHERE id = ?', [id])
      if (rows.length) {
        detectWorkout(rows[0].content, rows[0].date, id)
      }
      break
    }
    default:
      throw new Error(`[Storage] updateEntry: невідома колекція "${collection}"`)
  }

  const table = TABLE[collection]
  const cols  = SELECT_COLS[table] ?? '*'
  const rows  = query(`SELECT ${cols} FROM ${table} WHERE id = ? AND user_id = ?`, [id, userId])
  return rows.length ? normalizeRow(collection, rows[0]) : null
}

export async function deleteEntry(collection, id) {
  const userId = getCurrentUser()
  const table = TABLE[collection]
  if (!table) throw new Error(`[Storage] deleteEntry: невідома колекція "${collection}"`)
  run(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`, [id, userId])
  if (collection === 'tasks' || collection === 'notes') {
    removeWorkoutBySource(id)
  }
  return true
}


// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings() {
  const userId = getCurrentUser()
  if (!userId) return { theme: 'dark', geminiKey: '', goals: { calories: 2200, protein: 120, fat: 70, carbs: 250 } }
  const rows = query('SELECT key, value FROM settings WHERE user_id = ?', [userId])
  const map  = Object.fromEntries(rows.map(r => [r.key, r.value]))
  return {
    theme:     map.theme     ?? 'dark',
    geminiKey: map.geminiKey ?? '',
    goals: (() => {
      try   { return JSON.parse(map.goals) }
      catch { return { calories: 2200, protein: 120, fat: 70, carbs: 250 } }
    })(),
  }
}

export async function updateSettings(patch) {
  const userId = getCurrentUser()
  if (!userId) return getSettings()
  if (patch.theme !== undefined) {
    run(`INSERT OR REPLACE INTO settings (key, value, user_id) VALUES ('theme', ?, ?)`, [patch.theme, userId])
  }
  if (patch.geminiKey !== undefined) {
    run(`INSERT OR REPLACE INTO settings (key, value, user_id) VALUES ('geminiKey', ?, ?)`, [patch.geminiKey, userId])
  }
  if (patch.goals !== undefined) {
    const cur = await getSettings()
    const merged = { ...cur.goals, ...patch.goals }
    run(`INSERT OR REPLACE INTO settings (key, value, user_id) VALUES ('goals', ?, ?)`, [JSON.stringify(merged), userId])
  }
  return getSettings()
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export async function getHabitDefs() {
  const userId = getCurrentUser()
  return query('SELECT id, name, target_per_week as targetPerWeek FROM habit_defs WHERE user_id = ? OR user_id = "default"', [userId])
}

export async function getHabitLog(fromDate = null) {
  const userId = getCurrentUser()
  if (fromDate) {
    return query(`SELECT id, date, habit_id as habitId FROM habit_log WHERE date >= ? AND user_id = ? ORDER BY date DESC`, [fromDate, userId])
  }
  return query('SELECT id, date, habit_id as habitId FROM habit_log WHERE user_id = ? ORDER BY date DESC', [userId])
}

export async function toggleHabit(habitId, done) {
  const userId = getCurrentUser()
  const today = todayStr()
  if (done) {
    const exists = query('SELECT id FROM habit_log WHERE date = ? AND habit_id = ? AND user_id = ?', [today, habitId, userId])
    if (!exists.length) {
      run('INSERT INTO habit_log (id, date, habit_id, user_id) VALUES (?,?,?,?)', [uid(), today, habitId, userId])
    }
  } else {
    run('DELETE FROM habit_log WHERE date = ? AND habit_id = ? AND user_id = ?', [today, habitId, userId])
  }
}

// ─── Аналітика ───────────────────────────────────────────────────────────────

export async function getCaloriesByDate(date) {
  const userId = getCurrentUser()
  return query('SELECT id, date, name, calories, protein, fat, carbs, photo FROM calories WHERE date = ? AND user_id = ? ORDER BY rowid ASC', [date, userId])
}

export async function getDayTotals(date) {
  const userId = getCurrentUser()
  const rows = query(
    `SELECT
       COALESCE(SUM(calories),0) as calories,
       COALESCE(SUM(protein),0)  as protein,
       COALESCE(SUM(fat),0)      as fat,
       COALESCE(SUM(carbs),0)    as carbs
     FROM calories WHERE date = ? AND user_id = ?`,
    [date, userId]
  )
  return rows[0] ?? { calories: 0, protein: 0, fat: 0, carbs: 0 }
}

export async function computeStreak() {
  const userId = getCurrentUser()
  const rows = query('SELECT DISTINCT date FROM calories WHERE user_id = ? ORDER BY date DESC', [userId])
  const days = new Set(rows.map(r => r.date))
  let streak = 0
  const d = new Date()
  while (true) {
    const ds = d.toISOString().slice(0, 10)
    if (days.has(ds)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

// ─── Activity & Workouts ─────────────────────────────────────────────────────

export async function getActivityLog(date = null) {
  const userId = getCurrentUser()
  if (date) {
    const rows = query('SELECT * FROM activity_log WHERE date = ? AND user_id = ?', [date, userId])
    return rows[0] ?? { steps: 0, distance: 0, running_distance: 0 }
  }
  return query('SELECT * FROM activity_log WHERE user_id = ? ORDER BY date DESC', [userId])
}

export async function logActivity(date, steps, distance, runningDistance) {
  const userId = getCurrentUser()
  const exists = query('SELECT id FROM activity_log WHERE date = ? AND user_id = ?', [date, userId])
  if (exists.length) {
    run('UPDATE activity_log SET steps = ?, distance = ?, running_distance = ? WHERE id = ?', 
      [steps, distance, runningDistance, exists[0].id])
  } else {
    run('INSERT INTO activity_log (id, date, steps, distance, running_distance, user_id) VALUES (?,?,?,?,?,?)', 
      [uid(), date, steps, distance, runningDistance, userId])
  }
}

export async function getWorkouts(fromDate = null) {
  const userId = getCurrentUser()
  if (fromDate) {
    return query('SELECT * FROM workouts WHERE date >= ? AND user_id = ? ORDER BY date DESC', [fromDate, userId])
  }
  return query('SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC', [userId])
}

// ─── Експорт / Імпорт ────────────────────────────────────────────────────────

async function dumpAll() {
  const userId = getCurrentUser()
  const habitDefsRaw = await getHabitDefs()
  const habitLogRaw  = await getHabitLog()
  const settings     = await getSettings()
  return {
    calories: query('SELECT * FROM calories WHERE user_id = ? ORDER BY date ASC', [userId]),
    weight:   query('SELECT id, date, weight FROM weight_log WHERE user_id = ? ORDER BY date ASC', [userId]),
    tasks:    query('SELECT id, date, title, completed FROM tasks WHERE user_id = ? ORDER BY date ASC', [userId])
              .map(r => ({ ...r, completed: r.completed === 1 })),
    notes:    query('SELECT * FROM notes WHERE user_id = ? ORDER BY date ASC', [userId]),
    activity: query('SELECT * FROM activity_log WHERE user_id = ? ORDER BY date ASC', [userId]),
    workouts: query('SELECT * FROM workouts WHERE user_id = ? ORDER BY date ASC', [userId]),
    habits: { defs: habitDefsRaw, log: habitLogRaw },
    settings,
  }
}

export async function exportData() {
  try {
    const data   = await dumpAll()
    const json   = JSON.stringify(data, null, 2)
    const blob   = new Blob([json], { type: 'application/json' })
    const url    = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href     = url
    anchor.download = 'lifetracker-backup.json'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
    return true
  } catch (err) {
    console.error('[Storage] exportData failed:', err)
    return false
  }
}

const REQUIRED_FIELDS = ['calories', 'weight', 'tasks', 'notes', 'habits', 'settings']

export async function importData(file) {
  if (!file || file.type !== 'application/json') {
    return { ok: false, message: 'Файл повинен бути у форматі JSON (.json).' }
  }

  const userId = getCurrentUser()
  if (!userId) return { ok: false, message: 'Not logged in' }

  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result)
        const hasAll = REQUIRED_FIELDS.every(f => Object.hasOwn(parsed, f))
        if (!hasAll) throw new Error('Невірний формат бекапу (відсутні необхідні поля).')

        // Clear current user's data
        run('DELETE FROM calories WHERE user_id = ?', [userId])
        run('DELETE FROM weight_log WHERE user_id = ?', [userId])
        run('DELETE FROM tasks WHERE user_id = ?', [userId])
        run('DELETE FROM notes WHERE user_id = ?', [userId])
        run('DELETE FROM habit_log WHERE user_id = ?', [userId])
        run('DELETE FROM activity_log WHERE user_id = ?', [userId])
        run('DELETE FROM workouts WHERE user_id = ?', [userId])

        // Insert new data
        parsed.calories.forEach(c => run(`INSERT INTO calories (id, date, name, calories, protein, fat, carbs, photo, user_id) VALUES (?,?,?,?,?,?,?,?,?)`, [c.id, c.date, c.name, c.calories, c.protein, c.fat, c.carbs, c.photo ?? null, userId]))
        parsed.weight.forEach(w => run(`INSERT INTO weight_log (id, date, weight, user_id) VALUES (?,?,?,?)`, [w.id, w.date, w.weight, userId]))
        parsed.tasks.forEach(t => run(`INSERT INTO tasks (id, date, title, completed, user_id) VALUES (?,?,?,?,?)`, [t.id, t.date, t.title, t.completed ? 1 : 0, userId]))
        parsed.notes.forEach(n => run(`INSERT INTO notes (id, date, content, user_id) VALUES (?,?,?,?)`, [n.id, n.date, n.content, userId]))
        
        if (parsed.activity) {
          parsed.activity.forEach(a => run(`INSERT INTO activity_log (id, date, steps, distance, running_distance, user_id) VALUES (?,?,?,?,?,?)`, [a.id, a.date, a.steps, a.distance, a.running_distance, userId]))
        }
        if (parsed.workouts) {
          parsed.workouts.forEach(w => run(`INSERT INTO workouts (id, date, title, calories_burned, source_id, user_id) VALUES (?,?,?,?,?,?)`, [w.id, w.date, w.title, w.calories_burned, w.source_id, userId]))
        }

        parsed.habits.log.forEach(l => run(`INSERT INTO habit_log (id, date, habit_id, user_id) VALUES (?,?,?,?)`, [l.id ?? uid(), l.date, l.habitId ?? l.habit_id, userId]))

        resolve({ ok: true, message: 'Дані успішно відновлено.' })
      } catch (err) {
        console.error('[Storage] Import failed:', err)
        resolve({ ok: false, message: 'Помилка при читанні файлу: ' + err.message })
      }
    }

    reader.onerror = () => {
      resolve({ ok: false, message: 'Не вдалося прочитати файл.' })
    }

    reader.readAsText(file)
  })
}

export async function resetData() {
  const userId = getCurrentUser()
  if (!userId) return false
  try {
    run('DELETE FROM calories WHERE user_id = ?', [userId])
    run('DELETE FROM weight_log WHERE user_id = ?', [userId])
    run('DELETE FROM tasks WHERE user_id = ?', [userId])
    run('DELETE FROM notes WHERE user_id = ?', [userId])
    run('DELETE FROM habit_log WHERE user_id = ?', [userId])
    run('DELETE FROM activity_log WHERE user_id = ?', [userId])
    run('DELETE FROM workouts WHERE user_id = ?', [userId])
    return true
  } catch(e) {
    return false
  }
}
