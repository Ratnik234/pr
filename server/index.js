import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper to hash password
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(400).json({ ok: false, message: 'Username already exists' });
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        profile: {
          create: {} // Auto-create profile
        }
      }
    });

    res.json({ ok: true, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const passwordHash = hashPassword(password);
    const user = await prisma.user.findFirst({
      where: { username, passwordHash }
    });

    if (user) {
      res.json({ ok: true, userId: user.id });
    } else {
      res.status(401).json({ ok: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (user) {
      res.json({ username: user.username });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// --- Sync Route ---
// Maps each frontend collection name to its Prisma model.
const COLLECTION_MODEL = {
  calories: 'meal',
  tasks: 'task',
  notes: 'note',
  workouts: 'workout',
  calendarEvents: 'calendarEvent',
  water: 'waterLog',
  weight: 'weightLog',
  settings: 'setting',
  statistics: 'statistic'
};

app.post('/api/sync', async (req, res) => {
  const { userId, operations } = req.body;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Process operations sequentially
    for (const op of operations) {
      const { type, collection, data, id } = op;
      const modelName = COLLECTION_MODEL[collection];

      if (!modelName) {
        console.error(`Unknown sync collection: ${collection}`);
        continue;
      }

      const model = prisma[modelName];

      try {
        if (type === 'CREATE') {
          const recordId = data.id || id;
          await model.upsert({
            where: { id: recordId },
            update: { ...data, id: recordId, userId },
            create: { ...data, id: recordId, userId }
          });
        } else if (type === 'UPDATE') {
          await model.updateMany({ where: { id, userId }, data });
        } else if (type === 'DELETE') {
          await model.deleteMany({ where: { id, userId } });
        }
      } catch (opError) {
        console.error(`Error processing operation ${type} on ${collection}:`, opError);
      }
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Server error during sync' });
  }
});

// A simpler approach for the frontend is to push FULL state or pull FULL state.
// Since it's a personal lifetracker and data is small, we can just do a full pull/push for sync.
app.post('/api/sync/pull', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const data = {
      calories: await prisma.meal.findMany({ where: { userId } }),
      tasks: await prisma.task.findMany({ where: { userId } }),
      notes: await prisma.note.findMany({ where: { userId } }),
      workouts: await prisma.workout.findMany({ where: { userId } }),
      calendarEvents: await prisma.calendarEvent.findMany({ where: { userId } }),
      water: await prisma.waterLog.findMany({ where: { userId } }),
      weight: await prisma.weightLog.findMany({ where: { userId } }),
      settings: await prisma.setting.findMany({ where: { userId } }),
      statistics: await prisma.statistic.findMany({ where: { userId } })
    };
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/sync/push', async (req, res) => {
  const { userId, data } = req.body;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // For a robust offline-first app, we use upserts for every known collection.
    for (const [collection, modelName] of Object.entries(COLLECTION_MODEL)) {
      const rows = data[collection];
      if (!rows) continue;

      const model = prisma[modelName];
      for (const row of rows) {
        await model.upsert({
          where: { id: row.id },
          update: { ...row, userId },
          create: { ...row, userId }
        });
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3001;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;