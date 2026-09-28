import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../requireAdmin.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

// POST /api/lessons  (admin only) -> add a lesson to a module
router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { module_id, title, content_md = '', video_url = null } = req.body;

  if (!module_id || !title) {
    return res.status(400).json({ error: 'module_id and title are required.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO lessons (module_id, title, content_md, video_url, order_index)
     VALUES ($1, $2, $3, $4,
       (SELECT COALESCE(MAX(order_index), 0) + 1 FROM lessons WHERE module_id = $1))
     RETURNING *`,
    [module_id, title, content_md, video_url]
  );

  res.status(201).json(rows[0]);
}));

// PUT /api/lessons/:id  (admin only) -> edit a lesson's content
router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content_md, video_url } = req.body;

  const { rows } = await pool.query(
    `UPDATE lessons
     SET title = COALESCE($1, title),
         content_md = COALESCE($2, content_md),
         video_url = COALESCE($3, video_url),
         updated_at = now()
     WHERE id = $4
     RETURNING *`,
    [title, content_md, video_url, id]
  );

  if (!rows[0]) {
    return res.status(404).json({ error: 'Lesson not found.' });
  }
  res.json(rows[0]);
}));

export default router;
