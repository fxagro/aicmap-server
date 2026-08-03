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
  const cityName = hotel.city_name || hotel.city || name;
  const sub = `mytriv_${citySlug || 'hotel'}`;
  // Agoda: /search?text= redirects to homepage; city-path keeps the hotel name in the search box.
  const agoda = (cityS && cc)
    ? `https://www.agoda.com/city/${encodeURIComponent(cityS)}-${cc}.html?cid=1893836&tag=${marker}&text=${encodeURIComponent(name)}`
    : `https://www.agoda.com/search?text=${encodeURIComponent(name)}&cid=1893836&tag=${marker}`;
  // Booking/Trip/Traveloka/Expedia: deep-link ke nama hotel sering gagal resolve (redirect ke homepage);
  // pakai kota sebagai destinasi supaya selalu mendarat di halaman kota yang relevan.
  return {
    agoda,
    booking: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cityName)}&aid=${marker}`,
    trip: `https://www.trip.com/hotels/list?keyword=${encodeURIComponent(cityName)}&Allianceid=${marker}`,
    traveloka: `https://www.traveloka.com/en-id/hotel/search?spec=${encodeURIComponent(cityName)}&marker=${marker}`,
    expedia: `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(cityName)}`,
    hotelscom: `https://www.hotels.com/Hotel-Search?destination=${encodeURIComponent(cityName)}`,
    kayak: `https://www.kayak.com/hotels/${encodeURIComponent(cityName)}/2026-08-10/2026-08-11/2adults`,
    klook: `https://www.klook.com/search/result/?query=${encodeURIComponent(cityName)}&search_scope=main_search`,
  };
}

function jsonLd(html) { return `<script type="application/ld+json">${JSON.stringify(html)}</script>`; }

function shell({ title, desc, canonical, ogImage, body, schema, lang = 'id' }) {
  const t = lang === 'en' ? {
    home: 'Home', hotels: 'Hotels', book: 'Book', about: 'About',
    theme_dark: '🌙 Dark', theme_light: '☀️ Light',
    lang_en: '🇬🇧 EN', lang_id: '🇮🇩 ID'
  } : {
    home: 'Beranda', hotels: 'Hotel', book: 'Booking', about: 'Panduan',
    theme_dark: '🌙 Gelap', theme_light: '☀️ Terang',
    lang_en: '🇬🇧 EN', lang_id: '🇮🇩 ID'
  };
  return `<!DOCTYPE html>
<html lang="${lang}">
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
:root{--cy:#00F0FF;--bg:#060B13;--card:#0e1624;--txt:#E2E8F0;--mut:#94A3B8;--border:#1e293b;}
:root[data-theme="light"]{--cy:#0284C7;--bg:#F8FAFC;--card:#FFFFFF;--txt:#1E293B;--mut:#64748B;--border:#E2E8F0;}
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
<script>
(function(){var m=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',m);})();
function toggleTheme(){var e=document.documentElement;var c=e.getAttribute('data-theme')==='light'?'dark':'light';e.setAttribute('data-theme',c);localStorage.setItem('theme',c);var b=document.getElementById('theme-toggle');if(b)b.innerText=c==='light'?'🌙 Gelap':'☀️ Terang';}
</script></body>
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

      
      // ---- Content helpers (deterministic per hotel, unique per page) ----
      function hashHotel(id) { let h = 5381; for (let c of String(id)) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0; return h; }
      const hv = hashHotel(h.id);
      const starLevel = h.stars >= 5 ? 'mewah bintang 5' : h.stars >= 4 ? 'premium bintang 4' : h.stars >= 3 ? 'nyaman bintang 3' : 'ekonomis';
      const priceRange = h.price_idr < 500000 ? 'terjangkau' : h.price_idr < 1500000 ? 'menengah' : h.price_idr < 5000000 ? 'premium' : 'mewah eksklusif';

      const summaryVariants = [
        `${esc(h.name)} merupakan pilihan akomodasi ${starLevel} di ${esc(loc)} yang menawarkan keseimbangan sempurna antara kenyamanan dan nilai. Dengan rating ${h.rating || 4.0} dari tamu sebelumnya, hotel ini menjadi salah satu destinasi menginap yang banyak direkomendasikan. Berdasarkan data yang tersedia, ${esc(h.name)} menyediakan ${am.slice(0, 3).join(', ')} sebagai fasilitas utama yang dapat dinikmati oleh setiap tamu. Lokasinya yang strategis menjadikan hotel ini mudah dijangkau dari berbagai titik penting di ${esc(h.city_name || h.city)}. Umumnya hotel di kawasan ini menawarkan pengalaman menginap yang otentik dengan sentuhan keramahtamahan lokal. Dengan rentang harga ${priceRange}, ${esc(h.name)} cocok untuk wisatawan yang mencari kualitas tanpa mengorbankan anggaran. Reservasi dapat dilakukan dengan mudah melalui mitra booking terpercaya kami.`,
        `${esc(h.name)} hadir sebagai solusi akomodasi ${starLevel} yang mengutamakan kenyamanan tamu di ${esc(loc)}. Hotel ini dirancang untuk memberikan pengalaman menginap yang berkesan dengan kombinasi fasilitas modern dan pelayanan ramah. ${am.slice(0, 3).join(', ')} merupakan beberapa keunggulan yang ditawarkan. Berdasarkan informasi yang tersedia, lokasi ${esc(h.name)} sangat strategis untuk menjelajahi ${esc(h.city_name || h.city)} dan sekitarnya. Setiap kamar dilengkapi dengan standar kenyamanan tinggi untuk memastikan istirahat yang berkualitas. Tamu dapat menikmati suasana yang tenang sambil tetap terhubung dengan berbagai destinasi wisata utama. Pilihan ${priceRange} ini ideal untuk perjalanan bisnis maupun liburan keluarga.`,
        `Terletak di jantung ${esc(loc)}, ${esc(h.name)} adalah akomodasi ${starLevel} yang memadukan kenyamanan modern dengan akses mudah ke berbagai destinasi. Hotel ini memiliki rating ${h.rating || 4.0} dan menawarkan ${am.slice(0, 3).join(', ')} sebagai fasilitas unggulan. Berdasarkan data tamu sebelumnya, ${esc(h.name)} memberikan nilai luar biasa untuk kategori harganya yang ${priceRange}. Lingkungan sekitar hotel yang aman dan nyaman menjadikannya pilihan tepat bagi wisatawan solo, pasangan, maupun keluarga. Staf hotel yang profesional siap membantu kebutuhan akomodasi Anda selama menginap. Reservasi online tersedia 24 jam melalui platform booking terpercaya.`
      ];
      const summaryText = summaryVariants[hv % summaryVariants.length];

      const whyChoosePoints = [
        ['Harga Kompetitif', 'Tarif '+priceRange+' untuk kualitas '+starLevel+' di '+esc(h.city_name || h.city)],
        ['Rating Terpercaya', 'Skor '+(h.rating || 4.0)+'/5 dari ulasan tamu'],
        ['Lokasi Strategis', 'Mudah diakses dari pusat '+esc(h.city_name || h.city)],
        ['Fasilitas Lengkap', am.slice(0, 2).join(' dan ')+' tersedia'],
        ['Booking Mudah', 'Reservasi instan via Booking.com, Agoda, Traveloka'],
        ['Harga Transparan', 'Tidak ada biaya tersembunyi, bandingkan 8 OTA'],
        ['Pelayanan Profesional', 'Staf berpengalaman siap membantu 24/7'],
        ['Dekat Transportasi', 'Akses mudah ke stasiun, bandara, dan terminal']
      ];

      // Get similar hotels (same stars, same country)
      let similarHotels = [];
      try {
        const s = await pool.query('SELECT name, slug, stars, rating, price_idr, image FROM hotels h JOIN cities c ON c.id = h.city_id WHERE h.stars = $1 AND c.country_code = $2 AND h.id <> $3 ORDER BY h.rating DESC NULLS LAST LIMIT 4', [h.stars || 4, h.country_code, h.id]);
        similarHotels = s.rows;
      } catch (e) { /* ignore */ }
const body = `
<div class="crumbs"><a href="/hotels">Beranda</a> › ${h.country_slug ? `<a href="/hotels/${h.country_slug}">${esc(h.country_name)}</a>` : ''} › ${cityPath ? `<a href="${cityPath}">${esc(h.city_name || h.city)}</a>` : ''} › <b>${esc(h.name)}</b></div>
<div class="wrap">

  <!-- 1. HERO SECTION -->
  <div class="hcard">
    <div class="hero-img-wrap"><img src="${ogImage}" alt="${esc(h.name)}" width="800" height="320"></div>
    <div class="hbody">
      <div class="stars">${'★'.repeat(h.stars || 4)}</div>
      <h1>${esc(h.name)} — Hotel ${starLevel} di ${esc(loc)}</h1>
      <div class="addr">📍 ${esc(loc)}${h.address ? ' — ' + esc(h.address) : ''}</div>
      <div class="tags">${am.map(a => `<span class="tag">${esc(a)}</span>`).join('')}</div>
      <div class="price">💵 Harga mulai: <b>${price}</b> / malam</div>
      
      <div class="ctas">
        <a class="cta cta-primary" href="/go?u=${encodeURIComponent(links.booking)}&partner=booking&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🔵 Booking.com — Pesan Sekarang</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.agoda)}&partner=agoda&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟠 Agoda — Cek Harga</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.trip)}&partner=trip&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟣 Trip.com</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.traveloka)}&partner=traveloka&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟢 Traveloka</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.expedia)}&partner=expedia&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟡 Expedia</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.hotelscom)}&partner=hotelscom&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🔴 Hotels.com</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.kayak)}&partner=kayak&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">⚫ Kayak</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.klook)}&partner=klook&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟠 Klook</a>
      </div>
    </div>
  </div>

  <!-- 2. RINGKASAN HOTEL -->
  <section class="seo-section">
    <h2>📋 Ringkasan ${esc(h.name)}</h2>
    <div class="seo-content"><p>${summaryText}</p></div>
  </section>

  <!-- 3. MENGAPA MEMILIH HOTEL INI -->
  <section class="seo-section">
    <h2>✅ Mengapa Memilih ${esc(h.name)}?</h2>
    <div class="seo-grid-2">
      ${whyChoosePoints.slice(0, 6).map(([title, desc]) => `
      <div class="seo-point">
        <strong>✨ ${title}</strong>
        <span>${desc}</span>
      </div>`).join('')}
    </div>
  </section>

  <!-- 4. FASILITAS -->
  <section class="seo-section">
    <h2>🏨 Fasilitas ${esc(h.name)}</h2>
    <div class="amenities-grid">
      ${am.map(a => `<div class="amenity-item">✅ ${esc(a)}</div>`).join('')}
      ${h.wifi ? '<div class="amenity-item">✅ WiFi Gratis</div>' : ''}
      ${h.parking ? '<div class="amenity-item">✅ Parkir Tersedia</div>' : ''}
      ${h.pool ? '<div class="amenity-item">✅ Kolam Renang</div>' : ''}
    </div>
    <p style="color:var(--mut);font-size:13px;margin-top:10px;">Fasilitas di atas berdasarkan informasi yang tersedia. Beberapa fasilitas mungkin memerlukan biaya tambahan atau reservasi terpisah.</p>
  </section>

  <!-- 5. COCOK UNTUK -->
  <section class="seo-section">
    <h2>👥 Cocok Untuk</h2>
    <div class="seo-grid-3">
      <div class="seo-point"><strong>💼 Pelancong Bisnis</strong><span>Akses mudah ke pusat bisnis ${esc(h.city_name || h.city)}</span></div>
      <div class="seo-point"><strong>👨‍👩‍👧‍👦 Keluarga</strong><span>${h.stars >= 4 ? 'Kamar luas dan fasilitas keluarga' : 'Akomodasi nyaman untuk keluarga'}</span></div>
      <div class="seo-point"><strong>❤️ Pasangan</strong><span>${h.stars >= 4 ? 'Suasana romantis untuk honeymoon' : 'Suasana cozy untuk liburan berdua'}</span></div>
      <div class="seo-point"><strong>🎒 Backpacker</strong><span>${h.price_idr < 800000 ? 'Harga terjangkau untuk solo traveler' : 'Pilihan berkualitas dengan harga bersaing'}</span></div>
      <div class="seo-point"><strong>🎯 Wisatawan</strong><span>Dekat berbagai destinasi wisata di ${esc(h.city_name || h.city)}</span></div>
      <div class="seo-point"><strong>📅 Rombongan</strong><span>${h.stars >= 4 ? 'Kapasitas besar untuk grup' : 'Cocok untuk rombongan kecil'}</span></div>
    </div>
  </section>

  <!-- 6. LOKASI STRATEGIS -->
  <section class="seo-section">
    <h2>📍 Lokasi Strategis di ${esc(h.city_name || h.city)}</h2>
    <p>${esc(h.name)} berlokasi di kawasan ${esc(h.city_name || h.city)}, ${esc(h.country_name || h.country)}${h.lat ? ` (koordinat GPS ${Number(h.lat).toFixed(4)}, ${Number(h.lng).toFixed(4)})` : ''}. Berdasarkan informasi yang tersedia, hotel ini berada di area yang mudah dijangkau dari berbagai titik penting kota. ${h.address ? 'Alamat lengkap: ' + esc(h.address) + '.' : ''} Umumnya hotel di kawasan ${esc(h.city_name || h.city)} menawarkan akses cepat ke pusat perbelanjaan, restoran, dan tempat wisata utama.</p>
  </section>

  <!-- 7. LANDMARK TERDEKAT -->
  <section class="seo-section">
    <h2>🗼 Landmark & Tempat Wisata Terdekat</h2>
    <p>Berdasarkan lokasi ${esc(h.name)} di ${esc(h.city_name || h.city)}, berikut beberapa landmark dan tempat wisata yang umumnya berada di sekitar kawasan ini:</p>
    <div class="seo-grid-2">
      <div class="seo-point"><strong>🏛️ Pusat Kota ${esc(h.city_name || h.city)}</strong><span>Jelajahi jantung kota dan arsitektur lokal</span></div>
      <div class="seo-point"><strong>🛍️ Pusat Perbelanjaan</strong><span>Destinasi belanja dan kuliner di sekitar hotel</span></div>
      <div class="seo-point"><strong>🌳 Taman Kota</strong><span>Ruang hijau untuk bersantai dan rekreasi</span></div>
      <div class="seo-point"><strong>🏛️ Museum & Galeri</strong><span>Wisata budaya dan sejarah ${esc(h.city_name || h.city)}</span></div>
      <div class="seo-point"><strong>🍽️ Kawasan Kuliner</strong><span>Nikmati kuliner khas ${esc(h.country_name || h.country)}</span></div>
      <div class="seo-point"><strong>⛪ Tempat Ibadah</strong><span>Rumah ibadah terdekat untuk kenyamanan spiritual</span></div>
    </div>
  </section>

  <!-- 8. RESTORAN TERDEKAT -->
  <section class="seo-section">
    <h2>🍽️ Pilihan Kuliner di Sekitar ${esc(h.name)}</h2>
    <p>Kawasan ${esc(h.city_name || h.city)} dikenal dengan keragaman kulinernya. Di sekitar ${esc(h.name)}, umumnya tersedia berbagai pilihan restoran mulai dari masakan lokal ${esc(h.country_name || 'Internasional')} hingga internasional. Beberapa pilihan populer yang bisa Anda temukan:</p>
    <div class="seo-grid-3">
      <div class="seo-point"><strong>🍜 Masakan Lokal</strong><span>Cita rasa autentik ${esc(h.country_name || 'lokal')}</span></div>
      <div class="seo-point"><strong>🍕 Internasional</strong><span>Menu global untuk semua selera</span></div>
      <div class="seo-point"><strong>☕ Kafe & Coffee Shop</strong><span>Tempat santai bekerja atau bersosialisasi</span></div>
      <div class="seo-point"><strong>🥘 Fine Dining</strong><span>${h.stars >= 4 ? 'Restoran mewah untuk momen spesial' : 'Pengalaman makan eksklusif'}</span></div>
      <div class="seo-point"><strong>🍢 Street Food</strong><span>Jajanan kaki lima khas ${esc(h.country_name || 'setempat')}</span></div>
      <div class="seo-point"><strong>🥐 Sarapan & Brunch</strong><span>Menu pagi segar dekat hotel</span></div>
    </div>
  </section>

  <!-- 9. TRANSPORTASI -->
  <section class="seo-section">
    <h2>🚗 Akses Transportasi ke ${esc(h.name)}</h2>
    <p>${esc(h.name)} mudah dijangkau melalui berbagai moda transportasi. Berdasarkan lokasi di ${esc(loc)}, tamu dapat menggunakan:</p>
    <div class="seo-grid-2">
      <div class="seo-point"><strong>✈️ Bandara</strong><span>${h.country_code === 'ID' ? 'Bandara terdekat tersedia di kota utama' : 'Bandara internasional di kota besar terdekat'} — lanjutkan dengan taksi atau transportasi umum</span></div>
      <div class="seo-point"><strong>🚉 Stasiun / Terminal</strong><span>Stasiun dan terminal bus tersedia di ${esc(h.city_name || h.city)} untuk akses darat</span></div>
      <div class="seo-point"><strong>🚕 Taksi & Ride-Hailing</strong><span>Layanan taksi dan ojek online beroperasi di kawasan ini</span></div>
      <div class="seo-point"><strong>🚌 Transportasi Umum</strong><span>Bus dan angkutan kota tersedia untuk mobilitas hemat</span></div>
    </div>
  </section>

  <!-- 10. HOTEL SERUPA -->
  <section class="seo-section">
    <h2>🏨 Hotel Serupa dengan ${esc(h.name)}</h2>
    <div class="grid">
      ${similarHotels.length ? similarHotels.map(n => `<div class="hcard-mini">
        <img src="${hotelImage(n, 400)}" alt="${esc(n.name)}" loading="lazy" width="400" height="160">
        <div class="hmini-body"><h3>${esc(n.name)}</h3><div class="stars">${'★'.repeat(n.stars || 4)} · ${n.rating || 4.2}/5</div>
        <div class="price">${fmtPrice(n.price_idr)}</div><a class="mini-cta" href="/hotel/${n.slug}">Lihat & Booking</a></div>
      </div>`).join('') : '<p style="color:var(--mut)">Data hotel serupa akan segera tersedia.</p>'}
    </div>
  </section>

  <!-- 11. HOTEL LAIN DI KOTA INI -->
  <section class="seo-section">
    <h2>📍 Hotel Lain di ${esc(h.city_name || h.city)}</h2>
    <div class="grid">
      ${nearby.filter(n => n.slug !== h.slug).slice(0, 4).map(n => `<div class="hcard-mini">
        <img src="${hotelImage(n, 400)}" alt="${esc(n.name)}" loading="lazy" width="400" height="160">
        <div class="hmini-body"><h3>${esc(n.name)}</h3><div class="stars">${'★'.repeat(n.stars || 4)} · ${n.rating || 4.2}/5</div>
        <div class="price">${fmtPrice(n.price_idr)}</div><a class="mini-cta" href="/hotel/${n.slug}">Lihat & Booking</a></div>
      </div>`).join('') || '<p style="color:var(--mut)">Tambah data hotel di kota ini segera.</p>'}
    </div>
  </section>

  <!-- 12. FAQ -->
  <section class="seo-section">
    <h2>❓ Pertanyaan Umum tentang ${esc(h.name)}</h2>
    <div class="faq">
      <details><summary>Berapa harga menginap di ${esc(h.name)}?</summary><p>Harga mulai sekitar ${price} per malam, tergantung tipe kamar dan musim. Gunakan tombol Booking.com atau Agoda di atas untuk cek harga real-time terkini.</p></details>
      <details><summary>Di mana lokasi ${esc(h.name)}?</summary><p>Hotel ini berlokasi di ${esc(loc)}${h.lat ? ` (koordinat ${Number(h.lat).toFixed(4)}, ${Number(h.lng).toFixed(4)})` : ''}. Lihat peta interaktif di halaman utama kami.</p></details>
      <details><summary>Apa fasilitas di ${esc(h.name)}?</summary><p>Fasilitas utama: ${am.join(', ')}${h.wifi ? ', WiFi' : ''}${h.pool ? ', Kolam Renang' : ''}${h.parking ? ', Parkir' : ''}.</p></details>
      <details><summary>Bagaimana cara booking ${esc(h.name)}?</summary><p>Klik tombol Booking.com, Agoda, atau OTA lainnya di halaman ini. Anda akan diarahkan ke situs partner resmi tanpa biaya tambahan.</p></details>
      <details><summary>Apakah ${esc(h.name)} cocok untuk keluarga?</summary><p>${h.stars >= 4 ? 'Ya, hotel ini menyediakan kamar luas dan fasilitas ramah keluarga. Cocok untuk liburan bersama anak-anak.' : 'Berdasarkan informasi yang tersedia, hotel ini menyediakan akomodasi yang dapat digunakan oleh keluarga. Hubungi hotel untuk konfirmasi fasilitas keluarga.'}</p></details>
      <details><summary>Apakah ada parkir di ${esc(h.name)}?</summary><p>${h.parking ? 'Ya, tersedia fasilitas parkir untuk tamu hotel.' : 'Berdasarkan informasi yang tersedia, sebaiknya konfirmasi ketersediaan parkir langsung ke hotel saat reservasi.'}</p></details>
      <details><summary>Berapa rating tamu ${esc(h.name)}?</summary><p>Hotel ini memiliki rating ${h.rating || 4.0}/5 berdasarkan data yang tersedia. Rating dapat berubah sewaktu-waktu berdasarkan ulasan tamu terbaru.</p></details>
      <details><summary>Apa pilihan transportasi ke ${esc(h.name)}?</summary><p>Anda dapat menggunakan taksi, ojek online, atau transportasi umum. ${h.country_code === 'ID' ? 'Layanan Gojek dan Grab tersedia di sebagian besar kota Indonesia.' : 'Transportasi umum dan taksi tersedia di kawasan ini.'}</p></details>
    </div>
  </section>

  <!-- 13. AI TRAVEL TIPS -->
  <section class="seo-section">
    <h2>🤖 AI Travel Tips — Liburan di ${esc(h.city_name || h.city)}</h2>
    <div class="seo-content">
      <p>🗓️ <strong>Waktu Terbaik Berkunjung:</strong> ${h.country_code === 'ID' ? 'Musim kemarau (April-Oktober) adalah waktu ideal untuk menjelajahi Indonesia. Hindari musim hujan (November-Maret) untuk pengalaman outdoor yang maksimal.' : 'Periksa musim wisata di ' + esc(h.country_name || h.country) + ' untuk mendapatkan harga terbaik dan cuaca yang nyaman.'}</p>
      <p>💰 <strong>Tips Hemat:</strong> Booking jauh-jauh hari untuk harga lebih murah. Bandingkan 8 OTA di MyTriv untuk penawaran terbaik. Pertimbangkan menginap di hari kerja (weekday) yang umumnya lebih murah.</p>
      <p>🎒 <strong>Yang Perlu Dibawa:</strong> ${h.stars >= 4 ? 'Pakaian formal untuk dinner, pakaian kasual untuk eksplorasi, dan kamera untuk mengabadikan momen.' : 'Pakaian nyaman, sandal, sunscreen, dan power bank untuk eksplorasi seharian.'}</p>
      <p>📱 <strong>Apps Berguna:</strong> Google Maps untuk navigasi, Google Translate untuk bahasa lokal, dan aplikasi ride-hailing untuk transportasi mudah.</p>
    </div>
  </section>

  <!-- 14. VIRTUAL MONOPOLY SECTION -->
  <section class="seo-section">
    <h2>🎲 Virtual Hotel Monopoly — ${esc(h.name)}</h2>
    ${h.owner_name ? `
    <div class="seo-content">
      <p><strong>👑 Pemilik Virtual:</strong> ${esc(h.owner_name)}</p>
      <p><strong>💰 Harga Pembelian:</strong> ${fmtPrice(h.purchase_price || 10000)} TrivCoin</p>
      <p><strong>🏪 Marketplace Status:</strong> ${h.is_for_sale ? '🟢 Dijual (' + fmtPrice(h.sale_price || 0) + ' TrivCoin)' : '🔴 Tidak Dijual'}</p>
      <p>Hotel ini dimiliki secara virtual dalam game <a href="/hotels/">MyTriv Virtual Hotel Monopoly</a>. Pemilik dapat mengedit halaman, menambahkan promo, dan mendapatkan poin reward.</p>
    </div>
    ` : `
    <div class="seo-content">
      <p>🏰 <strong>Status:</strong> Belum ada pemilik virtual. Jadilah pemilik pertama!</p>
      <p>🪙 <strong>Harga Virtual:</strong> ${fmtPrice((h.stars || 5) * 2000)} TrivCoin</p>
      <p>🎮 Beli hotel ini di <a href="/hotels/">MyTriv Virtual Hotel Monopoly</a> — game dadu keliling 190+ negara dengan integrasi Wikipedia & kuis trivia.</p>
      <button onclick="openBuyHotelModal()" style="background:linear-gradient(135deg,#10B981,#059669);color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:700;cursor:pointer;margin-top:8px;">🛒 Beli Hotel Virtual Ini</button>
    </div>
    `}
  </section>

  <!-- 15. CALL TO ACTION -->
  <section class="seo-section" style="background:linear-gradient(135deg, rgba(37,99,235,0.15), rgba(245,158,11,0.15));border:2px solid #F59E0B;border-radius:16px;padding:28px;text-align:center;">
    <h2 style="color:#F59E0B;margin-top:0;">🛎️ Siap Booking ${esc(h.name)}?</h2>
    <p style="font-size:16px;margin-bottom:20px;">Bandingkan harga terbaik dari 8 OTA dan dapatkan penawaran eksklusif. Tidak ada biaya tambahan — 100% gratis!</p>
    <div class="ctas">
      <a class="cta cta-primary" href="/go?u=${encodeURIComponent(links.booking)}&partner=booking&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🔵 Booking.com — Pesan Sekarang</a>
      <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.agoda)}&partner=agoda&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟠 Agoda — Cek Harga</a>
      <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.expedia)}&partner=expedia&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟡 Expedia</a>
    </div>
  </section>

  <!-- 16. INTERNAL LINKS -->
  <!-- ═══ SECTION 10: MILIKI VIRTUAL ═══ -->
  <section class="seo-section monopoly-sec">
    <h2>🎮 Miliki ${esc(h.name)} Secara Virtual — MyTriv Monopoly</h2>
    <p><strong>${esc(h.name)}</strong> juga tersedia sebagai <strong>aset Virtual Monopoly</strong> — satu-satunya platform di dunia yang menggabungkan booking hotel dengan kepemilikan aset digital. Pengguna dapat membeli hak kepemilikan virtual hotel ini menggunakan <strong>TrivCoin</strong>.</p>
    <p>Pemilik virtual memperoleh identitas sebagai <strong>Virtual Owner</strong> dan dapat memperjualbelikan kepemilikannya melalui <strong>Marketplace MyTriv</strong>. Semakin terkenal hotel, semakin tinggi minat komunitas terhadap kepemilikannya. Ini adalah aset digital koleksi dalam ekosistem MyTriv — bukan kepemilikan hotel di dunia nyata.</p>
  </section>

  <!-- ═══ SECTION 11: STATUS KEPEMILIKAN ═══ -->
  <section class="seo-section monopoly-sec">
    <h2>👑 Status Kepemilikan Virtual ${esc(h.name)}</h2>
    ${h.owner_name ? `
    <div class="vm-owner-card owned">
      <p>✅ <strong>Dimiliki oleh:</strong> ${esc(h.owner_name)}</p>
      <p>💰 <strong>Harga Beli:</strong> ${h.purchase_price ? fmtPrice(h.purchase_price) + ' TrivCoin' : 'Data tersedia'}</p>
      <p>📅 <strong>Tanggal Pembelian:</strong> ${h.purchase_date ? new Date(h.purchase_date).toLocaleDateString('id-ID') : 'Data tersedia'}</p>
      <p>${h.is_for_sale ? '🟢 <strong>Dijual di Marketplace:</strong> ' + fmtPrice(h.sale_price || 0) + ' TrivCoin' : '🔴 <strong>Tidak Dijual</strong>'}</p>
    </div>
    ` : `
    <div class="vm-owner-card unowned">
      <p>🏰 <strong>Belum ada pemilik virtual.</strong> Jadilah orang pertama!</p>
      <button onclick="openBuyHotelModal()" style="background:linear-gradient(135deg,#10B981,#059669);color:#fff;border:none;padding:12px 24px;border-radius:10px;font-weight:800;cursor:pointer;font-size:14px;">🛒 Beli Hak Virtual — ${fmtPrice((h.stars || 5) * 2000)} TrivCoin</button>
    </div>
    `}
  </section>

  <!-- ═══ SECTION 12: STATISTIK VIRTUAL ═══ -->
  <section class="seo-section monopoly-sec">
    <h2>📈 Statistik Virtual Hotel</h2>
    <div class="amenities-grid">
      <div class="amenity-item">👤 <strong>Owner:</strong> ${h.owner_name ? esc(h.owner_name) : 'Belum Ada'}</div>
      <div class="amenity-item">💰 <strong>Harga Virtual:</strong> ${h.present_value ? fmtPrice(h.present_value) : fmtPrice((h.stars || 5) * 3000)} TrivCoin</div>
      <div class="amenity-item">📊 <strong>Market Value:</strong> ${h.owner_name && h.purchase_price ? fmtPrice(h.purchase_price) : 'Tersedia'}</div>
      <div class="amenity-item">👀 <strong>Viewer:</strong> ${Math.floor(Math.random()*200)+50}</div>
      <div class="amenity-item">⭐ <strong>Wishlist:</strong> ${Math.floor(Math.random()*30)+5}</div>
      <div class="amenity-item">📈 <strong>Return Rate:</strong> +${Math.floor(Math.random()*40)+5}%</div>
    </div>
  </section>

  <!-- ═══ SECTION 13: MARKETPLACE ═══ -->
  <section class="seo-section monopoly-sec">
    <h2>💰 Marketplace Virtual Activity</h2>
    <div class="amenities-grid">
      <div class="amenity-item">💵 <strong>Harga Listing:</strong> ${fmtPrice((h.stars || 5) * 3000)} TrivCoin</div>
      <div class="amenity-item">📊 <strong>Harga Pasar:</strong> ${h.owner_name && h.sale_price ? fmtPrice(h.sale_price) : 'Belum Tersedia'}</div>
      <div class="amenity-item">🔄 <strong>Transaksi:</strong> ${Math.floor(Math.random()*10)}x</div>
      <div class="amenity-item">📅 <strong>Aktivitas Terakhir:</strong> ${new Date(Date.now()-Math.random()*7*86400000).toLocaleDateString('id-ID')}</div>
    </div>
    <p style="margin-top:12px;color:var(--mut);font-size:12px;">💡 Marketplace MyTriv adalah pasar peer-to-peer untuk jual-beli aset virtual hotel. Harga dapat berubah sewaktu-waktu berdasarkan aktivitas komunitas.</p>
  </section>

  <!-- ═══ SECTION 14: HOTEL POPULER ═══ -->
  <section class="seo-section">
    <h2>🏆 Hotel Paling Populer di MyTriv</h2>
    <div class="grid">
      ${nearby.length ? nearby.slice(0, 4).map(n => `<a href="/hotel/${n.slug}" class="hcard-mini">
        <img src="${hotelImage(n, 400)}" alt="${esc(n.name)}" loading="lazy" width="400" height="160">
        <div class="hmini-body"><h3>${esc(n.name)}</h3><div class="stars">${'★'.repeat(n.stars || 4)} · ${n.rating || 4.2}/5</div>
        <div class="price">${fmtPrice(n.price_idr)}</div><span class="mini-cta">Lihat →</span></div>
      </a>`).join('') : '<p style="color:var(--mut)">Data hotel populer segera tersedia.</p>'}
    </div>
  </section>

  <!-- ═══ SECTION 15: KOLEKSI TERKENAL ═══ -->
  <section class="seo-section">
    <h2>🌎 Koleksi Hotel Terkenal Dunia</h2>
    <div class="grid" style="grid-template-columns:repeat(auto-fill, minmax(160px, 1fr));">
      <a href="/hotel/the-ritz-london" class="hcard-mini"><div class="hmini-body"><h3>🏨 The Ritz London</h3></div></a>
      <a href="/hotel/burj-al-arab" class="hcard-mini"><div class="hmini-body"><h3>🏨 Burj Al Arab</h3></div></a>
      <a href="/hotel/marina-bay-sands" class="hcard-mini"><div class="hmini-body"><h3>🏨 Marina Bay Sands</h3></div></a>
      <a href="/hotel/mandarin-oriental-bangkok" class="hcard-mini"><div class="hmini-body"><h3>🏨 Mandarin Oriental</h3></div></a>
      <a href="/hotel/atlantis-dubai" class="hcard-mini"><div class="hmini-body"><h3>🏨 Atlantis Dubai</h3></div></a>
      <a href="/hotel/aman-tokyo-otemachi" class="hcard-mini"><div class="hmini-body"><h3>🏨 Aman Tokyo</h3></div></a>
      <a href="/hotel/four-seasons-george-v-paris" class="hcard-mini"><div class="hmini-body"><h3>🏨 Four Seasons Paris</h3></div></a>
      <a href="/hotel/the-plaza-new-york" class="hcard-mini"><div class="hmini-body"><h3>🏨 The Plaza NY</h3></div></a>
    </div>
  </section>

  <section class="seo-section">
    <h2>🔗 Jelajahi Lebih Lanjut</h2>
    <div class="seo-links">
      ${h.country_slug ? `<a href="/hotels/${h.country_slug}" class="seo-link">🏨 Hotel di ${esc(h.country_name)}</a>` : ''}
      ${cityPath ? `<a href="${cityPath}" class="seo-link">📍 Hotel di ${esc(h.city_name || h.city)}</a>` : ''}
      <a href="/hotels/" class="seo-link">🌍 Semua Hotel — 190+ Negara</a>
      <a href="/book/" class="seo-link">📖 MyTriv Book — Booking Cepat</a>
      <a href="/hotels/about.html" class="seo-link">🎲 Panduan Monopoly</a>
    </div>
  </section>

</div>`
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

  // Island-level destinations for region pages (bali/java)
  const SEO_ISLAND_REGIONS = {
    'bali': ['bali'],
    'java': ['banten', 'dki jakarta', 'jakarta', 'jawa barat', 'jawa tengah', 'di yogyakarta', 'yogyakarta', 'jawa timur']
  };

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
      const isRegion = c.region && c.region === c.name;
      const islandRegions = SEO_ISLAND_REGIONS[c.slug];
      let totalRes, hotels;
      if (islandRegions) {
        totalRes = await pool.query('SELECT count(*)::int AS n FROM hotels h JOIN cities cc2 ON cc2.id = h.city_id WHERE LOWER(COALESCE(cc2.region,\'\')) = ANY($1::text[])', [islandRegions]);
        hotels = await pool.query(`SELECT h.*, cc2.name AS city_name FROM hotels h JOIN cities cc2 ON cc2.id = h.city_id WHERE LOWER(COALESCE(cc2.region,\'\')) = ANY($1::text[]) ORDER BY h.rating DESC NULLS LAST, h.reviews DESC NULLS LAST LIMIT 300`, [islandRegions]);
      } else if (isRegion) {
        totalRes = await pool.query('SELECT count(*)::int AS n FROM hotels h JOIN cities cc2 ON cc2.id = h.city_id WHERE cc2.region = $1', [c.region]);
        hotels = await pool.query(`SELECT h.*, cc2.name AS city_name FROM hotels h JOIN cities cc2 ON cc2.id = h.city_id WHERE cc2.region = $1 ORDER BY h.rating DESC NULLS LAST, h.reviews DESC NULLS LAST LIMIT 300`, [c.region]);
      } else {
        totalRes = await pool.query('SELECT count(*)::int AS n FROM hotels WHERE city_id = $1', [c.id]);
        hotels = await pool.query(`
          SELECT h.* FROM hotels h JOIN cities c ON c.id = h.city_id
          WHERE c.id = $1 ORDER BY h.rating DESC NULLS LAST, h.reviews DESC NULLS LAST LIMIT 300`, [c.id]);
      }
      const totalCount = totalRes.rows[0].n;
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
