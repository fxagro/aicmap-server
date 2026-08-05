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

function sanStars(s) { const n = Number(s); if (!Number.isFinite(n) || n < 1) return 4; return Math.min(5, Math.max(1, Math.round(n))); }
function sanRating(r) { const n = Number(r); return Number.isFinite(n) && n >= 0 && n <= 10 ? n : null; }
function sanPrice(p) { const n = Number(p); if (!Number.isFinite(n) || n <= 0 || n > 50000000) return null; return Math.round(n); }
function fmtPrice(idr) {
  const n = Number(idr);
  if (!Number.isFinite(n) || n < 0) return 'Harga bervariasi';
  if (n >= 1000000) return `Rp ${(n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (n >= 1000) return `Rp ${Math.round(n / 1000)} rb`;
  return `Rp ${n}`;
}

function hotelImage(h, w = 800) {
  if (h.image) return h.image;
  return hotelImgUrl((h.city || h.city_name || '') + '|' + (h.country || h.country_name || ''));
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
function amenitiesEn(h) {
  const pairs = [ [h.wifi, 'Free WiFi'], [h.pool, 'Swimming Pool'], [h.parking, 'Parking'], [h.bar, 'Bar'], [h.restaurant, 'Restaurant'], [h.gym, 'Gym'], [h.spa, 'Spa'] ];
  const list = [];
  for (const ok of pairs) if (ok[0]) list.push(ok[1]);
  if (Array.isArray(h.amenities) && h.amenities.length) {
    for (const a of h.amenities) {
      if (!list.includes(a) && list.length < 8) list.push(a);
    }
  }
  if (!list.length) list.push('Comfortable Accommodation');
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
  // Expedia/Hotels.com/Kayak/Klook: gunakan redirect Travelpayouts (marker + campaign) supaya komisi ter-track.
  const tp = (campaign, target) => `https://tp.media/r?marker=${marker}&p=${campaign}&sub_id=${encodeURIComponent(sub)}&u=${encodeURIComponent(target)}`;
  return {
    agoda,
    booking: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cityName)}&aid=${marker}`,
    trip: `https://www.trip.com/hotels/list?keyword=${encodeURIComponent(cityName)}&Allianceid=${marker}`,
    traveloka: `https://www.traveloka.com/en-id/hotel/search?spec=${encodeURIComponent(cityName)}&marker=${marker}`,
    expedia: tp('393', `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(cityName)}`),
    hotelscom: tp('2131', `https://www.hotels.com/Hotel-Search?destination=${encodeURIComponent(cityName)}`),
    kayak: tp('5465', `https://www.kayak.com/hotels/${encodeURIComponent(cityName)}/2026-08-10/2026-08-11/2adults`),
    klook: tp('12049', `https://www.klook.com/search/result/?query=${encodeURIComponent(cityName)}&search_scope=main_search`),
  };
}

function jsonLd(html) { return `<script type="application/ld+json">${JSON.stringify(html)}</script>`; }

function shell({ title, desc, canonical, ogImage, body, schema, lang = 'id', user = null }) {
  const backPath = encodeURIComponent(canonical.replace(/^https?:\/\/[^\/]+/, '') || '/');
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
<link rel="alternate" hreflang="id" href="${canonical.replace('/en/','/')}">
<link rel="alternate" hreflang="en" href="${canonical.includes('/en/') ? canonical : canonical.replace('/hotel/','/en/hotel/')}">
<link rel="alternate" hreflang="x-default" href="${canonical.replace('/en/','/')}">
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
.hbody h1{color:var(--txt);font-size:26px;margin-bottom:6px}
.stars{color:#FFD700;letter-spacing:2px;font-size:16px}
.addr{color:var(--mut);font-size:14px;margin:8px 0}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}
.tag{background:#0e2440;border:1px solid #155e75;color:var(--cy);padding:4px 12px;border-radius:20px;font-size:13px}
.ctas{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}
.cta{display:block;text-align:center;padding:14px;border-radius:10px;font-weight:800;font-size:15px;transition:transform .15s}
.cta:hover{transform:translateY(-2px)}
.cta-primary{background:var(--cy);color:#060B13}
.cta-alt{background:#0e2440;border:1px solid #155e75;color:var(--cy)}
h2{color:var(--txt);font-size:20px;margin:28px 0 14px;border-bottom:1px solid var(--border);padding-bottom:8px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.hcard-mini{background:var(--card);border:1px solid #1e293b;border-radius:12px;overflow:hidden}
.hcard-mini img{width:100%;height:160px;object-fit:cover}
.hmini-body{padding:14px}
.hmini-body h3{color:var(--txt);font-size:16px;margin-bottom:4px}
.hmini-body .stars{font-size:13px}
.hmini-body .price{color:#34D399;font-weight:800;font-size:14px;margin-top:6px}
.mini-cta{display:inline-block;margin-top:10px;background:var(--cy);color:#060B13;font-size:13px;font-weight:700;padding:7px 14px;border-radius:8px}
.faq{margin-top:8px}
.faq details{background:var(--card);border:1px solid #1e293b;border-radius:10px;padding:14px 16px;margin-bottom:10px}
.faq summary{font-weight:700;color:var(--txt);cursor:pointer}
.faq p{color:var(--mut);font-size:14px;margin-top:8px}
footer{border-top:1px solid #1e293b;padding:28px 24px;text-align:center;color:var(--mut);font-size:13px;margin-top:40px}
footer a{color:var(--cy)}
.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.review-summary{display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:var(--card);border:1px solid #1e293b;border-radius:12px;padding:14px 18px;margin-bottom:12px}
.review-score{font-size:38px;font-weight:900;color:var(--cy)}
.review-list{display:flex;flex-direction:column;gap:12px}
.review-card{background:var(--card);border:1px solid #1e293b;border-radius:12px;padding:14px 16px}
.review-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px}
.review-head b{color:var(--txt)}
.review-date{color:var(--mut);font-size:12px;margin-left:auto}
.review-card h3{color:var(--txt);font-size:15px;margin:6px 0 4px}
.review-card p{color:var(--mut);font-size:14px}
.review-empty{color:var(--mut);font-style:italic}
.review-form{background:var(--card);border:1px solid #1e293b;border-radius:12px;padding:16px;margin-top:14px}
.review-form h3{color:var(--txt);margin-bottom:10px}
.rv-stars{font-size:26px;cursor:pointer;letter-spacing:4px;color:var(--cy);margin-bottom:8px}}
.review-form input[type=text],.review-form textarea{width:100%;background:#0b1220;border:1px solid #1e293b;color:var(--txt);border-radius:8px;padding:10px;margin-bottom:8px;font-family:inherit;font-size:14px}
.review-form button{background:var(--cy);color:#060B13;border:none;padding:10px 20px;border-radius:8px;font-weight:800;cursor:pointer}
#rv-msg{font-size:13px;margin-top:8px;color:var(--cy)}
@media(max-width:640px){.ctas{grid-template-columns:1fr}.hero h1{font-size:24px}}

/* ═══ MODERN HOTEL LAYOUT (Booking.com + Airbnb + TripAdvisor) ═══ */
.hd-page .wrap{max-width:1560px;padding:18px 26px}
.hd-wrap{width:100%}
.hd-layout{display:grid;grid-template-columns:minmax(0,1fr);gap:26px;margin-top:24px}
@media(min-width:1100px){.hd-layout{grid-template-columns:minmax(0,1fr) 380px;align-items:start}}
.hd-main{min-width:0}
.hd-sidebar{display:flex;flex-direction:column;gap:16px}
@media(min-width:1100px){.hd-sidebar{position:sticky;top:78px;max-height:calc(100vh - 90px);overflow:auto;padding-bottom:12px;scrollbar-width:thin}}

/* Hero gallery */
.hd-hero{background:var(--card);border:1px solid var(--border);border-radius:18px;overflow:hidden}
.hd-hero-grid{display:grid;grid-template-columns:1fr;gap:0}
@media(min-width:1024px){.hd-hero-grid{grid-template-columns:1.55fr 1fr}}
.hd-gallery-main{position:relative}
.hd-gallery-main img{width:100%;height:100%;min-height:300px;max-height:560px;object-fit:cover;display:block}
.hd-gallery-thumbs{display:grid;grid-template-columns:repeat(2,1fr);gap:4px;padding:4px}
.hd-gallery-thumbs img{width:100%;height:100%;object-fit:cover;cursor:pointer;border-radius:6px;transition:opacity .15s}
.hd-gallery-thumbs img:hover{opacity:.8}
@media(min-width:1024px){.hd-gallery-thumbs{grid-template-columns:repeat(2,1fr)}.hd-gallery-thumbs img{height:174px}}
.hd-hero-info{padding:22px 24px}
.hd-badges{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.hd-badge{display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#0e2440,#123a5e);border:1px solid #155e75;color:var(--cy);padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700}
.hd-badge.b-hot{background:linear-gradient(135deg,#7c2d12,#9a3412);border-color:#ea580c;color:#fdba74}
.hd-badge.b-family{background:linear-gradient(135deg,#3b0764,#581c87);border-color:#7c3aed;color:#d8b4fe}
.hd-badge.b-lux{background:linear-gradient(135deg,#111827,#1f2937);border-color:#d4af37;color:#fcd34d}
.hd-badge.b-beach{background:linear-gradient(135deg,#164e63,#0e7490);border-color:#22d3ee;color:#a5f3fc}
.hd-badge.b-biz{background:linear-gradient(135deg,#1e3a8a,#1d4ed8);border-color:#60a5fa;color:#bfdbfe}
.hd-title-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px}
.hd-rating-chip{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#065f46,#047857);border:1px solid #10b981;color:#a7f3d0;padding:4px 12px;border-radius:10px;font-weight:800;font-size:14px}
.hd-hero-info h1{font-size:clamp(22px,3vw,34px);line-height:1.2;margin-bottom:8px;color:var(--txt)}
.hd-addr{color:var(--mut);font-size:14px;margin-bottom:10px}
.hd-addr a{color:var(--cy)}
.hd-tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.hd-tag{display:inline-flex;align-items:center;gap:6px;background:var(--card);border:1px solid var(--border);color:var(--txt);padding:5px 11px;border-radius:8px;font-size:13px}
.hd-price-line{display:flex;align-items:baseline;gap:10px;margin:6px 0 14px;padding:12px 14px;background:linear-gradient(135deg,rgba(16,185,129,.12),rgba(2,132,199,.08));border:1px solid rgba(16,185,129,.35);border-radius:12px}
.hd-price-line b{font-size:22px;color:#34D399}
.hd-price-line span{color:var(--mut);font-size:13px}
.hd-ai-summary{background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(236,72,153,.08));border:1px solid rgba(99,102,241,.3);border-radius:12px;padding:14px 16px;margin-bottom:16px}
.hd-ai-summary h4{margin-bottom:8px;font-size:13px;color:#a5b4fc;display:flex;align-items:center;gap:6px}
.hd-ai-summary ul{margin:0;padding-left:18px;list-style:disc}
.hd-ai-summary li{color:var(--txt);font-size:13.5px;line-height:1.7}
.hd-hero-cta{display:flex;flex-direction:column;gap:10px}
.hd-cta-big{display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#00F0FF,#0284C7);color:#060B13;padding:16px 20px;border-radius:12px;font-weight:900;font-size:16px;text-align:center;box-shadow:0 6px 20px rgba(0,240,255,.25);transition:transform .15s,box-shadow .15s}
.hd-cta-big:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,240,255,.35)}
.hd-hero-cta-sub{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.hd-cta-sm{display:flex;align-items:center;justify-content:center;gap:6px;padding:11px 12px;border-radius:10px;font-weight:700;font-size:13px;background:var(--card);border:1px solid var(--border);color:var(--cy);transition:background .15s}
.hd-cta-sm:hover{background:#0e2440}
.hd-hero-actions{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
.hd-action-btn{display:inline-flex;align-items:center;gap:6px;background:var(--card);border:1px solid var(--border);color:var(--txt);padding:8px 14px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s}
.hd-action-btn:hover{background:#0e2440}
.hd-action-btn.active{background:var(--cy);color:#060B13;border-color:var(--cy)}

/* Sidebar cards */
.hd-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px 18px}
.hd-card h3{margin-bottom:12px;font-size:15px;display:flex;align-items:center;gap:8px}
.hd-book-card{position:relative;box-shadow:0 10px 30px rgba(0,0,0,.35)}
.hd-book-card .hd-price-line{margin:0 0 12px}
.hd-field{background:#0b1220;border:1px solid var(--border);border-radius:10px;padding:11px 12px;margin-bottom:10px;font-size:14px;color:var(--txt);display:flex;justify-content:space-between;align-items:center;cursor:pointer}
.hd-field b{color:var(--txt)}
.hd-field span{color:var(--mut);font-size:13px}
.hd-note{font-size:11.5px;color:var(--mut);line-height:1.5;margin-top:10px}
.hd-ota-list{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.hd-ota{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:#0b1220;transition:border-color .15s}
.hd-ota:hover{border-color:var(--cy)}
.hd-ota b{font-size:14px;color:var(--txt)}
.hd-ota span{font-size:12px;color:var(--cy);font-weight:700}

/* Sidebar mini stats */
.hd-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.hd-stat{background:#0b1220;border:1px solid var(--border);border-radius:10px;padding:10px 12px}
.hd-stat span{display:block;font-size:11px;color:var(--mut);margin-bottom:3px}
.hd-stat b{font-size:15px;color:var(--txt)}

/* Quick facts + monopoly dashboard */
.hd-facts{display:grid;grid-template-columns:1fr;gap:8px}
.hd-fact{display:flex;justify-content:space-between;gap:10px;padding:9px 4px;border-bottom:1px dashed var(--border);font-size:13.5px}
.hd-fact:last-child{border-bottom:none}
.hd-fact span{color:var(--mut)}
.hd-fact b{color:var(--txt);text-align:right}
.vm-dash{border:1px solid rgba(245,158,11,.4);background:linear-gradient(135deg,rgba(245,158,11,.08),rgba(16,185,129,.06));border-radius:14px;padding:16px}
.vm-dash .vm-owner{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.vm-dash .vm-owner .av{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#10b981);display:flex;align-items:center;justify-content:center;font-size:20px}
.vm-dash .vm-price-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.vm-dash .vm-price-row b{font-size:20px;color:#fcd34d}
.vm-dash .vm-metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:12px 0}
.vm-metric{background:#0b1220;border:1px solid var(--border);border-radius:9px;padding:8px 10px}
.vm-metric span{display:block;font-size:10.5px;color:var(--mut)}
.vm-metric b{font-size:14px;color:var(--txt)}
.vm-buy-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;padding:14px;border-radius:11px;font-weight:900;font-size:15px;cursor:pointer;margin-top:12px;box-shadow:0 6px 18px rgba(16,185,129,.25)}
.vm-buy-btn:hover{transform:translateY(-1px)}

/* Section compaction: 2-col grids + collapse */
.hd-sec{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px 20px;margin-bottom:18px}
.hd-sec>h2{margin:0 0 12px;font-size:18px;border:none;padding:0}
.hd-main .seo-section,.hd-main section:not(.review-form){background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px 20px;margin-bottom:18px}
.hd-main .seo-section>h2{margin:0 0 12px;font-size:18px;border:none;padding:0}
.hd-main .seo-content p{color:var(--txt);font-size:14px}
.hd-main .faq details{background:#0b1220}
.hd-sec-collapse{cursor:pointer}
.hd-sec-collapse>h2::after{content:'▾';float:right;color:var(--mut);transition:transform .2s}
.hd-sec-collapse.open>h2::after{transform:rotate(180deg)}
.hd-grid-2{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:720px){.hd-grid-2{grid-template-columns:1fr 1fr}}
.hd-point{background:#0b1220;border:1px solid var(--border);border-radius:10px;padding:12px 14px}
.hd-point strong{display:block;margin-bottom:4px;color:var(--txt);font-size:14px}
.hd-point span{color:var(--mut);font-size:13px}
.hd-point .dist{float:right;color:var(--cy);font-weight:700;font-size:12px}

/* Nearby carousel */
.hd-carousel{display:flex;gap:12px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
.hd-carousel .hcard-mini{min-width:250px;max-width:280px;scroll-snap-align:start;flex-shrink:0}
.hd-carousel::-webkit-scrollbar{height:8px}
.hd-carousel::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}

/* Full-width map + explore around */
.hd-map-sec{margin-top:8px}
.hd-explore{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.hd-chip{background:var(--card);border:1px solid var(--border);color:var(--txt);padding:7px 16px;border-radius:22px;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s}
.hd-chip.active{background:var(--cy);color:#060B13;border-color:var(--cy)}
.hd-map-wrap{width:100%;height:460px;border-radius:16px;border:1px solid var(--border);background:var(--card);overflow:hidden;position:relative}

/* Mobile sticky booking bar */
.hd-mobile-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;position:fixed;left:0;right:0;bottom:0;background:linear-gradient(180deg,rgba(11,18,32,.97),#0b1220);border-top:1px solid var(--border);padding:12px 16px;z-index:100;box-shadow:0 -6px 20px rgba(0,0,0,.4)}
.hd-mobile-bar .m-price b{font-size:18px;color:#34D399}
.hd-mobile-bar .m-price span{display:block;font-size:11px;color:var(--mut)}
.hd-mobile-bar .m-cta{flex-shrink:0;background:linear-gradient(135deg,#00F0FF,#0284C7);color:#060B13;padding:13px 22px;border-radius:11px;font-weight:900;font-size:15px}
@media(min-width:1100px){.hd-mobile-bar{display:none}}
.hd-page{padding-bottom:76px}
@media(min-width:1100px){.hd-page{padding-bottom:0}}

/* Weather + best time */
.hd-weather{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}
.hd-w{background:#0b1220;border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center}
.hd-w .ic{font-size:26px}
.hd-w b{display:block;margin:4px 0 2px;color:var(--txt);font-size:14px}
.hd-w span{font-size:12px;color:var(--mut)}

/* Highlights */
.hd-highlights{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:720px){.hd-highlights{grid-template-columns:1fr 1fr}}
.hd-hl{display:flex;align-items:center;gap:10px;background:#0b1220;border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--txt)}
.hd-hl .ic{font-size:18px}

/* Compare modal */
.hd-compare-bar{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px 14px;margin-top:10px}
.hd-compare-bar input{flex:1;background:#0b1220;border:1px solid var(--border);color:var(--txt);border-radius:8px;padding:9px 12px;font-size:13px;font-family:inherit}
.hd-compare-bar button{background:var(--cy);color:#060B13;border:none;padding:9px 16px;border-radius:8px;font-weight:800;cursor:pointer}
@media(max-width:640px){.hd-hero-grid{grid-template-columns:1fr}.hd-gallery-thumbs img{height:110px}}

/* Generic content grids used across SEO sections */
.seo-grid-2{display:grid;grid-template-columns:1fr;gap:12px}
.seo-grid-3{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:720px){.seo-grid-2{grid-template-columns:1fr 1fr}.seo-grid-3{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}}
.seo-point{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px}
.seo-point strong{display:block;margin-bottom:5px;color:var(--txt);font-size:14.5px}
.seo-point span{color:var(--mut);font-size:13.5px}
.amenities-grid{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:720px){.amenities-grid{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}}
.amenity-item{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:11px 14px;font-size:14px;color:var(--txt)}
.highlight-grid{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:720px){.highlight-grid{grid-template-columns:1fr 1fr}}
.hl-item{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:11px 14px;font-size:14px;color:var(--txt)}
.vm-stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.vm-stat{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px 14px}
.vm-stat span{display:block;font-size:11px;color:var(--mut);margin-bottom:3px}
.vm-stat strong{font-size:15px;color:var(--txt)}
.seo-links{display:flex;flex-wrap:wrap;gap:8px}
.seo-link{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:7px 14px;font-size:13px;color:var(--cy);font-weight:600}
.seo-link:hover{background:var(--cy);color:#060B13}
.vm-owner-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;line-height:1.9}
.vm-owner-card.owned{border-color:#10B981}
.vm-owner-card.unowned{border-color:#F59E0B}
.monopoly-sec{border-color:rgba(245,158,11,.4)!important}
</style>
</head>
<body>
<header role="banner"><a href="/" class="logo" aria-label="MyTriv Hotels — Home">MyTriv <span>Hotels</span></a><nav>
<a href="/hotels">Hotel Map</a>
<a href="/hotels/indonesia">Indonesia</a>
<a href="/book">Booking</a>
<a href="${canonical.replace('/en/','/')}" style="background:var(--card);border:1px solid var(--border);color:var(--txt);padding:4px 10px;border-radius:6px;font-weight:700;text-decoration:none;font-size:13px;">🇮🇩 ID</a> <a href="${canonical.includes('/en/') ? canonical : canonical.replace('/hotel/','/en/hotel/')}" style="background:var(--card);border:1px solid var(--border);color:var(--txt);padding:4px 10px;border-radius:6px;font-weight:700;text-decoration:none;font-size:13px;">🇬🇧 EN</a> <button id="theme-toggle" onclick="toggleTheme()" style="background:var(--card);border:1px solid var(--border);color:var(--txt);padding:4px 10px;border-radius:6px;cursor:pointer;font-weight:700;">🌙 Dark</button>
${user ? `<a href="/auth/logout?redirect=${backPath}" style="background:var(--card);border:1px solid var(--border);color:var(--txt);padding:4px 10px;border-radius:6px;font-weight:700;text-decoration:none;font-size:13px;">👤 ${esc(user.name || user.email)} · Keluar</a>` : `<a href="/auth/login?redirect=${backPath}" style="background:var(--card);border:1px solid var(--border);color:var(--txt);padding:4px 10px;border-radius:6px;font-weight:700;text-decoration:none;font-size:13px;">🔐 Masuk</a>`}
</nav></header>
${body}
<footer style="padding:32px 24px;border-top:1px solid var(--border);margin-top:40px;color:var(--mut);font-size:13px;line-height:2;"><div style="max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:24px;"><div><strong style="color:var(--txt);">Top Countries</strong><br><a href="/hotels/indonesia">Indonesia</a><br><a href="/hotels/thailand">Thailand</a><br><a href="/hotels/japan">Japan</a><br><a href="/hotels/singapore">Singapore</a><br><a href="/hotels/malaysia">Malaysia</a></div><div><strong style="color:var(--txt);">Popular Cities</strong><br><a href="/hotels/indonesia/bali">Bali</a><br><a href="/hotels/thailand/bangkok">Bangkok</a><br><a href="/hotels/japan/tokyo">Tokyo</a><br><a href="/hotels/france/paris">Paris</a><br><a href="/hotels/united-kingdom/london">London</a></div><div><strong style="color:var(--txt);">MyTriv</strong><br><a href="/maps/">🗺️ Map Explorer</a><br><a href="/book/">Booking</a><br><a href="/hotels/about.html">Panduan Monopoly</a><br><a href="/hotels/">190+ Negara</a></div><div><strong style="color:var(--txt);">Partners</strong><br><span>Booking · Agoda · Trip<br>Traveloka · Expedia<br>Hotels.com · Kayak · Klook</span></div></div><p style="text-align:center;margin-top:20px;">MyTriv Hotels — 120.000+ hotel di 190+ negara. Bandingkan 8 OTA. Virtual Monopoly.</p><p style="text-align:center;font-size:11px;">© 2026 MyTriv · Harga estimasi</p> Harga referensi &amp; link booking dari partner resmi (Booking.com, Agoda, Trip.com, Traveloka, Expedia).</p>
<p><a href="/sitemap.xml">Sitemap</a> · <a href="/maps">🗺️ Map Explorer</a> · © 2026 MyTriv</p></footer>
<script>
(function(){var m=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',m);})();
function toggleTheme(){var e=document.documentElement;var c=e.getAttribute('data-theme')==='light'?'dark':'light';e.setAttribute('data-theme',c);localStorage.setItem('theme',c);var b=document.getElementById('theme-toggle');if(b)b.innerText=c==='light'?'🌙 Dark':'☀️ Light';}
</script></body>
</html>`;
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function reviewSectionHtml(h, slug, lang, user, agg, reviews) {
  const en = lang === 'en';
  const avg = agg.count ? agg.avg : 0;
  const stars = '\u2605'.repeat(Math.round(avg)) + '\u2606'.repeat(5 - Math.round(avg));
  const cards = (reviews || []).map(r => `
    <div class="review-card">
      <div class="review-head"><b>${esc(r.author_name)}</b><span class="review-stars">${'\u2605'.repeat(r.rating)}${'\u2606'.repeat(5 - r.rating)}</span><span class="review-date">${new Date(r.created_at).toLocaleDateString(en ? 'en-US' : 'id-ID')}</span></div>
      ${r.title ? `<h3>${esc(r.title)}</h3>` : ''}
      <p>${esc(r.body)}</p>
    </div>`).join('');
  const empty = agg.count ? '' : `<p class="review-empty">${en ? 'No reviews yet. Be the first to review!' : 'Belum ada ulasan. Jadilah yang pertama memberi ulasan!'}</p>`;
  const form = user ? `
    <div class="review-form">
      <h3>${en ? '\u270f\ufe0f Write a Review' : '\u270f\ufe0f Tulis Ulasan'}</h3>
      <div class="rv-stars" id="rv-stars">${[1, 2, 3, 4, 5].map(i => `<span data-v="${i}">\u2605</span>`).join('')}</div>
      <input id="rv-title" maxlength="120" placeholder="${en ? 'Title (optional)' : 'Judul (opsional)'}">
      <textarea id="rv-body" rows="4" maxlength="3000" placeholder="${en ? 'Share your experience staying here...' : 'Ceritakan pengalaman menginap Anda di sini...'}"></textarea>
      <button type="button" onclick="submitReview()">${en ? 'Submit Review' : 'Kirim Ulasan'}</button>
      <p id="rv-msg"></p>
    </div>` : `
    <div class="review-form">
      <p>${en ? '\U0001f510 Login to write a review.' : '\U0001f510 Masuk untuk menulis ulasan.'}</p>
      <a class="mini-cta" href="/auth/login?redirect=${encodeURIComponent('/' + (en ? 'en/' : '') + 'hotel/' + slug)}">${en ? 'Login with Google' : 'Masuk dengan Google'}</a>
    </div>`;
  return `
  <section class="seo-section" id="reviews">
    <h2>\u2b50 ${en ? 'Guest Reviews' : 'Ulasan Tamu'} ${esc(h.name)}</h2>
    <div class="review-summary"><span class="review-score">${agg.count ? avg.toFixed(1) : '\u2014'}</span><span class="review-stars">${stars}</span><span class="review-count">${agg.count} ${en ? 'reviews' : 'ulasan'}</span></div>
    <div class="review-list">${cards || empty}</div>
    ${form}
    <script>
    (function(){
      var el = document.getElementById('rv-stars');
      var v = 5;
      if (el) {
        var ss = el.querySelectorAll('span');
        ss.forEach(function (x, i) { x.style.color = i < 4 ? '#FFD700' : '#3b4a63'; x.onclick = function () { v = i + 1; ss.forEach(function (y, j) { y.style.color = j <= i ? '#FFD700' : '#3b4a63'; }); }; });
      }
      window.submitReview = function () {
        var title = (document.getElementById('rv-title') || {}).value || '';
        var body = (document.getElementById('rv-body') || {}).value || '';
        var msg = document.getElementById('rv-msg');
        var en = ${en ? 'true' : 'false'};
        msg.textContent = '';
        if (body.trim().length < 20) { msg.textContent = en ? 'Please write at least 20 characters.' : 'Mohon tulis minimal 20 karakter.'; return; }
        fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hotel_slug: '${slug}', lang: '${lang}', rating: v, title: title, body: body }) })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (res.ok) {
            msg.textContent = en ? 'Thank you! Your review has been submitted and is awaiting moderation.' : 'Terima kasih! Ulasan Anda telah dikirim dan sedang menunggu moderasi.';
            var tb = document.getElementById('rv-body'); if (tb) tb.value = '';
          } else { msg.textContent = res.d && res.d.error ? res.d.error : 'Error'; }
        })
        .catch(function () { msg.textContent = 'Network error'; });
      };
    })();
    <\/script>
  </section>`;
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
      const total = parseInt((await pool.query('SELECT count(*) FROM hotels WHERE slug IS NOT NULL')).rows[0].count, 10);
      const pages = Math.ceil(total / 50000);
      const parts = [];
      for (let i = 1; i <= pages; i++) parts.push(SITE + '/sitemap/hotels/id/' + i);
      for (let i = 1; i <= pages; i++) parts.push(SITE + '/sitemap/hotels/en/' + i);
      res.set('Content-Type', 'application/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${SITE}/sitemap/countries.xml</loc></url>
<url><loc>${SITE}/sitemap/cities.xml</loc></url>
${parts.map(u => `<url><loc>${u}</loc></url>`).join('\n')}
</sitemapindex>`);
    } catch (e) { console.error('sitemap index error:', e.message); res.status(500).send('sitemap error'); }
  });

  router.get('/sitemap/countries.xml', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT slug FROM countries');
      res.set('Content-Type', 'application/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.map(r => `<url><loc>${SITE}/hotels/${r.slug}</loc><changefreq>weekly</changefreq></url>`).join('\n')}
</urlset>`);
    } catch (e) { console.error('sitemap countries error:', e.message); res.status(500).send('sitemap error'); }
  });

  router.get('/sitemap/cities.xml', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT c.slug, cc.slug AS country FROM cities c JOIN countries cc ON cc.code = c.country_code');
      res.set('Content-Type', 'application/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.map(r => `<url><loc>${SITE}/hotels/${r.country}/${r.slug}</loc><changefreq>weekly</changefreq></url>`).join('\n')}
</urlset>`);
    } catch (e) { console.error('sitemap cities error:', e.message); res.status(500).send('sitemap error'); }
  });

  router.get('/sitemap/hotels/:lang/:part', async (req, res) => {
    try {
      const { lang, part } = req.params;
      const page = parseInt(part, 10);
      if (!page || page < 1 || page > 200) return res.status(404).send('not found');
      const offset = (page - 1) * 50000;
      const { rows } = await pool.query('SELECT slug FROM hotels WHERE slug IS NOT NULL ORDER BY slug LIMIT 50000 OFFSET $1', [offset]);
      if (!rows.length) return res.status(404).send('not found');
      const prefix = lang === 'en' ? '/en/hotel/' : '/hotel/';
      res.set('Content-Type', 'application/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.map(r => `<url><loc>${SITE}${prefix}${r.slug}</loc><changefreq>daily</changefreq></url>`).join('\n')}
</urlset>`);
    } catch (e) { console.error('sitemap hotels error:', e.message); res.status(500).send('sitemap error'); }
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
      if (!rows.length) return res.status(404).send(shell({ title: 'Hotel tidak ditemukan - MyTriv Hotels', desc: 'Hotel tidak ditemukan', canonical: SITE + req.path, ogImage: hotelImage({}, 800), body: '<div class="wrap"><h1>Hotel tidak ditemukan</h1></div>', user: req.user }));
      const h = rows[0];
      h.stars = sanStars(h.stars);
      h.rating = sanRating(h.rating);
      h.price_idr = sanPrice(h.price_idr);
      track(req, 'page_views', {});
      const am = amenities(h);
      const price = fmtPrice(h.price_idr);
      const hasPrice = h.price_idr != null;
      const links = partnerLinks(generatePartnerLink, h, h.city_name);
      const loc = `${h.city_name || h.city || ''}, ${h.country_name || h.country || ''}`;
      const cityPath = h.country_slug ? `/hotels/${h.country_slug}/${h.city_slug || slugify(h.city_name || h.city)}` : null;
      const citySlug = h.city_slug || slugify(h.city_name || h.city);

      // Nearby hotels (same city)
      let nearby = [];
      if (h.city_id) {
        const n = await pool.query(`SELECT name, slug, stars, rating, price_idr, image FROM hotels WHERE city_id = $1 AND slug <> $2 ORDER BY rating DESC NULLS LAST LIMIT 6`, [h.city_id, slug]);
        nearby = n.rows.map(x => ({ ...x, stars: sanStars(x.stars), rating: sanRating(x.rating), price_idr: sanPrice(x.price_idr) }));
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
      const priceRange = h.price_idr == null ? 'menengah' : h.price_idr < 500000 ? 'terjangkau' : h.price_idr < 1500000 ? 'menengah' : h.price_idr < 5000000 ? 'premium' : 'mewah eksklusif';

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
        similarHotels = s.rows.map(x => ({ ...x, stars: sanStars(x.stars), rating: sanRating(x.rating), price_idr: sanPrice(x.price_idr) }));
      } catch (e) { /* ignore */ }
      let reviewsHtml = '';
      let rvCount = 0, rvAvg = 0;
      try {
        const rvAgg = await pool.query("SELECT COUNT(*)::int AS count, COALESCE(AVG(rating),0)::numeric(3,1) AS avg FROM reviews WHERE hotel_slug=$1 AND status='approved' AND lang='id'", [slug]);
        rvCount = rvAgg.rows[0].count;
        rvAvg = Number(rvAgg.rows[0].avg);
        const rvList = await pool.query("SELECT author_name, rating, title, body, created_at FROM reviews WHERE hotel_slug=$1 AND status='approved' AND lang='id' ORDER BY created_at DESC LIMIT 50", [slug]);
        reviewsHtml = reviewSectionHtml(h, slug, 'id', req.user, { count: rvCount, avg: rvAvg }, rvList.rows);
      } catch (e) { /* reviews not ready */ }
      if (rvCount > 0) schema.aggregateRating = { '@type': 'AggregateRating', ratingValue: rvAvg.toFixed(1), reviewCount: rvCount, bestRating: 5, worstRating: 1 };

      // Dynamic POI sections from OSM map data (replaces generic templates)
      let poiSectionLandmark = '', poiSectionKuliner = '', poiSectionTransport = '', poiSectionBelanja = '';
      let poiSectionSehat = '', poiSectionIbadah = '', poiSectionTaman = '', poiSectionHotelLain = '';
      let poiSup = { resto:0, kafe:0, wisata:0, belanja:0, transport:0, sehat:0, ibadah:0, taman:0, hotelLain:0 };
      try {
        const poiRow = await pool.query('SELECT poi_json FROM hotel_pois WHERE hotel_id=$1', [h.id]);
        if (poiRow.rows.length && poiRow.rows[0].poi_json && poiRow.rows[0].poi_json.poi) {
          const pois = poiRow.rows[0].poi_json.poi;
          for (const p of pois) {
            if (p.cat === 'Restoran') poiSup.resto++;
            else if (p.cat === 'Kafe') poiSup.kafe++;
            else if (p.cat === 'Wisata') poiSup.wisata++;
            else if (p.cat === 'Belanja') poiSup.belanja++;
            else if (p.cat === 'Transport') poiSup.transport++;
            else if (p.cat === 'Kesehatan') poiSup.sehat++;
            else if (p.cat === 'Tempat Ibadah') poiSup.ibadah++;
            else if (p.cat === 'Taman') poiSup.taman++;
            else if (p.cat === 'Hotel Lain') poiSup.hotelLain++;
          }
          const wisataSorted = pois.filter(p => p.cat === 'Wisata').sort((a,b) => a.dist_m - b.dist_m);
          const belanjaSorted = pois.filter(p => p.cat === 'Belanja').sort((a,b) => a.dist_m - b.dist_m);
          const landmarkItems = [...wisataSorted, ...belanjaSorted].slice(0, 15);
          if (landmarkItems.length) {
            poiSectionLandmark = `<section class="seo-section">
    <h2>🗼 Landmark & Tempat Wisata di Sekitar ${esc(h.name)}</h2>
    <p>Data lokasi real-time: ${poiSup.wisata} tempat wisata (radius 10 km), ${poiSup.belanja} pusat belanja & ${poiSup.kafe + poiSup.resto} pilihan kuliner dalam radius 2.5 km dari ${esc(h.name)}. Berikut yang terdekat:</p>
    <div class="seo-grid-2">
      ${landmarkItems.map(p => `<div class="seo-point"><strong>${p.emoji} ${esc(p.name)}</strong><span>${p.dist_m < 1000 ? p.dist_m + ' m' : (p.dist_m / 1000).toFixed(1) + ' km'} · ${p.cat}</span></div>`).join('')}
    </div>
  </section>`;
          }
          const kulinerItems = pois.filter(p => p.cat === 'Restoran' || p.cat === 'Kafe').sort((a,b) => a.dist_m - b.dist_m).slice(0, 12);
          if (kulinerItems.length) {
            poiSectionKuliner = `<section class="seo-section">
    <h2>🍽️ Pilihan Kuliner di Sekitar ${esc(h.name)}</h2>
    <p>Dalam radius 2.5 km terdapat ${poiSup.resto} restoran dan ${poiSup.kafe} kafe. Berdasarkan data lokasi real-time, berikut pilihan terdekat:</p>
    <div class="seo-grid-3">
      ${kulinerItems.map(p => `<div class="seo-point"><strong>${p.emoji} ${esc(p.name)}</strong><span>${p.dist_m < 1000 ? p.dist_m + ' m' : (p.dist_m / 1000).toFixed(1) + ' km'} · ${p.cat}</span></div>`).join('')}
    </div>
  </section>`;
          }
          const transportItems = pois.filter(p => p.cat === 'Transport').sort((a,b) => a.dist_m - b.dist_m).slice(0, 8);
          if (transportItems.length) {
            poiSectionTransport = `<section class="seo-section">
    <h2>🚗 Transportasi & Akses di Sekitar ${esc(h.name)}</h2>
    <p>Terdapat ${poiSup.transport} titik transportasi dalam radius 2.5 km dari ${esc(h.name)}:</p>
    <div class="seo-grid-2">
      ${transportItems.map(p => `<div class="seo-point"><strong>${p.emoji} ${esc(p.name)}</strong><span>${p.dist_m < 1000 ? p.dist_m + ' m' : (p.dist_m / 1000).toFixed(1) + ' km'} dari hotel</span></div>`).join('')}
    </div>
  </section>`;
          }
          const belanjaItems = pois.filter(p => p.cat === 'Belanja').sort((a,b) => a.dist_m - b.dist_m).slice(0, 12);
          if (belanjaItems.length) {
            poiSectionBelanja = `<section class="seo-section">
    <h2>🛍️ Pusat Belanja & Fasilitas di Sekitar ${esc(h.name)}</h2>
    <p>Terdapat ${poiSup.belanja} pusat belanja, ATM, dan minimarket dalam radius 2.5 km dari ${esc(h.name)}:</p>
    <div class="seo-grid-2">
      ${belanjaItems.map(p => `<div class="seo-point"><strong>${p.emoji} ${esc(p.name)}</strong><span>${p.dist_m < 1000 ? p.dist_m + ' m' : (p.dist_m / 1000).toFixed(1) + ' km'} · ${p.cat}</span></div>`).join('')}
    </div>
  </section>`;
          }
          const sehatItems = pois.filter(p => p.cat === 'Kesehatan').sort((a,b) => a.dist_m - b.dist_m).slice(0, 10);
          if (sehatItems.length) {
            poiSectionSehat = `<section class="seo-section">
    <h2>🏥 Fasilitas Kesehatan di Sekitar ${esc(h.name)}</h2>
    <p>Dalam radius 5 km dari ${esc(h.name)} terdapat ${poiSup.sehat} fasilitas kesehatan. Berikut yang terdekat:</p>
    <div class="seo-grid-2">
      ${sehatItems.map(p => `<div class="seo-point"><strong>${p.emoji} ${esc(p.name)}</strong><span>${p.dist_m < 1000 ? p.dist_m + ' m' : (p.dist_m / 1000).toFixed(1) + ' km'} · ${p.cat}</span></div>`).join('')}
    </div>
  </section>`;
          }
          const ibadahItems = pois.filter(p => p.cat === 'Tempat Ibadah').sort((a,b) => a.dist_m - b.dist_m).slice(0, 8);
          if (ibadahItems.length) {
            poiSectionIbadah = `<section class="seo-section">
    <h2>🕌 Tempat Ibadah di Sekitar ${esc(h.name)}</h2>
    <p>Dalam radius 5 km dari ${esc(h.name)} terdapat ${poiSup.ibadah} tempat ibadah. Berikut yang terdekat:</p>
    <div class="seo-grid-2">
      ${ibadahItems.map(p => `<div class="seo-point"><strong>${p.emoji} ${esc(p.name)}</strong><span>${p.dist_m < 1000 ? p.dist_m + ' m' : (p.dist_m / 1000).toFixed(1) + ' km'} dari hotel</span></div>`).join('')}
    </div>
  </section>`;
          }
          const tamanItems = pois.filter(p => p.cat === 'Taman').sort((a,b) => a.dist_m - b.dist_m).slice(0, 10);
          if (tamanItems.length) {
            poiSectionTaman = `<section class="seo-section">
    <h2>🌳 Taman, Pantai & Alam di Sekitar ${esc(h.name)}</h2>
    <p>Dalam radius 10 km dari ${esc(h.name)} terdapat ${poiSup.taman} area taman, pantai, dan wisata alam. Berikut yang terdekat:</p>
    <div class="seo-grid-2">
      ${tamanItems.map(p => `<div class="seo-point"><strong>${p.emoji} ${esc(p.name)}</strong><span>${p.dist_m < 1000 ? p.dist_m + ' m' : (p.dist_m / 1000).toFixed(1) + ' km'} · ${p.cat}</span></div>`).join('')}
    </div>
  </section>`;
          }
          const hotelLainItems = pois.filter(p => p.cat === 'Hotel Lain').sort((a,b) => a.dist_m - b.dist_m).slice(0, 10);
          if (hotelLainItems.length) {
            poiSectionHotelLain = `<section class="seo-section">
    <h2>🏨 Hotel Lain Terdekat</h2>
    <p>Selain ${esc(h.name)}, dalam radius 5 km terdapat ${poiSup.hotelLain} hotel dan penginapan lain sebagai alternatif:</p>
    <div class="seo-grid-2">
      ${hotelLainItems.map(p => `<div class="seo-point"><strong>${p.emoji} ${esc(p.name)}</strong><span>${p.dist_m < 1000 ? p.dist_m + ' m' : (p.dist_m / 1000).toFixed(1) + ' km'} dari hotel</span></div>`).join('')}
    </div>
  </section>`;
          }
        }
      } catch (e) { /* no POI cache yet */ }

const body = `
<div class="hd-page">
<div class="crumbs"><a href="/hotels">Beranda</a> › ${h.country_slug ? `<a href="/hotels/${h.country_slug}">${esc(h.country_name)}</a>` : ''} › ${cityPath ? `<a href="${cityPath}">${esc(h.city_name || h.city)}</a>` : ''} › <b>${esc(h.name)}</b></div>
<div class="wrap hd-wrap">

  <!-- 1. HERO: GALLERY + INFO -->
  <div class="hd-hero">
    <div class="hd-hero-grid">
      <div class="hd-gallery">
        <div class="hd-gallery-main" id="hd-gmain">
          <img src="${ogImage}" alt="${esc(h.name)}" id="hd-gmain-img">
        </div>
        <div class="hd-gallery-thumbs">
          <img src="${hotelImage(h, 500)}&t=1" alt="${esc(h.name)} 2" onclick="hdSwap(this)" loading="lazy">
          <img src="${hotelImage(h, 500)}&t=2" alt="${esc(h.name)} 3" onclick="hdSwap(this)" loading="lazy">
          <img src="${hotelImage(h, 500)}&t=3" alt="${esc(h.name)} 4" onclick="hdSwap(this)" loading="lazy">
          <img src="${hotelImage(h, 500)}&t=4" alt="${esc(h.name)} 5" onclick="hdSwap(this)" loading="lazy">
        </div>
      </div>
      <div class="hd-hero-info">
        <div class="hd-badges">
          <span class="hd-badge ${h.stars >= 5 ? 'b-lux' : ''}">${h.stars >= 5 ? '👑' : '🏨'} ${starLevel === 'luxury 5-star' ? 'Luxury 5★' : starLevel === 'premium 4-star' ? 'Premium 4★' : starLevel === 'comfortable 3-star' ? 'Comfort 3★' : 'Budget'}</span>
          ${h.country_code === 'ID' ? '<span class="hd-badge b-beach">🇮🇩 Hotel Indonesia</span>' : ''}
          ${h.stars >= 4 ? '<span class="hd-badge b-family">👨‍👩‍👧‍👦 Ramah Keluarga</span>' : ''}
          ${h.pool ? '<span class="hd-badge b-biz">🏊 Kolam Renang</span>' : ''}
          ${h.wifi ? '<span class="hd-badge">📶 WiFi Gratis</span>' : ''}
        </div>
        <div class="hd-title-row">
          <span class="hd-rating-chip">⭐ ${h.rating || 4.0}/5</span>
          <div class="stars">${'★'.repeat(h.stars || 4)}${'☆'.repeat(Math.max(0, 5 - (h.stars || 4)))}</div>
        </div>
        <h1>${esc(h.name)} — Hotel ${starLevel} di ${esc(loc)}</h1>
        <div class="hd-addr">📍 ${esc(loc)}${h.address ? ' — ' + esc(h.address) : ''} · <a href="#hd-map-anchor" onclick="hdScrollMap(event)">Lihat di peta</a></div>
        <div class="hd-tags">${am.slice(0, 8).map(a => `<span class="hd-tag">✔ ${esc(a)}</span>`).join('')}</div>
        ${hasPrice ? `<div class="hd-price-line">💵 <b>${price}</b> <span>/ malam · sudah termasuk pajak</span></div>` : ''}
        <div class="hd-ai-summary">
          <h4>🤖 AI Summary</h4>
          <ul>
            <li><b>${esc(h.name)}</b> — hotel ${starLevel} dengan rating <b>${h.rating || 4.0}/5</b> dari tamu.</li>
            <li>Harga mulai <b>${price}</b>/malam — bandingkan <b>8 OTA</b> sekaligus tanpa biaya.</li>
            <li>Lokasi strategis di <b>${esc(loc)}</b>${h.country_code === 'ID' ? ' — kemudahan akses ke destinasi wisata & kuliner' : ''}.</li>
            <li>${am.slice(0, 3).join(', ')} tersedia untuk kenyamanan menginap Anda.</li>
          </ul>
        </div>
        <div class="hd-hero-cta">
          <a class="hd-cta-big" href="/go?u=${encodeURIComponent(links.booking)}&partner=booking&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🔵 Booking.com — Pesan Sekarang</a>
          <div class="hd-hero-cta-sub">
            <a class="hd-cta-sm" href="/go?u=${encodeURIComponent(links.agoda)}&partner=agoda&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟠 Agoda</a>
            <a class="hd-cta-sm" href="/go?u=${encodeURIComponent(links.trip)}&partner=trip&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟣 Trip.com</a>
            <a class="hd-cta-sm" href="/go?u=${encodeURIComponent(links.traveloka)}&partner=traveloka&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟢 Traveloka</a>
            <a class="hd-cta-sm" href="/go?u=${encodeURIComponent(links.expedia)}&partner=expedia&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟡 Expedia</a>
            <a class="hd-cta-sm" href="/go?u=${encodeURIComponent(links.hotelscom)}&partner=hotelscom&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🔴 Hotels.com</a>
            <a class="hd-cta-sm" href="/go?u=${encodeURIComponent(links.kayak)}&partner=kayak&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">⚫ Kayak</a>
            <a class="hd-cta-sm" href="/go?u=${encodeURIComponent(links.klook)}&partner=klook&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟠 Klook</a>
            <a class="hd-cta-sm" href="#hd-book" onclick="hdGotoBook(event)">📅 Cek Ketersediaan</a>
          </div>
        </div>
        <div class="hd-hero-actions">
          <button class="hd-action-btn" id="hd-wish" onclick="hdWish()">🤍 Wishlist</button>
          <button class="hd-action-btn" onclick="hdShare()">📤 Bagikan</button>
          <button class="hd-action-btn" onclick="hdCompare()">⚖️ Bandingkan Harga</button>
        </div>
      </div>
    </div>
  </div>

  <!-- LAYOUT: MAIN + STICKY SIDEBAR -->
  <div class="hd-layout">
    <div class="hd-main">

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

  ${poiSectionLandmark}
  <!-- 7. LANDMARK TERDEKAT (generik) -->
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

  ${poiSectionKuliner}
  <!-- 8. RESTORAN TERDEKAT (generik) -->
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

  ${poiSectionBelanja}
  ${poiSectionSehat}
  ${poiSectionIbadah}
  ${poiSectionTaman}
  ${poiSectionHotelLain}
  ${poiSectionTransport}
  <!-- 9. TRANSPORTASI (generik) -->
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
    <div class="hd-carousel">
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
    <div class="hd-carousel">
      ${nearby.filter(n => n.slug !== h.slug).slice(0, 8).map(n => `<div class="hcard-mini">
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

  ${reviewsHtml}
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

  </div><!-- /.hd-main -->

  <aside class="hd-sidebar">
    <!-- SIDEBAR: BOOKING CARD -->
    <div class="hd-card hd-book-card" id="hd-book">
      <h3>🔵 Booking ${esc(h.name)}</h3>
      ${hasPrice ? `<div class="hd-price-line"><b>${price}</b> <span>/ malam</span></div>` : ''}
      <div class="hd-field" onclick="hdPickDate(this,'checkin')"><span>🛎️ Check-in</span><b id="hd-in">+ Tambah Tanggal</b></div>
      <div class="hd-field" onclick="hdPickDate(this,'checkout')"><span>🧳 Check-out</span><b id="hd-out">+ Tambah Tanggal</b></div>
      <div class="hd-field" onclick="hdPickGuests(this)"><span>👥 Tamu</span><b id="hd-g">2 Tamu · 1 Kamar</b></div>
      <div class="hd-ota-list">
        <a class="hd-ota" href="/go?u=${encodeURIComponent(links.booking)}&partner=booking&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener"><b>🔵 Booking.com</b><span>Pesan →</span></a>
        <a class="hd-ota" href="/go?u=${encodeURIComponent(links.agoda)}&partner=agoda&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener"><b>🟠 Agoda</b><span>Cek Harga →</span></a>
        <a class="hd-ota" href="/go?u=${encodeURIComponent(links.traveloka)}&partner=traveloka&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener"><b>🟢 Traveloka</b><span>Cek Harga →</span></a>
        <a class="hd-ota" href="/go?u=${encodeURIComponent(links.trip)}&partner=trip&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener"><b>🟣 Trip.com</b><span>Cek Harga →</span></a>
      </div>
      <p class="hd-note">💡 Bandingkan harga di 8 OTA partner untuk penawaran terbaik. Tidak ada biaya tambahan — 100% gratis.</p>
    </div>

    <!-- SIDEBAR: QUICK FACTS -->
    <div class="hd-card">
      <h3>⚡ Quick Facts</h3>
      <div class="hd-facts">
        <div class="hd-fact"><span>⭐ Rating</span><b>${h.rating || 4.0}/5</b></div>
        <div class="hd-fact"><span>🏨 Bintang</span><b>${'★'.repeat(h.stars || 4)}</b></div>
        <div class="hd-fact"><span>📍 Kota</span><b>${esc(h.city_name || h.city)}</b></div>
        <div class="hd-fact"><span>🌍 Negara</span><b>${esc(h.country_name || h.country)}</b></div>
        <div class="hd-fact"><span>💵 Harga</span><b>${hasPrice ? price : '—'}</b></div>
        <div class="hd-fact"><span>📊 Kategori</span><b>${priceRange}</b></div>
      </div>
    </div>

    <!-- SIDEBAR: VIRTUAL MONOPOLY DASHBOARD -->
    <div class="vm-dash">
      <div class="vm-owner">
        <div class="av">${h.owner_name ? '👑' : '🏰'}</div>
        <div><b>${h.owner_name ? esc(h.owner_name) : 'Belum Ada Pemilik'}</b><br><span style="font-size:12px;color:var(--mut);">${h.owner_name ? 'Virtual Owner' : 'Jadilah pemilik pertama'}</span></div>
      </div>
      <div class="vm-price-row"><span style="color:var(--mut);font-size:13px;">Harga Virtual</span><b>${fmtPrice((h.stars || 5) * 2000)} TrivCoin</b></div>
      <div class="vm-metrics">
        <div class="vm-metric"><span>🏆 Virtual Rank</span><b>#${Math.floor(Math.random()*500)+50}</b></div>
        <div class="vm-metric"><span>⭐ Popularity</span><b>${Math.floor(Math.random()*40)+60}/100</b></div>
        <div class="vm-metric"><span>📈 Return Rate</span><b>+${Math.floor(Math.random()*40)+5}%</b></div>
        <div class="vm-metric"><span>👀 Views</span><b>${Math.floor(Math.random()*200)+50}</b></div>
      </div>
      ${h.is_for_sale ? `<div style="background:rgba(16,185,129,.15);border:1px solid #10B981;border-radius:9px;padding:9px 12px;font-size:12.5px;color:#6ee7b7;margin-top:4px;">🟢 Dijual di Marketplace — ${fmtPrice(h.sale_price || 0)} TrivCoin</div>` : ''}
      <button class="vm-buy-btn" onclick="openBuyHotelModal()">🛒 ${h.owner_name ? 'Beli dari Marketplace' : 'Beli Hak Virtual Ini'}</button>
    </div>
  </aside>
  </div><!-- /.hd-layout -->

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


  <!-- ═══ FULL-WIDTH MAP + EXPLORE AROUND (POSTGIS POI) ═══ -->
  <section class="hd-map-sec hd-sec" id="hd-map-anchor">
    <h2>🗺️ Peta Interaktif ${esc(h.name)} — Explore Around</h2>
    <div class="hd-explore">
      <button class="hd-chip active" data-r="500" onclick="hdRadius(this)">500 m</button>
      <button class="hd-chip" data-r="1000" onclick="hdRadius(this)">1 km</button>
      <button class="hd-chip" data-r="3000" onclick="hdRadius(this)">3 km</button>
      <button class="hd-chip" data-r="5000" onclick="hdRadius(this)">5 km</button>
      <span style="margin-left:auto;color:var(--mut);font-size:12.5px;align-self:center;">Restoran · Wisata · Transport · Belanja di sekitar</span>
    </div>
    <div id="poi-filters" style="display:none;flex-wrap:wrap;gap:6px;margin-bottom:10px;"></div>
    <div class="hd-map-wrap">
      <div id="hotel-map" style="position:absolute;inset:0;">
        <div id="map-placeholder" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--mut);font-size:14px;text-align:center;flex-direction:column;gap:8px;cursor:pointer;">🗺️ Klik untuk memuat peta interaktif<br><span style="font-size:12px;opacity:.8;">Data POI dari OpenStreetMap · radius bisa diatur di atas</span></div>
      </div>
    </div>
    <style>
    .poi-dot{width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;}
    .poi-dot.hotel-dot{width:30px;height:30px;font-size:16px;border-color:var(--cy);}
    #poi-filters button{background:var(--card);border:1px solid var(--border);color:var(--txt);padding:5px 12px;border-radius:20px;cursor:pointer;font-size:12px;}
    #poi-filters button.active{background:var(--cy);color:#060B13;border-color:var(--cy);font-weight:700;}
    </style>
    <script>
    (function(){var loaded=false;var map=null;var markers=[];var mapEl=document.getElementById('hotel-map');var ph=document.getElementById('map-placeholder');
    var lat=${Number(h.lat||0)},lng=${Number(h.lng||0)},hotelId=${Number(h.id)||0},radius=3000;
    var NAME=${JSON.stringify(h.name)},LOC=${JSON.stringify(loc)};
    var byCat={};
    function esc2(x){return String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
    window.hdRadius=function(btn){document.querySelectorAll('.hd-chip').forEach(function(c){c.classList.remove('active');});btn.classList.add('active');radius=Number(btn.getAttribute('data-r'));loadMap(true);};
    function loadMap(reload){if(!loaded){loaded=true;if(ph)ph.style.display='none';
    var css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
    var js=document.createElement('script');js.src='https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
    js.onload=function(){
    map=new maplibregl.Map({container:'hotel-map',style:'https://tiles.openfreemap.org/styles/liberty',center:[lng,lat],zoom:15});
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
    var el=document.createElement('div');el.className='poi-dot hotel-dot';el.textContent='🏨';
    new maplibregl.Marker({element:el}).setLngLat([lng,lat]).setPopup(new maplibregl.Popup({offset:12}).setHTML('<b>'+esc2(NAME)+'</b><br>'+esc2(LOC))).addTo(map);
    loadPois();
    setTimeout(function(){map.resize();},300);
    };document.head.appendChild(css);document.body.appendChild(js);}
    else if(reload){loadPois();}}
    function loadPois(){
    fetch('/maps/api/hotel-poi?hotel_id='+hotelId+'&r='+radius).then(function(r){return r.json();}).then(function(d){
    markers.forEach(function(m){m.remove();});markers=[];byCat={};
    var pois=d.poi||[];
    var fb=document.getElementById('poi-filters');fb.innerHTML='';
    if(!pois.length){fb.style.display='none';return;}
    var colors={Restoran:'#EF4444',Kafe:'#F59E0B',Wisata:'#10B981',Transport:'#3B82F6',Belanja:'#A855F7',Kesehatan:'#EC4899',Lainnya:'#64748B'};
    pois.slice(0,200).forEach(function(p){
    var dot=document.createElement('div');dot.className='poi-dot';dot.style.background=(colors[p.cat]||'#64748B');dot.textContent=p.emoji||'';
    var m=new maplibregl.Marker({element:dot}).setLngLat([p.lng,p.lat]).setPopup(new maplibregl.Popup({offset:10}).setHTML('<b>'+esc2(p.name)+'</b><br>'+esc2(p.cat)+(p.dist_m?'<br>~'+p.dist_m+' m':'')));
    m.addTo(map);markers.push(m);if(!byCat[p.cat])byCat[p.cat]=[];byCat[p.cat].push(m);
    });
    fb.style.display='flex';
    Object.keys(byCat).forEach(function(c){
    var b=document.createElement('button');b.textContent=c+' ('+byCat[c].length+')';b.className='active';
    b.onclick=function(){var on=!b.classList.contains('active');b.classList.toggle('active',on);(byCat[c]||[]).forEach(function(m2){m2.getElement().style.display=on?'':'none';});};
    fb.appendChild(b);
    });
    }).catch(function(){});
    }
    if(mapEl)mapEl.addEventListener('click',function(){loadMap(false);});
    })();
    </script>
    <p style="color:var(--mut);font-size:12px;margin-top:8px;">📍 Koordinat: ${Number(h.lat||0).toFixed(4)}, ${Number(h.lng||0).toFixed(4)} — ${esc(loc)} · Peta © OpenFreeMap · POI © OpenStreetMap</p>
    <a href="/maps/${slugify(h.city_name || h.city || '')}" class="cta cta-alt" style="display:inline-block;margin-top:10px;font-size:13px;padding:8px 16px;">🗺️ Jelajahi Semua Hotel di ${esc(h.city_name || h.city)} — Map Explorer →</a>
  </section>
  <!-- ═══ WALKING DISTANCE ═══ -->
  <section class="seo-section">
    <h2>🚶 Jarak dari ${esc(h.name)}</h2>
    <div class="amenities-grid">
      <div class="amenity-item">🚶 Pusat Kota: <strong>10-15 menit jalan kaki</strong> · 5 menit kendaraan</div>
      <div class="amenity-item">🚶 Pusat Kuliner: <strong>5-10 menit jalan kaki</strong> · 3 menit kendaraan</div>
      <div class="amenity-item">🚶 Pusat Perbelanjaan: <strong>15-20 menit jalan kaki</strong> · 8 menit kendaraan</div>
      <div class="amenity-item">🚶 ${h.country_code==='ID'?'Stasiun/Terminal':'Transport Hub'}: <strong>10-30 menit jalan kaki</strong> · 10 menit kendaraan</div>
      <div class="amenity-item">🚶 Tempat Wisata Terdekat: <strong>5-15 menit jalan kaki</strong> · 5 menit kendaraan</div>
      <div class="amenity-item">🚶 ${h.country_code==='ID'?'Rumah Sakit':'Hospital'}: <strong>10-20 menit kendaraan</strong></div>
    </div>
    <p style="color:var(--mut);font-size:11px;margin-top:8px;">* Estimasi berdasarkan lokasi umum di kawasan ${esc(h.city_name||h.city)}. Jarak aktual dapat bervariasi.</p>
  </section>

  <!-- ═══ BEST TIME TO VISIT + WEATHER ═══ -->
  <section class="seo-section">
    <h2>☀️ Waktu Terbaik Berkunjung & Cuaca</h2>
    <div class="hd-weather">
      <div class="hd-w"><div class="ic">☀️</div><b>Musim Terbaik</b><span>${h.country_code==='ID'?'April - Oktober (Kemarau)':'Tergantung destinasi'}</span></div>
      <div class="hd-w"><div class="ic">📈</div><b>Peak Season</b><span>${h.country_code==='ID'?'Juni-Agustus & Desember':'Musim liburan'}</span></div>
      <div class="hd-w"><div class="ic">📉</div><b>Low Season</b><span>${h.country_code==='ID'?'Januari-Maret':'Awal tahun'}</span></div>
      <div class="hd-w"><div class="ic">🌡️</div><b>Suhu Rata-rata</b><span>${h.country_code==='ID'?'25°C - 33°C':'Bervariasi per musim'}</span></div>
    </div>
    <p style="color:var(--mut);font-size:11px;margin-top:10px;">* Data cuaca berdasarkan estimasi iklim regional. Kondisi aktual dapat berbeda. Cek prakiraan cuaca terbaru sebelum bepergian.</p>
  </section>

  <!-- ═══ PRICE INFORMATION ═══ -->
  <section class="seo-section">
    <h2>💵 Informasi Harga ${esc(h.name)}</h2>
    <div class="amenities-grid">
      <div class="amenity-item">💰 <strong>Harga Mulai:</strong> ${price} / malam</div>
      <div class="amenity-item">📊 <strong>Kategori Harga:</strong> ${priceRange}</div>
      <div class="amenity-item">⭐ <strong>Level Hotel:</strong> ${starLevel}</div>
      <div class="amenity-item">🔄 <strong>Perbandingan:</strong> Bandingkan 8 OTA untuk harga terbaik</div>
    </div>
    <p style="color:var(--mut);font-size:11px;margin-top:8px;">⚠️ Harga dapat berubah sesuai tanggal menginap, ketersediaan kamar, dan promo yang sedang berlangsung. Harga di atas adalah estimasi berdasarkan data yang tersedia.</p>
  </section>

  <!-- ═══ AI TRAVEL RECOMMENDATION ═══ -->
  <section class="seo-section">
    <h2>🤖 AI Travel Match — ${esc(h.name)} Cocok Untuk</h2>
    <div class="highlight-grid">
      <div class="hl-item">💼 Business Traveler — ${h.stars>=4?'Fasilitas bisnis & meeting room':'Akses mudah ke pusat bisnis'}</div>
      <div class="hl-item">👨‍👩‍👧‍👦 Family Vacation — ${h.stars>=4?'Kamar luas & ramah anak':'Nyaman untuk keluarga kecil'}</div>
      <div class="hl-item">💑 Honeymoon & Romantic — ${h.stars>=4?'Suasana romantis & eksklusif':'Cozy untuk pasangan'}</div>
      <div class="hl-item">🎒 Backpacker — ${h.price_idr<800000?'Harga bersahabat untuk solo traveler':'Pilihan value-for-money'}</div>
      <div class="hl-item">🏖️ Staycation — Nyaman untuk liburan singkat tanpa perlu jauh-jauh</div>
      <div class="hl-item">👑 Luxury Seeker — ${h.stars>=5?'Pengalaman menginap kelas dunia':'Kenyamanan premium'}</div>
    </div>
  </section>

  <!-- ═══ ENHANCED MONOPOLY STATS ═══ -->
  <section class="seo-section monopoly-sec">
    <h2>📊 Statistik Virtual ${esc(h.name)}</h2>
    <div class="vm-stats-grid">
      <div class="vm-stat"><span>🏆 Virtual Rank</span><strong>#${Math.floor(Math.random()*500)+50}</strong></div>
      <div class="vm-stat"><span>⭐ Popularity</span><strong>${Math.floor(Math.random()*40)+60}/100</strong></div>
      <div class="vm-stat"><span>👀 Views Today</span><strong>${Math.floor(Math.random()*80)+10}</strong></div>
      <div class="vm-stat"><span>🔖 Bookings Today</span><strong>${Math.floor(Math.random()*20)+3}</strong></div>
      <div class="vm-stat"><span>🔄 Market Activity</span><strong>${Math.floor(Math.random()*15)+1} tx</strong></div>
      <div class="vm-stat"><span>🏰 Total Virtual Owners</span><strong>${Math.floor(Math.random()*200)+500}</strong></div>
    </div>
    ${!h.owner_name ? '<div style="background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.15));border:2px solid #10B981;border-radius:14px;padding:20px;margin-top:16px;text-align:center;"><h3 style="color:#10B981;margin:0 0 8px;">🏆 Jadilah Pemilik Virtual Pertama!</h3><p style="color:var(--txt);margin:0 0 12px;">Hotel ini masih tersedia. Beli sekarang sebelum dimiliki pemain lain.</p><button onclick="openBuyHotelModal()" style="background:linear-gradient(135deg,#10B981,#059669);color:#fff;border:none;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:900;cursor:pointer;">🛒 Beli Hak Virtual — '+fmtPrice((h.stars||5)*2000)+' TrivCoin</button></div>' : ''}
  </section>

  <!-- ═══ EXPLORE MORE ═══ -->
  <section class="seo-section">
    <h2>🌏 Jelajahi Destinasi Lainnya</h2>
    <div class="seo-links" style="display:flex;flex-wrap:wrap;gap:8px;">
      ${h.country_slug ? '<a href="/hotels/'+h.country_slug+'" class="seo-link">🏨 Hotel di '+esc(h.country_name)+'</a>' : ''}
      ${cityPath ? '<a href="'+cityPath+'" class="seo-link">📍 Hotel di '+esc(h.city_name||h.city)+'</a>' : ''}
      <a href="/hotels/" class="seo-link">🌍 Semua Hotel — 190+ Negara</a>
      <a href="/hotels/indonesia" class="seo-link">🇮🇩 Hotel Indonesia</a>
      <a href="/hotels/thailand" class="seo-link">🇹🇭 Hotel Thailand</a>
      <a href="/hotels/japan" class="seo-link">🇯🇵 Hotel Jepang</a>
      <a href="/hotels/singapore" class="seo-link">🇸🇬 Hotel Singapura</a>
      <a href="/book/" class="seo-link">📖 MyTriv Book</a>
    </div>
  </section>

  <section class="seo-section" role="region"><h2>💎 Mengapa Booking Lewat MyTriv?</h2><div class="highlight-grid"><div class="hl-item">🔍 Bandingkan 8 OTA sekaligus</div><div class="hl-item">🏰 Virtual Hotel Ownership — Miliki aset digital</div><div class="hl-item">🪙 Earn TrivCoin — Kumpulkan & redeem</div><div class="hl-item">🤖 AI Travel — Rekomendasi cerdas</div><div class="hl-item">🌍 190+ Negara — Peta interaktif</div><div class="hl-item">💰 100% Gratis — Ke OTA partner</div></div></section>

<section class="seo-section"><h2>🌏 Destinasi Populer</h2><div class="seo-links" style="display:flex;flex-wrap:wrap;gap:8px;">${h.country_slug ? `<a href="/hotels/`+h.country_slug+`" class="seo-link">🏨 `+esc(h.country_name)+`</a>` : ""}${cityPath ? `<a href="`+cityPath+`" class="seo-link">📍 `+esc(h.city_name||h.city)+`</a>` : ""}<a href="/hotels/indonesia" class="seo-link">🇮🇩 Indonesia</a><a href="/hotels/thailand" class="seo-link">🇹🇭 Thailand</a><a href="/hotels/japan" class="seo-link">🇯🇵 Jepang</a><a href="/hotels/singapore" class="seo-link">🇸🇬 Singapura</a><a href="/hotels/france" class="seo-link">🇫🇷 Prancis</a><a href="/hotels/united-states" class="seo-link">🇺🇸 USA</a><a href="/book/" class="seo-link">📖 Booking</a></div></section>

<section class="seo-section"><h2>🔗 Jelajahi Lebih Lanjut</h2>
    <div class="seo-links">
      ${h.country_slug ? `<a href="/hotels/${h.country_slug}" class="seo-link">🏨 Hotel di ${esc(h.country_name)}</a>` : ''}
      ${cityPath ? `<a href="${cityPath}" class="seo-link">📍 Hotel di ${esc(h.city_name || h.city)}</a>` : ''}
      <a href="/hotels/" class="seo-link">🌍 Semua Hotel — 190+ Negara</a>
      <a href="/book/" class="seo-link">📖 MyTriv Book — Booking Cepat</a>
      <a href="/hotels/about.html" class="seo-link">🎲 Panduan Monopoly</a>
    </div>
  </section>

  <!-- ═══ AI TRAVEL ASSISTANT ═══ -->
  <section class="seo-section">
    <h2>🤖 AI Travel Assistant — Tanya tentang ${esc(h.name)}</h2>
    <p style="color:var(--mut);font-size:13.5px;margin-bottom:10px;">Ketik pertanyaan Anda dan dapatkan jawaban instan berbasis data hotel & destinasi.</p>
    <div class="hd-compare-bar">
      <input id="ai-q" placeholder="Contoh: berapa harga per malam? / fasilitas apa saja? / cocok untuk keluarga?" onkeydown="if(event.key==='Enter')hdAskAI()">
      <button onclick="hdAskAI()">Tanya</button>
    </div>
    <div id="ai-chips" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">
      <button class="hd-chip" onclick="hdAskAI('Berapa harga menginap per malam?')">Harga</button>
      <button class="hd-chip" onclick="hdAskAI('Apa saja fasilitas yang tersedia?')">Fasilitas</button>
      <button class="hd-chip" onclick="hdAskAI('Apakah cocok untuk keluarga?')">Keluarga</button>
      <button class="hd-chip" onclick="hdAskAI('Dimana lokasi hotel ini?')">Lokasi</button>
    </div>
    <div id="ai-answer" style="margin-top:12px;background:#0b1220;border:1px solid var(--border);border-radius:12px;padding:16px;display:none;font-size:14px;line-height:1.8;"></div>
    <script>
    (function(){
      var NAME=${JSON.stringify(h.name)},CITY=${JSON.stringify(h.city_name||h.city)},COUNTRY=${JSON.stringify(h.country_name||h.country)};
      var PRICE=${JSON.stringify(hasPrice?price:null)},STARS=${h.stars||4},RATING=${h.rating||4.0};
      var AM=${JSON.stringify(am)},PRICERANGE=${JSON.stringify(priceRange)};
      var KB={};
      KB['harga']='Harga menginap di '+NAME+' mulai sekitar '+PRICE+' per malam ('+PRICERANGE+'). Untuk harga real-time, gunakan tombol Booking.com, Agoda, atau Traveloka di halaman ini.';
      KB['fasilitas']='Fasilitas utama '+NAME+': '+AM.join(', ')+'.';
      KB['lokasi']='Hotel ini berlokasi di '+CITY+', '+COUNTRY+'. Gunakan peta interaktif di atas untuk melihat POI di sekitarnya.';
      KB['keluarga']=STARS>=4?'Ya, '+NAME+' sangat cocok untuk keluarga — tersedia kamar luas dan fasilitas ramah anak.':'Berdasarkan data, '+NAME+' dapat digunakan untuk keluarga. Disarankan konfirmasi langsung saat reservasi.';
      KB['rating']='Rating tamu '+NAME+' adalah '+RATING+'/5.';
      KB['bintang']=NAME+' adalah hotel bintang '+STARS+'.';
      KB['default']='Terima kasih sudah bertanya tentang '+NAME+'. Berikut ringkasannya: harga mulai '+PRICE+'/malam, rating '+RATING+'/5, fasilitas '+AM.slice(0,3).join(', ')+'. Untuk info lebih detail, hubungi OTA partner atau lihat FAQ di halaman ini.';
      window.hdAskAI=function(q){var inp=document.getElementById('ai-q');if(typeof q==='string'){inp.value=q;}var text=(inp.value||'').trim().toLowerCase();if(!text&&!q){return;}var ans=KB['default'];
      Object.keys(KB).forEach(function(k){if(k!=='default'&&text.indexOf(k)!==-1){ans=KB[k];}});
      var box=document.getElementById('ai-answer');box.style.display='block';
      box.innerHTML='<b style="color:var(--cy);">🤖 MyTriv AI:</b><br>'+ans.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      };
    })();
    <\/script>
  </section>

</div><!-- /.wrap -->
</div><!-- /.hd-page -->

<!-- MOBILE STICKY BOOKING BAR -->
<div class="hd-mobile-bar">
  <div class="m-price"><b>${hasPrice ? price : 'Cek Harga'}</b><span>/ malam · ${starLevel}</span></div>
  <a class="m-cta" href="/go?u=${encodeURIComponent(links.booking)}&partner=booking&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🔵 Booking</a>
</div>

<script>
(function(){
  window.hdSwap=function(img){var main=document.getElementById('hd-gmain-img');if(main)main.src=img.src;};
  window.hdScrollMap=function(e){e.preventDefault();var el=document.getElementById('hd-map-anchor');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});};
  window.hdGotoBook=function(e){e.preventDefault();var el=document.getElementById('hd-book');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});};
  window.hdWish=function(){var b=document.getElementById('hd-wish');var on=b.classList.toggle('active');b.innerHTML=on?'💛 Di Wishlist':'🤍 Wishlist';};
  window.hdShare=function(){var u=location.href,t=${JSON.stringify(h.name)}+' - MyTriv Hotels';if(navigator.share){navigator.share({title:t,url:u}).catch(function(){});}else{try{navigator.clipboard.writeText(u);alert('Link disalin ke clipboard!');}catch(e){}}};
  window.hdCompare=function(){var el=document.getElementById('hd-book');if(el){el.scrollIntoView({behavior:'smooth'});var btn=document.querySelector('.hd-ota');if(btn)btn.style.outline='2px solid var(--cy)';}};
  window.hdPickDate=function(field,which){var d=new Date();if(which==='checkout')d.setDate(d.getDate()+1);var iso=d.toISOString().slice(0,10);var label=d.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});document.getElementById(which==='checkin'?'hd-in':'hd-out').textContent=label;};
  window.hdPickGuests=function(field){field.querySelector('b').textContent='2 Tamu · 1 Kamar';};
  window.openBuyHotelModal=function(){var el=document.getElementById('hd-book');if(el)el.scrollIntoView({behavior:'smooth'});else alert('Kunjungi /hotels/ untuk membeli hotel virtual di MyTriv Monopoly.');};
})();
</script>`
      res.set('Cache-Control', 'private, no-cache'); res.set('Vary', 'Cookie');
      res.send(shell({ title, desc, canonical: `${SITE}/hotel/${slug}`, ogImage, body, schema, user: req.user }));
    } catch (e) { console.error('hotel page error:', e.message); res.status(500).send('error'); }
  });

// ---- English hotel detail page ----
  router.get('/en/hotel/:slug', async (req, res) => {
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
      if (!rows.length) return res.status(404).send(shell({ title: 'Hotel not found - MyTriv Hotels', desc: 'Hotel not found', canonical: SITE + req.path, ogImage: hotelImage({}, 800), body: '<div class="wrap"><h1>Hotel not found</h1></div>', lang: 'en', user: req.user }));
      const h = rows[0];
      h.stars = sanStars(h.stars);
      h.rating = sanRating(h.rating);
      h.price_idr = sanPrice(h.price_idr);
      track(req, 'page_views', { lang: 'en' });
      const am = amenitiesEn(h);
      const price = fmtPrice(h.price_idr);
      const hasPrice = h.price_idr != null;
      const links = partnerLinks(generatePartnerLink, h, h.city_name);
      const loc = h.city_name || h.city || h.country_name || '';
      const cityPath = h.country_slug ? '/en/hotels/' + h.country_slug + '/' + (h.city_slug || slugify(h.city_name || h.city)) : null;
      const citySlug = h.city_slug || slugify(h.city_name || h.city);

      let nearby = [];
      if (h.city_id) {
        const n = await pool.query('SELECT name, slug, stars, rating, price_idr, image FROM hotels WHERE city_id = $1 AND slug <> $2 ORDER BY rating DESC NULLS LAST LIMIT 6', [h.city_id, slug]);
        nearby = n.rows.map(x => ({ ...x, stars: sanStars(x.stars), rating: sanRating(x.rating), price_idr: sanPrice(x.price_idr) }));
      }

      function hashHotel(id) { let hh = 5381; for (let cc of String(id)) hh = ((hh << 5) + hh + cc.charCodeAt(0)) >>> 0; return hh; }
      const hv = hashHotel(h.id);
      const starLevel = h.stars >= 5 ? 'luxury 5-star' : h.stars >= 4 ? 'premium 4-star' : h.stars >= 3 ? 'comfortable 3-star' : 'budget-friendly';
      const priceRange = h.price_idr == null ? 'mid-range' : h.price_idr < 500000 ? 'affordable' : h.price_idr < 1500000 ? 'mid-range' : h.price_idr < 5000000 ? 'premium' : 'luxury';

      const summaryVars = [
        `${esc(h.name)} is a ${starLevel} accommodation in ${esc(loc)} offering an excellent balance of comfort and value. With a rating of ${h.rating || 4.0}, this hotel is highly recommended by previous guests. Located in a strategic area, it provides easy access to key destinations in ${esc(h.city_name || h.city)}.`,
        `${esc(h.name)} delivers a memorable ${starLevel} stay experience with modern facilities and friendly service in ${esc(loc)}. Designed for both business and leisure travelers, this hotel combines comfort with convenience at ${priceRange} price point.`
      ];
      const summaryText = summaryVars[hv % summaryVars.length];
      const whyPoints = [
        ['Competitive Price', priceRange + ' rate for ' + starLevel + ' quality'],
        ['Trusted Rating', (h.rating || 4.0) + '/5 from guest reviews'],
        ['Strategic Location', 'Easy access to ' + esc(h.city_name || h.city) + ' center'],
        ['Complete Facilities', am.slice(0, 2).join(' and ') + ' available'],
        ['Easy Booking', 'Instant reservation via 8 OTA partners'],
        ['Transparent Pricing', 'No hidden fees, compare 8 OTAs at once']
      ];

      let similarHotels = [];
      try {
        const s = await pool.query('SELECT name, slug, stars, rating, price_idr, image FROM hotels h JOIN cities c ON c.id = h.city_id WHERE h.stars = $1 AND c.country_code = $2 AND h.id <> $3 ORDER BY h.rating DESC NULLS LAST LIMIT 4', [h.stars || 4, h.country_code, h.id]);
        similarHotels = s.rows.map(x => ({ ...x, stars: sanStars(x.stars), rating: sanRating(x.rating), price_idr: sanPrice(x.price_idr) }));
      } catch(e) {}
      let reviewsHtml = '';
      let rvCount = 0, rvAvg = 0;
      try {
        const rvAgg = await pool.query("SELECT COUNT(*)::int AS count, COALESCE(AVG(rating),0)::numeric(3,1) AS avg FROM reviews WHERE hotel_slug=$1 AND status='approved' AND lang='en'", [slug]);
        rvCount = rvAgg.rows[0].count;
        rvAvg = Number(rvAgg.rows[0].avg);
        const rvList = await pool.query("SELECT author_name, rating, title, body, created_at FROM reviews WHERE hotel_slug=$1 AND status='approved' AND lang='en' ORDER BY created_at DESC LIMIT 50", [slug]);
        reviewsHtml = reviewSectionHtml(h, slug, 'en', req.user, { count: rvCount, avg: rvAvg }, rvList.rows);
      } catch (e) { /* reviews not ready */ }

      const title = h.name + ' — Best Price & Booking ' + loc + ' | MyTriv Hotels';
      const desc = 'Check best prices for ' + h.name + ' in ' + loc + '. ' + am.slice(0, 3).join(', ') + '. Compare Booking.com, Agoda, Trip.com, Traveloka & more. Free booking, no extra fees.';
      const ogImage = hotelImage(h, 800);
      const schema = {
        '@context': 'https://schema.org', '@type': 'Hotel', name: h.name, image: ogImage,
        address: { '@type': 'PostalAddress', addressLocality: h.city_name || h.city, addressCountry: h.country_name || h.country },
        starRating: { '@type': 'Rating', ratingValue: h.stars || 4 },
        priceRange: price, url: SITE + '/en/hotel/' + slug
      };
      if (h.lat && h.lng) schema.geo = { '@type': 'GeoCoordinates', latitude: h.lat, longitude: h.lng };
      if (rvCount > 0) schema.aggregateRating = { '@type': 'AggregateRating', ratingValue: rvAvg.toFixed(1), reviewCount: rvCount, bestRating: 5, worstRating: 1 };

      // English body (full parity with ID)
      const body = `
<div class="crumbs"><a href="/hotels">Home</a> › ${h.country_slug ? `<a href="/en/hotels/${h.country_slug}">${esc(h.country_name)}</a>` : ''} › ${cityPath ? `<a href="${cityPath}">${esc(h.city_name || h.city)}</a>` : ''} › <b>${esc(h.name)}</b></div>
<div class="wrap">

  <div class="hcard">
    <div class="hero-img-wrap"><img src="${ogImage}" alt="${esc(h.name)}" width="800" height="320"></div>
    <div class="hbody">
      <div class="stars">${'★'.repeat(h.stars || 4)}</div>
      <h1>${esc(h.name)} — ${starLevel} Hotel in ${esc(loc)}</h1>
      <div class="addr">📍 ${esc(loc)}${h.address ? ' — ' + esc(h.address) : ''}</div>
      <div class="tags">${am.map(a => `<span class="tag">${esc(a)}</span>`).join('')}</div>
      ${hasPrice ? `<div class="price">💵 From <b>${price}</b> / night</div>` : ''}
      <div class="ctas">
        <a class="cta cta-primary" href="/go?u=${encodeURIComponent(links.booking)}&partner=booking&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🔵 Booking.com — Book Now</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.agoda)}&partner=agoda&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟠 Agoda — Check Price</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.trip)}&partner=trip&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟣 Trip.com</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.traveloka)}&partner=traveloka&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟢 Traveloka</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.expedia)}&partner=expedia&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟡 Expedia</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.hotelscom)}&partner=hotelscom&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🔴 Hotels.com</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.kayak)}&partner=kayak&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">⚫ Kayak</a>
        <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.klook)}&partner=klook&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟠 Klook</a>
      </div>
    </div>
  </div>

  <section class="seo-section">
    <h2>📋 ${esc(h.name)} — Summary</h2>
    <div class="seo-content"><p>${summaryText}</p></div>
  </section>

  <section class="seo-section">
    <h2>✅ Why Choose ${esc(h.name)}?</h2>
    <div class="seo-grid-2">
      ${whyPoints.map(([t, d]) => `<div class="seo-point"><strong>✨ ${t}</strong><span>${d}</span></div>`).join('')}
    </div>
  </section>

  <section class="seo-section">
    <h2>🏨 Facilities at ${esc(h.name)}</h2>
    <div class="amenities-grid">
      ${am.map(a => `<div class="amenity-item">✅ ${esc(a)}</div>`).join('')}
      ${h.wifi ? '<div class="amenity-item">✅ Free WiFi</div>' : ''}
      ${h.parking ? '<div class="amenity-item">✅ Parking Available</div>' : ''}
      ${h.pool ? '<div class="amenity-item">✅ Swimming Pool</div>' : ''}
    </div>
    <p style="color:var(--mut);font-size:13px;margin-top:10px;">Facilities are based on available information. Some may require extra fees or a separate booking.</p>
  </section>

  <section class="seo-section">
    <h2>👥 Best For</h2>
    <div class="seo-grid-3">
      <div class="seo-point"><strong>💼 Business Travelers</strong><span>Easy access to the ${esc(h.city_name || h.city)} business hub</span></div>
      <div class="seo-point"><strong>👨‍👩‍👧‍👦 Families</strong><span>${h.stars >= 4 ? 'Spacious rooms & family facilities' : 'Comfortable family accommodation'}</span></div>
      <div class="seo-point"><strong>❤️ Couples</strong><span>${h.stars >= 4 ? 'Romantic atmosphere for a honeymoon' : 'Cozy atmosphere for two'}</span></div>
      <div class="seo-point"><strong>🎒 Backpackers</strong><span>${h.price_idr < 800000 ? 'Affordable rates for solo travelers' : 'Quality choice at a competitive price'}</span></div>
      <div class="seo-point"><strong>🎯 Tourists</strong><span>Close to top attractions in ${esc(h.city_name || h.city)}</span></div>
      <div class="seo-point"><strong>📅 Groups</strong><span>${h.stars >= 4 ? 'Large capacity for groups' : 'Great for small groups'}</span></div>
    </div>
  </section>

  <section class="seo-section">
    <h2>📍 Strategic Location in ${esc(h.city_name || h.city)}</h2>
    <p>${esc(h.name)} is located in ${esc(h.city_name || h.city)}, ${esc(h.country_name || h.country)}${h.lat ? ` (GPS coordinates ${Number(h.lat).toFixed(4)}, ${Number(h.lng).toFixed(4)})` : ''}. Based on available information, the hotel sits in an area with easy access to key parts of the city. ${h.address ? 'Full address: ' + esc(h.address) + '.' : ''} Hotels in ${esc(h.city_name || h.city)} generally offer quick access to shopping areas, restaurants and main attractions.</p>
  </section>

  <section class="seo-section">
    <h2>🗼 Nearby Landmarks & Attractions</h2>
    <p>Based on the location of ${esc(h.name)} in ${esc(h.city_name || h.city)}, here are landmarks and attractions commonly found around the area:</p>
    <div class="seo-grid-2">
      <div class="seo-point"><strong>🏛️ ${esc(h.city_name || h.city)} City Center</strong><span>Explore the city heart and local architecture</span></div>
      <div class="seo-point"><strong>🛍️ Shopping Malls</strong><span>Shopping and dining destinations near the hotel</span></div>
      <div class="seo-point"><strong>🌳 City Parks</strong><span>Green spaces for relaxation and recreation</span></div>
      <div class="seo-point"><strong>🏛️ Museums & Galleries</strong><span>Culture and history of ${esc(h.city_name || h.city)}</span></div>
      <div class="seo-point"><strong>🍽️ Dining Districts</strong><span>Enjoy ${esc(h.country_name || 'local')} cuisine</span></div>
      <div class="seo-point"><strong>⛪ Places of Worship</strong><span>Nearby places of worship for spiritual comfort</span></div>
    </div>
  </section>

  <section class="seo-section">
    <h2>🍽️ Dining Options Near ${esc(h.name)}</h2>
    <p>${esc(h.city_name || h.city)} is known for its diverse culinary scene. Around ${esc(h.name)} you can typically find restaurants ranging from local ${esc(h.country_name || 'international')} cuisine to international favorites:</p>
    <div class="seo-grid-3">
      <div class="seo-point"><strong>🍜 Local Cuisine</strong><span>Authentic taste of ${esc(h.country_name || 'the region')}</span></div>
      <div class="seo-point"><strong>🍕 International</strong><span>Global menus for every taste</span></div>
      <div class="seo-point"><strong>☕ Cafés & Coffee Shops</strong><span>Great for working or socializing</span></div>
      <div class="seo-point"><strong>🥘 Fine Dining</strong><span>${h.stars >= 4 ? 'Upscale restaurants for special occasions' : 'Exclusive dining experiences'}</span></div>
      <div class="seo-point"><strong>🍢 Street Food</strong><span>Local street snacks in ${esc(h.country_name || 'the area')}</span></div>
      <div class="seo-point"><strong>🥐 Breakfast & Brunch</strong><span>Fresh morning menus near the hotel</span></div>
    </div>
  </section>

  <section class="seo-section">
    <h2>🚗 Transport Access to ${esc(h.name)}</h2>
    <p>${esc(h.name)} is easy to reach via multiple modes of transport. From ${esc(loc)}, guests can use:</p>
    <div class="seo-grid-2">
      <div class="seo-point"><strong>✈️ Airport</strong><span>Nearest airport on major routes — continue by taxi or public transport</span></div>
      <div class="seo-point"><strong>🚉 Station / Terminal</strong><span>Train and bus stations available in ${esc(h.city_name || h.city)}</span></div>
      <div class="seo-point"><strong>🚕 Taxi & Ride-Hailing</strong><span>Taxi and ride-hailing services operate in the area</span></div>
      <div class="seo-point"><strong>🚌 Public Transport</strong><span>Buses and city transit for budget-friendly mobility</span></div>
    </div>
  </section>

  <section class="seo-section">
    <h2>🏨 Similar Hotels to ${esc(h.name)}</h2>
    <div class="grid">
      ${similarHotels.length ? similarHotels.map(n => `<div class="hcard-mini">
        <img src="${hotelImage(n, 400)}" alt="${esc(n.name)}" loading="lazy" width="400" height="160">
        <div class="hmini-body"><h3>${esc(n.name)}</h3><div class="stars">${'★'.repeat(n.stars || 4)} · ${n.rating || 4.2}/5</div>
        <div class="price">${fmtPrice(n.price_idr)}</div><a class="mini-cta" href="/en/hotel/${n.slug}">View & Book</a></div>
      </div>`).join('') : '<p style="color:var(--mut)">Similar hotel data coming soon.</p>'}
    </div>
  </section>

  <section class="seo-section">
    <h2>📍 Other Hotels in ${esc(h.city_name || h.city)}</h2>
    <div class="grid">
      ${nearby.filter(n => n.slug !== h.slug).slice(0, 4).map(n => `<div class="hcard-mini">
        <img src="${hotelImage(n, 400)}" alt="${esc(n.name)}" loading="lazy" width="400" height="160">
        <div class="hmini-body"><h3>${esc(n.name)}</h3><div class="stars">${'★'.repeat(n.stars || 4)} · ${n.rating || 4.2}/5</div>
        <div class="price">${fmtPrice(n.price_idr)}</div><a class="mini-cta" href="/en/hotel/${n.slug}">View & Book</a></div>
      </div>`).join('') || '<p style="color:var(--mut)">More hotels in this city coming soon.</p>'}
    </div>
  </section>

  <section class="seo-section">
    <h2>❓ Frequently Asked Questions — ${esc(h.name)}</h2>
    <div class="faq">
      <details><summary>How much does it cost to stay at ${esc(h.name)}?</summary><p>Rates start from around ${price} per night, depending on room type and season. Use the Booking.com or Agoda buttons above to check the latest real-time prices.</p></details>
      <details><summary>Where is ${esc(h.name)} located?</summary><p>The hotel is located in ${esc(loc)}${h.lat ? ` (coordinates ${Number(h.lat).toFixed(4)}, ${Number(h.lng).toFixed(4)})` : ''}. See the interactive map on this page.</p></details>
      <details><summary>What facilities does ${esc(h.name)} offer?</summary><p>Main facilities: ${am.join(', ')}${h.wifi ? ', WiFi' : ''}${h.pool ? ', Swimming Pool' : ''}${h.parking ? ', Parking' : ''}.</p></details>
      <details><summary>How do I book ${esc(h.name)}?</summary><p>Click the Booking.com, Agoda or other OTA buttons on this page. You will be redirected to the official partner site with no extra fees.</p></details>
      <details><summary>Is ${esc(h.name)} suitable for families?</summary><p>${h.stars >= 4 ? 'Yes, the hotel offers spacious rooms and family-friendly facilities. Great for trips with children.' : 'Based on available information, the hotel provides accommodation suitable for families. Contact the hotel to confirm family facilities.'}</p></details>
      <details><summary>Is there parking at ${esc(h.name)}?</summary><p>${h.parking ? 'Yes, parking facilities are available for guests.' : 'Based on available information, please confirm parking availability directly with the hotel when booking.'}</p></details>
      <details><summary>What is the guest rating of ${esc(h.name)}?</summary><p>The hotel has a rating of ${h.rating || 4.0}/5 based on available data. Ratings may change over time as new guest reviews come in.</p></details>
      <details><summary>What transport options are available to ${esc(h.name)}?</summary><p>You can use taxis, ride-hailing services, or public transport to reach the hotel.</p></details>
    </div>
  </section>

  ${reviewsHtml}

  <section class="seo-section">
    <h2>🤖 AI Travel Tips — Visiting ${esc(h.city_name || h.city)}</h2>
    <div class="seo-content">
      <p>🗓️ <strong>Best Time to Visit:</strong> ${h.country_code === 'ID' ? 'The dry season (April–October) is ideal for exploring Indonesia. Avoid the rainy season (November–March) for the best outdoor experience.' : 'Check the travel season in ' + esc(h.country_name || h.country) + ' to get the best prices and comfortable weather.'}</p>
      <p>💰 <strong>Money-Saving Tips:</strong> Book well in advance for better rates. Compare all 8 OTAs on MyTriv for the best offers. Consider staying on weekdays, which are usually cheaper.</p>
      <p>🎒 <strong>What to Pack:</strong> ${h.stars >= 4 ? 'Formal wear for dinner, casual wear for exploring, and a camera to capture the moments.' : 'Comfortable clothes, sandals, sunscreen, and a power bank for a full day of exploring.'}</p>
      <p>📱 <strong>Useful Apps:</strong> Google Maps for navigation, Google Translate for local languages, and ride-hailing apps for easy transport.</p>
    </div>
  </section>

  <section class="seo-section">
    <h2>🎲 Virtual Hotel Monopoly — ${esc(h.name)}</h2>
    ${h.owner_name ? `
    <div class="seo-content">
      <p><strong>👑 Virtual Owner:</strong> ${esc(h.owner_name)}</p>
      <p><strong>💰 Purchase Price:</strong> ${fmtPrice(h.purchase_price || 10000)} TrivCoin</p>
      <p><strong>🏪 Marketplace Status:</strong> ${h.is_for_sale ? '🟢 For Sale (' + fmtPrice(h.sale_price || 0) + ' TrivCoin)' : '🔴 Not For Sale'}</p>
      <p>This hotel is virtually owned in the <a href="/hotels/">MyTriv Virtual Hotel Monopoly</a> game. Owners can edit the page, add promos, and earn reward points.</p>
    </div>
    ` : `
    <div class="seo-content">
      <p>🏰 <strong>Status:</strong> No virtual owner yet. Be the first!</p>
      <p>🪙 <strong>Virtual Price:</strong> ${fmtPrice((h.stars || 5) * 2000)} TrivCoin</p>
      <p>🎮 Buy this hotel in <a href="/hotels/">MyTriv Virtual Hotel Monopoly</a> — a dice game across 190+ countries with Wikipedia & trivia integration.</p>
      <button onclick="openBuyHotelModal()" style="background:linear-gradient(135deg,#10B981,#059669);color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:700;cursor:pointer;margin-top:8px;">🛒 Buy This Virtual Hotel</button>
    </div>
    `}
  </section>

  <section class="seo-section" style="background:linear-gradient(135deg, rgba(37,99,235,0.15), rgba(245,158,11,0.15));border:2px solid #F59E0B;border-radius:16px;padding:28px;text-align:center;">
    <h2 style="color:#F59E0B;margin-top:0;">🛎️ Ready to Book ${esc(h.name)}?</h2>
    <p style="font-size:16px;margin-bottom:20px;">Compare the best prices from 8 OTAs and get exclusive offers. No extra fees — 100% free!</p>
    <div class="ctas">
      <a class="cta cta-primary" href="/go?u=${encodeURIComponent(links.booking)}&partner=booking&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🔵 Booking.com — Book Now</a>
      <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.agoda)}&partner=agoda&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟠 Agoda — Check Price</a>
      <a class="cta cta-alt" href="/go?u=${encodeURIComponent(links.expedia)}&partner=expedia&slug=${encodeURIComponent(slug)}&hotel=1" target="_blank" rel="nofollow noopener">🟡 Expedia</a>
    </div>
  </section>

  <section class="seo-section monopoly-sec">
    <h2>🎮 Own ${esc(h.name)} Virtually — MyTriv Monopoly</h2>
    <p><strong>${esc(h.name)}</strong> is also available as a <strong>Virtual Monopoly asset</strong> — one of the few platforms in the world combining hotel booking with digital asset ownership. Users can buy the virtual ownership rights using <strong>TrivCoin</strong>.</p>
    <p>Virtual owners get an identity as a <strong>Virtual Owner</strong> and can trade their ownership through the <strong>MyTriv Marketplace</strong>. This is a collectible digital asset within the MyTriv ecosystem — not real-world hotel ownership.</p>
  </section>

  <section class="seo-section monopoly-sec">
    <h2>👑 Virtual Ownership Status of ${esc(h.name)}</h2>
    ${h.owner_name ? `
    <div class="vm-owner-card owned">
      <p>✅ <strong>Owned by:</strong> ${esc(h.owner_name)}</p>
      <p>💰 <strong>Purchase Price:</strong> ${h.purchase_price ? fmtPrice(h.purchase_price) + ' TrivCoin' : 'Data available'}</p>
      <p>📅 <strong>Purchase Date:</strong> ${h.purchase_date ? new Date(h.purchase_date).toLocaleDateString('en-US') : 'Data available'}</p>
      <p>${h.is_for_sale ? '🟢 <strong>Listed on Marketplace:</strong> ' + fmtPrice(h.sale_price || 0) + ' TrivCoin' : '🔴 <strong>Not For Sale</strong>'}</p>
    </div>
    ` : `
    <div class="vm-owner-card unowned">
      <p>🏰 <strong>No virtual owner yet.</strong> Be the first!</p>
      <button onclick="openBuyHotelModal()" style="background:linear-gradient(135deg,#10B981,#059669);color:#fff;border:none;padding:12px 24px;border-radius:10px;font-weight:800;cursor:pointer;font-size:14px;">🛒 Buy Virtual Rights — ${fmtPrice((h.stars || 5) * 2000)} TrivCoin</button>
    </div>
    `}
  </section>

  <section class="seo-section monopoly-sec">
    <h2>📈 Virtual Hotel Statistics</h2>
    <div class="amenities-grid">
      <div class="amenity-item">👤 <strong>Owner:</strong> ${h.owner_name ? esc(h.owner_name) : 'None Yet'}</div>
      <div class="amenity-item">💰 <strong>Virtual Price:</strong> ${h.present_value ? fmtPrice(h.present_value) : fmtPrice((h.stars || 5) * 3000)} TrivCoin</div>
      <div class="amenity-item">📊 <strong>Market Value:</strong> ${h.owner_name && h.purchase_price ? fmtPrice(h.purchase_price) : 'Available'}</div>
      <div class="amenity-item">👀 <strong>Viewers:</strong> ${Math.floor(Math.random()*200)+50}</div>
      <div class="amenity-item">⭐ <strong>Wishlist:</strong> ${Math.floor(Math.random()*30)+5}</div>
      <div class="amenity-item">📈 <strong>Return Rate:</strong> +${Math.floor(Math.random()*40)+5}%</div>
    </div>
  </section>

  <section class="seo-section monopoly-sec">
    <h2>💰 Marketplace Virtual Activity</h2>
    <div class="amenities-grid">
      <div class="amenity-item">💵 <strong>Listing Price:</strong> ${fmtPrice((h.stars || 5) * 3000)} TrivCoin</div>
      <div class="amenity-item">📊 <strong>Market Price:</strong> ${h.owner_name && h.sale_price ? fmtPrice(h.sale_price) : 'Not Available'}</div>
      <div class="amenity-item">🔄 <strong>Transactions:</strong> ${Math.floor(Math.random()*10)}x</div>
      <div class="amenity-item">📅 <strong>Last Activity:</strong> ${new Date(Date.now()-Math.random()*7*86400000).toLocaleDateString('en-US')}</div>
    </div>
    <p style="margin-top:12px;color:var(--mut);font-size:12px;">💡 MyTriv Marketplace is a peer-to-peer market for trading virtual hotel assets. Prices may change based on community activity.</p>
  </section>

  <section class="seo-section">
    <h2>🗺️ Interactive Map — ${esc(h.name)}</h2>
    <div id="poi-filters" style="display:none;flex-wrap:wrap;gap:6px;margin-bottom:10px;"></div>
    <div id="hotel-map" style="height:400px;border-radius:14px;border:1px solid var(--border);background:var(--card);overflow:hidden;position:relative;">
      <div id="map-placeholder" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--mut);font-size:14px;text-align:center;flex-direction:column;gap:8px;cursor:pointer;">🗺️ Click to load the interactive map<br><span style="font-size:12px;opacity:.8;">Restaurants · Attractions · Transport · Shopping nearby</span></div>
    </div>
    <style>
    .poi-dot{width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;}
    .poi-dot.hotel-dot{width:30px;height:30px;font-size:16px;border-color:var(--cy);}
    #poi-filters button{background:var(--card);border:1px solid var(--border);color:var(--txt);padding:5px 12px;border-radius:20px;cursor:pointer;font-size:12px;}
    #poi-filters button.active{background:var(--cy);color:#060B13;border-color:var(--cy);font-weight:700;}
    </style>
    <script>
    (function(){var loaded=false;var mapEl=document.getElementById('hotel-map');var ph=document.getElementById('map-placeholder');
    var lat=${Number(h.lat||0)},lng=${Number(h.lng||0)},hotelId=${Number(h.id)||0};
    var NAME=${JSON.stringify(h.name)},LOC=${JSON.stringify(loc)};
    var byCat={};
    function esc2(x){return String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
    function loadMap(){if(loaded)return;loaded=true;if(ph)ph.style.display='none';
    var css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
    var js=document.createElement('script');js.src='https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
    js.onload=function(){
    var map=new maplibregl.Map({container:'hotel-map',style:'https://tiles.openfreemap.org/styles/liberty',center:[lng,lat],zoom:16});
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
    var el=document.createElement('div');el.className='poi-dot hotel-dot';el.textContent='🏨';
    new maplibregl.Marker({element:el}).setLngLat([lng,lat]).setPopup(new maplibregl.Popup({offset:12}).setHTML('<b>'+esc2(NAME)+'</b><br>'+esc2(LOC))).addTo(map);
    fetch('/maps/api/hotel-poi?hotel_id='+hotelId+'&r=2500&lang=en').then(function(r){return r.json();}).then(function(d){
    var pois=d.poi||[];if(!pois.length)return;
    var colors={Restaurant:'#EF4444',Cafe:'#F59E0B',Attraction:'#10B981',Transport:'#3B82F6',Shopping:'#A855F7',Health:'#EC4899',Other:'#64748B'};
    pois.slice(0,150).forEach(function(p){
    var dot=document.createElement('div');dot.className='poi-dot';dot.style.background=(colors[p.cat]||'#64748B');dot.textContent=p.emoji||'';
    var m=new maplibregl.Marker({element:dot}).setLngLat([p.lng,p.lat]).setPopup(new maplibregl.Popup({offset:10}).setHTML('<b>'+esc2(p.name)+'</b><br>'+esc2(p.cat)+(p.dist_m?'<br>~'+p.dist_m+' m':'')));
    m.addTo(map);if(!byCat[p.cat])byCat[p.cat]=[];byCat[p.cat].push(m);
    });
    var fb=document.getElementById('poi-filters');fb.style.display='flex';
    Object.keys(byCat).forEach(function(c){
    var b=document.createElement('button');b.textContent=c+' ('+byCat[c].length+')';b.className='active';
    b.onclick=function(){var on=!b.classList.contains('active');b.classList.toggle('active',on);(byCat[c]||[]).forEach(function(m2){m2.getElement().style.display=on?'':'none';});};
    fb.appendChild(b);
    });
    }).catch(function(){});
    setTimeout(function(){map.resize();},300);
    };document.head.appendChild(css);document.body.appendChild(js);}
    if(mapEl)mapEl.addEventListener('click',loadMap);
    })();
    </script>
    <p style="color:var(--mut);font-size:12px;margin-top:8px;">📍 Coordinates: ${Number(h.lat||0).toFixed(4)}, ${Number(h.lng||0).toFixed(4)} — ${esc(loc)} · Map © OpenFreeMap · POI © OpenStreetMap</p>
    <a href="/maps/${slugify(h.city_name || h.city || '')}" class="cta cta-alt" style="display:inline-block;margin-top:10px;font-size:13px;padding:8px 16px;">🗺️ Explore All Hotels in ${esc(h.city_name || h.city)} — Map Explorer →</a>
  </section>

  <section class="seo-section">
    <h2>🚶 Walking Distance from ${esc(h.name)}</h2>
    <div class="amenities-grid">
      <div class="amenity-item">🚶 City Center: <strong>10-15 min walk</strong> · 5 min by car</div>
      <div class="amenity-item">🚶 Dining District: <strong>5-10 min walk</strong> · 3 min by car</div>
      <div class="amenity-item">🚶 Shopping Area: <strong>15-20 min walk</strong> · 8 min by car</div>
      <div class="amenity-item">🚶 Station / Terminal: <strong>10-30 min walk</strong> · 10 min by car</div>
      <div class="amenity-item">🚶 Nearest Attractions: <strong>5-15 min walk</strong> · 5 min by car</div>
      <div class="amenity-item">🚶 Hospital: <strong>10-20 min by car</strong></div>
    </div>
    <p style="color:var(--mut);font-size:11px;margin-top:8px;">* Estimates based on the general location in ${esc(h.city_name||h.city)}. Actual distances may vary.</p>
  </section>

  <section class="seo-section">
    <h2>☀️ Best Time to Visit & Weather</h2>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:12px;">
      <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;">
        <div style="font-size:28px;">☀️</div><strong>Best Season</strong><p style="font-size:12px;color:var(--mut);">${h.country_code==='ID'?'April - October (Dry)':'Depends on destination'}</p>
      </div>
      <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;">
        <div style="font-size:28px;">📈</div><strong>Peak Season</strong><p style="font-size:12px;color:var(--mut);">${h.country_code==='ID'?'June-August & December':'Holiday season'}</p>
      </div>
      <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;">
        <div style="font-size:28px;">📉</div><strong>Low Season</strong><p style="font-size:12px;color:var(--mut);">${h.country_code==='ID'?'January-March':'Early year'}</p>
      </div>
      <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;">
        <div style="font-size:28px;">🌡️</div><strong>Average Temp</strong><p style="font-size:12px;color:var(--mut);">${h.country_code==='ID'?'25°C - 33°C':'Varies by season'}</p>
      </div>
    </div>
    <p style="color:var(--mut);font-size:11px;margin-top:10px;">* Weather data based on regional climate estimates. Actual conditions may differ. Check the latest forecast before traveling.</p>
  </section>

  <section class="seo-section">
    <h2>💵 ${esc(h.name)} Price Information</h2>
    <div class="amenities-grid">
      <div class="amenity-item">💰 <strong>Starting Price:</strong> ${price} / night</div>
      <div class="amenity-item">📊 <strong>Price Category:</strong> ${priceRange}</div>
      <div class="amenity-item">⭐ <strong>Hotel Level:</strong> ${starLevel}</div>
      <div class="amenity-item">🔄 <strong>Comparison:</strong> Compare 8 OTAs for the best price</div>
    </div>
    <p style="color:var(--mut);font-size:11px;margin-top:8px;">⚠️ Prices may change based on travel dates, room availability, and ongoing promos. The price above is an estimate based on available data.</p>
  </section>

  <section class="seo-section">
    <h2>🤖 AI Travel Match — Who Is ${esc(h.name)} Best For?</h2>
    <div class="highlight-grid">
      <div class="hl-item">💼 Business Traveler — ${h.stars>=4?'Business facilities & meeting rooms':'Easy access to the business hub'}</div>
      <div class="hl-item">👨‍👩‍👧‍👦 Family Vacation — ${h.stars>=4?'Spacious & kid-friendly rooms':'Comfortable for small families'}</div>
      <div class="hl-item">💑 Honeymoon & Romantic — ${h.stars>=4?'Romantic & exclusive atmosphere':'Cozy for couples'}</div>
      <div class="hl-item">🎒 Backpacker — ${h.price_idr<800000?'Budget-friendly for solo travelers':'Great value for money'}</div>
      <div class="hl-item">🏖️ Staycation — Perfect for short getaways close to home</div>
      <div class="hl-item">👑 Luxury Seeker — ${h.stars>=5?'World-class stay experience':'Premium comfort'}</div>
    </div>
  </section>

  <section class="seo-section">
    <h2>🌎 World Famous Hotel Collection</h2>
    <div class="grid" style="grid-template-columns:repeat(auto-fill, minmax(160px, 1fr));">
      <a href="/en/hotel/the-ritz-london" class="hcard-mini"><div class="hmini-body"><h3>🏨 The Ritz London</h3></div></a>
      <a href="/en/hotel/burj-al-arab" class="hcard-mini"><div class="hmini-body"><h3>🏨 Burj Al Arab</h3></div></a>
      <a href="/en/hotel/marina-bay-sands" class="hcard-mini"><div class="hmini-body"><h3>🏨 Marina Bay Sands</h3></div></a>
      <a href="/en/hotel/mandarin-oriental-bangkok" class="hcard-mini"><div class="hmini-body"><h3>🏨 Mandarin Oriental</h3></div></a>
      <a href="/en/hotel/atlantis-dubai" class="hcard-mini"><div class="hmini-body"><h3>🏨 Atlantis Dubai</h3></div></a>
      <a href="/en/hotel/aman-tokyo-otemachi" class="hcard-mini"><div class="hmini-body"><h3>🏨 Aman Tokyo</h3></div></a>
      <a href="/en/hotel/four-seasons-george-v-paris" class="hcard-mini"><div class="hmini-body"><h3>🏨 Four Seasons Paris</h3></div></a>
      <a href="/en/hotel/the-plaza-new-york" class="hcard-mini"><div class="hmini-body"><h3>🏨 The Plaza NY</h3></div></a>
    </div>
  </section>

  <section class="seo-section">
    <h2>🌏 Explore Other Destinations</h2>
    <div class="seo-links" style="display:flex;flex-wrap:wrap;gap:8px;">
      ${h.country_slug ? '<a href="/en/hotels/'+h.country_slug+'" class="seo-link">🏨 Hotels in '+esc(h.country_name)+'</a>' : ''}
      ${cityPath ? '<a href="'+cityPath+'" class="seo-link">📍 Hotels in '+esc(h.city_name||h.city)+'</a>' : ''}
      <a href="/hotels/" class="seo-link">🌍 All Hotels — 190+ Countries</a>
      <a href="/en/hotels/united-states" class="seo-link">🇺🇸 Hotels in USA</a>
      <a href="/en/hotels/japan" class="seo-link">🇯🇵 Hotels in Japan</a>
      <a href="/en/hotels/france" class="seo-link">🇫🇷 Hotels in France</a>
      <a href="/en/hotels/united-kingdom" class="seo-link">🇬🇧 Hotels in UK</a>
      <a href="/book/" class="seo-link">📖 MyTriv Book</a>
    </div>
  </section>

  <section class="seo-section" role="region"><h2>💎 Why Book Through MyTriv?</h2><div class="highlight-grid"><div class="hl-item">🔍 Compare 8 OTAs at once</div><div class="hl-item">🏰 Virtual Hotel Ownership — Own digital assets</div><div class="hl-item">🪙 Earn TrivCoin — Collect & redeem</div><div class="hl-item">🤖 AI Travel — Smart recommendations</div><div class="hl-item">🌍 190+ Countries — Interactive map</div><div class="hl-item">💰 100% Free — Go to partner OTAs</div></div></section>

</div>`;

      res.set('Cache-Control', 'private, no-cache'); res.set('Vary', 'Cookie');
      res.send(shell({ title, desc, canonical: SITE + '/en/hotel/' + slug, ogImage, body, schema, lang: 'en', user: req.user }));
    } catch(e) { console.error('en hotel page error:', e.message); res.status(500).send('error'); }
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
      hotels.rows = hotels.rows.map(x => ({ ...x, stars: sanStars(x.stars), rating: sanRating(x.rating), price_idr: sanPrice(x.price_idr) }));

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
      res.set('Cache-Control', 'private, no-cache'); res.set('Vary', 'Cookie');
      res.send(shell({ title, desc, canonical: `${SITE}/hotels/${country}`, ogImage: hotelImage({}, 800), body, schema, user: req.user }));
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
      hotels.rows = hotels.rows.map(x => ({ ...x, stars: sanStars(x.stars), rating: sanRating(x.rating), price_idr: sanPrice(x.price_idr) }));
      const totalCount = totalRes.rows[0].n;
      const budget = hotels.rows.slice().sort((a, b) => a.price_idr - b.price_idr)[0];
      const lux = hotels.rows.slice().sort((a, b) => b.price_idr - a.price_idr)[0];

      const title = `Hotel di ${c.name}, ${c.country_name} — ${totalCount} Hotel Terbaik | MyTriv Hotels`;
      const desc = `Temukan ${totalCount} hotel terbaik di ${c.name}${budget && budget.price_idr != null ? `, mulai ${fmtPrice(budget.price_idr)}` : ''}. Bandingkan harga & booking online di Booking.com, Agoda, Trip.com, Traveloka.`;
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
    <details><summary>Hotel apa yang paling murah di ${esc(c.name)}?</summary><p>${budget && budget.price_idr != null ? `Hotel mulai dari ${fmtPrice(budget.price_idr)}.` : 'Cek daftar di atas untuk pilihan budget.'} Bandingkan di Booking.com dan Agoda untuk penawaran terbaik.</p></details>
  </div>
</div>`;
      const schema = { '@context': 'https://schema.org', '@type': 'City', name: c.name, url: SITE + '/hotels/' + country + '/' + city };
      res.set('Cache-Control', 'private, no-cache'); res.set('Vary', 'Cookie');
      res.send(shell({ title, desc, canonical: `${SITE}/hotels/${country}/${city}`, ogImage: hotelImage({}, 800), body, schema, user: req.user }));
    } catch (e) { console.error('city page error:', e.message); res.status(500).send('error'); }
  });

  // ---- Review moderation panel (admin only) ----
  router.get('/admin/reviews', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') return res.status(403).send('Forbidden');
    const body = `
<div class="wrap">
  <h1>\U0001f6e1\ufe0f Review Moderation</h1>
  <div class="row" style="margin:16px 0;">
    <button onclick="loadReviews('pending')" class="mini-cta" style="background:#F59E0B;">Pending</button>
    <button onclick="loadReviews('approved')" class="mini-cta">Approved</button>
    <button onclick="loadReviews('rejected')" class="mini-cta" style="background:#ef4444;color:#fff;">Rejected</button>
  </div>
  <div id="rv-admin"></div>
</div>
<script>
function esc2(x){return String(x||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function loadReviews(status){
  fetch('/api/admin/reviews?status='+status).then(function(r){return r.json();}).then(function(d){
    var rows=d.reviews||[];
    var out='<h2>'+status.charAt(0).toUpperCase()+status.slice(1)+' ('+rows.length+')</h2><div class="grid">';
    out+=rows.map(function(r){
      return '<div class="hcard-mini" style="padding:14px;border:1px solid #1e293b;"><div class="review-head"><b>'+esc2(r.author_name)+'</b><span class="review-stars">'+'\u2605'.repeat(r.rating)+'\u2606'.repeat(5-r.rating)+'</span><span class="review-date">'+esc2(r.hotel_name||r.hotel_slug)+' \u00b7 '+r.lang+'</span></div>'
        +(r.title?'<h3>'+esc2(r.title)+'</h3>':'')
        +'<p style="color:var(--mut)">'+esc2(r.body)+'</p>'
        +'<p style="font-size:12px;color:var(--mut)">'+new Date(r.created_at).toLocaleString()+' \u00b7 flags: '+((r.flags||[]).join(', ')||'none')+'</p>'
        +'<div class="row" style="margin-top:10px;">'
        +'<button class="mini-cta" onclick="setStatus('+r.id+',\'approved\')">\u2705 Approve</button> '
        +'<button class="mini-cta" style="background:#ef4444;color:#fff;" onclick="setStatus('+r.id+',\'rejected\')">\U0001f6ab Reject</button>'
        +'</div></div>';
    }).join('');
    out+='</div>';
    document.getElementById('rv-admin').innerHTML=out;
  }).catch(function(){document.getElementById('rv-admin').innerHTML='<p>Error loading.</p>';});
}
function setStatus(id,status){fetch('/api/admin/reviews/'+id+'/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:status})}).then(function(r){return r.json();}).then(function(){loadReviews('pending');}).catch(function(){});}
loadReviews('pending');
<\/script>`;
    res.set('Cache-Control', 'private, no-cache'); res.set('Vary', 'Cookie');
    res.send(shell({ title: 'Review Moderation - MyTriv', desc: 'Approve or reject guest reviews', canonical: SITE + '/admin/reviews', ogImage: hotelImage({}, 800), body, user: req.user }));
  });

  // ============ MAP EXPLORER ============
  router.get('/maps/:city', async (req, res) => {
    try {
      const city = req.params.city.replace(/-/g,' ').replace(/bandung/,'Bandung').replace(/jakarta/,'Jakarta').replace(/yogyakarta/,'Yogyakarta').replace(/bali/,'Bali');
      const lang = city === req.params.city ? 'id' : 'id'; // keep simple
      const cRes = await pool.query(
        "SELECT id, name, slug, city, lat, lng, stars, rating, price_idr, image FROM hotels WHERE LOWER(city)=LOWER($1) AND lat IS NOT NULL AND lng IS NOT NULL AND country='Indonesia' ORDER BY rating DESC NULLS LAST LIMIT 500",
        [city]
      );
      if (!cRes.rows.length) {
        return res.status(404).send(shell({ title: 'City Not Found', desc: 'No hotels found for this city', canonical: SITE + '/maps/' + req.params.city, ogImage: hotelImage({}, 800), body: '<p>City not found</p>' }));
      }
      const hotels = cRes.rows;
      const avgLat = hotels.reduce((s,h) => s + Number(h.lat), 0) / hotels.length;
      const avgLng = hotels.reduce((s,h) => s + Number(h.lng), 0) / hotels.length;
      
      const hotelsJson = JSON.stringify(hotels.map(h => ({
        id: h.id, name: h.name, slug: h.slug, lat: h.lat, lng: h.lng,
        stars: h.stars || 4, rating: h.rating, price: h.price_idr
      })));
      
      const title = `Peta Interaktif Hotel di ${city.charAt(0).toUpperCase()+city.slice(1)} — MyTriv Maps`;
      const desc = `Jelajahi ${hotels.length} hotel di ${city} dengan peta interaktif. Filter berdasarkan rating, harga, dan kategori. Bandingkan harga Booking.com, Agoda, Traveloka.`;
      
      const mapHtml = `
<link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:system-ui,sans-serif;background:#0d1117;color:#e6e6e6;overflow:hidden;height:100vh}
  #map{width:100%;height:100%}
  #sidebar{position:fixed;top:12px;left:12px;z-index:1000;background:rgba(13,17,23,.95);backdrop-filter:blur(10px);border:1px solid #30363d;border-radius:12px;padding:14px;max-width:340px;width:320px;max-height:calc(100vh-24px);overflow-y:auto;font-size:13px}
  #sidebar h1{font-size:18px;margin:0 0 4px;color:#58a6ff}
  #sidebar .sub{color:#8b949e;font-size:12px;margin-bottom:12px}
  #sidebar .stats{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
  #sidebar .stat{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:6px 10px;font-size:11px}
  #sidebar .stat b{color:#58a6ff}
  #sidebar button{display:block;width:100%;padding:8px;margin:3px 0;background:#21262d;color:#c9d1d9;border:1px solid #30363d;border-radius:6px;cursor:pointer;font-size:12px;text-align:left}
  #sidebar button:hover{background:#30363d;color:#58a6ff}
  #sidebar button.active{background:#1f6feb;color:#fff;border-color:#58a6ff}
  #hotel-list{margin-top:8px;max-height:300px;overflow-y:auto}
  #hotel-list a{display:block;padding:6px 8px;color:#c9d1d9;text-decoration:none;border-radius:4px;font-size:12px}
  #hotel-list a:hover{background:#21262d;color:#58a6ff}
  .maplibregl-popup{max-width:260px!important}
  .maplibregl-popup-content{background:#161b22!important;color:#e6e6e6!important;border:1px solid #30363d!important;border-radius:10px!important;padding:12px!important;font-size:12px}
  .maplibregl-popup-content h3{margin:0 0 4px;font-size:14px;color:#58a6ff}
  .maplibregl-popup-content .stars{color:#f0c040}
  .maplibregl-popup-content a{color:#58a6ff}
</style>
<div id="map"></div>
<div id="sidebar">
  <h1>🏨 Hotel di ${esc(city)}</h1>
  <div class="sub">${hotels.length} hotel — MyTriv Maps Explorer</div>
  <div class="stats">
    <div class="stat">⭐ <b>${(hotels.reduce((s,h)=>s+(h.rating||4),0)/hotels.length).toFixed(1)}</b> avg rating</div>
    <div class="stat">💰 <b>${hotels.filter(h=>h.price_idr<800000).length}</b> budget</div>
    <div class="stat">🌟 <b>${hotels.filter(h=>(h.stars||4)>=4).length}</b> premium</div>
  </div>
  <input type="text" id="hotel-search" placeholder="🔍 Cari hotel..." style="width:100%;padding:8px 10px;background:#21262d;border:1px solid #30363d;color:#c9d1d9;border-radius:6px;font-size:12px;margin-bottom:8px" oninput="searchHotel(this.value)">
  <button onclick="filterAll()" class="active" id="btn-all">📍 Semua Hotel (${hotels.length})</button>
  <button onclick="filterBy('premium')" id="btn-premium">🌟 Premium (4-5 bintang)</button>
  <button onclick="filterBy('budget')" id="btn-budget">💰 Budget (<800rb)</button>
  <div id="hotel-list">${hotels.slice(0,20).map(h=>`<a href="/hotel/${h.slug}" target="_blank">⭐${h.stars||4} ${esc(h.name).slice(0,28)}</a>`).join('')}</div>
</div>
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<script>
const HOTELS=${hotelsJson};
let activeFilter='all';
const map=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',center:[${avgLng},${avgLat}],zoom:14});
map.addControl(new maplibregl.NavigationControl(),'top-right');
const markers=[];
function renderMarkers(filter){
  markers.forEach(m=>m.remove()); markers.length=0;
  HOTELS.forEach(h=>{
    let show=filter==='all'||(filter==='premium'&&h.stars>=4)||(filter==='budget'&&h.price&&h.price<800000);
    if(!show)return;
    const el=document.createElement('div');
    el.style.cssText='width:'+(filter==='all'?18:22)+'px;height:'+(filter==='all'?18:22)+'px;background:'+(h.stars>=4?'#f0c040':'#58a6ff')+';border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.6);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:10px;color:#000;font-weight:bold';
    el.textContent=h.stars>=5?'5':h.stars>=4?'4':'';
    const m=new maplibregl.Marker({element:el}).setLngLat([h.lng,h.lat])
      .setPopup(new maplibregl.Popup().setHTML('<h3>'+h.name+'</h3><div class=\\"stars\\">'+'★'.repeat(h.stars>=5?5:h.stars>=4?4:3)+' '+(h.rating||4)+'/5</div>'+(h.price?'<div>from Rp '+(h.price/1000000).toFixed(1)+' jt</div>':'')+'<a href=\\"/hotel/'+h.slug+'\\">Lihat Detail & Booking →</a>'))
      .addTo(map);
    markers.push(m);
  });
  document.querySelectorAll('#sidebar button').forEach(b=>b.classList.remove('active'));
  document.getElementById('btn-'+(filter==='all'?'all':filter==='premium'?'premium':'budget')).classList.add('active');
}
function filterAll(){activeFilter='all';renderMarkers('all');}
function filterBy(f){activeFilter=f;renderMarkers(f);}
function searchHotel(q){
  if(!q){renderMarkers(activeFilter);return}
  markers.forEach(m=>m.remove());markers.length=0;
  const terms=q.toLowerCase().split(/\\s+/);
  const matched=HOTELS.filter(h=>terms.some(t=>h.name.toLowerCase().includes(t)));
  matched.sort((a,b)=>{
    const sa=terms.filter(t=>a.name.toLowerCase().includes(t)).length;
    const sb=terms.filter(t=>b.name.toLowerCase().includes(t)).length;
    return sb-sa;
  });
  matched.slice(0,50).forEach(h=>{
    const el=document.createElement('div');
    el.style.cssText='width:26px;height:26px;background:#e04040;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.7);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:bold';
    el.textContent=h.stars>=5?'5':h.stars>=4?'4':'';
    const m=new maplibregl.Marker({element:el}).setLngLat([h.lng,h.lat])
      .setPopup(new maplibregl.Popup().setHTML('<h3>'+h.name+'</h3><div class=\\"stars\\">'+'★'.repeat(h.stars>=5?5:h.stars>=4?4:3)+' '+(h.rating||4)+'/5</div>'+(h.price?'<div>from Rp '+(h.price/1000000).toFixed(1)+' jt</div>':'')+'<a href=\\"/hotel/'+h.slug+'\\">Lihat Detail & Booking →</a>'))
      .addTo(map);
    markers.push(m);
  });
}
renderMarkers('all');
</script>`;
      res.send(shell({ title, desc, canonical: SITE + '/maps/' + req.params.city, ogImage: hotelImage({}, 800), body: mapHtml }));
    } catch (e) {
      res.status(500).send(shell({ title: 'Error', desc: 'Server error', canonical: SITE + '/maps/' + req.params.city, ogImage: hotelImage({}, 800), body: '<p>Error loading map</p>' }));
    }
  });

  return router;
};
