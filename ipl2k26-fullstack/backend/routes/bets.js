const express = require('express');
const { pool } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/bets — place a bet ─────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { matchId, betOn, amount } = req.body;
  const userEmail = req.user.email;

  if (!matchId || !betOn || !amount)
    return res.status(400).json({ error: 'matchId, betOn and amount are required' });

  if (amount < 10)  return res.status(400).json({ error: 'Minimum bet is ₹10' });
  if (amount > 50000) return res.status(400).json({ error: 'Maximum bet is ₹50,000' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get match
    const matchRes = await client.query('SELECT * FROM matches WHERE id=$1', [matchId]);
    if (!matchRes.rows.length) throw new Error('Match not found');
    const match = matchRes.rows[0];

    if (!['upcoming', 'live'].includes(match.status))
      throw new Error('Betting is closed for this match');

    // Get locked odds
    const oddsMap = { team1: match.odds_team1, team2: match.odds_team2, draw: match.odds_draw };
    const lockedOdds = oddsMap[betOn.toLowerCase()];
    if (!lockedOdds) throw new Error('Invalid betOn value. Use team1, team2 or draw');

    const potentialWin = parseFloat((amount * lockedOdds).toFixed(2));

    // Get user and check balance
    const userRes = await client.query('SELECT * FROM users WHERE email=$1 FOR UPDATE', [userEmail]);
    if (!userRes.rows.length) throw new Error('User not found');
    const user = userRes.rows[0];

    if (parseFloat(user.wallet) < amount)
      throw new Error('Insufficient wallet balance');

    // Deduct wallet
    const balBefore = parseFloat(user.wallet);
    const balAfter  = parseFloat((balBefore - amount).toFixed(2));
    await client.query('UPDATE users SET wallet=$1 WHERE id=$2', [balAfter, user.id]);

    // Save bet
    const betRes = await client.query(
      `INSERT INTO bets (user_id, match_id, bet_on, amount, odds_at_bet, potential_win, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING *`,
      [user.id, matchId, betOn.toLowerCase(), amount, lockedOdds, potentialWin]
    );
    const bet = betRes.rows[0];

    // Save transaction
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, reference_id, note)
       VALUES ($1,'bet_placed',$2,$3,$4,$5,$6)`,
      [user.id, amount, balBefore, balAfter, bet.id, `Bet on ${match.title}`]
    );

    await client.query('COMMIT');

    res.json({
      id:           bet.id,
      matchTitle:   match.title,
      betOn:        bet.bet_on,
      selection:    bet.bet_on === 'team1' ? match.team1 + ' Win'
                  : bet.bet_on === 'team2' ? match.team2 + ' Win' : 'Draw',
      amount:       parseFloat(bet.amount),
      oddsAtBet:    parseFloat(bet.odds_at_bet),
      potentialWin: parseFloat(bet.potential_win),
      status:       bet.status,
      newBalance:   balAfter,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ── GET /api/bets/my — user's own bets ───────────────────────────────────────
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email=$1', [req.user.email]);
    if (!userRes.rows.length) return res.json([]);
    const userId = userRes.rows[0].id;

    const result = await pool.query(
      `SELECT b.*, m.title as match_title, m.team1, m.team2
       FROM bets b JOIN matches m ON b.match_id = m.id
       WHERE b.user_id=$1 ORDER BY b.placed_at DESC`,
      [userId]
    );

    const bets = result.rows.map(b => ({
      id:           b.id,
      matchTitle:   b.match_title,
      betOn:        b.bet_on,
      selection:    b.bet_on === 'team1' ? b.team1 + ' Win'
                  : b.bet_on === 'team2' ? b.team2 + ' Win' : 'Draw',
      amount:       parseFloat(b.amount),
      oddsAtBet:    parseFloat(b.odds_at_bet),
      potentialWin: parseFloat(b.potential_win),
      status:       b.status,
      placedAt:     b.placed_at,
    }));

    res.json(bets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/bets — admin: all bets ──────────────────────────────────────────
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name as user_name, u.email as user_email,
              m.title as match_title, m.team1, m.team2
       FROM bets b
       JOIN users u ON b.user_id = u.id
       JOIN matches m ON b.match_id = m.id
       ORDER BY b.placed_at DESC`
    );

    const bets = result.rows.map(b => ({
      id:           b.id,
      userName:     b.user_name,
      userEmail:    b.user_email,
      matchTitle:   b.match_title,
      betOn:        b.bet_on,
      selection:    b.bet_on === 'team1' ? b.team1 + ' Win'
                  : b.bet_on === 'team2' ? b.team2 + ' Win' : 'Draw',
      amount:       parseFloat(b.amount),
      oddsAtBet:    parseFloat(b.odds_at_bet),
      potentialWin: parseFloat(b.potential_win),
      status:       b.status,
      placedAt:     b.placed_at,
    }));

    res.json(bets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/bets/declare/:matchId — admin: declare result ──────────────────
router.post('/declare/:matchId', authMiddleware, adminMiddleware, async (req, res) => {
  const { winner } = req.body; // 'team1', 'team2', 'draw'
  const matchId = parseInt(req.params.matchId);

  if (!['team1', 'team2', 'draw'].includes(winner?.toLowerCase()))
    return res.status(400).json({ error: 'winner must be team1, team2 or draw' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get match
    const matchRes = await client.query('SELECT * FROM matches WHERE id=$1', [matchId]);
    if (!matchRes.rows.length) throw new Error('Match not found');
    const match = matchRes.rows[0];

    // Update match status and winner
    await client.query(
      "UPDATE matches SET status='completed', winner=$1 WHERE id=$2",
      [winner.toLowerCase(), matchId]
    );

    // Get all pending bets for this match
    const betsRes = await client.query(
      "SELECT b.*, u.wallet, u.email FROM bets b JOIN users u ON b.user_id=u.id WHERE b.match_id=$1 AND b.status='pending'",
      [matchId]
    );

    let won = 0, lost = 0, totalPayout = 0;

    for (const bet of betsRes.rows) {
      const userWon = bet.bet_on === winner.toLowerCase();

      if (userWon) {
        const payout     = parseFloat(bet.potential_win);
        const balBefore  = parseFloat(bet.wallet);
        const balAfter   = parseFloat((balBefore + payout).toFixed(2));

        // Credit wallet
        await client.query('UPDATE users SET wallet=$1 WHERE id=$2', [balAfter, bet.user_id]);

        // Record transaction
        await client.query(
          `INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, reference_id, note)
           VALUES ($1,'bet_win',$2,$3,$4,$5,$6)`,
          [bet.user_id, payout, balBefore, balAfter, bet.id, `Win: ${match.title}`]
        );

        await client.query("UPDATE bets SET status='won' WHERE id=$1", [bet.id]);
        won++;
        totalPayout += payout;
      } else {
        await client.query("UPDATE bets SET status='lost' WHERE id=$1", [bet.id]);
        lost++;
      }
    }

    await client.query('COMMIT');

    const winnerName = winner === 'team1' ? match.team1
                     : winner === 'team2' ? match.team2 : 'Draw';

    res.json({
      message:      `Result declared! ${winnerName} won.`,
      winner:       winnerName,
      won,
      lost,
      totalPayout:  parseFloat(totalPayout.toFixed(2)),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
