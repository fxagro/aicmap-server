// gsc_index_urls.js - Submit top hotel URLs to Google Indexing API
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const credFile = path.join(__dirname, 'gsc-credentials.json');
const SITE = 'sc-domain:mytriv.com';

const cred = JSON.parse(fs.readFileSync(credFile, 'utf8'));
const { client_email, private_key, token_uri } = cred;

function b64u(buf) { return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function jwtHeader() { return b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' })); }
function jwtClaim() {
  const now = Math.floor(Date.now() / 1000);
  return b64u(JSON.stringify({ iss: client_email, scope: 'https://www.googleapis.com/auth/indexing', aud: token_uri, exp: now + 3600, iat: now }));
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

function indexingReq(token, method, apiUrl, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(apiUrl);
    const payload = body ? JSON.stringify(body) : '';
    const req = https.request({ hostname: u.hostname, path: u.pathname + u.search, method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { reject(new Error('parse: ' + d.slice(0, 300))); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

function parseSitemap(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) urls.push(m[1].trim());
  return urls;
}

(async () => {
  console.log('Authenticating...');
  const token = await getAccessToken();
  console.log('Token OK');

  // Fetch all hotel URLs from sitemaps
  const sitemaps = [
    '/sitemap/hotels/id/1',
    '/sitemap/hotels/id/2',
    '/sitemap/hotels/id/3',
    '/sitemap/hotels/en/1',
    '/sitemap/hotels/en/2',
    '/sitemap/hotels/en/3',
  ];

  console.log('\nFetching sitemaps...');
  let allUrls = [];
  for (const sm of sitemaps) {
    const xml = await fetchUrl('https://mytriv.com' + sm);
    const urls = parseSitemap(xml);
    allUrls = allUrls.concat(urls);
    console.log('  ' + sm + ': ' + urls.length + ' URLs');
  }
  console.log('Total URLs: ' + allUrls.length);

  // Sample top 100 URLs for indexing submission (Indexing API allows 200/day)
  const sample = allUrls.slice(0, 100);

  console.log('\nSubmitting to Indexing API (batch of ' + sample.length + ')...');
  let ok = 0, fail = 0;
  for (let i = 0; i < sample.length; i++) {
    const url = sample[i];
    try {
      const r = await indexingReq(token, 'POST', 'https://indexing.googleapis.com/v3/urlNotifications:publish', {
        url: url,
        type: 'URL_UPDATED'
      });
      if (r.urlNotificationMetadata && r.urlNotificationMetadata.latestUpdate) {
        ok++;
      } else {
        fail++;
        console.log('  [' + (i+1) + '] unexpected:', JSON.stringify(r).slice(0, 100));
      }
    } catch (e) {
      fail++;
      if (i < 3) console.log('  [' + (i+1) + '] error:', e.message);
    }
    // Rate limit: small delay
    if (i % 50 === 49) {
      console.log('  Progress: ' + (i+1) + '/' + sample.length + ' (ok=' + ok + ', fail=' + fail + ')');
    }
  }

  console.log('\n=== Results ===');
  console.log('Submitted: ' + ok + ' OK, ' + fail + ' failed, total ' + sample.length);
  console.log('Daily limit: 200 URLs/day');
  console.log('All ' + allUrls.length + ' URLs in sitemap — submit remaining tomorrow');
})();
