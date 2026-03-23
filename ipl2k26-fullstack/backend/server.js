require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { initDB } = require('./db');

const authRoutes    = require('./routes/auth');
const matchRoutes   = require('./routes/matches');
const betRoutes     = require('./routes/bets');
const adminRoutes   = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    /\.netlify\.app$/,
    /\.onrender\.com$/,
  ],
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/bets',    betRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api',         adminRoutes);   // wallet routes also on /api/wallet

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'IPL2K26 API running ✅' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  await initDB();          // create tables if not exist
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

start();
