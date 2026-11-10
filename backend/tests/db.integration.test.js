import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import { pool } from '../src/db.js';
import app from '../src/app.js';

// These tests run against a REAL Postgres database. schema.sql drops and
// recreates every table, so refuse to run unless we are pointed at a database
// whose name ends in _test. vitest.config.js sets PGDATABASE accordingly.
const dbName = process.env.PGDATABASE ?? '';
if (!dbName.endsWith('_test')) {
  throw new Error(
    `Refusing to run integration tests against "${dbName}": ` +
      'the database name must end in _test.',
  );
}

const dbDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'db',
);
const schema = readFileSync(path.join(dbDir, 'schema.sql'), 'utf8');
const seed = readFileSync(path.join(dbDir, 'seed.sql'), 'utf8');

const ADMIN = { 'x-user-role': 'admin' };
const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSabc123/viewform';

async function resetDatabase() {
  await pool.query(schema);
  await pool.query(seed);
}

beforeAll(resetDatabase);
beforeEach(resetDatabase);
afterAll(() => pool.end());

describe('seed data through the API', () => {
  // BI-01
  it('shows a student only the published modules, in order', async () => {
    const res = await request(app).get('/api/modules');

    expect(res.status).toBe(200);
    expect(res.body.map((m) => m.title)).toEqual([
      'Propositional Logic',
      'Set Theory',
    ]);
  });

  it('shows an admin every module including the draft', async () => {
    const res = await request(app).get('/api/modules').set(ADMIN);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body.filter((m) => !m.published)).toHaveLength(1);
  });
});

describe('creating a module', () => {
  // BI-02
  it('appends it with order_index MAX + 1 and defaults to unpublished', async () => {
    const res = await request(app)
      .post('/api/modules')
      .set(ADMIN)
      .send({ slug: 'graph-theory', title: 'Graph Theory' });

    expect(res.status).toBe(201);
    expect(res.body.order_index).toBe(4);
    expect(res.body.published).toBe(false);

    // ...and a student still cannot see it.
    const student = await request(app).get('/api/modules');
    expect(student.body.map((m) => m.slug)).not.toContain('graph-theory');
  });
});

describe('updating a module', () => {
  // BI-03
  it('changes only the fields that were sent and bumps updated_at', async () => {
    const before = (await request(app).get('/api/modules/1')).body;

    const res = await request(app)
      .put('/api/modules/1')
      .set(ADMIN)
      .send({ title: 'Renamed Module' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Renamed Module');
    expect(res.body.description).toBe(before.description);
    expect(res.body.published).toBe(before.published);
    expect(res.body.quiz_form_url).toBe(before.quiz_form_url);
    expect(new Date(res.body.updated_at).getTime()).toBeGreaterThan(
      new Date(before.updated_at).getTime(),
    );
  });

  // BI-04
  it('stores the canonical quiz link, then clears it with an empty string', async () => {
    const saved = await request(app)
      .put('/api/modules/1')
      .set(ADMIN)
      .send({ quiz_form_url: `<iframe src="${FORM}"></iframe>` });

    expect(saved.status).toBe(200);
    expect(saved.body.quiz_form_url).toBe(`${FORM}?embedded=true`);

    const cleared = await request(app)
      .put('/api/modules/1')
      .set(ADMIN)
      .send({ quiz_form_url: '' });

    expect(cleared.status).toBe(200);
    expect(cleared.body.quiz_form_url).toBeNull();

    const reread = await request(app).get('/api/modules/1');
    expect(reread.body.quiz_form_url).toBeNull();
  });
});
