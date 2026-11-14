import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface StoredLoginEvent {
  id: string;
  studentId: string;
  rollNumber: number;
  studentName: string;
  username: string;
  phone?: string;
  action: 'register' | 'login';
  timestamp: string;
  date: string;
}

interface LoginStoreData {
  events: StoredLoginEvent[];
  registeredPhones: Record<string, string>;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'student-logins.json');

function readStore(): LoginStoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<LoginStoreData>;
      return {
        events: Array.isArray(parsed.events) ? parsed.events : [],
        registeredPhones:
          parsed.registeredPhones && typeof parsed.registeredPhones === 'object'
            ? parsed.registeredPhones
            : {},
      };
    }
  } catch (err) {
    console.error('Failed to read student-logins store:', err);
  }
  return { events: [], registeredPhones: {} };
}

function writeStore(data: LoginStoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write student-logins store:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/student-logins', (_req, res) => {
    const store = readStore();
    res.json(store);
  });

  app.post('/api/student-logins', (req, res) => {
    const body = req.body as Partial<StoredLoginEvent> | undefined;
    if (!body || !body.studentId || !body.rollNumber || !body.studentName) {
      res.status(400).json({ error: 'Invalid login event payload' });
      return;
    }

    const store = readStore();
    const event: StoredLoginEvent = {
      id: typeof body.id === 'string' && body.id ? body.id : `login-${body.studentId}-${Date.now()}`,
      studentId: String(body.studentId),
      rollNumber: Number(body.rollNumber),
      studentName: String(body.studentName),
      username: body.username ? String(body.username) : `student${body.rollNumber}`,
      phone: body.phone ? String(body.phone) : undefined,
      action: body.action === 'register' ? 'register' : 'login',
      timestamp: body.timestamp ? String(body.timestamp) : new Date().toISOString().slice(0, 16).replace('T', ' '),
      date: body.date ? String(body.date) : new Date().toISOString().slice(0, 10),
    };

    const exists = store.events.some((e) => e.id === event.id);
    if (!exists) {
      store.events = [event, ...store.events].slice(0, 500);
    }
    if (event.phone) {
      store.registeredPhones[event.studentId] = event.phone;
    }

    writeStore(store);
    res.json({ ok: true, store });
  });

  app.delete('/api/student-logins', (_req, res) => {
    const empty: LoginStoreData = { events: [], registeredPhones: {} };
    writeStore(empty);
    res.json({ ok: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
