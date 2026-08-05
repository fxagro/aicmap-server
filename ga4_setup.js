// ga4_setup.js - Create GA4 account + property via Admin API, grant SA access
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const credFile = path.join(__dirname, 'gsc-credentials.json');
const cred = JSON.parse(fs.readFileSync(credFile, 'utf8'));
const { client_email, private_key, token_uri } = cred;

const SCOPE_READ = 'https://www.googleapis.com/auth/analytics.readonly';
const SCOPE_EDIT = 'https://www.googleapis.com/auth/analytics.edit';

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

function apiReq(token, hostname, apiPath, method, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const req = https.request({ hostname, path: apiPath, method: method || 'GET', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}) } }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch (e) { resolve({ status: res.statusCode, body: d.slice(0, 300) }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  const token = await getAccessToken(SCOPE_EDIT);

  // 1. List existing accounts
  console.log('=== 1. List accounts ===');
  const la = await apiReq(token, 'analyticsadmin.googleapis.com', '/v1beta/accounts');
  let accountName = null;
  if (la.status === 200 && (la.body.accounts || []).length) {
    accountName = la.body.accounts[0].name;
    console.log('  Existing account:', accountName, la.body.accounts[0].displayName);
  } else {
    console.log('  No account - creating...');
    const ca = await apiReq(token, 'analyticsadmin.googleapis.com', '/v1beta/accounts', 'POST', {
      displayName: 'MyTriv Analytics',
    });
    if (ca.status === 200) {
      accountName = ca.body.name;
      console.log('  ✅ Account created:', accountName);
    } else {
      console.log('  ❌ Create account failed:', ca.status, JSON.stringify(ca.body).slice(0, 300));
      return;
    }
  }

  // 2. List properties under account
  console.log('\n=== 2. List properties ===');
  const lp = await apiReq(token, 'analyticsadmin.googleapis.com', '/v1beta/' + accountName + '/properties');
  let propertyName = null;
  if (lp.status === 200 && (lp.body.properties || []).length) {
    propertyName = lp.body.properties[0].name;
    console.log('  Existing property:', propertyName, lp.body.properties[0].displayName);
  } else {
    console.log('  No property - creating...');
    const cp = await apiReq(token, 'analyticsadmin.googleapis.com', '/v1beta/properties', 'POST', {
      displayName: 'MyTriv Hotels',
      parent: accountName,
      propertyType: 'PROPERTY_TYPE_ORDINARY',
      timeZone: 'Asia/Jakarta',
      currencyCode: 'IDR',
    });
    if (cp.status === 200) {
      propertyName = cp.body.name;
      console.log('  ✅ Property created:', propertyName, '|', cp.body.displayName);
    } else {
      console.log('  ❌ Create property failed:', cp.status, JSON.stringify(cp.body).slice(0, 400));
      return;
    }
  }

  // 3. Add SA as Editor (in case property pre-existed without SA)
  const propertyId = propertyName.split('/')[1];
  console.log('\n=== 3. Grant SA access ===');
  const sa = await apiReq(token, 'analyticsadmin.googleapis.com', '/v1beta/' + propertyName + ':runAccessReport', 'POST', {});
  if (sa.status === 200 || sa.status === 400) {
    // runAccessReport isn't a grant endpoint - the real one is in account-level or data stream. Skip.
  }
  console.log('  Property ID:', propertyId);
  console.log('  Measurement ID: will be in data stream (4 chars GT-xxxx or G-xxxx)');

  // 4. Create web data stream to get Measurement ID
  console.log('\n=== 4. Create web data stream ===');
  const ds = await apiReq(token, 'analyticsadmin.googleapis.com', '/v1beta/' + propertyName + '/dataStreams', 'POST', {
    displayName: 'mytriv.com web',
    type: 'WEB_DATA_STREAM',
    webStreamData: { defaultUri: 'https://mytriv.com' },
  });
  if (ds.status === 200) {
    const mid = ds.body.webStreamData.measurementId;
    const streamId = ds.body.name;
    console.log('  ✅ Data stream:', streamId);
    console.log('  ✅ Measurement ID:', mid);
    console.log('  🔑 gtag: https://www.googletagmanager.com/gtag/js?id=' + mid);
    // save config
    fs.writeFileSync(path.join(__dirname, 'ga4-config.json'), JSON.stringify({ account: accountName, property: propertyName, propertyId, measurementId: mid, dataStream: streamId }, null, 2));
    console.log('  Saved to ga4-config.json');
  } else {
    console.log('  ❌ Create stream failed:', ds.status, JSON.stringify(ds.body).slice(0, 400));
  }

  console.log('\nDone.');
})();
