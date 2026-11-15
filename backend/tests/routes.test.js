import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Route tests never reach Postgres: the connection pool is replaced with a
// stub whose query() each test programs.
vi.mock('../src/db.js', () => ({ pool: { query: vi.fn() } }));

const { pool } = await import('../src/db.js');
const { default: app } = await import('../src/app.js');

const ADMIN = { 'x-user-role': 'admin' };
const EDITOR_LINK = 'https://docs.google.com/forms/d/ABC/edit';

beforeEach(() => {
  pool.query.mockReset();
});

describe('GET /api/health', () => {
  // BR-01
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/modules', () => {
  // BR-02
  it('filters to published modules for a student', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app).get('/api/modules');

    expect(res.status).toBe(200);
    expect(pool.query.mock.calls[0][0]).toContain('WHERE published = true');
  });

  it('does not filter for an admin', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await request(app).get('/api/modules').set(ADMIN);

    expect(pool.query.mock.calls[0][0]).not.toContain('published = true');
  });
});

describe('GET /api/modules/:id', () => {
  // BR-03
  it('returns 404 when the module does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/modules/9999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Module not found.' });
  });

  it('returns 404 for a draft module when the caller is a student', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 3, title: 'Draft', published: false }],
    });

    const res = await request(app).get('/api/modules/3');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Module not found.' });
  });

  it('returns a draft module with its lessons for an admin', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ id: 3, title: 'Draft', published: false }],
      })
      .mockResolvedValueOnce({ rows: [{ id: 7, title: 'Lesson' }] });

    const res = await request(app).get('/api/modules/3').set(ADMIN);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Draft');
    expect(res.body.lessons).toEqual([{ id: 7, title: 'Lesson' }]);
  });
});

describe('POST /api/modules', () => {
  // BR-04
  it('returns 403 for a student and writes nothing', async () => {
    const res = await request(app)
      .post('/api/modules')
      .send({ slug: 'graphs', title: 'Graphs' });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'Admin access required.' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  // BR-05
  it('returns 400 when the title is missing', async () => {
    const res = await request(app)
      .post('/api/modules')
      .set(ADMIN)
      .send({ slug: 'graphs' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'slug and title are required.' });
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('creates the module and returns 201 for a valid body', async () => {
    const created = {
      id: 4,
      slug: 'graphs',
      title: 'Graphs',
      published: false,
    };
    pool.query.mockResolvedValueOnce({ rows: [created] });

    const res = await request(app)
      .post('/api/modules')
      .set(ADMIN)
      .send({ slug: 'graphs', title: 'Graphs' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
    // slug, title, description (default ''), published (default false)
    expect(pool.query.mock.calls[0][1]).toEqual([
      'graphs',
      'Graphs',
      '',
      false,
    ]);
  });
});

describe('PUT /api/modules/:id', () => {
  // BR-06
  it('rejects an editor link with 400 and writes nothing', async () => {
    const res = await request(app)
      .put('/api/modules/1')
      .set(ADMIN)
      .send({ quiz_form_url: EDITOR_LINK });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(
      /^That isn't a shareable Google Form link\./,
    );
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('clears the quiz when quiz_form_url is an empty string', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, quiz_form_url: null }],
    });

    const res = await request(app)
      .put('/api/modules/1')
      .set(ADMIN)
      .send({ quiz_form_url: '' });

    expect(res.status).toBe(200);
    expect(res.body.quiz_form_url).toBeNull();
    // [title, description, published, updatesQuizForm, quizFormUrl, id]
    const params = pool.query.mock.calls[0][1];
    expect(params[3]).toBe(true);
    expect(params[4]).toBeNull();
  });

  it('leaves the quiz alone when quiz_form_url is not in the body', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'New' }] });

    await request(app).put('/api/modules/1').set(ADMIN).send({ title: 'New' });

    expect(pool.query.mock.calls[0][1][3]).toBe(false);
  });
});

describe('/api/lessons', () => {
  // BR-07
  it('POST returns 403 for a student', async () => {
    const res = await request(app)
      .post('/api/lessons')
      .send({ module_id: 1, title: 'L' });

    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('POST returns 400 for an admin when module_id is missing', async () => {
    const res = await request(app)
      .post('/api/lessons')
      .set(ADMIN)
      .send({ title: 'L' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'module_id and title are required.' });
  });

  // BR-08
  it('PUT returns 404 when the lesson does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put('/api/lessons/9999')
      .set(ADMIN)
      .send({ title: 'X' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Lesson not found.' });
  });
});

describe('unknown routes and server errors', () => {
  // BR-09
  it('returns a JSON 404 for an unknown /api route', async () => {
    const res = await request(app).get('/api/doesnotexist');

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toEqual({ error: 'Not found.' });
  });

  // BR-10
  it('returns a generic 500 with no stack trace when the database throws', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    pool.query.mockRejectedValueOnce(new Error('connection refused'));

    const res = await request(app).get('/api/modules');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'Something went wrong on the server. Check the backend logs.',
    });
    expect(JSON.stringify(res.body)).not.toContain('connection refused');
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
