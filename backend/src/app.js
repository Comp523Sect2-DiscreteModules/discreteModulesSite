import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { attachUserRole } from './userRole.js';
import modulesRouter from './routes/modules.js';
import lessonsRouter from './routes/lessons.js';

// The Express app, built but not started. server.js listens on a port; the
// automated tests import this file directly and drive it with supertest.
const app = express();

app.use(express.json());

app.use(attachUserRole);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/modules', modulesRouter);
app.use('/api/lessons', lessonsRouter);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const distPath = path.join(__dirname, '..', '..', 'frontend', 'dist');

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

export default app;
