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

// Hotel Search & Map Filter Endpoint
app.get('/api/hotels/search', (req, res) => {
  try {
    const { city, min_price, max_price, stars, amenity } = req.query;
    let filtered = WORLDWIDE_HOTELS;

    if (city) {
      const q = city.toLowerCase();
      filtered = filtered.filter(h => h.city.toLowerCase().includes(q) || h.country.toLowerCase().includes(q) || h.name.toLowerCase().includes(q));
    }
    if (min_price) {
      filtered = filtered.filter(h => h.price_idr >= parseInt(min_price));
    }
    if (max_price) {
      filtered = filtered.filter(h => h.price_idr <= parseInt(max_price));
    }
    if (stars && stars !== '0') {
      filtered = filtered.filter(h => h.stars >= parseInt(stars));
    }
    if (amenity) {
      filtered = filtered.filter(h => h.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase())));
    }

    res.json({
      total: filtered.length,
      hotels: filtered
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Hotel Detail Endpoint
app.get('/api/hotels/:id', (req, res) => {
  try {
    const { id } = req.params;
    const hotel = WORLDWIDE_HOTELS.find(h => h.id === id);
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
      img: `https://photos.hotellook.com/image_v2/limit/h${h.hotelId || 10001}_0/800/520.jpg`,
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
