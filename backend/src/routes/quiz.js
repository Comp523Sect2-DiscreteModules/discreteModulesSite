import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';

const router = Router();

// GET /api/quiz/:moduleId
// Stub for the base layer: the table exists (see db/schema.sql) but no
// questions are seeded yet, so this returns an empty array. The quiz page
// on the frontend is built to render whatever comes back here, so wiring
// up real questions later is just a matter of inserting rows.
router.get('/:moduleId', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM quiz_questions WHERE module_id = $1 ORDER BY order_index, id',
    [req.params.moduleId]
  );
  res.json(rows);
}));

export default router;
