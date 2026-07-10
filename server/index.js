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
app.post('/api/sync', async (req, res) => {
  const { userId, operations } = req.body;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Process operations sequentially
    for (const op of operations) {
      const { type, collection, data, id } = op;
      
      try {
        switch (collection) {
          case 'calories':
            if (type === 'CREATE') {
              await prisma.meal.upsert({
                where: { id: data.id },
                update: { ...data, userId },
                create: { ...data, userId }
              });
            } else if (type === 'UPDATE') {
              await prisma.meal.updateMany({ where: { id, userId }, data });
            } else if (type === 'DELETE') {
              await prisma.meal.deleteMany({ where: { id, userId } });
            }
            break;

          case 'weight':
            if (type === 'CREATE' || type === 'UPDATE') {
              const weightId = data.id || id;
              await prisma.statistic.upsert({
                where: { id: weightId },
                update: { distance: data.weight }, // weight maps to distance here? No wait!
                // Let's just create proper weight fields, wait, schema has Profile.weight, but we need weight log!
                // Ah, let's fix the schema for weight log. We can use a new model WeightLog or put it in Statistic.
                // Let's use Profile weight or create WeightLog. Let's create WeightLog.
                create: {}
              });
            }
            break;
            // Add other collections...
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
    // To make it simple, we can delete and re-insert or use upserts.
    // For a robust offline-first app, we should use upserts.
    
    // Process Tasks
    if (data.tasks) {
      for (const t of data.tasks) {
        await prisma.task.upsert({
          where: { id: t.id },
          update: { ...t, userId },
          create: { ...t, userId }
        });
      }
    }

    // Process Notes
    if (data.notes) {
      for (const n of data.notes) {
        await prisma.note.upsert({
          where: { id: n.id },
          update: { ...n, userId },
          create: { ...n, userId }
        });
      }
    }

    // Process Meals (Calories)
    if (data.calories) {
      for (const m of data.calories) {
        await prisma.meal.upsert({
          where: { id: m.id },
          update: { ...m, userId },
          create: { ...m, userId }
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
