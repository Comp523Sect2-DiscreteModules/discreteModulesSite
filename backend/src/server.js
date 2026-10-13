import express from 'express';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

import { pool } from './db.js';
import modulesRouter from './routes/modules.js';
import lessonsRouter from './routes/lessons.js';
import quizRouter from './routes/quiz.js';

const app = express();

app.use(express.json());

// --- Base-layer "auth" ---
// There is no real session/identity system yet (Onyen SSO is a separate,
// larger task). The frontend's mock login screen sets a role and sends it
// on every request as `x-user-role`. This middleware just reads that header
// so route handlers can gate admin-only actions. Replace this with real
// session/JWT-based auth once SSO is wired up.
app.use((req, _res, next) => {
  req.userRole = req.header('x-user-role') === 'admin' ? 'admin' : 'student';
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/modules', modulesRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/quiz', quizRouter);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', '..', 'frontend', 'dist');

// Unknown API routes should return JSON 404s, not the React app
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

// Built frontend (JS/CSS/assets)
app.use(express.static(distPath));

// A missing hashed asset should 404, not return index.html with a 200
app.use('/assets', (_req, res) => res.sendStatus(404));

// SPA fallback: needed because you use BrowserRouter. Without it,
// refreshing on /modules/1/quiz or /admin would return "Cannot GET ...".
app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));

// Safety net: any error passed to next() (including from asyncHandler-wrapped
// routes) lands here instead of crashing the process. Logs the real error
// server-side but returns a generic message to the client.
app.use((err, _req, res, _next) => {
  console.error('Request failed:', err);
  res.status(500).json({
    error: 'Something went wrong on the server. Check the backend logs.',
  });
});

const PORT = process.env.PORT || 4000;

async function start() {
  // Fail loudly and clearly if Postgres isn't reachable or the schema
  // hasn't been applied, instead of letting the first request surface it.
  try {
    await pool.query('SELECT 1 FROM modules LIMIT 1');
  } catch (err) {
    console.error('\n--- Database check failed on startup ---');
    console.error(err.message);
    console.error(
      'Is Postgres running? Does the database in your .env exist? ' +
        'Have you run `npm run db:setup` to apply schema.sql and seed.sql?\n',
    );
    process.exit(1);
  }

  if (!existsSync(path.join(distPath, 'index.html'))) {
    console.warn(
      'Frontend build not found (frontend/dist). Fine in dev: use the Vite ' +
        'server on :5173. For production, run `npm run build` first.',
    );
  }

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start();
