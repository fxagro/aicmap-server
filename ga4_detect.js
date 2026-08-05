// ga4_detect.js - Detect GA4 accounts, properties, data streams, test Data API
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
  const claim = b64u(JSON.stringify({
    iss: client_email,
    scope: scope,
    aud: token_uri,
    exp: now + 3600,
    iat: now
  }));
  const data = header + '.' + claim;
  const sig = require('crypto').createSign('RSA-SHA256').update(data).sign(private_key);
  const jwt = data + '.' + b64u(sig);

  return new Promise((resolve, reject) => {
    const body = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + encodeURIComponent(jwt);
    const u = new URL(token_uri);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.access_token) resolve(j.access_token);
          else reject(new Error('token error: ' + d.slice(0, 200)));
        } catch (e) { reject(new Error('parse: ' + d.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function apiGet(token, hostname, apiPath) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: hostname,
      path: apiPath,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d.slice(0, 500) }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function apiPost(token, hostname, apiPath, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: hostname,
      path: apiPath,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d.slice(0, 500) }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  const READ = 'https://www.googleapis.com/auth/analytics.readonly';
  const EDIT = 'https://www.googleapis.com/auth/analytics.edit';

  console.log('Authenticating...');
  const readTok = await getAccessToken(READ);
  const editTok = await getAccessToken(EDIT);
  console.log('Token OK');

  // 1. List accounts
  console.log('\n=== ACCOUNTS ===');
  const la = await apiGet(readTok, 'analyticsadmin.googleapis.com', '/v1beta/accounts');
  console.log('Status:', la.status);
  if (la.status !== 200) { console.log('Error:', JSON.stringify(la.body).slice(0, 400)); return; }
  const accounts = la.body.accounts || [];
  console.log('Found:', accounts.length, 'account(s)');
  accounts.forEach(a => console.log('  ' + a.name + ' | ' + a.displayName));

  if (!accounts.length) { console.log('No accounts found. SA may not be added yet.'); return; }

  // 2. List properties for each account
  console.log('\n=== PROPERTIES ===');
  const allProperties = [];
  for (const acct of accounts) {
    const lp = await apiGet(readTok, 'analyticsadmin.googleapis.com', '/v1beta/' + acct.name + '/properties');
    const props = lp.body.properties || [];
    console.log(acct.displayName + ':', props.length, 'property(ies)');
    props.forEach(p => {
      console.log('  ' + p.name + ' | ' + p.displayName);
      allProperties.push(p);
    });
  }

  if (!allProperties.length) { console.log('No properties found.'); return; }

  // 3. For each property: data streams + Data API test
  for (const prop of allProperties) {
    const pid = prop.name.split('/')[1];
    console.log('\n=== PROPERTY: ' + prop.displayName + ' (ID: ' + pid + ') ===');

    // Data streams
    const ds = await apiGet(readTok, 'analyticsadmin.googleapis.com', '/v1beta/' + prop.name + '/dataStreams');
    const streams = ds.body.dataStreams || [];
    console.log('Data streams:', streams.length);
    for (const s of streams) {
      console.log('  ' + s.name + ' | type=' + s.type + ' | displayName=' + s.displayName);
      if (s.webStreamData) {
        console.log('  measurementId:', s.webStreamData.measurementId);
        console.log('  defaultUri:', s.webStreamData.defaultUri);
        console.log('  streamId:', s.name);
      }
    }

    // Data API test
    console.log('\n  Testing Data API...');
    const rpt = await apiPost(readTok, 'analyticsdata.googleapis.com', '/v1beta/properties/' + pid + ':runReport', {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }, { name: 'sessions' }],
    });
    console.log('  Status:', rpt.status);
    if (rpt.status === 200) {
      const rows = rpt.body.rows || [];
      const totals = rpt.body.totals || [];
      console.log('  ✅ Data API works!');
      if (totals.length) {
        const m = totals[0].metricValues;
        console.log('    activeUsers:', m[0]?.value);
        console.log('    screenPageViews:', m[1]?.value);
        console.log('    sessions:', m[2]?.value);
      }
      // Save config
      const cfg = {
        account: acct.name,
        property: prop.name,
        propertyId: pid,
        displayName: prop.displayName,
        measurementId: streams[0]?.webStreamData?.measurementId || 'unknown',
        dataStream: streams[0]?.name || 'unknown',
        defaultUri: streams[0]?.webStreamData?.defaultUri || '',
      };
      fs.writeFileSync(path.join(__dirname, 'ga4-config.json'), JSON.stringify(cfg, null, 2));
      console.log('\n  Saved ga4-config.json');
    } else {
      console.log('  Error:', JSON.stringify(rpt.body).slice(0, 300));
    }
  }
})();
