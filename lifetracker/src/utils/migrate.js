/**
 * src/utils/migrate.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Одноразова міграція даних: LocalStorage → SQLite.
 *
 * Запускається автоматично при initDB якщо виявлено старий ключ 'lifetracker_data'.
 * Після успішної міграції — старий ключ видаляється.
 */

import { run } from './db'

const LEGACY_KEY = 'lifetracker_data'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/**
 * Перевіряє наявність legacy-даних і мігрує їх у SQLite.
 * Ідемпотентна — безпечно викликати кілька разів.
 */
export async function migrateFromLocalStorage() {
  const raw = localStorage.getItem(LEGACY_KEY)
  if (!raw) return  // немає старих даних — виходимо

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    console.warn('[Migrate] Не вдалося розпарсити legacy LocalStorage — пропускаємо.')
    localStorage.removeItem(LEGACY_KEY)
    return
  }

  console.log('[Migrate] Знайдено legacy дані — мігруємо до SQLite...')

  try {
    // ── calories ─────────────────────────────────────────────────────────────
    if (Array.isArray(data.calories)) {
      for (const e of data.calories) {
        run(
          `INSERT OR IGNORE INTO calories (id, date, name, calories, protein, fat, carbs, photo)
           VALUES (?,?,?,?,?,?,?,?)`,
          [
            e.id ?? uid(),
            e.date ?? new Date().toISOString().slice(0, 10),
            e.name ?? '',
            Number(e.calories) || 0,
            Number(e.protein)  || 0,
            Number(e.fat)      || 0,
            Number(e.carbs)    || 0,
            e.photo ?? null,
          ]
        )
      }
    }

    // ── weight ────────────────────────────────────────────────────────────────
    if (Array.isArray(data.weight)) {
      for (const e of data.weight) {
        run(
          `INSERT OR IGNORE INTO weight_log (id, date, weight) VALUES (?,?,?)`,
          [
            e.id ?? uid(),
            e.date ?? new Date().toISOString().slice(0, 10),
            Number(e.weight ?? e.val) || 0,
          ]
        )
      }
    }

    // ── tasks ─────────────────────────────────────────────────────────────────
    if (Array.isArray(data.tasks)) {
      for (const e of data.tasks) {
        run(
          `INSERT OR IGNORE INTO tasks (id, date, title, completed) VALUES (?,?,?,?)`,
          [
            e.id ?? uid(),
            e.date ?? new Date().toISOString().slice(0, 10),
            e.title ?? e.name ?? '',
            e.completed || e.done ? 1 : 0,
          ]
        )
      }
    }

    // ── notes ─────────────────────────────────────────────────────────────────
    if (Array.isArray(data.notes)) {
      for (const e of data.notes) {
        run(
          `INSERT OR IGNORE INTO notes (id, date, content) VALUES (?,?,?)`,
          [
            e.id ?? uid(),
            e.date ?? new Date().toISOString().slice(0, 10),
            e.content ?? '',
          ]
        )
      }
    }

    // ── habit_defs ────────────────────────────────────────────────────────────
    if (data.habits?.defs && Array.isArray(data.habits.defs)) {
      for (const h of data.habits.defs) {
        run(
          `INSERT OR IGNORE INTO habit_defs (id, name, target_per_week) VALUES (?,?,?)`,
          [h.id ?? uid(), h.name ?? '', Number(h.targetPerWeek) || 3]
        )
      }
    }

    // ── habit_log ─────────────────────────────────────────────────────────────
    if (data.habits?.log && Array.isArray(data.habits.log)) {
      for (const l of data.habits.log) {
        run(
          `INSERT OR IGNORE INTO habit_log (id, date, habit_id) VALUES (?,?,?)`,
          [uid(), l.date ?? new Date().toISOString().slice(0, 10), l.habitId ?? l.habit_id ?? '']
        )
      }
    }

    // ── settings ──────────────────────────────────────────────────────────────
    if (data.settings) {
      const s = data.settings
      if (s.theme) {
        run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('theme', ?)`, [s.theme])
      }
      if (s.goals) {
        run(
          `INSERT OR REPLACE INTO settings (key, value) VALUES ('goals', ?)`,
          [typeof s.goals === 'string' ? s.goals : JSON.stringify(s.goals)]
        )
      }
      if (s.geminiKey !== undefined) {
        run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('geminiKey', ?)`, [s.geminiKey ?? ''])
      }
    }

    // ── Видаляємо legacy ключ після успішної міграції ─────────────────────────
    localStorage.removeItem(LEGACY_KEY)
    console.log('[Migrate] Міграція завершена успішно.')
  } catch (err) {
    console.error('[Migrate] Помилка під час міграції:', err)
    // Не видаляємо legacy ключ — наступний запуск спробує ще раз
  }
}
