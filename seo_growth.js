// seo_growth.js - Automated SEO growth monitoring & actions
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const credFile = path.join(__dirname, 'gsc-credentials.json');
const configFile = path.join(__dirname, 'ga4-config.json');
const cred = JSON.parse(fs.readFileSync(credFile, 'utf8'));
const ga4Config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : null;
const { client_email, private_key, token_uri } = cred;
const SITE = 'sc-domain:mytriv.com';
const SITE_ENC = SITE.replace(/:/g, '%3A');

// --- JWT (same as gsc_check.js) ---
function b64u(buf) { return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function jwtHeader() { return b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' })); }
function jwtClaim(scope) {
  const now = Math.floor(Date.now() / 1000);
  return b64u(JSON.stringify({ iss: client_email, scope, aud: token_uri, exp: now + 3600, iat: now }));
}
function sign(data) {
  const crypto = require('crypto');
  return crypto.createSign('RSA-SHA256').update(data).sign(private_key);
}
async function getAccessToken(scope) {
  const assertion = `${jwtHeader()}.${jwtClaim(scope)}`;
  const sig = sign(assertion);
  const token = `${assertion}.${b64u(sig)}`;
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: token }).toString();
    const u = new URL(token_uri);
    const req = https.request({ hostname: u.hostname, path: u.pathname, method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { try { resolve(JSON.parse(d).access_token); } catch (e) { reject(new Error('token: ' + d.slice(0, 200))); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function gscReq(tok, method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const opts = { hostname: 'searchconsole.googleapis.com', path: apiPath, method, headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' } };
    if (payload) opts.headers['Content-Length'] = Buffer.byteLength(payload);
    const req = https.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve({ error: d.slice(0, 200) }); } });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function ga4Req(tok, apiPath, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const opts = { hostname: 'analyticsdata.googleapis.com', path: apiPath, method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } };
    const req = https.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve({ error: d.slice(0, 200) }); } });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000 }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

(async () => {
  console.log('Authenticating...');
  const gscTok = await getAccessToken('https://www.googleapis.com/auth/webmasters.readonly');
  let ga4Tok = null;
  if (ga4Config) {
    ga4Tok = await getAccessToken('https://www.googleapis.com/auth/analytics.readonly');
  }
  console.log('Token OK\n');

  console.log('╔══════════════════════════════════════╗');
  console.log('║    MyTriv SEO GROWTH REPORT         ║');
  console.log('╚══════════════════════════════════════╝\n');

  // 1. GSC Search Analytics
  console.log('📊 SEARCH ANALYTICS (28 days)');
  const today = new Date().toISOString().slice(0, 10);
  const d28 = new Date(Date.now() - 28*86400000).toISOString().slice(0, 10);
  const d7 = new Date(Date.now() - 7*86400000).toISOString().slice(0, 10);
  const sa = await gscReq(gscTok, 'POST', '/webmasters/v3/sites/' + SITE_ENC + '/searchAnalytics/query', {
    startDate: d28, endDate: today, rowLimit: 50,
    dimensions: ['page']
  });
  if (sa.rows) {
    const hotelPages = sa.rows.filter(r => r.keys[0].includes('/hotel/'));
    const totalClicks = sa.rows.reduce((s,r) => s + r.clicks, 0);
    const totalImps = sa.rows.reduce((s,r) => s + r.impressions, 0);
    const hotelClicks = hotelPages.reduce((s,r) => s + r.clicks, 0);
    const hotelImps = hotelPages.reduce((s,r) => s + r.impressions, 0);
    console.log('  Total clicks: ' + totalClicks);
    console.log('  Total impressions: ' + totalImps);
    console.log('  Hotel clicks: ' + hotelClicks + ' (' + (totalClicks ? Math.round(hotelClicks/totalClicks*100) : 0) + '%)');
    console.log('  Hotel impressions: ' + hotelImps);
    console.log('  Pages with data: ' + sa.rows.length);
    console.log('  Hotel pages with data: ' + hotelPages.length);
    if (hotelPages.length) {
      console.log('\n  Top hotel pages:');
      hotelPages.sort((a,b) => b.clicks - a.clicks).slice(0, 5).forEach((r,i) => {
        console.log('    ' + (i+1) + '. ' + r.clicks + 'clk ' + r.impressions + 'imp pos' + r.position.toFixed(1) + ' ' + r.keys[0].replace('https://mytriv.com',''));
      });
    }
    // Queries
    const qa = await gscReq(gscTok, 'POST', '/webmasters/v3/sites/' + SITE_ENC + '/searchAnalytics/query', {
      startDate: d28, endDate: today, rowLimit: 20,
      dimensions: ['query']
    });
    if (qa.rows) {
      console.log('\n  Top queries:');
      qa.rows.slice(0, 10).forEach((r,i) => {
        console.log('    ' + (i+1) + '. ' + r.clicks + 'clk ' + r.impressions + 'imp pos' + r.position.toFixed(1) + ' "' + r.keys[0] + '"');
      });
    }
  } else {
    console.log('  Error:', JSON.stringify(sa).slice(0, 150));
  }

  // 2. GSC Sitemaps
  console.log('\n📋 SITEMAP STATUS');
  const sm = await gscReq(gscTok, 'GET', '/webmasters/v3/sites/' + SITE_ENC + '/sitemaps');
  if (sm.sitemap) {
    let totalSubmitted = 0;
    sm.sitemap.forEach(s => {
      const p = s.path.replace('https://mytriv.com', '');
      const submitted = s.contents ? s.contents.reduce((sum,c) => sum + (c.submitted || 0), 0) : 0;
      totalSubmitted += submitted;
      const status = s.isPending ? '⏳ pending' : '✅ ' + submitted.toLocaleString() + ' urls';
      console.log('  ' + p + ' → ' + status);
    });
    console.log('  Total submitted: ' + totalSubmitted.toLocaleString() + ' URLs');
  }

  // 3. GA4
  if (ga4Tok && ga4Config) {
    console.log('\n📈 GA4 ANALYTICS (7 days)');
    const ga4 = await ga4Req(ga4Tok, '/v1beta/properties/' + ga4Config.propertyId + ':runReport', {
      dateRanges: [{ startDate: d7, endDate: today }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
    });
    if (ga4.totals && ga4.totals.length) {
      const m = ga4.totals[0].metricValues;
      console.log('  Users: ' + (m[0]?.value || 0));
      console.log('  Sessions: ' + (m[1]?.value || 0));
      console.log('  Page views: ' + (m[2]?.value || 0));
    } else {
      console.log('  No data yet (collecting...)');
    }

    const bc = await ga4Req(ga4Tok, '/v1beta/properties/' + ga4Config.propertyId + ':runReport', {
      dateRanges: [{ startDate: d7, endDate: today }],
      metrics: [{ name: 'eventCount' }],
      dimensions: [{ name: 'eventName' }],
      dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'booking_click' } } },
    });
    if (bc.rows && bc.rows.length) {
      console.log('  Booking clicks: ' + bc.rows[0].metricValues[0].value);
    } else {
      console.log('  Booking clicks: 0');
    }
  }

  // 4. Technical SEO
  console.log('\n🔧 TECHNICAL SEO');
  const testPages = [
    { url: 'https://mytriv.com/hotel/amanjiwo-magelang', name: 'Hotel ID' },
    { url: 'https://mytriv.com/en/hotel/amanjiwo-magelang', name: 'Hotel EN' },
    { url: 'https://mytriv.com/hotels/indonesia', name: 'Country' },
    { url: 'https://mytriv.com/maps/jakarta', name: 'Maps' },
  ];
  for (const t of testPages) {
    const start = Date.now();
    const html = await fetchUrl(t.url);
    const ms = Date.now() - start;
    const checks = {
      gtag: html.includes('G-5QCP5QF51T'),
      schema: html.includes('application/ld+json'),
      canonical: html.includes('rel="canonical"'),
      viewport: html.includes('viewport'),
      h1: html.includes('<h1'),
    };
    const score = Object.values(checks).filter(Boolean).length;
    console.log('  ' + t.name + ': ' + ms + 'ms ' + (html.length/1024).toFixed(0) + 'KB [' + score + '/5]');
  }

  console.log('\n✅ Report complete.');
})();
