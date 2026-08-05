// gsc_check.js - Google Search Console status checker (free API)
// Usage: node gsc_check.js [gsc-credentials.json] [site]
// Requires: service account JSON (from Google Cloud) + SA added to Search Console
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const credFile = process.argv[2] || path.join(__dirname, 'gsc-credentials.json');
const SITE = process.argv[3] || 'sc-domain:mytriv.com';
const SITE_ENC = SITE.replace(/:/g, '%3A');

if (!fs.existsSync(credFile)) {
  console.error('MISSING credentials JSON at:', credFile);
  console.error('Steps:');
  console.error('  1. console.cloud.google.com -> New Project');
  console.error('  2. APIs & Services -> Enable "Search Console API"');
  console.error('  3. IAM & Admin -> Service Accounts -> Create -> Create Key (JSON)');
  console.error('  4. search.google.com/search-console -> Settings -> Users -> Add SA email (Full)');
  console.error('  5. Save the downloaded JSON to:', credFile);
  process.exit(1);
}

const cred = JSON.parse(fs.readFileSync(credFile, 'utf8'));
const { client_email, private_key, token_uri } = cred;

// --- minimal JWT assertion (no external deps) ---
function b64u(buf) { return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function jwtHeader() { return b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' })); }
function jwtClaim() {
  const now = Math.floor(Date.now() / 1000);
  return b64u(JSON.stringify({ iss: client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: token_uri, exp: now + 3600, iat: now }));
}
function sign(data) {
  const crypto = require('crypto');
  return crypto.createSign('RSA-SHA256').update(data).sign(private_key);
}
async function getAccessToken() {
  const assertion = `${jwtHeader()}.${jwtClaim()}`;
  const sig = sign(assertion);
  const token = `${assertion}.${b64u(sig)}`;
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: token }).toString();
    const u = new URL(token_uri);
    const req = https.request({ hostname: u.hostname, path: u.pathname, method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { try { resolve(JSON.parse(d).access_token); } catch (e) { reject(new Error('token response: ' + d.slice(0, 200))); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function gscReq(token, method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: 'searchconsole.googleapis.com', path: apiPath, method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (res.statusCode >= 400) return reject(new Error('GSC API ' + res.statusCode + ': ' + (j.error ? j.error.message : d.slice(0, 300))));
          resolve(j);
        } catch (e) { reject(new Error('parse: ' + d.slice(0, 300))); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const pad = (s, n) => String(s).padStart(n);
const fmt = (n) => Number(n || 0).toLocaleString('en-US');

(async () => {
  console.log('Connecting as:', client_email);
  console.log('Site property :', SITE, '\n');
  const token = await getAccessToken();

  // 1. Indexing status (URL Inspection / index coverage)
  try {
    const idx = await gscReq(token, 'POST', '/v1/urlInspection/index:inspect', {
      inspectionUrl: 'https://mytriv.com/hotel/ciputat-alila-scbd',
      siteUrl: SITE,
    });
    const r = (idx.inspectionResult || {});
    console.log('=== URL INSPECTION (sample page) ===');
    console.log('URL state       :', r.indexStatusResult ? r.indexStatusResult.verdict : 'n/a');
    console.log('Crawl allowed   :', r.crawlStatusResult ? r.crawlStatusResult.urlRobotsState : 'n/a');
    console.log('Indexed?        :', r.indexStatusResult ? r.indexStatusResult.coverageState : 'n/a');
    console.log('Last crawl      :', r.crawlStatusResult && r.crawlStatusResult.lastCrawlTime ? r.crawlStatusResult.lastCrawlTime : 'n/a');
  } catch (e) { console.log('URL inspection skipped:', e.message); }

  // 2. Search analytics (last 28 days)
  try {
    const now = new Date();
    const start = new Date(now.getTime() - 28 * 86400000);
    const iso = (d) => d.toISOString().slice(0, 10);
    const sa = await gscReq(token, 'POST', '/webmasters/v3/sites/' + SITE_ENC + '/searchAnalytics/query', {
      startDate: iso(start), endDate: iso(now), dimensions: ['page'], rowLimit: 20,
    });
    const rows = sa.rows || [];
    let clicks = 0, imps = 0;
    rows.forEach((r) => { clicks += r.clicks; imps += r.impressions; });
    console.log('\n=== SEARCH ANALYTICS (28d, top 20 pages) ===');
    console.log('Total clicks  :', fmt(clicks));
    console.log('Total imps    :', fmt(imps));
    console.log('Avg CTR       :', imps ? ((clicks / imps) * 100).toFixed(2) + '%' : '-');
    console.log('Top pages:');
    rows.forEach((r) => console.log('  ' + pad(r.clicks, 5) + ' clk  ' + pad(r.impressions, 7) + ' imp  ' + pad((r.position || 0).toFixed(1), 6) + ' pos  ' + (r.keys[0] || '').slice(0, 80)));
  } catch (e) { console.log('\nSearch analytics skipped:', e.message); }

  // 3. Sitemap status
  try {
    const sm = await gscReq(token, 'GET', '/webmasters/v3/sites/' + SITE_ENC + '/sitemaps');
    const list = sm.sitemap || [];
    console.log('\n=== SITEMAPS (' + list.length + ') ===');
    list.slice(0, 15).forEach((s) => {
      console.log('  ' + pad(s.path.replace('https://mytriv.com', ''), 40) + ' ' + pad(s.lastSubmitted || '-', 12) + ' ' + pad(String(s.contentErrorCount || 0) + ' err', 8) + ' ' + (s.isPending ? 'PENDING' : 'OK'));
    });
  } catch (e) { console.log('\nSitemap status skipped:', e.message); }

  console.log('\nDone.');
})();