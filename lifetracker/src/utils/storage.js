/**
 * utils/storage.js
 * LifeTracker — єдиний модуль для роботи з LocalStorage.
 *
 * Схема даних:
 * {
 *   tasks:    [],            // загальні задачі (для майбутніх розділів)
 *   notes:    [],            // нотатки
 *   calories: [],            // записи харчування (замінює ht_foodEntries)
 *   weight:   [],            // записи ваги (замінює ht_weightLog)
 *   habits:   { defs:[], log:[] },  // трекер звичок
 *   settings: {
 *     theme:    "light",
 *     goals:    { calories:2200, protein:120, fat:70, carbs:250 },
 *     geminiKey: ""
 *   }
 * }
 *
 * Кожен запис у масивах має поля:
 *   id   — унікальний рядок (uid())
 *   date — "YYYY-MM-DD"
 *   ...решта полів залежно від типу запису
 */


// ─── Константи ───────────────────────────────────────────────────────────────


const STORAGE_KEY = "lifetracker_data";

const REQUIRED_FIELDS = ["tasks", "notes", "calories", "weight", "habits", "settings"];

const DEFAULT_DATA = {
  tasks: [],
  notes: [],
  calories: [],
  weight: [],
  habits: {
    defs: [
      { id: "run", name: "Біг", targetPerWeek: 3 },
      { id: "gym", name: "Тренування", targetPerWeek: 4 }
    ],
    log: []
  },
  settings: {
    theme: "light",
    goals: { calories: 2200, protein: 120, fat: 70, carbs: 250 },
    geminiKey: ""
  }
};

// ─── Допоміжні функції ────────────────────────────────────────────────────────

/**
 * Генерує унікальний рядковий ідентифікатор.
 * @returns {string}
 */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Повертає поточну дату у форматі YYYY-MM-DD.
 * @returns {string}
 */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Глибоке злиття об'єктів (target ← source); не перезаписує масиви.
 * @param {object} target
 * @param {object} source
 * @returns {object}
 */
function deepMerge(target, source) {
  const result = Object.assign({}, target);
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// ─── Базові операції з LocalStorage ──────────────────────────────────────────

/**
 * Зберігає повний об'єкт даних у LocalStorage.
 * @param {object} data
 * @returns {boolean} — true якщо успішно
 */
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error("[LifeTracker] saveData failed:", err);
    return false;
  }
}

/**
 * Завантажує дані з LocalStorage. Якщо немає або помилка — повертає DEFAULT_DATA.
 * Відсутні поля автоматично доповнюються з DEFAULT_DATA.
 * @returns {object}
 */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw);
    // Доповнюємо відсутні поля дефолтами (безпечна міграція)
    return deepMerge(structuredClone(DEFAULT_DATA), parsed);
  } catch (err) {
    console.error("[LifeTracker] loadData failed:", err);
    return structuredClone(DEFAULT_DATA);
  }
}

/**
 * Повністю очищає дані LifeTracker у LocalStorage (скидає до DEFAULT_DATA).
 * @returns {boolean}
 */
function clearData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error("[LifeTracker] clearData failed:", err);
    return false;
  }
}

// ─── Експорт / Імпорт ────────────────────────────────────────────────────────

/**
 * Експортує всі дані як JSON-файл lifetracker-backup.json.
 * Використовує Blob + URL.createObjectURL — без зовнішніх бібліотек.
 */
function exportData() {
  try {
    const data = loadData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "lifetracker-backup.json";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("[LifeTracker] exportData failed:", err);
    return false;
  }
}

/**
 * Імпортує дані з JSON-файлу, перевіряє формат та зберігає в LocalStorage.
 *
 * @param {File} file — об'єкт File (наприклад, із <input type="file">)
 * @returns {Promise<{ ok: boolean, message: string }>}
 */
function importData(file) {
  return new Promise((resolve) => {
    // Перевірка типу файлу
    if (!file || file.type !== "application/json") {
      return resolve({ ok: false, message: "Файл повинен бути у форматі JSON (.json)." });
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);

        // Перевірка обов'язкових полів
        const missing = REQUIRED_FIELDS.filter((f) => !(f in parsed));
        if (missing.length > 0) {
          return resolve({
            ok: false,
            message: `Файл пошкоджений або невірного формату. Відсутні поля: ${missing.join(", ")}.`
          });
        }

        // Перевірка типів ключових масивів
        const arrayFields = ["tasks", "notes", "calories", "weight"];
        for (const field of arrayFields) {
          if (!Array.isArray(parsed[field])) {
            return resolve({
              ok: false,
              message: `Поле "${field}" повинно бути масивом.`
            });
          }
        }

        // Перевірка структури habits
        if (
          typeof parsed.habits !== "object" ||
          !Array.isArray(parsed.habits.defs) ||
          !Array.isArray(parsed.habits.log)
        ) {
          return resolve({
            ok: false,
            message: 'Поле "habits" повинно містити масиви "defs" та "log".'
          });
        }

        // Перевірка структури settings
        if (typeof parsed.settings !== "object" || typeof parsed.settings.goals !== "object") {
          return resolve({
            ok: false,
            message: 'Поле "settings" повинно містити об\'єкт "goals".'
          });
        }

        // Зберігаємо — об'єднуємо з дефолтами для безпечної міграції
        const merged = deepMerge(structuredClone(DEFAULT_DATA), parsed);
        saveData(merged);

        resolve({ ok: true, message: "Дані успішно імпортовано!" });
      } catch (err) {
        resolve({ ok: false, message: "Не вдалося прочитати файл: " + err.message });
      }
    };

    reader.onerror = () => {
      resolve({ ok: false, message: "Помилка читання файлу." });
    };

    reader.readAsText(file);
  });
}

// ─── Загальні CRUD-функції (працюють з будь-яким масивом у схемі) ─────────────

/**
 * Отримує записи з вказаного масиву, з опціональною фільтрацією.
 *
 * @param {"tasks"|"notes"|"calories"|"weight"} collection
 * @param {function|null} filterFn — наприклад: entry => entry.date === "2025-01-01"
 * @returns {Array}
 */
function getEntries(collection, filterFn = null) {
  const data = loadData();
  const arr = data[collection] ?? [];
  return filterFn ? arr.filter(filterFn) : arr;
}

/**
 * Додає запис до вказаного масиву. Автоматично проставляє id та date.
 *
 * @param {"tasks"|"notes"|"calories"|"weight"} collection
 * @param {object} entry — поля запису (без id та date, якщо не задані)
 * @returns {object} — доданий запис з id та date
 */
function addEntry(collection, entry) {
  const data = loadData();
  if (!Array.isArray(data[collection])) {
    throw new Error(`[LifeTracker] Колекція "${collection}" не є масивом.`);
  }
  const newEntry = {
    id: uid(),
    date: todayStr(),
    ...entry
  };
  data[collection].push(newEntry);
  saveData(data);
  return newEntry;
}

/**
 * Оновлює запис у вказаному масиві за id.
 *
 * @param {"tasks"|"notes"|"calories"|"weight"} collection
 * @param {string} id
 * @param {object} updates — поля для оновлення
 * @returns {object|null} — оновлений запис або null якщо не знайдено
 */
function updateEntry(collection, id, updates) {
  const data = loadData();
  if (!Array.isArray(data[collection])) {
    throw new Error(`[LifeTracker] Колекція "${collection}" не є масивом.`);
  }
  const idx = data[collection].findIndex((e) => e.id === id);
  if (idx === -1) return null;

  data[collection][idx] = { ...data[collection][idx], ...updates };
  saveData(data);
  return data[collection][idx];
}

/**
 * Видаляє запис із вказаного масиву за id.
 *
 * @param {"tasks"|"notes"|"calories"|"weight"} collection
 * @param {string} id
 * @returns {boolean} — true якщо запис знайдено і видалено
 */
function deleteEntry(collection, id) {
  const data = loadData();
  if (!Array.isArray(data[collection])) {
    throw new Error(`[LifeTracker] Колекція "${collection}" не є масивом.`);
  }
  const before = data[collection].length;
  data[collection] = data[collection].filter((e) => e.id !== id);
  if (data[collection].length === before) return false;
  saveData(data);
  return true;
}

// ─── Спеціалізовані функції для settings ─────────────────────────────────────

/**
 * Повертає поточні налаштування.
 * @returns {object}
 */
function getSettings() {
  return loadData().settings;
}

/**
 * Зберігає оновлені налаштування (часткове оновлення).
 * @param {object} patch — поля для оновлення settings
 * @returns {object} — нові settings
 */
function updateSettings(patch) {
  const data = loadData();
  data.settings = deepMerge(data.settings, patch);
  saveData(data);
  return data.settings;
}

// ─── Спеціалізовані функції для звичок (habits) ───────────────────────────────

/**
 * Повертає визначення звичок.
 * @returns {Array}
 */
function getHabitDefs() {
  return loadData().habits.defs;
}

/**
 * Повертає лог звичок (з опціональним фільтром по даті).
 * @param {string|null} fromDate — "YYYY-MM-DD", включно
 * @returns {Array}
 */
function getHabitLog(fromDate = null) {
  const log = loadData().habits.log;
  return fromDate ? log.filter((l) => l.date >= fromDate) : log;
}

/**
 * Перемикає виконання звички на сьогодні.
 * @param {string} habitId
 * @param {boolean} done
 */
function toggleHabit(habitId, done) {
  const data = loadData();
  const t = todayStr();
  const idx = data.habits.log.findIndex((l) => l.date === t && l.habitId === habitId);

  if (done && idx === -1) {
    data.habits.log.push({ date: t, habitId, done: true });
  } else if (!done && idx !== -1) {
    data.habits.log.splice(idx, 1);
  }
  saveData(data);
}

// ─── Функції для календаря ────────────────────────────────────────────────────

/**
 * Повертає всі записи харчування за вказану дату.
 * @param {string} date — "YYYY-MM-DD"
 * @returns {Array}
 */
function getCaloriesByDate(date) {
  return getEntries("calories", (e) => e.date === date);
}

/**
 * Повертає суму калорій та макросів за вказану дату.
 * @param {string} date — "YYYY-MM-DD"
 * @returns {{ calories:number, protein:number, fat:number, carbs:number }}
 */
function getDayTotals(date) {
  return getCaloriesByDate(date).reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories || 0),
      protein: acc.protein + (e.protein || 0),
      fat: acc.fat + (e.fat || 0),
      carbs: acc.carbs + (e.carbs || 0)
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

/**
 * Повертає кількість днів поспіль із хоча б одним записом харчування.
 * @returns {number}
 */
function computeStreak() {
  const daysWithEntries = new Set(getEntries("calories").map((e) => e.date));
  let streak = 0;
  const d = new Date();
  while (true) {
    const ds = d.toISOString().slice(0, 10);
    if (daysWithEntries.has(ds)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ─── ES-модульні експорти (для Vite / React) ──────────────────────────────────
// Також зберігаємо window.LTStorage для сумісності з index.html (vanilla JS)

if (typeof window !== 'undefined') {
  window.LTStorage = {
    saveData, loadData, clearData, exportData, importData,
    getEntries, addEntry, updateEntry, deleteEntry,
    getSettings, updateSettings,
    getHabitDefs, getHabitLog, toggleHabit,
    getCaloriesByDate, getDayTotals, computeStreak,
    uid, todayStr,
  };
}

export {
  // Базові операції
  saveData,
  loadData,
  clearData,
  exportData,
  importData,

  // Універсальні CRUD
  getEntries,
  addEntry,
  updateEntry,
  deleteEntry,

  // Settings
  getSettings,
  updateSettings,

  // Звички
  getHabitDefs,
  getHabitLog,
  toggleHabit,

  // Календар / аналітика
  getCaloriesByDate,
  getDayTotals,
  computeStreak,

  // Допоміжні
  uid,
  todayStr,
};
