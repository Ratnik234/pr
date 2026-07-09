/**
 * src/utils/storage.js
 * ─────────────────────────────────────────────────────────────────────────────
 * LifeTracker — публічне API для роботи з даними.
 * Всі операції делегуються у SQLite через db.js.
 *
 * ⚠ Всі функції (крім todayStr / uid) є async.
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

// Маппінг: назва колекції → SQL-таблиця
const TABLE = {
  calories: 'calories',
  weight:   'weight_log',
  tasks:    'tasks',
  notes:    'notes',
}

// Колонки для SELECT (щоб weight_log мав поле 'weight' у відповіді)
const SELECT_COLS = {
  calories:   'id, date, name, calories, protein, fat, carbs, photo',
  weight_log: 'id, date, weight',
  tasks:      'id, date, title, completed',
  notes:      'id, date, content',
}

// ─── Загальні CRUD ────────────────────────────────────────────────────────────

/**
 * Повертає записи з колекції з опціональним фільтром (виконується в JS).
 * @param {'calories'|'weight'|'tasks'|'notes'} collection
 * @param {function|null} filterFn
 * @returns {Promise<Array>}
 */
export async function getEntries(collection, filterFn = null) {
  const table = TABLE[collection]
  if (!table) throw new Error(`[Storage] Невідома колекція: ${collection}`)
  const cols = SELECT_COLS[table] ?? '*'
  const rows = query(`SELECT ${cols} FROM ${table} ORDER BY date DESC`, [])
  // completed зберігається як 0/1 у SQLite — конвертуємо в boolean
  const normalized = rows.map(r => normalizeRow(collection, r))
  return filterFn ? normalized.filter(filterFn) : normalized
}

/**
 * Додає новий запис. Автоматично проставляє id та date (якщо не задані).
 * @param {'calories'|'weight'|'tasks'|'notes'} collection
 * @param {object} entry
 * @returns {Promise<object>} — збережений запис
 */
export async function addEntry(collection, entry) {
  const newEntry = {
    id:   uid(),
    date: todayStr(),
    ...entry,
  }

  switch (collection) {
    case 'calories':
      run(
        `INSERT INTO calories (id, date, name, calories, protein, fat, carbs, photo)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          newEntry.id, newEntry.date, newEntry.name ?? '',
          Number(newEntry.calories) || 0,
          Number(newEntry.protein)  || 0,
          Number(newEntry.fat)      || 0,
          Number(newEntry.carbs)    || 0,
          newEntry.photo ?? null,
        ]
      )
      break

    case 'weight':
      run(
        `INSERT OR REPLACE INTO weight_log (id, date, weight) VALUES (?,?,?)`,
        [newEntry.id, newEntry.date, Number(newEntry.weight ?? newEntry.val) || 0]
      )
      break

    case 'tasks':
      run(
        `INSERT INTO tasks (id, date, title, completed) VALUES (?,?,?,?)`,
        [newEntry.id, newEntry.date, newEntry.title ?? '', newEntry.completed ? 1 : 0]
      )
      break

    case 'notes':
      run(
        `INSERT INTO notes (id, date, content) VALUES (?,?,?)`,
        [newEntry.id, newEntry.date, newEntry.content ?? '']
      )
      break

    default:
      throw new Error(`[Storage] addEntry: невідома колекція "${collection}"`)
  }

  return newEntry
}

/**
 * Оновлює запис за id (часткове оновлення).
 * @param {'calories'|'weight'|'tasks'|'notes'} collection
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object|null>}
 */
export async function updateEntry(collection, id, updates) {
  switch (collection) {
    case 'calories': {
      const fields = []
      const vals   = []
      const allowed = ['name', 'calories', 'protein', 'fat', 'carbs', 'photo', 'date']
      for (const [k, v] of Object.entries(updates)) {
        if (allowed.includes(k)) { fields.push(`${k} = ?`); vals.push(v) }
      }
      if (!fields.length) return null
      vals.push(id)
      run(`UPDATE calories SET ${fields.join(', ')} WHERE id = ?`, vals)
      break
    }
    case 'weight': {
      if (updates.weight !== undefined || updates.val !== undefined) {
        run(`UPDATE weight_log SET weight = ? WHERE id = ?`,
            [Number(updates.weight ?? updates.val), id])
      }
      break
    }
    case 'tasks': {
      const fields = []
      const vals   = []
      if (updates.title     !== undefined) { fields.push('title = ?');     vals.push(updates.title) }
      if (updates.completed !== undefined) { fields.push('completed = ?'); vals.push(updates.completed ? 1 : 0) }
      if (!fields.length) return null
      vals.push(id)
      run(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, vals)
      break
    }
    case 'notes': {
      if (updates.content !== undefined) {
        run(`UPDATE notes SET content = ? WHERE id = ?`, [updates.content, id])
      }
      break
    }
    default:
      throw new Error(`[Storage] updateEntry: невідома колекція "${collection}"`)
  }

  // Повертаємо оновлений запис
  const table = TABLE[collection]
  const cols  = SELECT_COLS[table] ?? '*'
  const rows  = query(`SELECT ${cols} FROM ${table} WHERE id = ?`, [id])
  return rows.length ? normalizeRow(collection, rows[0]) : null
}

/**
 * Видаляє запис за id.
 * @param {'calories'|'weight'|'tasks'|'notes'} collection
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteEntry(collection, id) {
  const table = TABLE[collection]
  if (!table) throw new Error(`[Storage] deleteEntry: невідома колекція "${collection}"`)
  run(`DELETE FROM ${table} WHERE id = ?`, [id])
  return true
}

// ─── Settings ─────────────────────────────────────────────────────────────────

/**
 * Повертає об'єкт налаштувань.
 * @returns {Promise<object>}
 */
export async function getSettings() {
  const rows = query('SELECT key, value FROM settings', [])
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

/**
 * Часткове оновлення налаштувань.
 * @param {object} patch
 * @returns {Promise<object>} — нові налаштування
 */
export async function updateSettings(patch) {
  if (patch.theme !== undefined) {
    run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('theme', ?)`, [patch.theme])
  }
  if (patch.geminiKey !== undefined) {
    run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('geminiKey', ?)`, [patch.geminiKey])
  }
  if (patch.goals !== undefined) {
    const cur = await getSettings()
    const merged = { ...cur.goals, ...patch.goals }
    run(
      `INSERT OR REPLACE INTO settings (key, value) VALUES ('goals', ?)`,
      [JSON.stringify(merged)]
    )
  }
  return getSettings()
}

// ─── Habits ───────────────────────────────────────────────────────────────────

/**
 * Повертає масив визначень звичок.
 * @returns {Promise<Array>}
 */
export async function getHabitDefs() {
  return query('SELECT id, name, target_per_week as targetPerWeek FROM habit_defs', [])
}

/**
 * Повертає лог звичок (з опціональним фільтром по даті від).
 * @param {string|null} fromDate — 'YYYY-MM-DD', включно
 * @returns {Promise<Array>}
 */
export async function getHabitLog(fromDate = null) {
  if (fromDate) {
    return query(
      `SELECT id, date, habit_id as habitId FROM habit_log WHERE date >= ? ORDER BY date DESC`,
      [fromDate]
    )
  }
  return query('SELECT id, date, habit_id as habitId FROM habit_log ORDER BY date DESC', [])
}

/**
 * Перемикає виконання звички на сьогодні.
 * @param {string} habitId
 * @param {boolean} done
 * @returns {Promise<void>}
 */
export async function toggleHabit(habitId, done) {
  const today = todayStr()
  if (done) {
    // Перевіряємо чи вже є запис
    const exists = query(
      'SELECT id FROM habit_log WHERE date = ? AND habit_id = ?',
      [today, habitId]
    )
    if (!exists.length) {
      run(
        'INSERT INTO habit_log (id, date, habit_id) VALUES (?,?,?)',
        [uid(), today, habitId]
      )
    }
  } else {
    run('DELETE FROM habit_log WHERE date = ? AND habit_id = ?', [today, habitId])
  }
}

// ─── Аналітика ───────────────────────────────────────────────────────────────

/**
 * Повертає записи харчування за конкретну дату.
 * @param {string} date — 'YYYY-MM-DD'
 * @returns {Promise<Array>}
 */
export async function getCaloriesByDate(date) {
  const rows = query(
    'SELECT id, date, name, calories, protein, fat, carbs, photo FROM calories WHERE date = ? ORDER BY rowid ASC',
    [date]
  )
  return rows
}

/**
 * Повертає суму калорій та макросів за день.
 * @param {string} date — 'YYYY-MM-DD'
 * @returns {Promise<{calories, protein, fat, carbs}>}
 */
export async function getDayTotals(date) {
  const rows = query(
    `SELECT
       COALESCE(SUM(calories),0) as calories,
       COALESCE(SUM(protein),0)  as protein,
       COALESCE(SUM(fat),0)      as fat,
       COALESCE(SUM(carbs),0)    as carbs
     FROM calories WHERE date = ?`,
    [date]
  )
  return rows[0] ?? { calories: 0, protein: 0, fat: 0, carbs: 0 }
}

/**
 * Кількість днів поспіль з хоча б одним записом харчування.
 * @returns {Promise<number>}
 */
export async function computeStreak() {
  const rows = query('SELECT DISTINCT date FROM calories ORDER BY date DESC', [])
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

// ─── Експорт / Імпорт ────────────────────────────────────────────────────────

/**
 * Повний дамп всіх даних у вигляді JSON-об'єкта.
 * @returns {Promise<object>}
 */
async function dumpAll() {
  const habitDefsRaw = await getHabitDefs()
  const habitLogRaw  = await getHabitLog()
  const settings     = await getSettings()
  return {
    calories: query('SELECT * FROM calories ORDER BY date ASC', []),
    weight:   query('SELECT id, date, weight FROM weight_log ORDER BY date ASC', []),
    tasks:    query('SELECT id, date, title, completed FROM tasks ORDER BY date ASC', [])
              .map(r => ({ ...r, completed: r.completed === 1 })),
    notes:    query('SELECT * FROM notes ORDER BY date ASC', []),
    habits: {
      defs: habitDefsRaw,
      log:  habitLogRaw,
    },
    settings,
  }
}

/**
 * Завантажує файл lifetracker-backup.json через Blob.
 * @returns {Promise<boolean>}
 */
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

// Обов'язкові поля файлу резервної копії
const REQUIRED_FIELDS = ['calories', 'weight', 'tasks', 'notes', 'habits', 'settings']

/**
 * Імпортує дані з JSON-файлу у SQLite (замінює поточні дані).
 * @param {File} file
 * @returns {Promise<{ok:boolean, message:string}>}
 */
export async function importData(file) {
  if (!file || file.type !== 'application/json') {
    return { ok: false, message: 'Файл повинен бути у форматі JSON (.json).' }
  }

  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result)

        // Перевірка обов'язкових полів
        const missing = REQUIRED_FIELDS.filter(f => !(f in parsed))
        if (missing.length) {
          return resolve({
            ok: false,
            message: `Файл пошкоджений. Відсутні поля: ${missing.join(', ')}.`,
          })
        }

        const arrayFields = ['calories', 'weight', 'tasks', 'notes']
        for (const f of arrayFields) {
          if (!Array.isArray(parsed[f])) {
            return resolve({ ok: false, message: `Поле "${f}" повинно бути масивом.` })
          }
        }

        if (!Array.isArray(parsed.habits?.defs) || !Array.isArray(parsed.habits?.log)) {
          return resolve({ ok: false, message: 'habits.defs та habits.log повинні бути масивами.' })
        }

        if (typeof parsed.settings !== 'object' || typeof parsed.settings.goals !== 'object') {
          return resolve({ ok: false, message: 'settings.goals повинен бути об\'єктом.' })
        }

        // Очищаємо поточні дані
        run('DELETE FROM calories',   [])
        run('DELETE FROM weight_log', [])
        run('DELETE FROM tasks',      [])
        run('DELETE FROM notes',      [])
        run('DELETE FROM habit_log',  [])
        run('DELETE FROM habit_defs', [])
        run('DELETE FROM settings',   [])

        // Вставляємо імпортовані дані
        for (const e of parsed.calories) {
          run(
            `INSERT INTO calories (id,date,name,calories,protein,fat,carbs,photo) VALUES (?,?,?,?,?,?,?,?)`,
            [e.id??uid(), e.date, e.name??'', Number(e.calories)||0, Number(e.protein)||0,
             Number(e.fat)||0, Number(e.carbs)||0, e.photo??null]
          )
        }
        for (const e of parsed.weight) {
          run(
            `INSERT OR REPLACE INTO weight_log (id,date,weight) VALUES (?,?,?)`,
            [e.id??uid(), e.date, Number(e.weight)||0]
          )
        }
        for (const e of parsed.tasks) {
          run(
            `INSERT INTO tasks (id,date,title,completed) VALUES (?,?,?,?)`,
            [e.id??uid(), e.date, e.title??'', e.completed?1:0]
          )
        }
        for (const e of parsed.notes) {
          run(
            `INSERT INTO notes (id,date,content) VALUES (?,?,?)`,
            [e.id??uid(), e.date, e.content??'']
          )
        }
        for (const h of parsed.habits.defs) {
          run(
            `INSERT INTO habit_defs (id,name,target_per_week) VALUES (?,?,?)`,
            [h.id??uid(), h.name??'', Number(h.targetPerWeek??h.target_per_week)||3]
          )
        }
        for (const l of parsed.habits.log) {
          run(
            `INSERT INTO habit_log (id,date,habit_id) VALUES (?,?,?)`,
            [uid(), l.date, l.habitId??l.habit_id??'']
          )
        }

        const s = parsed.settings
        run(`INSERT OR REPLACE INTO settings (key,value) VALUES ('theme',?)`,     [s.theme??'dark'])
        run(`INSERT OR REPLACE INTO settings (key,value) VALUES ('geminiKey',?)`, [s.geminiKey??''])
        run(
          `INSERT OR REPLACE INTO settings (key,value) VALUES ('goals',?)`,
          [typeof s.goals === 'string' ? s.goals : JSON.stringify(s.goals)]
        )

        resolve({ ok: true, message: 'Дані успішно імпортовано!' })
      } catch (err) {
        resolve({ ok: false, message: 'Не вдалося прочитати файл: ' + err.message })
      }
    }

    reader.onerror = () => resolve({ ok: false, message: 'Помилка читання файлу.' })
    reader.readAsText(file)
  })
}

/**
 * Очищає всі дані (скидає до стану після seed).
 * @returns {Promise<boolean>}
 */
export async function clearData() {
  try {
    run('DELETE FROM calories',   [])
    run('DELETE FROM weight_log', [])
    run('DELETE FROM tasks',      [])
    run('DELETE FROM notes',      [])
    run('DELETE FROM habit_log',  [])
    run('DELETE FROM settings',   [])
    // Seed дефолтних налаштувань
    run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('theme',     'dark')`,   [])
    run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('geminiKey', '')`,       [])
    run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('goals', ?)`,
        [JSON.stringify({ calories: 2200, protein: 120, fat: 70, carbs: 250 })])
    return true
  } catch (err) {
    console.error('[Storage] clearData failed:', err)
    return false
  }
}

// ─── Внутрішній helper ────────────────────────────────────────────────────────
function normalizeRow(collection, row) {
  if (collection === 'tasks') {
    return { ...row, completed: row.completed === 1 || row.completed === true }
  }
  return row
}

// ─── saveData / loadData — сумісність (не рекомендовано для прямого використання) ──
// Залишені як no-op щоб уникнути крашів якщо десь залишились старі виклики
export const saveData = async () => true
export const loadData = async () => ({})
