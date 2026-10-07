import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../requireAdmin.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

// GET /api/modules
// Students see only published modules; admins see everything so they can
// find and edit drafts too.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query =
      req.userRole === 'admin'
        ? 'SELECT * FROM modules ORDER BY order_index, id'
        : 'SELECT * FROM modules WHERE published = true ORDER BY order_index, id';
    const { rows } = await pool.query(query);
    res.json(rows);
  }),
);

// GET /api/modules/:id  -> module details plus its lessons
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const moduleResult = await pool.query(
      'SELECT * FROM modules WHERE id = $1',
      [id],
    );
    const moduleRow = moduleResult.rows[0];

    if (!moduleRow) {
      return res.status(404).json({ error: 'Module not found.' });
    }
    if (!moduleRow.published && req.userRole !== 'admin') {
      return res.status(404).json({ error: 'Module not found.' });
    }

    const lessonsResult = await pool.query(
      'SELECT * FROM lessons WHERE module_id = $1 ORDER BY order_index, id',
      [id],
    );

    res.json({ ...moduleRow, lessons: lessonsResult.rows });
  }),
);

// POST /api/modules  (admin only) -> create a new module
router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { slug, title, description = '', published = false } = req.body;

    if (!slug || !title) {
      return res.status(400).json({ error: 'slug and title are required.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO modules (slug, title, description, published, order_index)
     VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM modules))
     RETURNING *`,
      [slug, title, description, published],
    );

    res.status(201).json(rows[0]);
  }),
);

// PUT /api/modules/:id  (admin only) -> edit title/description/published
router.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, published } = req.body;

    const { rows } = await pool.query(
      `UPDATE modules
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         published = COALESCE($3, published),
         updated_at = now()
     WHERE id = $4
     RETURNING *`,
      [title, description, published, id],
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Module not found.' });
    }
    res.json(rows[0]);
  }),
);

export default router;
