const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Shared seeded hotel-photo pool (must stay in sync with app.js / seo.js)
const HOTEL_IMG_POOL = [
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1549294413-26f195200c16?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&auto=format&fit=crop&q=70',
  'https://images.unsplash.com/photo-1560200353-ce0a76b1d438?w=1200&auto=format&fit=crop&q=70',
  'https://images.pexels.com/photos/28011238/pexels-photo-28011238.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/31146633/pexels-photo-31146633.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/32021575/pexels-photo-32021575.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/34055652/pexels-photo-34055652.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/34496706/pexels-photo-34496706.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/18801062/pexels-photo-18801062.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/36767624/pexels-photo-36767624.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/4493299/pexels-photo-4493299.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/34496715/pexels-photo-34496715.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/7258034/pexels-photo-7258034.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/14750392/pexels-photo-14750392.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/28962539/pexels-photo-28962539.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/27638174/pexels-photo-27638174.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/33389169/pexels-photo-33389169.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/14750394/pexels-photo-14750394.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/4890676/pexels-photo-4890676.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/37734643/pexels-photo-37734643.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/7722164/pexels-photo-7722164.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/34496701/pexels-photo-34496701.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/34040619/pexels-photo-34040619.jpeg?w=1200&auto=compress&cs=tinysrgb',
  'https://images.pexels.com/photos/14750592/pexels-photo-14750592.jpeg?w=1200&auto=compress&cs=tinysrgb'
];
function hotelImgUrl(seedKey) {
  let h = 5381;
  const s = String(seedKey || 'hotel');
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return HOTEL_IMG_POOL[h % HOTEL_IMG_POOL.length];
}

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

// 2. Get Player State & Owned Properties (Includes Virtual Hotels)
app.get('/api/monopoly/player/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const player = await pool.query(`SELECT * FROM monopoly_players WHERE member_id = $1`, [id]);
    if (!player.rowCount) return res.status(404).json({ error: 'Player tidak ditemukan' });

    const pData = player.rows[0];
    const ownedProps = await pool.query(`SELECT * FROM monopoly_properties WHERE owner_id = $1`, [id]);
    const ownedHotels = await pool.query(`SELECT * FROM virtual_hotel_ownership WHERE LOWER(owner_email) = LOWER($1)`, [pData.email]);

    const totalCount = (ownedProps.rowCount || 0) + (ownedHotels.rowCount || 0);

    res.json({
      ...pData,
      owned_properties: ownedProps.rows,
      owned_virtual_hotels: ownedHotels.rows,
      total_properties_count: totalCount
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

// GET Monopoly Leaderboard (Includes Virtual Hotels)
app.get('/api/monopoly/leaderboard', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT p.member_id, p.name, p.country, p.city, p.subscription_tier, p.balance,
             (COUNT(DISTINCT prop.id) + COUNT(DISTINCT vho.id)) AS total_properties
      FROM monopoly_players p
      LEFT JOIN monopoly_properties prop ON prop.owner_id = p.member_id
      LEFT JOIN virtual_hotel_ownership vho ON LOWER(vho.owner_email) = LOWER(p.email)
      GROUP BY p.member_id, p.name, p.country, p.city, p.subscription_tier, p.balance, p.email
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
    const { city, country, min_price, max_price, stars, amenity, limit = 100, lat, lng, radius } = req.query;
    const conditions = [];
    const params = [];

    if (country) {
      params.push(`%${country.toLowerCase()}%`);
      conditions.push(`(LOWER(h.country) LIKE $${params.length} OR LOWER(COALESCE(cc.name,'')) LIKE $${params.length})`);
      params.push(`%${country.toLowerCase()}%`);
      conditions.push(`(LOWER(h.country) LIKE $${params.length} OR LOWER(COALESCE(cc.name,'')) LIKE $${params.length})`);
    } else if (city) {
      const cityMatch = await pool.query(
        `SELECT id FROM cities WHERE LOWER(name) = $1 OR LOWER(slug) = $1 LIMIT 1`,
        [city.toLowerCase()]
      );
      if (cityMatch.rows.length) {
        params.push(cityMatch.rows[0].id);
        conditions.push(`h.city_id = $${params.length}`);
      } else {
        params.push(`%${city.toLowerCase()}%`);
        conditions.push(`(LOWER(h.city) LIKE $${params.length} OR LOWER(h.country) LIKE $${params.length} OR LOWER(h.name) LIKE $${params.length})`);
      }
    }
    if (lat && lng && radius) {
      const rLat = parseInt(radius) / 111320;
      const rLng = parseInt(radius) / (111320 * Math.max(0.1, Math.abs(Math.cos(parseFloat(lat) * Math.PI / 180))));
      params.push(parseFloat(lat) - rLat);
      params.push(parseFloat(lat) + rLat);
      params.push(parseFloat(lng) - rLng);
      params.push(parseFloat(lng) + rLng);
      conditions.push(`h.lat BETWEEN $${params.length - 3} AND $${params.length - 2} AND h.lng BETWEEN $${params.length - 1} AND $${params.length}`);
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
    params.push(parseInt(limit) || 100);

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT h.id, h.name, h.city, h.country, h.lat, h.lng, h.stars, h.rating, h.reviews, h.price_idr, h.price_formatted, h.currency, h.image, h.amenities, h.description, h.slug, c.slug AS city_slug, c.country_code AS country_code
       FROM hotels h LEFT JOIN cities c ON c.id = h.city_id LEFT JOIN countries cc ON cc.code = c.country_code
       ${where} ORDER BY h.rating DESC NULLS LAST, h.stars DESC NULLS LAST LIMIT $${params.length}`,
      params
    );

    const source = 'db';
    if (rows.length > 0) {
      return res.json({ total: rows.length, source, hotels: rows.map(r => enrichBookHotel(r)) });
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

// Record a hotel search (trending analytics) — fire and forget
app.post('/api/searches', async (req, res) => {
  try {
    const { q, result_count } = req.body || {};
    if (!q) return res.status(400).json({ error: 'missing q' });
    await pool.query(
      `INSERT INTO searches (query, result_count, session_id)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [String(q).slice(0, 200), parseInt(result_count) || 0, (req.headers['x-session'] || 'map').slice(0, 64)]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Analytics summary for admin dashboard (page views, clicks, trends)
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const [pv, clicks, clicksByPartner, topPaths, topCities, topHotels, topSearches] = await Promise.all([
      pool.query('SELECT count(*) AS c, count(*) FILTER (WHERE is_bot = false) AS human FROM page_views WHERE created_at >= $1', [since]),
      pool.query('SELECT count(*) AS c FROM affiliate_clicks WHERE created_at >= $1', [since]),
      pool.query('SELECT partner, count(*) AS c FROM affiliate_clicks WHERE created_at >= $1 GROUP BY partner ORDER BY c DESC', [since]),
      pool.query(`SELECT path, count(*) AS c FROM page_views WHERE created_at >= $1 AND path LIKE '/hotel/%' GROUP BY path ORDER BY c DESC LIMIT 15`, [since]),
      pool.query(`SELECT path, count(*) AS c FROM page_views WHERE created_at >= $1 AND path LIKE '/hotels/%' GROUP BY path ORDER BY c DESC LIMIT 15`, [since]),
      pool.query(`SELECT h.name, h.slug, count(p.id) AS c FROM page_views p LEFT JOIN hotels h ON h.slug = NULLIF(regexp_replace(p.path, '^/hotel/', ''), p.path) WHERE p.created_at >= $1 AND p.path LIKE '/hotel/%' GROUP BY h.name, h.slug ORDER BY c DESC LIMIT 15`, [since]),
      pool.query('SELECT query, count(*) AS c FROM searches WHERE created_at >= $1 GROUP BY query ORDER BY c DESC LIMIT 15', [since]),
    ]);

    const estRevenue = clicks.rows[0].c * 0.35; // estimasi USD/click ~$0.35 dari hotel OTA
    res.json({
      days,
      generated_at: new Date().toISOString(),
      totals: {
        page_views: parseInt(pv.rows[0].c),
        human_page_views: parseInt(pv.rows[0].human),
        affiliate_clicks: parseInt(clicks.rows[0].c),
        searches: (await pool.query('SELECT count(*) AS c FROM searches WHERE created_at >= $1', [since])).rows[0].c,
        est_revenue_usd: Math.round(estRevenue * 100) / 100,
      },
      clicks_by_partner: clicksByPartner.rows,
      top_paths: topPaths.rows,
      top_city_pages: topCities.rows,
      top_hotels: topHotels.rows,
      trending_searches: topSearches.rows,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// SEO hub data for the /hotels landing page (top countries, cities, hotels, faq)
app.get('/api/seo/hub', async (req, res) => {
  try {
    const [countries, cities, hotels, total] = await Promise.all([
      pool.query(`SELECT cc.slug, cc.name, count(h.id) AS hotel_count FROM countries cc
                  LEFT JOIN cities c ON c.country_code = cc.code
                  LEFT JOIN hotels h ON h.city_id = c.id
                  GROUP BY cc.slug, cc.name HAVING count(h.id) > 0 ORDER BY hotel_count DESC LIMIT 12`),
      pool.query(`SELECT c.slug, c.name, cc.slug AS country_slug, count(h.id) AS hotel_count FROM cities c
                  JOIN countries cc ON cc.code = c.country_code
                  LEFT JOIN hotels h ON h.city_id = c.id
                  GROUP BY c.slug, c.name, cc.slug HAVING count(h.id) > 0 ORDER BY hotel_count DESC LIMIT 12`),
      pool.query(`SELECT h.id, h.name, h.slug, h.stars, h.rating, h.price_idr, h.image, c.name AS city_name, cc.slug AS country_slug
                  FROM hotels h LEFT JOIN cities c ON c.id = h.city_id LEFT JOIN countries cc ON cc.code = c.country_code
                  WHERE h.slug IS NOT NULL ORDER BY h.rating DESC NULLS LAST, h.reviews DESC NULLS LAST LIMIT 12`),
      pool.query('SELECT count(*) AS c FROM hotels'),
    ]);
    res.json({ total_hotels: total.rows[0].c, countries: countries.rows, cities: cities.rows, hotels: hotels.rows.map(h => ({ ...h, image: h.image || hotelImgUrl(h.id + '|' + h.name) })) });
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
        `SELECT h.id, h.name, h.city, h.country, h.lat, h.lng, h.stars, h.rating, h.reviews, h.price_idr, h.price_formatted, h.currency, h.image, h.amenities, h.description, h.slug, c.slug AS city_slug, c.country_code AS country_code FROM hotels h LEFT JOIN cities c ON c.id = h.city_id WHERE h.id = $1::INTEGER`,
        [numId]
      );
      if (rows.length > 0) hotel = { ...rows[0], image: rows[0].image || hotelImgUrl(rows[0].id + '|' + rows[0].name), amenities: Array.isArray(rows[0].amenities) ? rows[0].amenities : (rows[0].amenities || []) };
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

// ISO country code -> flag emoji (e.g. "id" -> 🇮🇩)
function countryFlagEmoji(code) {
  if (!code || code.length !== 2) return '🌐';
  const cc = code.toUpperCase();
  return String.fromCodePoint(0x1F1E6 + cc.charCodeAt(0) - 65, 0x1F1E6 + cc.charCodeAt(1) - 65);
}

// Build OTA partner links + display fields for a DB hotel row (used by /book/ lite page)
function enrichBookHotel(r) {
  const price = r.price_idr || 1500000;
  const prices = {
    agoda: price,
    booking: Math.round(price * 1.04),
    trip: Math.round(price * 1.02),
    traveloka: Math.round(price * 0.97)
  };
  const bestOta = Object.keys(prices).reduce((a, b) => prices[a] <= prices[b] ? a : b);
  return {
    ...r,
    image: r.image || hotelImgUrl(r.id + '|' + r.name),
    amenities: Array.isArray(r.amenities) ? r.amenities : (r.amenities || []),
    flag: countryFlagEmoji(r.country_code || (r.country ? (r.country.slice(0, 2)) : '')),
    distance: `${r.city}`, 
    prices: prices,
    best_ota: bestOta.charAt(0).toUpperCase() + bestOta.slice(1),
    partner_links: {
      agoda: generateTravelpayoutsPartnerLink(`https://www.agoda.com/search?text=${encodeURIComponent(r.name)}`, '4115', `book_${r.id}`, r.name),
      booking: generateTravelpayoutsPartnerLink(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(r.name)}`, '4114', `book_${r.id}`, r.name),
      trip: generateTravelpayoutsPartnerLink(`https://www.trip.com/hotels/list?keyword=${encodeURIComponent(r.name)}`, '5075', `book_${r.id}`, r.name),
      traveloka: generateTravelpayoutsPartnerLink(`https://www.traveloka.com/en-id/hotel/search?spec=${encodeURIComponent(r.name)}`, 'traveloka', `book_${r.id}`, r.name)
    }
  };
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

// ==========================================
// MYTRIV BOOK LITE — REAL DB INTEGRATION ENDPOINTS
// ==========================================

// GET All destinations (countries + cities with hotel data) for autocomplete & grid
app.get('/api/destinations', async (req, res) => {
  try {
    const { q } = req.query;
    const searchCond = q ? ` WHERE LOWER(c.name) LIKE $1 OR LOWER(cc.name) LIKE $1` : '';
    const searchParams = q ? [`%${q.toLowerCase()}%`] : [];

    const [countries, cities, total] = await Promise.all([
      pool.query(`SELECT cc.code, cc.slug, cc.name, cc.capital, cc.lat, cc.lng, cc.currency, count(h.id) AS hotel_count
                  FROM countries cc
                  LEFT JOIN cities c ON c.country_code = cc.code
                  LEFT JOIN hotels h ON h.city_id = c.id
                  GROUP BY cc.code, cc.slug, cc.name, cc.capital, cc.lat, cc.lng, cc.currency
                  HAVING count(h.id) > 0 ORDER BY hotel_count DESC LIMIT 30`),
      pool.query(`SELECT c.slug, c.name, cc.slug AS country_slug, cc.name AS country, c.country_code, c.lat, c.lng, c.region, count(h.id) AS hotel_count
                  FROM cities c JOIN countries cc ON cc.code = c.country_code
                  LEFT JOIN hotels h ON h.city_id = c.id
                  ${searchCond}
                  GROUP BY c.slug, c.name, cc.slug, cc.name, c.country_code, c.lat, c.lng, c.region
                  HAVING count(h.id) > 0 ORDER BY hotel_count DESC LIMIT 500`, searchParams),
      pool.query('SELECT count(*) AS c FROM hotels')
    ]);

    res.json({
      total_hotels: total.rows[0].c,
      countries: countries.rows.map(r => ({ ...r, flag: countryFlagEmoji(r.code), lat: parseFloat(r.lat), lng: parseFloat(r.lng) })),
      cities: cities.rows.map(r => ({ ...r, flag: countryFlagEmoji(r.country_code), lat: parseFloat(r.lat), lng: parseFloat(r.lng) }))
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET Flight search deep-link (MyTriv White Label at us.mytriv.com — Travelpayouts WL)
// A) results_url = direct-results (flightSearch=CGK1208DPS1) skips the 302 → user sees tickets immediately
// B) form_url     = iframe-embeddable WL search form
app.get('/api/flights/search', (req, res) => {
  try {
    const { origin, destination, depart_date, return_date, adults = 1, children = 0, infants = 0, trip_class = 0, locale = 'id', marker = TRAVELPAYOUTS_CONFIG.marker_id } = req.query;

    const originIata = origin ? String(origin).toUpperCase().slice(0, 3) : 'CGK';
    const destIata = destination ? String(destination).toUpperCase().slice(0, 3) : 'DPS';
    const adultsNum = parseInt(adults) || 1;

    // Build flightSearch token: {origin}{DDMM}{dest}{adults}  e.g. CGK1208DPS1
    let flightToken = originIata + destIata + String(adultsNum);
    if (depart_date && /^\d{4}-\d{2}-\d{2}$/.test(String(depart_date))) {
      flightToken = originIata + String(depart_date).slice(8, 10) + String(depart_date).slice(5, 7) + destIata + String(adultsNum);
    }

    const baseParams = {
      origin_iata: originIata,
      destination_iata: destIata,
      depart_date: depart_date || '',
      return_date: return_date || '',
      adults: String(adultsNum),
      children: String(children),
      infants: String(infants),
      trip_class: String(trip_class),
      locale: locale,
      with_request: 'true'
    };

    // Direct-results URL (skips 302, lands on tickets)
    const resultsUrl = `https://us.mytriv.com/?flightSearch=${flightToken}&${new URLSearchParams(baseParams).toString()}`;
    // Iframe-friendly search form URL (pre-filled)
    const formUrl = `https://us.mytriv.com/?${new URLSearchParams(baseParams).toString()}`;

    res.json({
      status: 'ok',
      origin: originIata,
      destination: destIata,
      depart_date: depart_date || '',
      adults: adultsNum,
      marker_id: marker,
      engine: 'us.mytriv.com',
      flight_token: flightToken,
      target_url: resultsUrl,
      results_url: resultsUrl,
      form_url: formUrl,
      partner_url: resultsUrl
    });
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

// SEO pages (server-side rendered) — mounted after API routes
const createSeoRouter = require('./seo');
app.use(createSeoRouter({ pool, generatePartnerLink: generateTravelpayoutsPartnerLink }));

module.exports = { pool }; // used by seo router tests


// =================================================================
// 👑 VIRTUAL HOTEL OWNERSHIP & MARKETPLACE ENDPOINTS
// =================================================================

// GET P2P Marketplace hotel listings (must be declared BEFORE :slug route)
app.get('/api/hotels/ownership/marketplace', async (req, res) => {
  try {
    const q = await pool.query('SELECT * FROM virtual_hotel_ownership WHERE is_for_sale = TRUE ORDER BY sale_price ASC LIMIT 100');
    res.json({ listings: q.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ownership status for hotel
app.get('/api/hotels/ownership/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const q = await pool.query('SELECT * FROM virtual_hotel_ownership WHERE hotel_slug = $1', [slug]);
    if (q.rowCount > 0) {
      return res.json({ owned: true, ownership: q.rows[0] });
    }
    return res.json({ owned: false, base_price: 10000 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BUY unowned hotel with TrivCoin balance (Auto-Sync SSO & Auto-Register User)
app.post('/api/hotels/ownership/buy', async (req, res) => {
  try {
    const { email, hotel_slug, hotel_name, city, country, stars } = req.body || {};
    if (!email || !hotel_slug) return res.status(400).json({ error: 'Email SSO wajib diisi' });

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check or Auto-Create Player in monopoly_players
    let pRes = await pool.query('SELECT * FROM monopoly_players WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
    let player;

    if (!pRes.rowCount) {
      // Sync with Edu DB
      let pName = cleanEmail.split('@')[0];
      let subTier = 'pro_edu';
      try {
        const eduQuery = await eduPool.query(
          `SELECT id, email, name, plan, "extensionPlan" FROM users WHERE LOWER(email) = LOWER($1)`,
          [cleanEmail]
        );
        if (eduQuery.rowCount > 0 && eduQuery.rows[0].name) {
          pName = eduQuery.rows[0].name;
        }
      } catch (err) {
        console.error('Edu DB lookup error:', err.message);
      }

      // Create new player with 50,000 TrivCoin initial bonus for testing & hotel buying!
      const initialBalance = 50000;
      const newP = await pool.query(
        `INSERT INTO monopoly_players (name, email, subscription_tier, balance, country, city)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [pName, cleanEmail, subTier, initialBalance, country || 'Indonesia', city || 'Jakarta']
      );
      player = newP.rows[0];
    } else {
      player = pRes.rows[0];
    }

    // 2. Check if already owned
    const oRes = await pool.query('SELECT * FROM virtual_hotel_ownership WHERE hotel_slug = $1', [hotel_slug]);
    if (oRes.rowCount > 0) {
      return res.status(400).json({ error: `Hotel ini sudah dimiliki oleh @${oRes.rows[0].owner_name}` });
    }

    const price = (stars || 5) * 2000;
    const currentBal = Number(player.balance) || 0;
    
    if (currentBal < price) {
      return res.status(400).json({ 
        error: `Saldo TrivCoin kurang! Butuh ${price.toLocaleString()} TrivCoin, saldo Anda ${currentBal.toLocaleString()} TrivCoin.` 
      });
    }

    // 3. Deduct coins & insert ownership
    await pool.query('UPDATE monopoly_players SET balance = balance - $1::INTEGER WHERE member_id = $2', [price, player.member_id]);
    const ins = await pool.query(
      `INSERT INTO virtual_hotel_ownership (hotel_slug, hotel_name, city, country, stars, owner_email, owner_name, purchase_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [hotel_slug, hotel_name || hotel_slug, city || 'World', country || 'Global', stars || 5, cleanEmail, player.name || cleanEmail.split('@')[0], price]
    );

    res.json({
      success: true,
      message: `🎉 Selamat! @${player.name} resmi menjadi Pemilik Virtual Hotel ${hotel_name || hotel_slug}!`,
      ownership: ins.rows[0],
      new_balance: currentBal - price
    });
  } catch (err) {
    console.error('Buy Hotel API Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE owner page content (Custom headline, review, affiliate URL, and sale price)
app.post('/api/hotels/ownership/update-page', async (req, res) => {
  try {
    const { email, hotel_slug, custom_headline, custom_review, custom_affiliate_url, is_for_sale, sale_price } = req.body || {};
    if (!email || !hotel_slug) return res.status(400).json({ error: 'Email and hotel_slug required' });

    const cleanEmail = email.trim().toLowerCase();

    const oRes = await pool.query('SELECT * FROM virtual_hotel_ownership WHERE hotel_slug = $1', [hotel_slug]);
    if (!oRes.rowCount) return res.status(404).json({ error: 'Hotel ownership record not found' });
    const ownership = oRes.rows[0];

    if (ownership.owner_email.toLowerCase() !== cleanEmail) {
      return res.status(403).json({ error: 'Anda bukan pemilik sah dari hotel virtual ini!' });
    }

    const up = await pool.query(
      `UPDATE virtual_hotel_ownership 
       SET custom_headline = $1, custom_review = $2, custom_affiliate_url = $3, is_for_sale = $4, sale_price = $5, updated_at = CURRENT_TIMESTAMP
       WHERE hotel_slug = $6 RETURNING *`,
      [custom_headline || null, custom_review || null, custom_affiliate_url || null, is_for_sale || false, sale_price || 0, hotel_slug]
    );

    res.json({ success: true, message: 'Halaman & Promo Pemilik Hotel berhasil diperbarui live!', ownership: up.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

