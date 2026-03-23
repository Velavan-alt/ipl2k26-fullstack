const express = require('express');
const { pool } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/matches — public ─────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM matches ORDER BY match_time ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/matches/:id — public ────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM matches WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Match not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/matches — admin ─────────────────────────────────────────────────
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { title, team1, team2, venue, oddsTeam1, oddsTeam2, oddsDraw, matchTime } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO matches (title, team1, team2, venue, odds_team1, odds_team2, odds_draw, match_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, team1, team2, venue, oddsTeam1, oddsTeam2, oddsDraw, matchTime]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/matches/:id/live — admin ─────────────────────────────────────────
router.put('/:id/live', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE matches SET status='live' WHERE id=$1 RETURNING *",
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/matches/:id/reschedule — admin ───────────────────────────────────
router.put('/:id/reschedule', authMiddleware, adminMiddleware, async (req, res) => {
  const { matchTime } = req.body;
  try {
    const result = await pool.query(
      "UPDATE matches SET match_time=$1, status='upcoming' WHERE id=$2 RETURNING *",
      [matchTime, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/matches/:id/odds — admin ────────────────────────────────────────
router.put('/:id/odds', authMiddleware, adminMiddleware, async (req, res) => {
  const { oddsTeam1, oddsTeam2, oddsDraw } = req.body;
  try {
    const result = await pool.query(
      'UPDATE matches SET odds_team1=$1, odds_team2=$2, odds_draw=$3 WHERE id=$4 RETURNING *',
      [oddsTeam1, oddsTeam2, oddsDraw, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/matches/:id — admin ──────────────────────────────────────────
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM matches WHERE id=$1', [req.params.id]);
    res.json({ message: 'Match deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
