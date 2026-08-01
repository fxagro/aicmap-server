// seo.js - Server-Side Rendered SEO pages + sitemap + analytics tracking.
// Factory: createSeoRouter({ pool, generatePartnerLink })
const express = require('express');

const SITE = 'https://mytriv.com';

// Shared seeded hotel-photo pool (must stay in sync with app.js / server.js)
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

function slugify(s) {
  if (!s) return '';
  let t = '';
  for (const ch of String(s).toLowerCase().replace(/&/g, ' and ').replace(/'/g, '')) {
    if (/[a-z0-9]/.test(ch)) t += ch;
    else if (' -_'.includes(ch)) t += '-';
  }
  while (t.includes('--')) t = t.replace('--', '-');
  return t.replace(/^-+|-+$/g, '').slice(0, 120);
}

function fmtPrice(idr) {
  const n = parseInt(idr || 800000);
  if (n >= 1000000) return `Rp ${(n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (n >= 1000) return `Rp ${Math.round(n / 1000)} rb`;
  return `Rp ${n}`;
}

function hotelImage(h, w = 800) {
  if (h.image) return h.image;
  return hotelImgUrl((h.id || '') + '|' + (h.name || ''));
}

function amenities(h) {
  const list = [];
  if (h.wifi) list.push('WiFi Gratis');
  if (h.pool) list.push('Kolam Renang');
  if (h.parking) list.push('Parkir');
  if (h.bar) list.push('Bar');
  if (h.restaurant) list.push('Restoran');
  if (h.gym) list.push('Gym');
  if (h.spa) list.push('Spa');
  if (Array.isArray(h.amenities) && h.amenities.length) {
    for (const a of h.amenities) {
      if (!list.includes(a) && list.length < 8) list.push(a);
    }
  }
  if (!list.length) list.push('Akomodasi Nyaman');
  return list;
}

function partnerLinks(generatePartnerLink, hotel, citySlug) {
  const marker = '126699';
  const name = hotel.name || '';
  const cc = (hotel.country_code || '').toLowerCase();
  const cityS = hotel.city_slug || citySlug || '';
  const sub = `mytriv_${citySlug || 'hotel'}`;
  // Agoda: /search?text= redirects to homepage; city-path keeps the hotel name in the search box.
  const agoda = (cityS && cc)
    ? `https://www.agoda.com/city/${encodeURIComponent(cityS)}-${cc}.html?cid=1893836&tag=${marker}&text=${encodeURIComponent(name)}`
    : `https://www.agoda.com/search?text=${encodeURIComponent(name)}&cid=1893836&tag=${marker}`;
  return {
    agoda,
    booking: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(name)}&aid=${marker}`,
    trip: `https://www.trip.com/hotels/list?keyword=${encodeURIComponent(name)}&Allianceid=${marker}`,
    traveloka: `https://www.traveloka.com/en-id/hotel/search?spec=${encodeURIComponent(name)}&marker=${marker}`,
    expedia: `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(name)}`,
  };
}

function jsonLd(html) { return `<script type="application/ld+json">${JSON.stringify(html)}</script>`; }

function shell({ title, desc, canonical, ogImage, body, schema }) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta name="robots" content="index,follow">
<link rel="icon" href="/hotels/favicon.ico">
<link rel="preconnect" href="https://images.unsplash.com">
${schema ? jsonLd(schema) : ''}
<style>
:root{--cy:#00F0FF;--bg:#060B13;--card:#0e1624;--txt:#E2E8F0;--mut:#94A3B8;}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--txt);line-height:1.6}
a{color:var(--cy);text-decoration:none}
header{background:linear-gradient(135deg,#0b1220,#101a30);padding:16px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1e293b;position:sticky;top:0;z-index:10}
.logo{font-weight:900;font-size:20px;color:#fff}.logo span{color:var(--cy)}
nav a{margin-left:18px;font-size:14px;color:var(--mut)}nav a:hover{color:var(--cy)}
.hero{text-align:center;padding:48px 24px 40px;background:radial-gradient(ellipse at top,#0e2440 0%,var(--bg) 70%)}
.hero h1{font-size:32px;color:#fff;margin-bottom:10px}
.hero p{color:var(--mut);font-size:16px;max-width:640px;margin:0 auto}
.crumbs{font-size:13px;color:var(--mut);max-width:1000px;margin:20px auto 0;padding:0 24px}
.crumbs a{color:var(--cy)}
.wrap{max-width:1000px;margin:0 auto;padding:24px}
.hcard{background:var(--card);border:1px solid #1e293b;border-radius:14px;overflow:hidden;margin-bottom:24px}
.hcard img{width:100%;height:320px;object-fit:cover;display:block}
.hbody{padding:24px}
.hbody h1{color:#fff;font-size:26px;margin-bottom:6px}
.stars{color:#FFD700;letter-spacing:2px;font-size:16px}
.addr{color:var(--mut);font-size:14px;margin:8px 0}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}
.tag{background:#0e2440;border:1px solid #155e75;color:var(--cy);padding:4px 12px;border-radius:20px;font-size:13px}
.ctas{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}
.cta{display:block;text-align:center;padding:14px;border-radius:10px;font-weight:800;font-size:15px;transition:transform .15s}
.cta:hover{transform:translateY(-2px)}
.cta-primary{background:var(--cy);color:#060B13}
.cta-alt{background:#0e2440;border:1px solid #155e75;color:var(--cy)}
h2{color:#fff;font-size:20px;margin:28px 0 14px;border-bottom:1px solid #1e293b;padding-bottom:8px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.hcard-mini{background:var(--card);border:1px solid #1e293b;border-radius:12px;overflow:hidden}
.hcard-mini img{width:100%;height:160px;object-fit:cover}
.hmini-body{padding:14px}
.hmini-body h3{color:#fff;font-size:16px;margin-bottom:4px}
.hmini-body .stars{font-size:13px}
.hmini-body .price{color:#34D399;font-weight:800;font-size:14px;margin-top:6px}
.mini-cta{display:inline-block;margin-top:10px;background:var(--cy);color:#060B13;font-size:13px;font-weight:700;padding:7px 14px;border-radius:8px}
.faq{margin-top:8px}
.faq details{background:var(--card);border:1px solid #1e293b;border-radius:10px;padding:14px 16px;margin-bottom:10px}
.faq summary{font-weight:700;color:#fff;cursor:pointer}
.faq p{color:var(--mut);font-size:14px;margin-top:8px}
footer{border-top:1px solid #1e293b;padding:28px 24px;text-align:center;color:var(--mut);font-size:13px;margin-top:40px}
footer a{color:var(--cy)}
.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
@media(max-width:640px){.ctas{grid-template-columns:1fr}.hero h1{font-size:24px}}
</style>
</head>
<body>
<header><a href="/" class="logo">MyTriv <span>Hotels</span></a><nav>
<a href="/hotels">Hotel Map</a><a href="/hotels/indonesia">Indonesia</a><a href="/hotels/japan">Japan</a><a href="/hotels/thailand">Thailand</a></nav></header>
${body}
<footer><p>MyTriv Hotels — Interactive World Hotel Map. Harga referensi &amp; link booking dari partner resmi (Booking.com, Agoda, Trip.com, Traveloka, Expedia).</p>
<p><a href="/sitemap.xml">Sitemap</a> · <a href="/hotels">Peta Interaktif</a> · © 2026 MyTriv</p></footer>
</body>
</html>`;
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = function createSeoRouter({ pool, generatePartnerLink }) {
  const router = express.Router();

  // ---- Analytics tracking (lightweight, no external scripts) ----
  const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|googlebot|curl|python-requests|headless/i;

  function track(req, table, extra) {
    try {
      const base = {
        referrer: (req.get('referer') || '').slice(0, 500),
        user_agent: (req.get('user-agent') || '').slice(0, 300),
        ip: (req.ip || '').slice(0, 45),
        session_id: (req.query.s || '').slice(0, 64),
      };
      const byTable = {
        page_views: { path: req.path.slice(0, 500), is_bot: BOT_RE.test(req.get('user-agent') || '') },
        affiliate_clicks: { hotel_id: extra.hotel_id || null, hotel_slug: extra.hotel_slug || null, partner: extra.partner || null, destination: extra.destination || null },
        searches: { query: extra.query || null, result_count: extra.result_count || null },
      };
      const cols = Object.keys({ ...byTable[table], ...base });
      const vals = cols.map((c) => (c in byTable[table] ? byTable[table][c] : base[c]));
      const qtext = `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')})`;
      pool.query(qtext, vals).catch((e) => { console.error('track error:', table, e.message); });
    } catch (e) { console.error('track setup error:', e.message); }
  }

  // Redirect + track OTA click (used by booking CTAs)
  router.get('/go', async (req, res) => {
    const { u, hotel, partner, slug } = req.query;
    if (u) {
      track(req, 'affiliate_clicks', { hotel_slug: slug || null, partner: partner || null, destination: String(u).slice(0, 500) });
      return res.redirect(302, String(u));
    }
    res.status(400).json({ error: 'missing url' });
  });

  // Page view tracking (1x1 pixel)
  router.get('/t.js', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    res.set('Cache-Control', 'no-store');
    track(req, 'page_views', {});
    res.send('/* tracked */');
  });

  // ---- Sitemap ----
  router.get('/sitemap.xml', async (req, res) => {
    try {
      const [hotels, cities, countries] = await Promise.all([
        pool.query('SELECT slug FROM hotels WHERE slug IS NOT NULL'),
        pool.query('SELECT c.slug, cc.slug AS country FROM cities c JOIN countries cc ON cc.code = c.country_code'),
        pool.query('SELECT slug FROM countries'),
      ]);
      res.set('Content-Type', 'application/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${countries.rows.map(r => `<url><loc>${SITE}/hotels/${r.slug}</loc><changefreq>weekly</changefreq></url>`).join('\n')}
${cities.rows.map(r => `<url><loc>${SITE}/hotels/${r.country}/${r.slug}</loc><changefreq>weekly</changefreq></url>`).join('\n')}
${hotels.rows.map(r => `<url><loc>${SITE}/hotel/${r.slug}</loc><changefreq>daily</changefreq></url>`).join('\n')}
</urlset>`);
    } catch (e) { console.error('sitemap error:', e.message); res.status(500).send('sitemap error'); }
  });

  // ---- Robots ----
  router.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Sitemap: ${SITE}/sitemap.xml
`);
  });

  // ---- Hotel detail page ----
  router.get('/hotel/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const { rows } = await pool.query(`
        SELECT h.*, c.name AS city_name, c.slug AS city_slug, c.country_code, cc.name AS country_name, cc.slug AS country_slug,
               vho.owner_email, vho.owner_name, vho.purchase_price, vho.custom_headline, vho.custom_review, vho.custom_affiliate_url, vho.is_for_sale, vho.sale_price
        FROM hotels h
        LEFT JOIN cities c ON c.id = h.city_id
        LEFT JOIN countries cc ON cc.code = c.country_code
        LEFT JOIN virtual_hotel_ownership vho ON vho.hotel_slug = h.slug
        WHERE h.slug = $1`, [slug]);
      if (!rows.length) return res.status(404).send(shell({ title: 'Hotel tidak ditemukan - MyTriv Hotels', desc: 'Hotel tidak ditemukan', canonical: SITE + req.path, ogImage: hotelImage({}, 800), body: '<div class="wrap"><h1>Hotel tidak ditemukan</h1></div>' }));
      const h = rows[0];
      track(req, 'page_views', {});
      const am = amenities(h);
      const price = fmtPrice(h.price_idr);
      const links = partnerLinks(generatePartnerLink, h, h.city_name);
      const loc = `${h.city_name || h.city || ''}, ${h.country_name || h.country || ''}`;
      const cityPath = h.country_slug ? `/hotels/${h.country_slug}/${h.city_slug || slugify(h.city_name || h.city)}` : null;
      const citySlug = h.city_slug || slugify(h.city_name || h.city);

      // Nearby hotels (same city)
      let nearby = [];
      if (h.city_id) {
        const n = await pool.query(`SELECT name, slug, stars, rating, price_idr, image FROM hotels WHERE city_id = $1 AND slug <> $2 ORDER BY rating DESC NULLS LAST LIMIT 6`, [h.city_id, slug]);
        nearby = n.rows;
      }

      const title = `${h.name} — Harga & Booking ${loc} | MyTriv Hotels`;
      const desc = `Cek harga terbaik ${h.name} di ${loc}. ${am.slice(0, 4).join(', ')}. Bandingkan harga Booking.com, Agoda, Trip.com, Traveloka & Expedia. Booking online terpercaya.`;
      const ogImage = hotelImage(h, 800);

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Hotel',
        name: h.name,
        image: ogImage,
        address: { '@type': 'PostalAddress', addressLocality: h.city_name || h.city, addressCountry: h.country_name || h.country },
        starRating: { '@type': 'Rating', ratingValue: h.stars || 4 },
        priceRange: price,
        url: SITE + '/hotel/' + slug,
      };
      if (h.lat && h.lng) schema.geo = { '@type': 'GeoCoordinates', latitude: h.lat, longitude: h.lng };

      const body = `
<div class="crumbs"><a href="/hotels">Beranda</a> › ${h.country_slug ? `<a href="/hotels/${h.country_slug}">${esc(h.country_name)}</a>` : ''} › ${cityPath ? `<a href="${cityPath}">${esc(h.city_name || h.city)}</a>` : ''} › <b>${esc(h.name)}</b></div>
<div class="wrap">
  <div class="hcard">
    <img src="${ogImage}" alt="${esc(h.name)}" width="800" height="320">
    <div class="hbody">
      <div class="stars">${'★'.repeat(h.stars || 4)}</div>
      <h1>${esc(h.name)}</h1>
      <div class="addr">📍 ${esc(loc)}${h.address ? ' — ' + esc(h.address) : ''}${h.phone ? ' · ☎ ' + esc(h.phone) : ''}</div>
      <div class="tags">${am.map(a => `<span class="tag">${esc(a)}</span>`).join('')}</div>
      <div class="price">Tarif mulai: <b style="color:#34D399;font-size:18px;">${price}</b> / malam</div>
      
      <!-- VIRTUAL HOTEL OWNER & PROMO WIDGET -->
      <div id="virtual-owner-section" style="margin-top:20px; margin-bottom:20px; padding:20px; background:linear-gradient(135deg, #0d1b2a, #1b263b); border:1.5px solid #00F0FF; border-radius:14px; box-shadow:0 0 25px rgba(0,240,255,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg, #00F0FF, #3B82F6); display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:bold; color:#000; box-shadow:0 0 10px #00F0FF;">
              ${h.owner_name ? esc(h.owner_name.charAt(0).toUpperCase()) : '🏰'}
            </div>
            <div>
              <div style="color:#00F0FF; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">
                ${h.owner_name ? '👑 VIRTUAL HOTEL OWNER' : '🎲 VIRTUAL MONOPOLY HOTEL'}
              </div>
              <div style="color:#FFF; font-size:20px; font-weight:bold;">
                ${h.owner_name ? esc(h.owner_name) : 'Belum Ada Pemilik Virtual'}
              </div>
              <div style="color:#94A3B8; font-size:13px; margin-top:2px;">
                ${h.owner_name ? `Harga Beli: ${fmtPrice(h.purchase_price || 10000)} TrivCoin` : `Harga Hak Milik Virtual: ${(h.stars || 5) * 2000} TrivCoin`}
              </div>
            </div>
          </div>

          <div>
            ${h.owner_name ? `
              <button onclick="openOwnerEditModal()" class="cta cta-primary" style="padding:10px 18px; font-size:13px; cursor:pointer;">✏️ Edit Halaman Owner</button>
            ` : `
              <button onclick="openBuyHotelModal()" class="cta cta-primary" style="padding:10px 22px; font-size:14px; background:linear-gradient(135deg, #10B981, #059669); cursor:pointer;">🛒 Beli Hotel Virtual Ini</button>
            `}
          </div>
        </div>

        ${h.custom_headline ? `
          <div style="margin-top:16px; padding:12px 16px; background:rgba(0,240,255,0.08); border-left:4px solid #00F0FF; border-radius:6px; color:#E2E8F0; font-size:14px; font-weight:600;">
            📢 <span style="color:#00F0FF;">Pesan Pemilik:</span> "${esc(h.custom_headline)}"
          </div>
        ` : ''}

        ${h.custom_review ? `
          <div style="margin-top:10px; color:#CBD5E1; font-size:13px; line-height:1.6; font-style:italic;">
            ✍️ "${esc(h.custom_review)}"
          </div>
        ` : ''}

        ${h.custom_affiliate_url ? `
          <div style="margin-top:14px;">
            <a href="${esc(h.custom_affiliate_url)}" target="_blank" rel="nofollow noopener" class="cta" style="background:linear-gradient(135deg, #EC4899, #8B5CF6); color:#FFF; font-weight:bold; width:100%; text-align:center; padding:12px; display:block; border-radius:8px; text-decoration:none;">
              🌟 PROMO KHUSUS PEMILIK: Klik Booking Via Referral Owner
            </a>
          </div>
        ` : ''}
      </div>

      
      

      <!-- LIVE CLIENT-SIDE REFRESH FOR OWNERSHIP WIDGET -->
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          fetch('/api/hotels/ownership/${slug}')
            .then(function(r) { return r.json(); })
            .then(function(data) {
              if (data && data.owned && data.ownership) {
                var o = data.ownership;
                var sec = document.getElementById('virtual-owner-section');
                if (sec && o.owner_name) {
                  var initial = o.owner_name.charAt(0).toUpperCase();
                  var headlineHtml = o.custom_headline ? '<div style="margin-top:16px; padding:12px 16px; background:rgba(0,240,255,0.08); border-left:4px solid #00F0FF; border-radius:6px; color:#E2E8F0; font-size:14px; font-weight:600;">📢 <span style="color:#00F0FF;">Pesan Pemilik:</span> "' + o.custom_headline + '"</div>' : '';
                  var reviewHtml = o.custom_review ? '<div style="margin-top:10px; color:#CBD5E1; font-size:13px; line-height:1.6; font-style:italic;">✍️ "' + o.custom_review + '"</div>' : '';
                  var affHtml = o.custom_affiliate_url ? '<div style="margin-top:14px;"><a href="' + o.custom_affiliate_url + '" target="_blank" rel="nofollow noopener" class="cta" style="background:linear-gradient(135deg, #EC4899, #8B5CF6); color:#FFF; font-weight:bold; width:100%; text-align:center; padding:12px; display:block; border-radius:8px; text-decoration:none;">🌟 PROMO KHUSUS PEMILIK: Klik Booking Via Referral Owner</a></div>' : '';

                  sec.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;"><div style="display:flex; align-items:center; gap:14px;"><div style="width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg, #00F0FF, #3B82F6); display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:bold; color:#000; box-shadow:0 0 10px #00F0FF;">' + initial + '</div><div><div style="color:#00F0FF; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">👑 VIRTUAL HOTEL OWNER</div><div style="color:#FFF; font-size:20px; font-weight:bold;">' + o.owner_name + '</div><div style="color:#94A3B8; font-size:13px; margin-top:2px;">Pemilik Sah Virtual | Harga Beli: ' + (o.purchase_price || 10000).toLocaleString() + ' TrivCoin</div></div></div><div><button onclick="openOwnerEditModal()" class="cta cta-primary" style="padding:10px 18px; font-size:13px; cursor:pointer;">✏️ Edit Halaman Owner</button></div></div>' + headlineHtml + reviewHtml + affHtml;
                }
              }
            })
            .catch(function(e) { console.error('Live ownership sync error:', e); });
        });
      </script>

<!-- MODAL BANTUAN BUY & EDIT OWNER -->
      <script>
        function openBuyHotelModal() {
          const savedEmail = localStorage.getItem('mytriv_sso_email') || 'mytriv.com@gmail.com';
          const email = prompt('Masukkan Email SSO Edu MyTriv Anda untuk membeli hotel virtual ini:', savedEmail);
          if (!email || !email.trim()) return;
          const cleanEmail = email.trim();
          localStorage.setItem('mytriv_sso_email', cleanEmail);

          const payload = {
            email: cleanEmail,
            hotel_slug: '${slug}',
            hotel_name: '${esc(h.name)}',
            city: '${esc(h.city_name || h.city || '')}',
            country: '${esc(h.country_name || h.country || '')}',
            stars: ${h.stars || 5}
          };

          function sendBuy(endpoint) {
            return fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }).then(r => r.json());
          }

          sendBuy('/api/hotels/ownership/buy')
            .then(res => {
              if (res.error) {
                // Fallback to /maps/api/
                return sendBuy('/maps/api/hotels/ownership/buy');
              }
              return res;
            })
            .then(res => {
              if (res.error) {
                alert('❌ Gagal: ' + res.error);
              } else {
                alert('🎉 ' + res.message + '

💰 Sisa Saldo TrivCoin Anda: ' + (res.new_balance !== undefined ? res.new_balance.toLocaleString() : 'Terupdate') + ' TrivCoin');
                location.reload();
              }
            })
            .catch(e => alert('API Error: ' + e.message));
        }

        function openOwnerEditModal() {
          const savedEmail = localStorage.getItem('mytriv_sso_email') || 'mytriv.com@gmail.com';
          const email = prompt('Masukkan Email Pemilik Hotel:', savedEmail);
          if (!email || !email.trim()) return;
          const cleanEmail = email.trim();
          localStorage.setItem('mytriv_sso_email', cleanEmail);

          const headline = prompt('Pesan Promo / Headline untuk pengunjung:', '${esc(h.custom_headline || '')}');
          const review = prompt('Ulasan / Rekomendasi Pribadi Anda:', '${esc(h.custom_review || '')}');
          const affUrl = prompt('URL Link Referral / Affiliate Anda (Opsional):', '${esc(h.custom_affiliate_url || '')}');

          const payload = {
            email: cleanEmail,
            hotel_slug: '${slug}',
            custom_headline: headline,
            custom_review: review,
            custom_affiliate_url: affUrl
          };

          fetch('/api/hotels/ownership/update-page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          .then(r => r.json())
          .then(res => {
            if (res.error) alert('❌ Error: ' + res.error);
            else {
              alert('✨ ' + res.message);
              location.reload();
            }
          })
          .catch(e => alert('API Error: ' + e.message));
        }
      </script>

      <div class="ctas">
        <a class="cta cta-primary" href="/go?u=${encodeURIComponent(links.booking)}&partner=booking&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">Booking.com — Pesan Sekarang</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.agoda)}&partner=agoda&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">Agoda — Cek Harga</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.trip)}&partner=trip&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">Trip.com — Cek Harga</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.traveloka)}&partner=traveloka&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">Traveloka — Cek Harga</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.expedia)}&partner=expedia&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">Expedia — Cek Harga</a>
      </div>
    </div>
  </div>

  <h2>Hotel di dekat ${esc(h.city_name || h.city)}</h2>
  <div class="grid">
    ${nearby.map(n => `<div class="hcard-mini">
      <img src="${hotelImage(n, 400)}" alt="${esc(n.name)}" loading="lazy" width="400" height="160">
      <div class="hmini-body"><h3>${esc(n.name)}</h3><div class="stars">${'★'.repeat(n.stars || 4)} · ${n.rating || 4.2}/5</div>
      <div class="price">${fmtPrice(n.price_idr)}</div><a class="mini-cta" href="/hotel/${n.slug}">Lihat & Booking</a></div>
    </div>`).join('') || '<p style="color:var(--mut)">Tambah data hotel di kota ini segera.</p>'}
  </div>

  <h2>Pertanyaan Umum tentang ${esc(h.name)}</h2>
  <div class="faq">
    <details><summary>Berapa harga menginap di ${esc(h.name)}?</summary><p>Harga mulai sekitar ${price} per malam, tergantung tipe kamar dan musim. Gunakan tombol di atas untuk cek harga real-time di Booking.com, Agoda, Trip.com, Traveloka, dan Expedia.</p></details>
    <details><summary>Di mana lokasi ${esc(h.name)}?</summary><p>Hotel ini berlokasi di ${esc(loc)}${h.lat ? ` (koordinat ${h.lat}, ${h.lng})` : ''}. Anda bisa melihat posisinya di peta interaktif kami.</p></details>
    <details><summary>Apa fasilitas di ${esc(h.name)}?</summary><p>Fasilitas utama: ${am.join(', ')}.</p></details>
    <details><summary>Bagaimana cara booking ${esc(h.name)}?</summary><p>Klik tombol Booking.com atau Agoda di halaman ini. Anda diarahkan ke situs partner resmi untuk harga & ketersediaan terbaru tanpa biaya tambahan.</p></details>
  </div>
</div>`;
      res.set('Cache-Control', 'public, max-age=3600');
      res.send(shell({ title, desc, canonical: `${SITE}/hotel/${slug}`, ogImage, body, schema }));
    } catch (e) { console.error('hotel page error:', e.message); res.status(500).send('error'); }
  });

  // ---- Country page ----
  router.get('/hotels/:country', async (req, res) => {
    try {
      const { country } = req.params;
      const { rows } = await pool.query('SELECT * FROM countries WHERE slug = $1', [country]);
      if (!rows.length) return res.status(404).send('Not found');
      const c = rows[0];
      const cities = await pool.query('SELECT name, slug, hotel_count, lat, lng FROM cities WHERE country_code = $1 AND hotel_count > 0 ORDER BY hotel_count DESC, population DESC NULLS LAST LIMIT 60', [c.code]);
      const hotels = await pool.query(`SELECT h.name, h.slug, h.stars, h.rating, h.price_idr, h.image, c.name AS city_name FROM hotels h JOIN cities c ON c.id = h.city_id WHERE c.country_code = $1 ORDER BY h.rating DESC NULLS LAST LIMIT 12`, [c.code]);
      const totalHotels = await pool.query('SELECT count(*) FROM hotels h JOIN cities c ON c.id = h.city_id WHERE c.country_code = $1', [c.code]);

      const title = `Hotel di ${c.name} — ${totalHotels.rows[0].count} Hotel Terbaik | MyTriv Hotels`;
      const desc = `Cari hotel terbaik di ${c.name}. ${cities.rows.length} kota dengan hotel murah & mewah. Bandingkan harga Booking.com, Agoda, Trip.com & Traveloka.`;
      const body = `
<div class="crumbs"><a href="/hotels">Beranda</a> › <b>${esc(c.name)}</b></div>
<div class="hero"><h1>Hotel di ${esc(c.name)}</h1><p>${desc}</p></div>
<div class="wrap">
  <h2>Kota populer di ${esc(c.name)}</h2>
  <div class="grid">
    ${cities.rows.map(ct => `<a href="/hotels/${country}/${ct.slug}" class="hcard-mini" style="text-decoration:none">
      <div class="hmini-body"><h3>${esc(ct.name)}</h3><div class="price">${ct.hotel_count} hotel</div></div>
    </a>`).join('') || '<p style="color:var(--mut)">Kota akan segera ditambahkan.</p>'}
  </div>
  <h2>Hotel terbaik di ${esc(c.name)}</h2>
  <div class="grid">
    ${hotels.rows.map(n => `<div class="hcard-mini">
      <img src="${hotelImage(n, 400)}" alt="${esc(n.name)}" loading="lazy" width="400" height="160">
      <div class="hmini-body"><h3>${esc(n.name)}</h3><div class="stars">${'★'.repeat(n.stars || 4)}</div>
      <div style="color:var(--mut);font-size:13px">${esc(n.city_name)}</div><div class="price">${fmtPrice(n.price_idr)}</div>
      <a class="mini-cta" href="/hotel/${n.slug}">Lihat & Booking</a></div>
    </div>`).join('')}
  </div>
</div>`;
      const schema = { '@context': 'https://schema.org', '@type': 'Country', name: c.name, url: SITE + '/hotels/' + country };
      res.set('Cache-Control', 'public, max-age=3600');
      res.send(shell({ title, desc, canonical: `${SITE}/hotels/${country}`, ogImage: hotelImage({}, 800), body, schema }));
    } catch (e) { console.error('country page error:', e.message); res.status(500).send('error'); }
  });

  // ---- City page ----
  router.get('/hotels/:country/:city', async (req, res) => {
    try {
      const { country, city } = req.params;
      const { rows } = await pool.query(`
        SELECT c.*, cc.name AS country_name FROM cities c
        JOIN countries cc ON cc.code = c.country_code
        WHERE c.slug = $1 AND cc.slug = $2`, [city, country]);
      if (!rows.length) return res.status(404).send('Not found');
      const c = rows[0];
      const totalRes = await pool.query('SELECT count(*)::int AS n FROM hotels WHERE city_id = $1', [c.id]);
      const totalCount = totalRes.rows[0].n;
      const hotels = await pool.query(`
        SELECT h.* FROM hotels h JOIN cities c ON c.id = h.city_id
        WHERE c.id = $1 ORDER BY h.rating DESC NULLS LAST, h.reviews DESC NULLS LAST LIMIT 300`, [c.id]);
      const budget = hotels.rows.slice().sort((a, b) => a.price_idr - b.price_idr)[0];
      const lux = hotels.rows.slice().sort((a, b) => b.price_idr - a.price_idr)[0];

      const title = `Hotel di ${c.name}, ${c.country_name} — ${totalCount} Hotel Terbaik | MyTriv Hotels`;
      const desc = `Temukan ${totalCount} hotel terbaik di ${c.name}${budget ? `, mulai ${fmtPrice(budget.price_idr)}` : ''}. Bandingkan harga & booking online di Booking.com, Agoda, Trip.com, Traveloka.`;
      const body = `
<div class="crumbs"><a href="/hotels">Beranda</a> › <a href="/hotels/${country}">${esc(c.country_name)}</a> › <b>${esc(c.name)}</b></div>
<div class="hero"><h1>Hotel di ${esc(c.name)}</h1><p>${desc}</p></div>
<div class="wrap">
  <h2>${totalCount} hotel tersedia di ${esc(c.name)}</h2>
  <div class="grid">
    ${hotels.rows.map(n => `<div class="hcard-mini">
      <img src="${hotelImage(n, 400)}" alt="${esc(n.name)}" loading="lazy" width="400" height="160">
      <div class="hmini-body"><h3>${esc(n.name)}</h3><div class="stars">${'★'.repeat(n.stars || 4)} · ${n.rating || 4.2}/5</div>
      <div class="price">${fmtPrice(n.price_idr)}</div><a class="mini-cta" href="/hotel/${n.slug}">Lihat & Booking</a></div>
    </div>`).join('')}
  </div>
  <h2>Tips wisata ${esc(c.name)}</h2>
  <div class="faq">
    <details><summary>Kapan waktu terbaik ke ${esc(c.name)}?</summary><p>Cek musim wisata dan event lokal untuk memilih waktu terbaik. Harga hotel umumnya lebih murah di musim sepi.</p></details>
    <details><summary>Hotel apa yang paling murah di ${esc(c.name)}?</summary><p>${budget ? `Hotel mulai dari ${fmtPrice(budget.price_idr)}.` : 'Cek daftar di atas untuk pilihan budget.'} Bandingkan di Booking.com dan Agoda untuk penawaran terbaik.</p></details>
  </div>
</div>`;
      const schema = { '@context': 'https://schema.org', '@type': 'City', name: c.name, url: SITE + '/hotels/' + country + '/' + city };
      res.set('Cache-Control', 'public, max-age=3600');
      res.send(shell({ title, desc, canonical: `${SITE}/hotels/${country}/${city}`, ogImage: hotelImage({}, 800), body, schema }));
    } catch (e) { console.error('city page error:', e.message); res.status(500).send('error'); }
  });

  return router;
};
