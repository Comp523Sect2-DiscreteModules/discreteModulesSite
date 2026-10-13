import { Router } from 'express';
import { pool } from '../db.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAdmin } from '../requireAdmin.js';

const router = Router();

// GET /api/quiz/:moduleId
router.get(
  '/:moduleId',
  asyncHandler(async (req, res) => {
    const { moduleId } = req.params;

    // Match the published-module visibility rules used elsewhere.
    const moduleResult = await pool.query(
      'SELECT published FROM modules WHERE id = $1',
      [moduleId],
    );

    const module = moduleResult.rows[0];

    if (!module || (!module.published && req.userRole !== 'admin')) {
      return res.status(404).json({ error: 'Module not found.' });
    }

    // Only administrators need the answer key.
    const columns =
      req.userRole === 'admin'
        ? 'id, module_id, prompt, choices, correct_choice, explanation, order_index'
        : 'id, module_id, prompt, choices, order_index';

    const { rows } = await pool.query(
      `SELECT ${columns}
       FROM quiz_questions
       WHERE module_id = $1
       ORDER BY order_index, id`,
      [moduleId],
    );

    res.json(rows);
  }),
);

// POST /api/quiz/:moduleId
// Admin only: append one or more questions to a module's quiz.
router.post(
  '/:moduleId',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const moduleId = Number(req.params.moduleId);
    const { questions } = req.body;

    if (!Number.isInteger(moduleId) || moduleId < 1) {
      return res.status(400).json({ error: 'Invalid module ID.' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        error: 'At least one question is required.',
      });
    }

    // Validate and normalize the entire request before inserting anything.
    const cleanedQuestions = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i] ?? {};

      const prompt =
        typeof question.prompt === 'string' ? question.prompt.trim() : '';

      const choices = Array.isArray(question.choices)
        ? question.choices.map((choice) =>
            typeof choice === 'string' ? choice.trim() : '',
          )
        : [];

      const rawCorrectChoice = question.correct_choice;
      const correctChoice = Number(rawCorrectChoice);

      if (!prompt) {
        return res.status(400).json({
          error: `Question ${i + 1} needs a prompt.`,
        });
      }

      if (choices.length < 2 || choices.some((choice) => !choice)) {
        return res.status(400).json({
          error: `Question ${i + 1} needs at least two nonempty choices.`,
        });
      }

      if (
        rawCorrectChoice === null ||
        rawCorrectChoice === undefined ||
        rawCorrectChoice === '' ||
        !Number.isInteger(correctChoice) ||
        correctChoice < 0 ||
        correctChoice >= choices.length
      ) {
        return res.status(400).json({
          error: `Question ${i + 1} has an invalid correct answer.`,
        });
      }

      cleanedQuestions.push({
        prompt,
        choices,
        correctChoice,
        explanation:
          typeof question.explanation === 'string'
            ? question.explanation.trim() || null
            : null,
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const moduleResult = await client.query(
        'SELECT id FROM modules WHERE id = $1',
        [moduleId],
      );

      if (!moduleResult.rows[0]) {
        await client.query('ROLLBACK');

        return res.status(404).json({
          error: 'Module not found.',
        });
      }

      // Continue the existing ordering for this module's questions.
      const orderResult = await client.query(
        `SELECT COALESCE(MAX(order_index), 0) AS max_order
         FROM quiz_questions
         WHERE module_id = $1`,
        [moduleId],
      );

      let nextOrder = Number(orderResult.rows[0].max_order) + 1;
      const savedQuestions = [];

      for (const question of cleanedQuestions) {
        const { rows } = await client.query(
          `INSERT INTO quiz_questions
            (module_id, prompt, choices, correct_choice, explanation, order_index)
           VALUES ($1, $2, $3::jsonb, $4, $5, $6)
           RETURNING *`,
          [
            moduleId,
            question.prompt,
            JSON.stringify(question.choices),
            question.correctChoice,
            question.explanation,
            nextOrder++,
          ],
        );

        savedQuestions.push(rows[0]);
      }

      await client.query('COMMIT');

      res.status(201).json(savedQuestions);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }),
);

export default router;
