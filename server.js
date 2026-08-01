const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'
});

const eduPool = new Pool({
  connectionString: process.env.EDU_DATABASE_URL || 'postgres://mytriv:mytriv_password_2026@127.0.0.1:5432/mytriv'
});

// Admin token untuk console admin (header: x-admin-token)
const ADMIN_TOKEN = process.env.AIMAP_ADMIN_TOKEN || 'mytriv-admin-2026';

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'aicmap-monopoly-api' }));

// SSO Login & Sync with Edu MyTriv Database
app.post('/api/auth/sso-login', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email Edu wajib diisi' });

    let eduUser = null;
    let subscriptionTier = 'free';

    try {
      const eduQuery = await eduPool.query(
        `SELECT id, email, name, plan, "extensionPlan", "subscriptionStatus" FROM users WHERE LOWER(email) = LOWER($1)`,
        [email.trim()]
      );

      if (eduQuery.rowCount > 0) {
        eduUser = eduQuery.rows[0];
        const pVal = (eduUser.plan || eduUser.extensionPlan || 'free').toLowerCase();
        if (pVal === 'pro' || pVal === 'pro_edu') subscriptionTier = 'pro_edu';
        else if (pVal === 'basic' || pVal === 'basic_edu') subscriptionTier = 'basic_edu';
      }
    } catch (err) {
      console.error('Edu DB Sync Error:', err.message);
    }

    let pRes = await pool.query(`SELECT * FROM monopoly_players WHERE LOWER(email) = LOWER($1)`, [email.trim()]);
    let player;

    if (!pRes.rowCount) {
      const pName = eduUser ? eduUser.name : email.split('@')[0];
      const initialCoins = subscriptionTier === 'pro_edu' ? 11000 : (subscriptionTier === 'basic_edu' ? 2500 : 1000);

      const newP = await pool.query(
        `INSERT INTO monopoly_players (name, email, subscription_tier, balance, country, city)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [pName, email.trim(), subscriptionTier, initialCoins, 'Indonesia', 'Jakarta']
      );
      player = newP.rows[0];
    } else {
      player = pRes.rows[0];
      if (player.subscription_tier !== subscriptionTier) {
        let coinBonus = 0;
        if (subscriptionTier === 'pro_edu' && player.subscription_tier !== 'pro_edu') coinBonus = 10000;
        else if (subscriptionTier === 'basic_edu' && player.subscription_tier === 'free') coinBonus = 1500;

        const updated = await pool.query(
          `UPDATE monopoly_players SET subscription_tier = $1, balance = balance + $2::INTEGER, updated_at = NOW() WHERE member_id = $3 RETURNING *`,
          [subscriptionTier, coinBonus, player.member_id]
        );
        player = updated.rows[0];
      }
    }

    res.json({
      sso_success: true,
      edu_user: eduUser ? { ...eduUser, tier: subscriptionTier } : null,
      player
    });
  } catch (e) {
    console.error('SSO Endpoint Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// 1. Get All Monopoly Properties
app.get('/api/monopoly/properties', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, pl.name as owner_name, pl.country as owner_country
      FROM monopoly_properties p
      LEFT JOIN monopoly_players pl ON p.owner_id = pl.member_id
      ORDER BY p.id ASC
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. Get Player State & Owned Properties
app.get('/api/monopoly/player/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const player = await pool.query(`SELECT * FROM monopoly_players WHERE member_id = $1`, [id]);
    if (!player.rowCount) return res.status(404).json({ error: 'Player tidak ditemukan' });

    const owned = await pool.query(`SELECT * FROM monopoly_properties WHERE owner_id = $1`, [id]);
    res.json({
      ...player.rows[0],
      owned_properties: owned.rows
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =================================================================
// 🌍 COMMUNITY ENDPOINTS (members, events, chat, leaderboard)
// =================================================================

// GET Members (list, optional country/city filter)
app.get('/api/members', async (req, res) => {
  try {
    const { country, city } = req.query;
    let sql = `SELECT id, name, role, country, province, city, lat, lng, bio, avatar_color, is_verified, created_at FROM members`;
    const conds = [];
    const vals = [];
    if (country) { conds.push(`country ILIKE $${vals.length + 1}`); vals.push('%' + country + '%'); }
    if (city) { conds.push(`city ILIKE $${vals.length + 1}`); vals.push('%' + city + '%'); }
    if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
    sql += ' ORDER BY created_at DESC LIMIT 500';
    const r = await pool.query(sql, vals);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST Register Member
app.post('/api/members', async (req, res) => {
  try {
    const { name, role = 'Builder', country, province, city, lat, lng, bio, email } = req.body || {};
    if (!name || !country) return res.status(400).json({ error: 'Nama dan Negara wajib diisi' });

    const colors = ['#00f0ff', '#ff00ff', '#00ff88', '#ffaa00', '#7c3aed', '#f43f5e', '#22d3ee', '#facc15'];
    const avatar_color = colors[Math.floor(Math.random() * colors.length)];

    const r = await pool.query(
      `INSERT INTO members (name, role, country, province, city, lat, lng, bio, email, avatar_color)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, name, role, country, city, lat, lng, bio, avatar_color, is_verified, created_at`,
      [name, role, country, province || null, city || null, lat || null, lng || null, bio || null, email || null, avatar_color]
    );
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH Verify / Update Member (admin)
app.patch('/api/members/:id', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Token admin salah' });

    const { id } = req.params;
    const { is_verified, role } = req.body || {};
    const sets = [];
    const vals = [];
    if (typeof is_verified === 'boolean') { sets.push(`is_verified = $${vals.length + 1}`); vals.push(is_verified); }
    if (role) { sets.push(`role = $${vals.length + 1}`); vals.push(role); }
    if (!sets.length) return res.status(400).json({ error: 'Tidak ada field untuk diupdate' });
    vals.push(id);
    const r = await pool.query(`UPDATE members SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${vals.length} RETURNING *`, vals);
    if (!r.rowCount) return res.status(404).json({ error: 'Member tidak ditemukan' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE Member (admin)
app.delete('/api/members/:id', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Token admin salah' });

    const { id } = req.params;
    const r = await pool.query(`DELETE FROM members WHERE id = $1 RETURNING id`, [id]);
    if (!r.rowCount) return res.status(404).json({ error: 'Member tidak ditemukan' });
    res.json({ ok: true, deleted_id: id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET Events (list)
app.get('/api/events', async (req, res) => {
  try {
    const { country } = req.query;
    let sql = `SELECT * FROM events`;
    const vals = [];
    if (country) { sql += ` WHERE country ILIKE $1`; vals.push('%' + country + '%'); }
    sql += ' ORDER BY created_at DESC LIMIT 100';
    const r = await pool.query(sql, vals);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST Create Event
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, country, city, lat, lng, event_type = 'Meetup', join_url, host_name } = req.body || {};
    if (!title || !country) return res.status(400).json({ error: 'Judul dan Negara wajib diisi' });

    const r = await pool.query(
      `INSERT INTO events (title, description, country, city, lat, lng, event_type, join_url, host_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [title, description || null, country, city || null, lat || null, lng || null, event_type, join_url || null, host_name || null]
    );
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE Event (admin)
app.delete('/api/events/:id', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Token admin salah' });

    const { id } = req.params;
    const r = await pool.query(`DELETE FROM events WHERE id = $1 RETURNING id`, [id]);
    if (!r.rowCount) return res.status(404).json({ error: 'Event tidak ditemukan' });
    res.json({ ok: true, deleted_id: id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET Chat Messages
app.get('/api/chat', async (req, res) => {
  try {
    const { country, limit = 50 } = req.query;
    const lim = Math.min(parseInt(limit) || 50, 200);
    let sql = `SELECT cm.*, m.name AS resolved_name FROM chat_messages cm
               LEFT JOIN members m ON cm.member_id = m.id`;
    const vals = [];
    if (country) { sql += ` WHERE cm.country ILIKE $${vals.length + 1}`; vals.push('%' + country + '%'); }
    sql += ` ORDER BY cm.created_at DESC LIMIT $${vals.length + 1}`;
    vals.push(lim);
    const r = await pool.query(sql, vals);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST Send Chat Message
app.post('/api/chat', async (req, res) => {
  try {
    const { member_name = 'Guest', country = 'Global', message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Pesan tidak boleh kosong' });

    const r = await pool.query(
      `INSERT INTO chat_messages (member_name, country, message) VALUES ($1,$2,$3) RETURNING *`,
      [String(member_name).slice(0, 40), String(country).slice(0, 40), String(message).slice(0, 280)]
    );
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET Leaderboard (cities, countries, recent members)
app.get('/api/leaderboard', async (req, res) => {
  try {
    const cities = await pool.query(`
      SELECT city, country, COUNT(*) AS members
      FROM members WHERE city IS NOT NULL AND city <> ''
      GROUP BY city, country ORDER BY members DESC LIMIT 20`);
    const countries = await pool.query(`
      SELECT country, COUNT(*) AS members
      FROM members WHERE country IS NOT NULL AND country <> ''
      GROUP BY country ORDER BY members DESC LIMIT 20`);
    const recent = await pool.query(`
      SELECT id, name, role, country, city, avatar_color, is_verified, created_at
      FROM members ORDER BY created_at DESC LIMIT 10`);
    res.json({ cities: cities.rows, countries: countries.rows, recent: recent.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =================================================================
// 🎲 VIRTUAL MONOPOLY GAME ENDPOINTS
// =================================================================

// GET Monopoly Leaderboard
app.get('/api/monopoly/leaderboard', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT p.member_id, p.name, p.country, p.city, p.subscription_tier, p.balance,
             COUNT(prop.id) AS total_properties
      FROM monopoly_players p
      LEFT JOIN monopoly_properties prop ON prop.owner_id = p.member_id
      GROUP BY p.member_id, p.name, p.country, p.city, p.subscription_tier, p.balance
      ORDER BY p.balance DESC LIMIT 50
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST Credit Subscription (simulate subscribe, grant coin bonus)
app.post('/api/monopoly/credit-subscription', async (req, res) => {
  try {
    const { member_id, subscription_tier = 'basic_edu' } = req.body || {};
    if (!member_id) return res.status(400).json({ error: 'member_id wajib' });
    const mId = parseInt(member_id);

    const p = await pool.query(`SELECT * FROM monopoly_players WHERE member_id = $1`, [mId]);
    if (!p.rowCount) return res.status(404).json({ error: 'Player tidak ditemukan' });

    const tier = String(subscription_tier).toLowerCase();
    const current = (p.rows[0].subscription_tier || 'free').toLowerCase();
    let bonus = 0;
    if (tier === 'pro_edu' && current !== 'pro_edu') bonus = 10000;
    else if (tier === 'basic_edu' && current === 'free') bonus = 1500;

    const r = await pool.query(
      `UPDATE monopoly_players SET subscription_tier = $1, balance = balance + $2::INTEGER, updated_at = NOW()
       WHERE member_id = $3 RETURNING *`,
      [tier, bonus, mId]
    );

    if (bonus > 0) {
      await pool.query(
        `INSERT INTO token_transactions (member_id, amount, source_type, description)
         VALUES ($1, $2, 'subscription_bonus', $3)`,
        [mId, bonus, `Bonus Token SSO Upgrade Langganan (${tier.toUpperCase()})`]
      );
    }

    res.json({
      ok: true,
      subscription_tier: tier,
      coin_bonus: bonus,
      balance: r.rows[0].balance,
      message: `Langganan ${tier.toUpperCase()} berhasil${bonus > 0 ? `! +${bonus} TrivCoin bonus` : ''}!`
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST Roll Dice & Move
app.post('/api/monopoly/roll-dice', async (req, res) => {
  try {
    const { member_id } = req.body || {};
    if (!member_id) return res.status(401).json({ error: 'Silakan Login SSO terlebih dahulu.' });
    const mId = parseInt(member_id);

    const p = await pool.query(`SELECT * FROM monopoly_players WHERE member_id = $1`, [mId]);
    if (!p.rowCount) return res.status(404).json({ error: 'Player tidak ditemukan' });
    const player = p.rows[0];

    const props = await pool.query(`
      SELECT p.*, pl.name AS owner_name, pl.country AS owner_country
      FROM monopoly_properties p
      LEFT JOIN monopoly_players pl ON p.owner_id = pl.member_id
      ORDER BY p.id ASC
    `);
    if (!props.rowCount) return res.status(500).json({ error: 'Belum ada properti di papan' });

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const totalStep = dice1 + dice2;

    // Land on property based on current position + dice step
    const currentIdx = player.current_property_id
      ? props.rows.findIndex(x => x.id === player.current_property_id)
      : -1;
    const landIdx = (currentIdx < 0 ? 0 : currentIdx + totalStep) % props.rows.length;
    const landed = props.rows[landIdx];

    await pool.query(
      `UPDATE monopoly_players SET current_property_id = $1, updated_at = NOW() WHERE member_id = $2`,
      [landed.id, mId]
    );

    let rentNotice = null;
    if (landed.owner_id && parseInt(landed.owner_id) !== mId) {
      const rent = (landed.base_rent || 0) * (landed.level || 1);
      if (parseInt(player.balance) >= rent) {
        await pool.query(`UPDATE monopoly_players SET balance = balance - $1::INTEGER WHERE member_id = $2`, [rent, mId]);
        await pool.query(`UPDATE monopoly_players SET balance = balance + $1::INTEGER WHERE member_id = $2`, [rent, landed.owner_id]);
        await pool.query(
          `INSERT INTO token_transactions (member_id, amount, source_type, description)
           VALUES ($1, -$2::INTEGER, 'rent_payment', $3)`,
          [mId, rent, `Bayar sewa ke ${landed.owner_name || 'pemilik'} (${landed.name})`]
        );
        rentNotice = `💰 Anda membayar sewa ${rent} TrivCoin kepada ${landed.owner_name || 'pemilik'} untuk ${landed.name}.`;
      } else {
        rentNotice = `⚠️ Saldo Anda tidak cukup untuk membayar sewa ${rent} TrivCoin di ${landed.name}.`;
      }
    }

    // Provide a quiz related to the landed property
    let quiz = null;
    try {
      const qz = await pool.query(
        `SELECT * FROM edu_quizzes WHERE ($1::text IS NULL OR category ILIKE $1) ORDER BY RANDOM() LIMIT 1`,
        [landed.quiz_category || null]
      );
      if (qz.rowCount) {
        const q = qz.rows[0];
        quiz = {
          id: q.id,
          question: q.question,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
          reward_coins: q.reward_coins || 50,
          explanation: q.explanation || ''
        };
      }
    } catch (e) {
      console.error('Quiz fetch error:', e.message);
    }

    res.json({
      dice: [dice1, dice2],
      total_step: totalStep,
      landed_property: landed,
      rent_notice: rentNotice,
      quiz
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST Buy Property
app.post('/api/monopoly/buy-property', async (req, res) => {
  try {
    const { member_id, property_id } = req.body || {};
    if (!member_id || !property_id) return res.status(400).json({ error: 'member_id dan property_id wajib' });
    const mId = parseInt(member_id);
    const pId = parseInt(property_id);

    const prop = await pool.query(`SELECT * FROM monopoly_properties WHERE id = $1`, [pId]);
    if (!prop.rowCount) return res.status(404).json({ error: 'Properti tidak ditemukan' });
    if (prop.rows[0].owner_id) return res.status(400).json({ error: 'Properti ini sudah dimiliki orang lain' });

    const pl = await pool.query(`SELECT balance FROM monopoly_players WHERE member_id = $1`, [mId]);
    if (!pl.rowCount) return res.status(404).json({ error: 'Player tidak ditemukan' });
    if (parseInt(pl.rows[0].balance) < parseInt(prop.rows[0].price)) {
      return res.status(400).json({ error: `Saldo TrivCoin tidak cukup. Dibutuhkan ${prop.rows[0].price} TrivCoin.` });
    }

    await pool.query(`UPDATE monopoly_players SET balance = balance - $1::INTEGER, current_property_id = $2, updated_at = NOW() WHERE member_id = $3`, [prop.rows[0].price, pId, mId]);
    await pool.query(`UPDATE monopoly_properties SET owner_id = $1, level = 1 WHERE id = $2`, [mId, pId]);
    await pool.query(
      `INSERT INTO token_transactions (member_id, amount, source_type, description)
       VALUES ($1, -$2::INTEGER, 'property_buy', $3)`,
      [mId, prop.rows[0].price, `Beli properti ${prop.rows[0].name}`]
    );

    res.json({ ok: true, message: `🎉 Berhasil membeli ${prop.rows[0].name}!` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST Upgrade Property
app.post('/api/monopoly/upgrade-property', async (req, res) => {
  try {
    const { member_id, property_id } = req.body || {};
    if (!member_id || !property_id) return res.status(400).json({ error: 'member_id dan property_id wajib' });
    const mId = parseInt(member_id);
    const pId = parseInt(property_id);

    const prop = await pool.query(`SELECT * FROM monopoly_properties WHERE id = $1`, [pId]);
    if (!prop.rowCount) return res.status(404).json({ error: 'Properti tidak ditemukan' });
    if (parseInt(prop.rows[0].owner_id) !== mId) return res.status(400).json({ error: 'Hanya pemilik properti yang bisa upgrade' });

    const upgradeCost = Math.round(parseInt(prop.rows[0].price) * 0.5);
    const pl = await pool.query(`SELECT balance FROM monopoly_players WHERE member_id = $1`, [mId]);
    if (parseInt(pl.rows[0].balance) < upgradeCost) {
      return res.status(400).json({ error: `Saldo TrivCoin tidak cukup untuk upgrade (${upgradeCost} TrivCoin).` });
    }

    await pool.query(`UPDATE monopoly_players SET balance = balance - $1::INTEGER, updated_at = NOW() WHERE member_id = $2`, [upgradeCost, mId]);
    await pool.query(`UPDATE monopoly_properties SET level = level + 1 WHERE id = $1`, [pId]);
    await pool.query(
      `INSERT INTO token_transactions (member_id, amount, source_type, description)
       VALUES ($1, -$2::INTEGER, 'property_upgrade', $3)`,
      [mId, upgradeCost, `Upgrade properti ${prop.rows[0].name} ke Level ${prop.rows[0].level + 1}`]
    );

    res.json({ ok: true, message: `🎉 ${prop.rows[0].name} naik ke Level ${prop.rows[0].level + 1}!` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST Answer Quiz
app.post('/api/monopoly/answer-quiz', async (req, res) => {
  try {
    const { member_id, quiz_id, selected_option } = req.body || {};
    if (!member_id || !quiz_id || typeof selected_option !== 'number') {
      return res.status(400).json({ error: 'member_id, quiz_id, dan selected_option wajib' });
    }
    const mId = parseInt(member_id);

    const qz = await pool.query(`SELECT * FROM edu_quizzes WHERE id = $1`, [parseInt(quiz_id)]);
    if (!qz.rowCount) return res.status(404).json({ error: 'Kuis tidak ditemukan' });
    const q = qz.rows[0];

    const correct = selected_option === q.correct_answer;

    if (correct) {
      await pool.query(`UPDATE monopoly_players SET balance = balance + $1::INTEGER, quizzes_solved = quizzes_solved + 1, updated_at = NOW() WHERE member_id = $2`, [q.reward_coins || 50, mId]);
      await pool.query(
        `INSERT INTO token_transactions (member_id, amount, source_type, description)
         VALUES ($1, $2, 'quiz_reward', $3)`,
        [mId, q.reward_coins || 50, `Reward Kuis Edu: ${q.category}`]
      );
    }

    res.json({ correct, explanation: q.explanation || 'Jawaban benar!' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET P2P Marketplace Listings
app.get('/api/monopoly/marketplace/listings', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT l.id, l.asking_price, l.status, l.created_at,
             p.id AS property_id, p.name AS property_name, p.category, p.city, p.country, p.level,
             pl.name AS seller_name, pl.member_id AS seller_id, pl.subscription_tier AS seller_tier
      FROM monopoly_listings l
      JOIN monopoly_properties p ON l.property_id = p.id
      JOIN monopoly_players pl ON l.seller_id = pl.member_id
      WHERE l.status = 'active'
      ORDER BY l.created_at DESC
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST List Property on Marketplace
app.post('/api/monopoly/marketplace/list-property', async (req, res) => {
  try {
    const { member_id, property_id, asking_price } = req.body || {};
    if (!member_id || !property_id || !asking_price) return res.status(400).json({ error: 'member_id, property_id, asking_price wajib' });
    const mId = parseInt(member_id);
    const pId = parseInt(property_id);
    const price = parseInt(asking_price);

    const prop = await pool.query(`SELECT * FROM monopoly_properties WHERE id = $1`, [pId]);
    if (!prop.rowCount) return res.status(404).json({ error: 'Properti tidak ditemukan' });
    if (parseInt(prop.rows[0].owner_id) !== mId) return res.status(400).json({ error: 'Hanya pemilik properti yang bisa menjual' });

    const existing = await pool.query(`SELECT id FROM monopoly_listings WHERE property_id = $1 AND status = 'active'`, [pId]);
    if (existing.rowCount) return res.status(400).json({ error: 'Properti ini sudah terpasang di marketplace' });

    await pool.query(
      `INSERT INTO monopoly_listings (property_id, seller_id, asking_price, status) VALUES ($1, $2, $3, 'active')`,
      [pId, mId, price]
    );
    res.json({ ok: true, message: `🏷 ${prop.rows[0].name} berhasil dipasang di Marketplace dengan harga ${price} TrivCoin!` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST Buy Marketplace Listing
app.post('/api/monopoly/marketplace/buy-listing', async (req, res) => {
  try {
    const { member_id, listing_id } = req.body || {};
    if (!member_id || !listing_id) return res.status(400).json({ error: 'member_id dan listing_id wajib' });
    const mId = parseInt(member_id);
    const lId = parseInt(listing_id);

    const listing = await pool.query(`SELECT * FROM monopoly_listings WHERE id = $1 AND status = 'active'`, [lId]);
    if (!listing.rowCount) return res.status(404).json({ error: 'Listing tidak ditemukan atau sudah tidak aktif' });
    const li = listing.rows[0];
    if (parseInt(li.seller_id) === mId) return res.status(400).json({ error: 'Tidak bisa membeli properti sendiri' });

    const buyer = await pool.query(`SELECT balance FROM monopoly_players WHERE member_id = $1`, [mId]);
    if (!buyer.rowCount) return res.status(404).json({ error: 'Player tidak ditemukan' });
    if (parseInt(buyer.rows[0].balance) < parseInt(li.asking_price)) {
      return res.status(400).json({ error: `Saldo TrivCoin tidak cukup. Dibutuhkan ${li.asking_price} TrivCoin.` });
    }

    const prop = await pool.query(`SELECT name FROM monopoly_properties WHERE id = $1`, [li.property_id]);

    await pool.query(`UPDATE monopoly_players SET balance = balance - $1::INTEGER, updated_at = NOW() WHERE member_id = $2`, [li.asking_price, mId]);
    await pool.query(`UPDATE monopoly_players SET balance = balance + $1::INTEGER, updated_at = NOW() WHERE member_id = $2`, [li.asking_price, li.seller_id]);
    await pool.query(`UPDATE monopoly_properties SET owner_id = $1 WHERE id = $2`, [mId, li.property_id]);
    await pool.query(`UPDATE monopoly_listings SET status = 'sold' WHERE id = $1`, [lId]);
    await pool.query(
      `INSERT INTO token_transactions (member_id, amount, source_type, description)
       VALUES ($1, -$2::INTEGER, 'marketplace_buy', $3)`,
      [mId, li.asking_price, `Beli ${prop.rows[0].name} dari marketplace P2P`]
    );
    await pool.query(
      `INSERT INTO token_transactions (member_id, amount, source_type, description)
       VALUES ($1, $2, 'marketplace_sell', $3)`,
      [li.seller_id, li.asking_price, `Penjualan ${prop.rows[0].name} di marketplace P2P`]
    );

    res.json({ ok: true, message: `🎉 Berhasil membeli ${prop.rows[0].name} seharga ${li.asking_price} TrivCoin!` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// =================================================================
// 🏨 WORLDWIDE HOTEL AGGREGATOR DATABASE & ENDPOINTS
// =================================================================

const WORLDWIDE_HOTELS = [
  // INDONESIA
  {
    id: 'h1',
    name: 'Hotel Indonesia Kempinski Jakarta',
    city: 'Jakarta',
    country: 'Indonesia',
    lat: -6.1952,
    lng: 106.8231,
    stars: 5,
    rating: 4.9,
    reviews: 1420,
    price_idr: 2100000,
    price_formatted: 'Rp 2,1jt',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
    amenities: ['Pool', 'WiFi', 'Breakfast', 'Gym', 'Spa'],
    rates: [
      { provider: 'Agoda', price: 2100000, best: true },
      { provider: 'Booking.com', price: 2250000, best: false },
      { provider: 'Traveloka', price: 2200000, best: false }
    ],
    description: 'Hotel mewah ikonik di Bundaran HI Jakarta dengan panorama kota yang spektakuler.'
  },
  {
    id: 'h2',
    name: 'The Ritz-Carlton Jakarta SCBD',
    city: 'Jakarta',
    country: 'Indonesia',
    lat: -6.2254,
    lng: 106.8099,
    stars: 5,
    rating: 4.95,
    reviews: 980,
    price_idr: 3400000,
    price_formatted: 'Rp 3,4jt',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
    amenities: ['Pool', 'WiFi', 'Breakfast', 'Gym', 'Valet'],
    rates: [
      { provider: 'Booking.com', price: 3400000, best: true },
      { provider: 'Agoda', price: 3520000, best: false }
    ],
    description: 'Pengalaman menginap ultra-mewah di kawasan bisnis SCBD Jakarta.'
  },
  {
    id: 'h3',
    name: 'The Mulia Resort Nusa Dua',
    city: 'Bali',
    country: 'Indonesia',
    lat: -8.7951,
    lng: 115.2289,
    stars: 5,
    rating: 4.98,
    reviews: 2310,
    price_idr: 4200000,
    price_formatted: 'Rp 4,2jt',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&auto=format&fit=crop&q=80',
    amenities: ['Private Beach', 'Infinity Pool', 'Spa', 'WiFi'],
    rates: [
      { provider: 'Agoda', price: 4200000, best: true },
      { provider: 'Booking.com', price: 4350000, best: false }
    ],
    description: 'Resort pantai bintang 5 terkemuka di Nusa Dua Bali menghadap Samudra Hindia.'
  },
  {
    id: 'h4',
    name: 'Desa Potato Head Seminyak',
    city: 'Bali',
    country: 'Indonesia',
    lat: -8.6791,
    lng: 115.1528,
    stars: 5,
    rating: 4.85,
    reviews: 1750,
    price_idr: 2850000,
    price_formatted: 'Rp 2,85jt',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80',
    amenities: ['Beach Club', 'Pool', 'WiFi', 'Sunset Bar'],
    rates: [
      { provider: 'Agoda', price: 2850000, best: true },
      { provider: 'Booking.com', price: 2990000, best: false }
    ],
    description: 'Kawasan gaya hidup boutique hotel paling hits di pantai Seminyak Bali.'
  },
  {
    id: 'h5',
    name: 'Padma Hotel Bandung',
    city: 'Bandung',
    country: 'Indonesia',
    lat: -6.8523,
    lng: 107.6074,
    stars: 5,
    rating: 4.91,
    reviews: 1890,
    price_idr: 1650000,
    price_formatted: 'Rp 1,65jt',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80',
    amenities: ['Heated Pool', 'Valley View', 'WiFi', 'Gym'],
    rates: [
      { provider: 'Traveloka', price: 1650000, best: true },
      { provider: 'Agoda', price: 1710000, best: false }
    ],
    description: 'Resort lereng lembah di Ciumbuleuit Bandung dengan kolam air hangat luar ruangan.'
  },

  // JAPAN
  {
    id: 'h6',
    name: 'Aman Tokyo Otemachi',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6882,
    lng: 139.7644,
    stars: 5,
    rating: 4.99,
    reviews: 620,
    price_idr: 14500000,
    price_formatted: '¥ 140.000 (~Rp 14,5jt)',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    amenities: ['Ryokan Onsen', 'City View', 'Spa', 'WiFi'],
    rates: [
      { provider: 'Agoda', price: 14500000, best: true },
      { provider: 'Booking.com', price: 14800000, best: false }
    ],
    description: 'Oase ketenangan zen di puncak Otemachi Tower Tokyo dengan panorama Gunung Fuji.'
  },
  {
    id: 'h7',
    name: 'Park Hyatt Tokyo Shinjuku',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6852,
    lng: 139.6909,
    stars: 5,
    rating: 4.92,
    reviews: 1450,
    price_idr: 9800000,
    price_formatted: '¥ 95.000 (~Rp 9,8jt)',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80',
    amenities: ['Pool', 'Sky Lounge', 'Gym', 'WiFi'],
    rates: [
      { provider: 'Booking.com', price: 9800000, best: true },
      { provider: 'Trip.com', price: 9950000, best: false }
    ],
    description: 'Hotel ikonik di Shinjuku Tokyo tempat lokasi film Lost in Translation.'
  },
  {
    id: 'h8',
    name: 'Hoshinoya Kyoto Ryokan',
    city: 'Kyoto',
    country: 'Japan',
    lat: 35.0116,
    lng: 135.6777,
    stars: 5,
    rating: 4.97,
    reviews: 510,
    price_idr: 12400000,
    price_formatted: '¥ 120.000 (~Rp 12,4jt)',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80',
    amenities: ['Traditional Onsen', 'River View', 'Kaiseki Dinner', 'WiFi'],
    rates: [
      { provider: 'Agoda', price: 12400000, best: true },
      { provider: 'Booking.com', price: 12700000, best: false }
    ],
    description: 'Ryokan tradisional tepi sungai Oi di Arashiyama Kyoto dengan akses perahu kayu.'
  },

  // SINGAPORE
  {
    id: 'h9',
    name: 'Marina Bay Sands Singapore',
    city: 'Singapore',
    country: 'Singapore',
    lat: 1.2834,
    lng: 103.8607,
    stars: 5,
    rating: 4.96,
    reviews: 5400,
    price_idr: 7800000,
    price_formatted: 'S$ 680 (~Rp 7,8jt)',
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&auto=format&fit=crop&q=80',
    amenities: ['Rooftop Infinity Pool', 'Casino', 'Shopping Mall', 'WiFi'],
    rates: [
      { provider: 'Booking.com', price: 7800000, best: true },
      { provider: 'Agoda', price: 7950000, best: false }
    ],
    description: 'Hotel ikonik Singapura dengan kolam renang infinity rooftop terbesar di dunia.'
  },
  {
    id: 'h10',
    name: 'Raffles Hotel Singapore',
    city: 'Singapore',
    country: 'Singapore',
    lat: 1.2949,
    lng: 103.8545,
    stars: 5,
    rating: 4.98,
    reviews: 820,
    price_idr: 11200000,
    price_formatted: 'S$ 980 (~Rp 11,2jt)',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
    amenities: ['Colonial Luxury', 'Long Bar', 'Spa', 'WiFi'],
    rates: [
      { provider: 'Agoda', price: 11200000, best: true },
      { provider: 'Trip.com', price: 11450000, best: false }
    ],
    description: 'Hotel bersejarah gaya kolonial abad ke-19 tempat lahirnya cocktail Singapore Sling.'
  },

  // FRANCE
  {
    id: 'h11',
    name: 'The Ritz Paris Place Vendôme',
    city: 'Paris',
    country: 'France',
    lat: 48.8681,
    lng: 2.3284,
    stars: 5,
    rating: 4.97,
    reviews: 890,
    price_idr: 18900000,
    price_formatted: '€ 1.150 (~Rp 18,9jt)',
    image: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=600&auto=format&fit=crop&q=80',
    amenities: ['Palace Status', 'Chanel Spa', 'WiFi', 'Gourmet Dining'],
    rates: [
      { provider: 'Booking.com', price: 18900000, best: true },
      { provider: 'Expedia', price: 19200000, best: false }
    ],
    description: 'Hotel paling legendaris di Place Vendôme Paris melambangkan keanggunan gaya Prancis.'
  },

  // UNITED STATES
  {
    id: 'h12',
    name: 'The Plaza Hotel New York',
    city: 'New York',
    country: 'United States',
    lat: 40.7645,
    lng: -73.9745,
    stars: 5,
    rating: 4.91,
    reviews: 3200,
    price_idr: 13500000,
    price_formatted: '$ 890 (~Rp 13,5jt)',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&auto=format&fit=crop&q=80',
    amenities: ['Central Park View', 'Butler Service', 'Spa', 'WiFi'],
    rates: [
      { provider: 'Booking.com', price: 13500000, best: true },
      { provider: 'Agoda', price: 13800000, best: false }
    ],
    description: 'Hotel landmark legendaris New York di sudut Fifth Avenue dan Central Park.'
  }
];

// Hotel Search & Map Filter Endpoint (DB-first, fallback ke WORLDWIDE_HOTELS)
app.get('/api/hotels/search', async (req, res) => {
  try {
    const { city, min_price, max_price, stars, amenity, limit = 50 } = req.query;
    const conditions = [];
    const params = [];

    if (city) {
      params.push(`%${city.toLowerCase()}%`);
      conditions.push(`(LOWER(h.city) LIKE $${params.length} OR LOWER(h.country) LIKE $${params.length} OR LOWER(h.name) LIKE $${params.length})`);
    }
    if (min_price) {
      params.push(parseInt(min_price));
      conditions.push(`h.price_idr >= $${params.length}`);
    }
    if (max_price) {
      params.push(parseInt(max_price));
      conditions.push(`h.price_idr <= $${params.length}`);
    }
    if (stars && stars !== '0') {
      params.push(parseInt(stars));
      conditions.push(`h.stars >= $${params.length}`);
    }
    if (amenity) {
      params.push(`%${amenity.toLowerCase()}%`);
      conditions.push(`h.amenities::text ILIKE $${params.length}`);
    }
    params.push(parseInt(limit) || 50);

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT id, name, city, country, lat, lng, stars, rating, reviews, price_idr, price_formatted, currency, image, amenities, description
       FROM hotels h ${where} ORDER BY h.rating DESC LIMIT $${params.length}`,
      params
    );

    const source = 'db';
    if (rows.length > 0) {
      return res.json({ total: rows.length, source, hotels: rows.map(r => ({ ...r, amenities: Array.isArray(r.amenities) ? r.amenities : (r.amenities || []) })) });
    }

    // Fallback: in-memory catalog lama
    let filtered = WORLDWIDE_HOTELS;
    if (city) {
      const q = city.toLowerCase();
      filtered = filtered.filter(h => h.city.toLowerCase().includes(q) || h.country.toLowerCase().includes(q) || h.name.toLowerCase().includes(q));
    }
    if (min_price) filtered = filtered.filter(h => h.price_idr >= parseInt(min_price));
    if (max_price) filtered = filtered.filter(h => h.price_idr <= parseInt(max_price));
    if (stars && stars !== '0') filtered = filtered.filter(h => h.stars >= parseInt(stars));
    if (amenity) filtered = filtered.filter(h => h.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase())));

    res.json({ total: filtered.length, source: 'memory', hotels: filtered });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Hotel Detail Endpoint (DB-first)
app.get('/api/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const numId = parseInt(id);
    let hotel = null;

    if (Number.isInteger(numId) && numId > 0) {
      const { rows } = await pool.query(
        `SELECT id, name, city, country, lat, lng, stars, rating, reviews, price_idr, price_formatted, currency, image, amenities, description FROM hotels WHERE id = $1::INTEGER`,
        [numId]
      );
      if (rows.length > 0) hotel = { ...rows[0], amenities: Array.isArray(rows[0].amenities) ? rows[0].amenities : (rows[0].amenities || []) };
    }

    if (!hotel) hotel = WORLDWIDE_HOTELS.find(h => h.id === id);
    if (!hotel) return res.status(404).json({ error: 'Hotel tidak ditemukan' });
    res.json(hotel);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Redeem TrivCoin for Hotel Booking Discount Voucher
app.post('/api/hotels/redeem-trivcoin', async (req, res) => {
  try {
    const { member_id, coins_to_redeem } = req.body || {};
    if (!member_id || !coins_to_redeem) {
      return res.status(400).json({ error: 'member_id dan coins_to_redeem wajib' });
    }

    const mId = parseInt(member_id);
    const coins = parseInt(coins_to_redeem);
    if (coins < 500) return res.status(400).json({ error: 'Penukaran minimal 500 TrivCoin.' });

    const pState = await pool.query(`SELECT balance FROM monopoly_players WHERE member_id = $1::INTEGER`, [mId]);
    if (!pState.rowCount || parseInt(pState.rows[0].balance) < coins) {
      return res.status(400).json({ error: `Saldo TrivCoin Anda tidak cukup. Koin Anda: ${pState.rows[0] ? pState.rows[0].balance : 0} TrivCoin.` });
    }

    const discountRp = coins * 100;
    const voucherCode = `MYTRIV-HOTEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await pool.query(`UPDATE monopoly_players SET balance = balance - $1::INTEGER WHERE member_id = $2::INTEGER`, [coins, mId]);
    await pool.query(`
      INSERT INTO token_transactions (member_id, amount, source_type, description)
      VALUES ($1::INTEGER, -$2::INTEGER, 'hotel_voucher_redeem', $3)
    `, [mId, coins, `Tukar ${coins} TrivCoin jadi Voucher Diskon Hotel Rp ${discountRp.toLocaleString()}`]);

    res.json({
      ok: true,
      voucher_code: voucherCode,
      discount_rp: discountRp,
      discount_formatted: `Rp ${discountRp.toLocaleString()}`,
      message: `Selamat! Berhasil menukarkan ${coins} TrivCoin menjadi Voucher Diskon Hotel senilai Rp ${discountRp.toLocaleString()}!`
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});


// ==========================================
// TRAVELPAYOUTS REAL HOTEL & FLIGHT API INTEGRATION
// ==========================================
let TRAVELPAYOUTS_CONFIG = {
  api_token: process.env.TRAVELPAYOUTS_API_TOKEN || '4ef018269e8bb3be415f3ae7067d022b',
  marker_id: process.env.TRAVELPAYOUTS_MARKER_ID || '126699',
  enabled: true
};

// ==========================================
// TRAVELPAYOUTS PARTNER LINKS API & LIVE BULK ENGINE
// ==========================================

// Helper Function: Programmatic Travelpayouts Partner Link Generator
// Helper Function: Programmatic Travelpayouts & Direct OTA Partner Link Generator
function generateTravelpayoutsPartnerLink(targetUrl, campaignId = '4115', subId = 'mytriv_hotels', hotelName = '') {
  const marker = TRAVELPAYOUTS_CONFIG.marker_id || '126699';
  const mode = TRAVELPAYOUTS_CONFIG.enabled ? 'direct_ota' : 'tp_media';

  if (mode === 'direct_ota') {
    if (targetUrl.includes('agoda.com')) {
      return `https://www.agoda.com/search?text=${encodeURIComponent(hotelName || 'hotel')}&cid=1893836&tag=${marker}`;
    }
    if (targetUrl.includes('booking.com')) {
      return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotelName || 'hotel')}&aid=${marker}`;
    }
    if (targetUrl.includes('trip.com')) {
      return `https://www.trip.com/hotels/list?keyword=${encodeURIComponent(hotelName || 'hotel')}&Allianceid=${marker}`;
    }
    if (targetUrl.includes('traveloka.com')) {
      return `https://www.traveloka.com/en-id/hotel/search?spec=${encodeURIComponent(hotelName || 'hotel')}&marker=${marker}`;
    }
  }

  // Standard Travelpayouts Partner Link Generator format
  return `https://tp.media/r?marker=${marker}&p=${campaignId}&sub_id=${encodeURIComponent(subId)}&u=${encodeURIComponent(targetUrl)}`;
}

app.post('/api/travelpayouts/generate-link', (req, res) => {
  try {
    const { target_url, campaign_id = '4115', sub_id = 'mytriv_hotels' } = req.body || {};
    if (!target_url) {
      return res.status(400).json({ error: 'target_url wajib diisi' });
    }
    const partnerLink = generateTravelpayoutsPartnerLink(target_url, campaign_id, sub_id);
    res.json({
      status: 'ok',
      target_url: target_url,
      partner_link: partnerLink,
      marker_id: TRAVELPAYOUTS_CONFIG.marker_id
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// REST Endpoint: Bulk Auto-Fetch Live Hotel Data per City
app.get('/api/travelpayouts/hotels/live-city', async (req, res) => {
  try {
    const { city = 'Jakarta', currency = 'IDR' } = req.query;
    const token = TRAVELPAYOUTS_CONFIG.api_token || '4ef018269e8bb3be415f3ae7067d022b';

    // Call Travelpayouts Cache API
    const tpApiUrl = `https://engine.hotellook.com/api/v2/cache.json?location=${encodeURIComponent(city)}&currency=${currency.toLowerCase()}&limit=20&token=${token}`;
    
    let rawHotels = [];
    try {
      const resp = await fetch(tpApiUrl);
      if (resp.ok) {
        rawHotels = await resp.json();
      }
    } catch (err) {
      console.log("Fallback to local database for city:", city);
    }

    // Fallback ke database lokal jika Hotellook (deprecated sejak Okt 2025) tidak merespons
    if (!Array.isArray(rawHotels) || rawHotels.length === 0) {
      try {
        const { rows } = await pool.query(
          `SELECT id, name, city, country, lat, lng, stars, rating, reviews, price_idr, image, amenities, description
           FROM hotels WHERE LOWER(city) = LOWER($1) OR LOWER(country) = LOWER($1)
           ORDER BY rating DESC LIMIT 20`,
          [city.trim()]
        );
        if (rows.length > 0) {
          rawHotels = rows.map(r => ({
            hotelId: r.id,
            hotelName: r.name,
            priceFrom: r.price_idr,
            stars: r.stars,
            rating: r.rating,
            location: { lat: r.lat, lon: r.lng },
            _local: true
          }));
        }
      } catch (dbErr) {
        console.log("DB fallback error:", dbErr.message);
      }
    }

    // Process and enrich with Partner Links API
    const enrichedHotels = (Array.isArray(rawHotels) && rawHotels.length > 0) ? rawHotels.map(h => ({
      id: h.hotelId || h.id,
      name: h.hotelName || h.name,
      price: `${currency.toUpperCase()} ${(h.priceFrom || 1500000).toLocaleString()}`,
      priceVal: h.priceFrom || 1500000,
      stars: h.stars || 5,
      rating: h.rating || 4.9,
      lat: h.location ? h.location.lat : -6.2088,
      lng: h.location ? h.location.lon : 106.8456,
      img: h._local ? (h.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80') : `https://photos.hotellook.com/image_v2/limit/h${h.hotelId || 10001}_0/800/520.jpg`,
      desc: `Hotel bintang ${h.stars || 5} terverifikasi live di ${city}.`,
      partner_links: {
        agoda: generateTravelpayoutsPartnerLink(`https://www.agoda.com/search?text=${encodeURIComponent(h.hotelName || h.name)}`, '4115', `map_${city}`),
        booking: generateTravelpayoutsPartnerLink(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(h.hotelName || h.name)}`, '4114', `map_${city}`),
        trip: generateTravelpayoutsPartnerLink(`https://www.trip.com/hotels/list?keyword=${encodeURIComponent(h.hotelName || h.name)}`, '5075', `map_${city}`)
      }
    })) : WORLDWIDE_HOTELS.map(h => ({
      ...h,
      partner_links: {
        agoda: generateTravelpayoutsPartnerLink(`https://www.agoda.com/search?text=${encodeURIComponent(h.name)}`, '4115', `map_${city}`),
        booking: generateTravelpayoutsPartnerLink(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(h.name)}`, '4114', `map_${city}`),
        trip: generateTravelpayoutsPartnerLink(`https://www.trip.com/hotels/list?keyword=${encodeURIComponent(h.name)}`, '5075', `map_${city}`)
      }
    }));

    res.json({
      status: 'success',
      city: city,
      marker_id: TRAVELPAYOUTS_CONFIG.marker_id,
      total_hotels: enrichedHotels.length,
      hotels: enrichedHotels
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET Travelpayouts Config
app.get('/api/travelpayouts/config', (req, res) => {
  res.json({
    marker_id: TRAVELPAYOUTS_CONFIG.marker_id,
    enabled: TRAVELPAYOUTS_CONFIG.enabled,
    has_token: !!TRAVELPAYOUTS_CONFIG.api_token
  });
});

// POST Update Travelpayouts Config (User / Admin Settings)
app.post('/api/travelpayouts/config', (req, res) => {
  try {
    const { api_token, marker_id } = req.body || {};
    if (api_token) TRAVELPAYOUTS_CONFIG.api_token = api_token;
    if (marker_id) TRAVELPAYOUTS_CONFIG.marker_id = marker_id;
    res.json({ status: 'ok', message: 'Konfigurasi Travelpayouts berhasil disimpan!', config: TRAVELPAYOUTS_CONFIG });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET Travelpayouts Hotel Aggregator Search Endpoint
app.get('/api/travelpayouts/hotels/search', (req, res) => {
  try {
    const { city = 'Jakarta' } = req.query;
    const marker = TRAVELPAYOUTS_CONFIG.marker_id;

    // Rich Hotel Dataset enriched with Travelpayouts Affiliate Marker
    const matchingHotels = WORLDWIDE_HOTELS.filter(h => 
      h.city.toLowerCase().includes(city.toLowerCase()) || 
      h.country.toLowerCase().includes(city.toLowerCase())
    );

    const results = (matchingHotels.length > 0 ? matchingHotels : WORLDWIDE_HOTELS.slice(0, 5)).map(h => ({
      ...h,
      affiliate_urls: {
        agoda: `https://tp.media/r?marker=${marker}&p=4115&u=${encodeURIComponent(`https://www.agoda.com/search?text=${h.name}`)}`,
        booking: `https://tp.media/r?marker=${marker}&p=4114&u=${encodeURIComponent(`https://www.booking.com/searchresults.html?ss=${h.name}`)}`,
        trip: `https://tp.media/r?marker=${marker}&p=5075&u=${encodeURIComponent(`https://www.trip.com/hotels/list?keyword=${h.name}`)}`,
        traveloka: `https://tp.media/r?marker=${marker}&p=4115&u=${encodeURIComponent(`https://www.traveloka.com/en-id/hotel/search?spec=${h.name}`)}`
      }
    }));

    res.json({
      city: city,
      marker_id: marker,
      total: results.length,
      hotels: results
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3099;
app.listen(PORT, () => {
  console.log(`Edu MyTriv Monopoly & Hotel Aggregator Backend API running on port ${PORT}`);
});
