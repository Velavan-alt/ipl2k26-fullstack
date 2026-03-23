const express = require('express');
const { pool } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM users ORDER BY created_at DESC');

    const result = await Promise.all(users.rows.map(async (u) => {
      const betsRes = await pool.query(
        'SELECT status, amount FROM bets WHERE user_id=$1', [u.id]
      );
      const bets       = betsRes.rows;
      const wonBets    = bets.filter(b => b.status === 'won').length;
      const totalStaked = bets.reduce((s, b) => s + parseFloat(b.amount), 0);

      return {
        id:            u.id,
        name:          u.name,
        username:      u.username,
        email:         u.email,
        password:      u.password,
        walletBalance: parseFloat(u.wallet),
        isActive:      u.is_active,
        totalBets:     bets.length,
        wonBets,
        totalStaked:   parseFloat(totalStaked.toFixed(2)),
        createdAt:     u.created_at,
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/admin/users/:id/add-money ──────────────────────────────────────
router.post('/users/:id/add-money', authMiddleware, adminMiddleware, async (req, res) => {
  const { amount, note } = req.body;
  const userId = parseInt(req.params.id);

  if (!amount || amount <= 0)
    return res.status(400).json({ error: 'Enter a valid amount' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userRes = await client.query('SELECT * FROM users WHERE id=$1 FOR UPDATE', [userId]);
    if (!userRes.rows.length) throw new Error('User not found');
    const user = userRes.rows[0];

    const balBefore = parseFloat(user.wallet);
    const balAfter  = parseFloat((balBefore + parseFloat(amount)).toFixed(2));

    await client.query('UPDATE users SET wallet=$1 WHERE id=$2', [balAfter, userId]);
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, note)
       VALUES ($1,'deposit',$2,$3,$4,$5)`,
      [userId, amount, balBefore, balAfter, note || 'Admin credit']
    );

    await client.query('COMMIT');
    res.json({ message: `₹${amount} added to ${user.name}`, newBalance: balAfter });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ── PUT /api/admin/users/:id/toggle ──────────────────────────────────────────
router.put('/users/:id/toggle', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET is_active = NOT is_active WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    const u = result.rows[0];
    res.json({ message: u.is_active ? 'User activated' : 'User suspended', isActive: u.is_active });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [usersRes, betsRes, volumeRes, pendingRes, liveRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM bets'),
      pool.query('SELECT COALESCE(SUM(amount),0) as total FROM bets'),
      pool.query("SELECT COUNT(*) FROM bets WHERE status='pending'"),
      pool.query("SELECT COUNT(*) FROM matches WHERE status='live'"),
    ]);

    res.json({
      totalUsers:   parseInt(usersRes.rows[0].count),
      totalBets:    parseInt(betsRes.rows[0].count),
      totalVolume:  parseFloat(volumeRes.rows[0].total),
      pendingBets:  parseInt(pendingRes.rows[0].count),
      liveMatches:  parseInt(liveRes.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/wallet/balance ───────────────────────────────────────────────────
router.get('/wallet/balance', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT wallet FROM users WHERE email=$1', [req.user.email]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ balance: parseFloat(result.rows[0].wallet) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/wallet/transactions ─────────────────────────────────────────────
router.get('/wallet/transactions', authMiddleware, async (req, res) => {
  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email=$1', [req.user.email]);
    if (!userRes.rows.length) return res.json([]);

    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id=$1 ORDER BY created_at DESC',
      [userRes.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
