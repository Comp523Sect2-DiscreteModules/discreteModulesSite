import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const schema = readFileSync(
    path.join(__dirname, '..', 'db', 'schema.sql'),
    'utf8',
  );
  const seed = readFileSync(
    path.join(__dirname, '..', 'db', 'seed.sql'),
    'utf8',
  );

  console.log('Applying schema.sql ...');
  await pool.query(schema);

  console.log('Applying seed.sql ...');
  await pool.query(seed);

  console.log('Database ready.');
  await pool.end();
}

run().catch((err) => {
  console.error('Failed to set up database:', err);
  process.exit(1);
});
