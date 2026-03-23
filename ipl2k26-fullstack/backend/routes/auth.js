const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

const makeToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, username: user.username, name: user.name, role: user.role || 'USER' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const normEmail    = email.toLowerCase().trim();
    const normUsername = username.toLowerCase().trim().replace(/\s/g, '');

    // Check duplicates
    const exists = await pool.query(
      'SELECT id FROM users WHERE email=$1 OR username=$2',
      [normEmail, normUsername]
    );
    if (exists.rows.length > 0) {
      const taken = exists.rows[0];
      return res.status(400).json({
        error: exists.rows.some(r => r.email === normEmail)
          ? 'Email already registered'
          : 'Username already taken',
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, username, email, password, wallet)
       VALUES ($1, $2, $3, $4, 0) RETURNING *`,
      [name.trim(), normUsername, normEmail, hashed]
    );

    const user  = result.rows[0];
    const token = makeToken({ ...user, role: 'USER' });

    res.json({
      token,
      role:          'USER',
      name:          user.name,
      username:      user.username,
      email:         user.email,
      walletBalance: parseFloat(user.wallet),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password)
    return res.status(400).json({ error: 'Identifier and password are required' });

  try {
    const id = identifier.toLowerCase().trim();

    // Admin check
    if (id === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = makeToken({ id: 0, email: process.env.ADMIN_EMAIL, username: 'admin', name: 'Admin', role: 'ADMIN' });
      return res.json({ token, role: 'ADMIN', name: 'Admin', username: 'admin', email: process.env.ADMIN_EMAIL, walletBalance: 0 });
    }

    // Find user by email or username
    const result = await pool.query(
      'SELECT * FROM users WHERE email=$1 OR username=$1',
      [id]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: 'No account found with that email or username' });

    const user = result.rows[0];

    if (!user.is_active)
      return res.status(403).json({ error: 'Account suspended. Contact admin.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: 'Incorrect password' });

    const token = makeToken({ ...user, role: 'USER' });

    res.json({
      token,
      role:          'USER',
      name:          user.name,
      username:      user.username,
      email:         user.email,
      walletBalance: parseFloat(user.wallet),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
