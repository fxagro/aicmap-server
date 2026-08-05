// ga4_list_v2.js - Try listing with edit scope + try known GA4 patterns
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const credFile = path.join(__dirname, 'gsc-credentials.json');
const cred = JSON.parse(fs.readFileSync(credFile, 'utf8'));
const { client_email, private_key, token_uri } = cred;

function b64u(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function getAccessToken(scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64u(JSON.stringify({ iss: client_email, scope, aud: token_uri, exp: now + 3600, iat: now }));
  const data = header + '.' + claim;
  const sig = require('crypto').createSign('RSA-SHA256').update(data).sign(private_key);
  const jwt = data + '.' + b64u(sig);
  return new Promise((resolve, reject) => {
    const body = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + encodeURIComponent(jwt);
    const u = new URL(token_uri);
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { try { resolve(JSON.parse(d).access_token); } catch (e) { reject(new Error('token: ' + d.slice(0, 200))); } });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

function apiGet(token, hostname, apiPath) {
  return new Promise((resolve, reject) => {
    https.get({ hostname, path: apiPath, headers: { 'Authorization': 'Bearer ' + token } }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch (e) { resolve({ status: res.statusCode, raw: d.slice(0, 500) }); } });
    }).on('error', reject);
  });
}

(async () => {
  // Try with edit scope
  const EDIT = 'https://www.googleapis.com/auth/analytics.edit';
  const READ = 'https://www.googleapis.com/auth/analytics.readonly';
  const both = READ + ' ' + EDIT;

  console.log('=== With combined scope ===');
  const tok = await getAccessToken(both);

  // List accounts
  const la = await apiGet(tok, 'analyticsadmin.googleapis.com', '/v1beta/accounts');
  console.log('Accounts:', la.status, JSON.stringify(la.body, null, 2).slice(0, 300));

  // Try account properties endpoint with pageSize
  const r1 = await apiGet(tok, 'analyticsadmin.googleapis.com', '/v1beta/accounts/403611706/properties?pageSize=200&order=createTime%20desc');
  console.log('\nAccount properties:', r1.status, JSON.stringify(r1.body || r1.raw, null, 2).slice(0, 500));

  // Try searching by displayName
  const r2 = await apiGet(tok, 'analyticsadmin.googleapis.com', '/v1beta/accountSummaries');
  console.log('\nAccount summaries:', r2.status, JSON.stringify(r2.body || r2.raw, null, 2).slice(0, 500));

  // Try property summaries through accountSummary
  const r3 = await apiGet(tok, 'analyticsadmin.googleapis.com', '/v1beta/accountSummaries/accounts/403611706');
  console.log('\nAccount summary detail:', r3.status, JSON.stringify(r3.body || r3.raw, null, 2).slice(0, 500));
})();
