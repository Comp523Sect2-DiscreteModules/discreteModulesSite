import 'dotenv/config';
import path from 'path';
import { existsSync } from 'fs';

import { pool } from './db.js';
import app, { distPath } from './app.js';

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
