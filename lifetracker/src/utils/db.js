/**
 * src/utils/db.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SQLite engine для LifeTracker.
 *
 * Стек:
 *   • sql.js  — SQLite скомпільований у WebAssembly
 *   • IndexedDB — зберігає бінарний дамп БД між сесіями браузера
 *
 * Публічне API:
 *   initDB()          → Promise<void>    — ініціалізація (одноразово при старті)
 *   getDB()           → SQL.Database     — поточний екземпляр (кидає якщо не готово)
 *   run(sql, params)  → void             — INSERT / UPDATE / DELETE
 *   query(sql,params) → Array<object>    — SELECT → масив рядків-об'єктів
 *   persistDB()       → Promise<void>    — зберегти дамп у IndexedDB
 *   clearDB()         → Promise<void>    — знищити БД і дамп у IndexedDB
 */

const IDB_NAME    = 'lifetracker_idb'
const IDB_STORE   = 'db_store'
const IDB_KEY     = 'sqlite_bin'
const WASM_PATH   = '/sql-wasm.wasm'   // з public/

// ─── Стан модуля ─────────────────────────────────────────────────────────────
let _db     = null   // sql.js Database instance
let _SQL    = null   // sql.js namespace
let _ready  = false
let _initPromise = null   // singleton promise

// ─── IndexedDB helpers ────────────────────────────────────────────────────────
function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(IDB_STORE)
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = (e) => reject(e.target.error)
  })
}

async function idbGet(key) {
  const idb = await openIDB()
  return new Promise((resolve, reject) => {
    const tx  = idb.transaction(IDB_STORE, 'readonly')
    const req = tx.objectStore(IDB_STORE).get(key)
    req.onsuccess = (e) => resolve(e.target.result ?? null)
    req.onerror   = (e) => reject(e.target.error)
  })
}

async function idbPut(key, value) {
  const idb = await openIDB()
  return new Promise((resolve, reject) => {
    const tx  = idb.transaction(IDB_STORE, 'readwrite')
    const req = tx.objectStore(IDB_STORE).put(value, key)
    req.onsuccess = () => resolve()
    req.onerror   = (e) => reject(e.target.error)
  })
}

async function idbDelete(key) {
  const idb = await openIDB()
  return new Promise((resolve, reject) => {
    const tx  = idb.transaction(IDB_STORE, 'readwrite')
    const req = tx.objectStore(IDB_STORE).delete(key)
    req.onsuccess = () => resolve()
    req.onerror   = (e) => reject(e.target.error)
  })
}

// ─── DDL: схема таблиць ───────────────────────────────────────────────────────
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS calories (
    id       TEXT PRIMARY KEY,
    date     TEXT NOT NULL,
    name     TEXT NOT NULL,
    calories INTEGER DEFAULT 0,
    protein  REAL    DEFAULT 0,
    fat      REAL    DEFAULT 0,
    carbs    REAL    DEFAULT 0,
    photo    TEXT
  );

  CREATE TABLE IF NOT EXISTS weight_log (
    id     TEXT PRIMARY KEY,
    date   TEXT NOT NULL UNIQUE,
    weight REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id        TEXT PRIMARY KEY,
    date      TEXT NOT NULL,
    title     TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS notes (
    id      TEXT PRIMARY KEY,
    date    TEXT NOT NULL,
    content TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS habit_defs (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    target_per_week INTEGER DEFAULT 3
  );

  CREATE TABLE IF NOT EXISTS habit_log (
    id       TEXT PRIMARY KEY,
    date     TEXT NOT NULL,
    habit_id TEXT NOT NULL,
    FOREIGN KEY (habit_id) REFERENCES habit_defs(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_calories_date  ON calories(date);
  CREATE INDEX IF NOT EXISTS idx_tasks_date     ON tasks(date);
  CREATE INDEX IF NOT EXISTS idx_notes_date     ON notes(date);
  CREATE INDEX IF NOT EXISTS idx_habit_log_date ON habit_log(date);
`

// ─── Seed: дефолтні дані ─────────────────────────────────────────────────────
const DEFAULT_HABIT_DEFS = [
  { id: 'run', name: 'Біг',        target_per_week: 3 },
  { id: 'gym', name: 'Тренування', target_per_week: 4 },
]

const DEFAULT_SETTINGS = {
  theme:    'dark',
  goals:    JSON.stringify({ calories: 2200, protein: 120, fat: 70, carbs: 250 }),
  geminiKey: '',
}

function seedDefaults(db) {
  // Habit defs — тільки якщо порожньо
  const count = db.exec('SELECT COUNT(*) as c FROM habit_defs')[0]?.values[0][0] ?? 0
  if (count === 0) {
    DEFAULT_HABIT_DEFS.forEach(h => {
      db.run(
        'INSERT OR IGNORE INTO habit_defs (id, name, target_per_week) VALUES (?,?,?)',
        [h.id, h.name, h.target_per_week]
      )
    })
  }
  // Settings — тільки відсутні ключі
  Object.entries(DEFAULT_SETTINGS).forEach(([key, value]) => {
    db.run(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)',
      [key, typeof value === 'string' ? value : JSON.stringify(value)]
    )
  })
}

// ─── initDB ───────────────────────────────────────────────────────────────────
/**
 * Ініціалізує sql.js та відкриває/створює БД.
 * Безпечно викликати кілька разів — повертає той самий Promise.
 * @returns {Promise<void>}
 */
export async function initDB() {
  if (_initPromise) return _initPromise
  _initPromise = _doInit()
  return _initPromise
}

async function _doInit() {
  try {
    // 1. Завантажуємо sql.js (глобальний скрипт вже завантажено, або через dynamic import)
    if (!window.initSqlJs) {
      await _loadScript('/sql-wasm.js')
    }
    _SQL = await window.initSqlJs({ locateFile: () => WASM_PATH })

    // 2. Перевіряємо IndexedDB на наявність збереженого дампу
    const savedBin = await idbGet(IDB_KEY)

    if (savedBin) {
      // Відновлюємо існуючу БД
      _db = new _SQL.Database(new Uint8Array(savedBin))
    } else {
      // Нова порожня БД
      _db = new _SQL.Database()
    }

    // 3. Застосовуємо схему (CREATE TABLE IF NOT EXISTS — ідемпотентно)
    _db.run(SCHEMA_SQL)

    // 4. Seed дефолтів якщо нові таблиці
    seedDefaults(_db)

    // 5. Зберігаємо щоб IndexedDB мав актуальний стан
    await persistDB()

    _ready = true
    console.log('[LifeTracker DB] SQLite ready.')
  } catch (err) {
    console.error('[LifeTracker DB] initDB failed:', err)
    _initPromise = null
    throw err
  }
}

function _loadScript(src) {
  return new Promise((resolve, reject) => {
    const script  = document.createElement('script')
    script.src    = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// ─── getDB ────────────────────────────────────────────────────────────────────
/**
 * Повертає поточний екземпляр sql.js Database.
 * Кидає помилку якщо initDB() ще не завершено.
 * @returns {object} sql.js Database
 */
export function getDB() {
  if (!_ready || !_db) {
    throw new Error('[LifeTracker DB] Database not initialized. Call initDB() first.')
  }
  return _db
}

// ─── run ──────────────────────────────────────────────────────────────────────
/**
 * Виконує INSERT / UPDATE / DELETE і автоматично зберігає дамп.
 * @param {string} sql
 * @param {Array}  params
 */
export function run(sql, params = []) {
  getDB().run(sql, params)
  // Auto-persist у IndexedDB (fire-and-forget)
  persistDB().catch(err => console.error('[LifeTracker DB] persistDB error:', err))
}

// ─── query ────────────────────────────────────────────────────────────────────
/**
 * Виконує SELECT і повертає масив об'єктів.
 * @param {string} sql
 * @param {Array}  params
 * @returns {Array<object>}
 */
export function query(sql, params = []) {
  const db = getDB()
  const result = db.exec(sql, params)
  if (!result.length) return []
  const { columns, values } = result[0]
  return values.map(row =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  )
}

// ─── persistDB ───────────────────────────────────────────────────────────────
/**
 * Зберігає бінарний дамп SQLite у IndexedDB.
 * @returns {Promise<void>}
 */
export async function persistDB() {
  if (!_db) return
  const bin = _db.export()
  await idbPut(IDB_KEY, bin.buffer)
}

// ─── clearDB ──────────────────────────────────────────────────────────────────
/**
 * Закриває та видаляє БД, очищає IndexedDB.
 * Після цього потрібно знову викликати initDB().
 * @returns {Promise<void>}
 */
export async function clearDB() {
  if (_db) {
    _db.close()
    _db    = null
    _SQL   = null
    _ready = false
    _initPromise = null
  }
  await idbDelete(IDB_KEY)
}

export const isReady = () => _ready
