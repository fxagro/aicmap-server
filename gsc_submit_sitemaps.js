// gsc_submit_sitemaps.js - Submit hotel sitemaps to Google Search Console
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const credFile = path.join(__dirname, 'gsc-credentials.json');
const SITE = 'sc-domain:mytriv.com';
const SITE_ENC = SITE.replace(/:/g, '%3A');

const cred = JSON.parse(fs.readFileSync(credFile, 'utf8'));
const { client_email, private_key, token_uri } = cred;

function b64u(buf) { return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function jwtHeader() { return b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' })); }
function jwtClaim() {
  const now = Math.floor(Date.now() / 1000);
  return b64u(JSON.stringify({ iss: client_email, scope: 'https://www.googleapis.com/auth/webmasters', aud: token_uri, exp: now + 3600, iat: now }));
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
      res.on('end', () => { try { resolve(JSON.parse(d).access_token); } catch (e) { reject(new Error('token: ' + d.slice(0, 200))); } });
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
          if (res.statusCode >= 400) return reject(new Error('GSC ' + res.statusCode + ': ' + (j.error ? j.error.message : d.slice(0, 300))));
          resolve(j);
        } catch (e) { reject(new Error('parse: ' + d.slice(0, 300))); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  console.log('Authenticating...');
  const token = await getAccessToken();

  // Sitemaps to submit
  const sitemaps = [
    '/sitemap/hotels/id/1',
    '/sitemap/hotels/id/2',
    '/sitemap/hotels/id/3',
    '/sitemap/hotels/en/1',
    '/sitemap/hotels/en/2',
    '/sitemap/hotels/en/3',
    '/sitemap/countries.xml',
    '/sitemap/cities.xml',
  ];

  console.log('\nSubmitting sitemaps to GSC...');
  for (const sm of sitemaps) {
    const url = 'https://mytriv.com' + sm;
    try {
      await gscReq(token, 'PUT', '/webmasters/v3/sites/' + SITE_ENC + '/sitemaps/' + encodeURIComponent(url));
      console.log('  ✓', sm);
    } catch (e) {
      console.log('  ✗', sm, '-', e.message);
    }
  }

  // Verify submitted sitemaps
  console.log('\nVerifying submitted sitemaps...');
  try {
    const sm = await gscReq(token, 'GET', '/webmasters/v3/sites/' + SITE_ENC + '/sitemaps');
    const list = sm.sitemap || [];
    console.log('Total sitemaps in GSC:', list.length);
    list.forEach((s) => {
      const path = s.path.replace('https://mytriv.com', '');
      console.log('  ' + (s.isPending ? '⏳' : '✅') + ' ' + path + ' (submitted: ' + (s.lastSubmitted || 'never') + ', errors: ' + (s.contentErrorCount || 0) + ')');
    });
  } catch (e) { console.log('Verify error:', e.message); }

  // Check current index coverage
  console.log('\nChecking index coverage (sample pages)...');
  const sampleUrls = [
    'https://mytriv.com/hotel/amanjiwo-magelang',
    'https://mytriv.com/hotel/ciputat-alila-scbd',
    'https://mytriv.com/en/hotel/ciputat-alila-scbd',
    'https://mytriv.com/hotels/indonesia/bali',
  ];
  for (const u of sampleUrls) {
    try {
      const r = await gscReq(token, 'POST', '/v1/urlInspection/index:inspect', { inspectionUrl: u, siteUrl: SITE });
      const idx = (r.inspectionResult || {}).indexStatusResult || {};
      console.log('  ' + u.replace('https://mytriv.com', '') + ' → ' + (idx.verdict || 'unknown') + ' | ' + (idx.coverageState || '-'));
    } catch (e) { console.log('  ' + u + ' → error: ' + e.message); }
  }

  console.log('\nDone.');
})();
