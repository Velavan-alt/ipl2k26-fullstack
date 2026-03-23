const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// ── Create all tables on startup ──────────────────────────────────────────────
const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        username    VARCHAR(50)  NOT NULL UNIQUE,
        email       VARCHAR(100) NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        wallet      DECIMAL(12,2) DEFAULT 0.00,
        is_active   BOOLEAN DEFAULT true,
        created_at  TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS matches (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(200) NOT NULL,
        team1       VARCHAR(100) NOT NULL,
        team2       VARCHAR(100) NOT NULL,
        team1_score VARCHAR(50)  DEFAULT '-',
        team2_score VARCHAR(50)  DEFAULT '-',
        odds_team1  DECIMAL(5,2) DEFAULT 1.80,
        odds_team2  DECIMAL(5,2) DEFAULT 2.00,
        odds_draw   DECIMAL(5,2) DEFAULT 10.00,
        venue       VARCHAR(200),
        match_time  TIMESTAMP NOT NULL,
        status      VARCHAR(20)  DEFAULT 'upcoming',
        winner      VARCHAR(20),
        overs       VARCHAR(20)  DEFAULT '-',
        created_at  TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS bets (
        id            SERIAL PRIMARY KEY,
        user_id       INTEGER REFERENCES users(id),
        match_id      INTEGER REFERENCES matches(id),
        bet_on        VARCHAR(20) NOT NULL,
        amount        DECIMAL(10,2) NOT NULL,
        odds_at_bet   DECIMAL(5,2) NOT NULL,
        potential_win DECIMAL(10,2) NOT NULL,
        status        VARCHAR(20) DEFAULT 'pending',
        placed_at     TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id             SERIAL PRIMARY KEY,
        user_id        INTEGER REFERENCES users(id),
        type           VARCHAR(30) NOT NULL,
        amount         DECIMAL(10,2) NOT NULL,
        balance_before DECIMAL(12,2) NOT NULL,
        balance_after  DECIMAL(12,2) NOT NULL,
        reference_id   INTEGER,
        note           VARCHAR(255),
        created_at     TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Database tables ready');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
