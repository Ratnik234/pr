import { openDB } from 'idb';

const API_URL = 'https://pr-ten-rust.vercel.app';

let dbPromise;
export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB('lifetracker-neon', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('calories')) db.createObjectStore('calories', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('weight')) db.createObjectStore('weight', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('tasks')) db.createObjectStore('tasks', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('notes')) db.createObjectStore('notes', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('habits_defs')) db.createObjectStore('habits_defs', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('habit_log')) db.createObjectStore('habit_log', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('activity')) db.createObjectStore('activity', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('workouts')) db.createObjectStore('workouts', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('sync_queue')) db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    });
  }
  return dbPromise;
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function getCurrentUser() {
  return localStorage.getItem('lifetracker_session');
}

export function setCurrentUser(id, username = null) {
  if (id) {
    localStorage.setItem('lifetracker_session', id);
    if (username) localStorage.setItem('lifetracker_username', username);
  } else {
    localStorage.removeItem('lifetracker_session');
    localStorage.removeItem('lifetracker_username');
  }
}

export async function getCurrentUserInfo() {
  const id = getCurrentUser();
  if (!id) return null;
  const username = localStorage.getItem('lifetracker_username');
  if (username) return { username };

  if (navigator.onLine) {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`);
      const data = await res.json();
      if (data.username) {
        localStorage.setItem('lifetracker_username', data.username);
        return { username: data.username };
      }
    } catch (e) {
      console.warn('Could not fetch user info', e);
    }
  }
  return { username: 'User' };
}

export async function loginUser(username, password) {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.ok) {
      setCurrentUser(data.userId, username);
      await performFullSync();
      return { ok: true };
    }
    return { ok: false, message: data.message };
  } catch (err) {
    return { ok: false, message: 'No internet connection for login' };
  }
}

export async function registerUser(username, password) {
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.ok) {
      setCurrentUser(data.userId, username);
      return { ok: true };
    }
    return { ok: false, message: data.message };
  } catch (err) {
    return { ok: false, message: 'No internet connection for registration' };
  }
}

export function logoutUser() {
  setCurrentUser(null);
}

// ─── Sync Logic ───────────────────────────────────────────────────────────────

export async function addSyncOp(op) {
  const db = await getDB();
  await db.add('sync_queue', op);
  triggerSync();
}

let syncTimeout = null;
export function triggerSync() {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    if (!navigator.onLine) return;
    const userId = getCurrentUser();
    if (!userId) return;

    try {
      const db = await getDB();
      const queue = await db.getAll('sync_queue');
      if (queue.length === 0) return;

      const res = await fetch(`${API_URL}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, operations: queue })
      });
      const data = await res.json();
      if (data.ok) {
        const tx = db.transaction('sync_queue', 'readwrite');
        for (const op of queue) {
          tx.store.delete(op.id);
        }
        await tx.done;
      }
    } catch (err) {
      console.warn('Sync failed, will retry later:', err);
    }
  }, 2000);
}

window.addEventListener('online', triggerSync);

export async function performFullSync() {
  const userId = getCurrentUser();
  if (!userId || !navigator.onLine) return;
  try {
    const res = await fetch(`${API_URL}/api/sync/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (!data.error) {
      const db = await getDB();
      // Store all fetched data to local IndexedDB
      if (data.calories) {
        const tx = db.transaction('calories', 'readwrite');
        tx.store.clear();
        data.calories.forEach(item => tx.store.put(item));
      }
      if (data.tasks) {
        const tx = db.transaction('tasks', 'readwrite');
        tx.store.clear();
        data.tasks.forEach(item => tx.store.put(item));
      }
      // Continue for other stores as needed...
    }
  } catch (e) {
    console.warn('Pull sync failed', e);
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getEntries(collection, filterFn = null) {
  const db = await getDB();
  const all = await db.getAll(collection);
  // Sort by date DESC
  all.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    return 0;
  });
  return filterFn ? all.filter(filterFn) : all;
}

export async function addEntry(collection, entry) {
  const db = await getDB();
  const newEntry = { id: uid(), date: todayStr(), ...entry };
  await db.put(collection, newEntry);
  await addSyncOp({ type: 'CREATE', collection, data: newEntry });
  return newEntry;
}

export async function updateEntry(collection, id, updates) {
  const db = await getDB();
  const existing = await db.get(collection, id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  await db.put(collection, updated);
  await addSyncOp({ type: 'UPDATE', collection, id, data: updates });
  return updated;
}

export async function deleteEntry(collection, id) {
  const db = await getDB();
  await db.delete(collection, id);
  await addSyncOp({ type: 'DELETE', collection, id });
  return true;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings() {
  const db = await getDB();
  const all = await db.getAll('settings');
  const map = Object.fromEntries(all.map(s => [s.key, s.value]));

  return {
    theme: map.theme ?? 'dark',
    geminiKey: map.geminiKey ?? '',
    language: map.language ?? 'en',
    goals: map.goals ?? { calories: 2200, protein: 120, fat: 70, carbs: 250 },
    waterLog: map.waterLog ?? {},
    profile: map.profile ?? { height: '', weight: '', age: '', gender: 'male', activityLevel: 'medium' },
  };
}

export async function updateSettings(patch) {
  const db = await getDB();
  const tx = db.transaction('settings', 'readwrite');
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) {
      if (k === 'goals') {
        const existing = await tx.store.get('goals');
        tx.store.put({ key: 'goals', value: { ...(existing?.value || {}), ...v } });
      } else {
        tx.store.put({ key: k, value: v });
      }
      await addSyncOp({ type: 'UPDATE_SETTING', key: k, value: v });
    }
  }
  await tx.done;
  return getSettings();
}

// ─── Habits ───────────────────────────────────────────────────────────────────

export async function getHabitDefs() {
  const db = await getDB();
  return db.getAll('habits_defs');
}

export async function getHabitLog(fromDate = null) {
  const db = await getDB();
  const all = await db.getAll('habit_log');
  if (fromDate) {
    return all.filter(l => l.date >= fromDate).sort((a, b) => b.date.localeCompare(a.date));
  }
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

export async function toggleHabit(habitId, done) {
  const db = await getDB();
  const today = todayStr();
  const logs = await db.getAll('habit_log');
  const existing = logs.find(l => l.date === today && (l.habitId === habitId || l.habit_id === habitId));

  if (done && !existing) {
    const entry = { id: uid(), date: today, habitId };
    await db.put('habit_log', entry);
    await addSyncOp({ type: 'CREATE', collection: 'habit_log', data: entry });
  } else if (!done && existing) {
    await db.delete('habit_log', existing.id);
    await addSyncOp({ type: 'DELETE', collection: 'habit_log', id: existing.id });
  }
}

// ─── Analytics & Others ────────────────────────────────────────────────────────

export async function getCaloriesByDate(date) {
  const db = await getDB();
  const all = await db.getAll('calories');
  return all.filter(c => c.date === date);
}

export async function getDayTotals(date) {
  const meals = await getCaloriesByDate(date);
  return meals.reduce((acc, m) => {
    acc.calories += Number(m.calories) || 0;
    acc.protein += Number(m.protein) || 0;
    acc.fat += Number(m.fat) || 0;
    acc.carbs += Number(m.carbs) || 0;
    return acc;
  }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
}

export async function computeStreak() {
  const db = await getDB();
  const cals = await db.getAll('calories');
  const days = new Set(cals.map(c => c.date));
  let streak = 0;
  const d = new Date();
  while (true) {
    const ds = d.toISOString().slice(0, 10);
    if (days.has(ds)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export async function getActivityLog(date = null) {
  const db = await getDB();
  const all = await db.getAll('activity');
  if (date) {
    return all.find(a => a.date === date) ?? { steps: 0, distance: 0, running_distance: 0 };
  }
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

export async function logActivity(date, steps, distance, runningDistance) {
  const db = await getDB();
  const all = await db.getAll('activity');
  const existing = all.find(a => a.date === date);
  const data = { id: existing?.id || uid(), date, steps, distance, running_distance: runningDistance };
  await db.put('activity', data);
  await addSyncOp({ type: existing ? 'UPDATE' : 'CREATE', collection: 'activity', id: data.id, data });
}

export async function getWorkouts(fromDate = null) {
  const db = await getDB();
  const all = await db.getAll('workouts');
  if (fromDate) {
    return all.filter(w => w.date >= fromDate).sort((a, b) => b.date.localeCompare(a.date));
  }
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

// ─── Export & Import ────────────────────────────────────────────────────────

export async function exportData() {
  const db = await getDB();
  const data = {
    calories: await db.getAll('calories'),
    weight: await db.getAll('weight'),
    tasks: await db.getAll('tasks'),
    notes: await db.getAll('notes'),
    activity: await db.getAll('activity'),
    workouts: await db.getAll('workouts'),
    habits: { defs: await db.getAll('habits_defs'), log: await db.getAll('habit_log') },
    settings: await getSettings()
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'lifetracker-backup.json';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return true;
}

export async function importData(file) {
  if (!file || file.type !== 'application/json') {
    return { ok: false, message: 'Файл повинен бути у форматі JSON (.json).' };
  }
  const userId = getCurrentUser();
  if (!userId) return { ok: false, message: 'Not logged in' };

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const db = await getDB();

        const tables = ['calories', 'weight', 'tasks', 'notes', 'activity', 'workouts'];
        for (const table of tables) {
          if (parsed[table]) {
            const tx = db.transaction(table, 'readwrite');
            tx.store.clear();
            parsed[table].forEach(item => tx.store.put(item));
            await tx.done;
          }
        }

        if (parsed.habits) {
          if (parsed.habits.defs) {
            const tx = db.transaction('habits_defs', 'readwrite');
            tx.store.clear();
            parsed.habits.defs.forEach(item => tx.store.put(item));
            await tx.done;
          }
          if (parsed.habits.log) {
            const tx = db.transaction('habit_log', 'readwrite');
            tx.store.clear();
            parsed.habits.log.forEach(item => tx.store.put(item));
            await tx.done;
          }
        }

        // Trigger bulk sync to server
        await fetch(`${API_URL}/api/sync/push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, data: parsed })
        });

        resolve({ ok: true, message: 'Дані успішно відновлено.' });
      } catch (err) {
        resolve({ ok: false, message: 'Помилка при читанні файлу: ' + err.message });
      }
    };
    reader.onerror = () => resolve({ ok: false, message: 'Не вдалося прочитати файл.' });
    reader.readAsText(file);
  });
}

export async function resetData() {
  const db = await getDB();
  const tables = ['calories', 'weight', 'tasks', 'notes', 'habits_defs', 'habit_log', 'activity', 'workouts', 'sync_queue'];
  for (const table of tables) {
    const tx = db.transaction(table, 'readwrite');
    tx.store.clear();
    await tx.done;
  }
  return true;
}