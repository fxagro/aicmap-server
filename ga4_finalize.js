// ga4_finalize.js - Get data streams, create if needed, test Data API
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const credFile = path.join(__dirname, 'gsc-credentials.json');
const cred = JSON.parse(fs.readFileSync(credFile, 'utf8'));
const { client_email, private_key, token_uri } = cred;

const PROPERTY_ID = '548627624';
const PROPERTY_NAME = 'properties/' + PROPERTY_ID;

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

function apiReq(token, hostname, apiPath, method, payload) {
  return new Promise((resolve, reject) => {
    const body = payload ? JSON.stringify(payload) : '';
    const opts = {
      hostname, path: apiPath, method: method || 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
    };
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);
    const req = https.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch (e) { resolve({ status: res.statusCode, body: d.slice(0, 500) }); } });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  const BOTH = 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics.edit';
  const tok = await getAccessToken(BOTH);
  console.log('Token OK\n');

  // 1. Get property details
  console.log('=== 1. PROPERTY DETAILS ===');
  const pd = await apiReq(tok, 'analyticsadmin.googleapis.com', '/v1beta/' + PROPERTY_NAME);
  console.log('Status:', pd.status);
  if (pd.status === 200) {
    console.log('  Name:', pd.body.displayName);
    console.log('  Type:', pd.body.propertyType);
    console.log('  Currency:', pd.body.currencyCode);
    console.log('  Timezone:', pd.body.timeZone);
  } else {
    console.log('  Error:', JSON.stringify(pd.body).slice(0, 300));
  }

  // 2. List data streams
  console.log('\n=== 2. DATA STREAMS ===');
  const ds = await apiReq(tok, 'analyticsadmin.googleapis.com', '/v1beta/' + PROPERTY_NAME + '/dataStreams');
  console.log('Status:', ds.status);
  const streams = ds.body.dataStreams || [];
  console.log('Found:', streams.length, 'stream(s)');
  let measurementId = null;
  let streamId = null;
  for (const s of streams) {
    console.log('  ' + s.name + ' | type=' + s.type + ' | ' + s.displayName);
    if (s.webStreamData) {
      measurementId = s.webStreamData.measurementId;
      streamId = s.name;
      console.log('  measurementId:', measurementId);
      console.log('  defaultUri:', s.webStreamData.defaultUri);
    }
  }

  // 3. Create web data stream if none exists
  if (!measurementId) {
    console.log('\n=== 3. CREATING WEB DATA STREAM ===');
    const cs = await apiReq(tok, 'analyticsadmin.googleapis.com', '/v1beta/' + PROPERTY_NAME + '/dataStreams', 'POST', {
      displayName: 'mytriv.com web',
      type: 'WEB_DATA_STREAM',
      webStreamData: { defaultUri: 'https://mytriv.com' }
    });
    console.log('Status:', cs.status);
    if (cs.status === 200) {
      measurementId = cs.body.webStreamData.measurementId;
      streamId = cs.body.name;
      console.log('  ✅ Created:', cs.body.name);
      console.log('  measurementId:', measurementId);
      console.log('  streamId:', streamId);
    } else {
      console.log('  Error:', JSON.stringify(cs.body).slice(0, 400));
    }
  }

  // 4. Test Data API
  console.log('\n=== 4. DATA API TEST ===');
  const rpt = await apiReq(tok, 'analyticsdata.googleapis.com', '/v1beta/properties/' + PROPERTY_ID + ':runReport', 'POST', {
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
      { name: 'sessions' },
      { name: 'averageSessionDuration' }
    ],
    limit: 10
  });
  console.log('Status:', rpt.status);
  if (rpt.status === 200) {
    console.log('  ✅ Data API works!');
    const totals = rpt.body.totals || [];
    if (totals.length) {
      console.log('  Totals (7 days):');
      console.log('    activeUsers:', totals[0].metricValues[0]?.value);
      console.log('    screenPageViews:', totals[0].metricValues[1]?.value);
      console.log('    sessions:', totals[0].metricValues[2]?.value);
      console.log('    avgSessionDuration:', totals[0].metricValues[3]?.value, 'sec');
    } else {
      console.log('  No data yet (property just created, normal)');
    }
    // Top pages report
    const rp2 = await apiReq(tok, 'analyticsdata.googleapis.com', '/v1beta/properties/' + PROPERTY_ID + ':runReport', 'POST', {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'screenPageViews' }],
      dimensions: [{ name: 'pagePath' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10
    });
    if (rp2.status === 200 && rp2.body.rows) {
      console.log('\n  Top pages:');
      rp2.body.rows.forEach((r, i) => {
        console.log('    ' + (i+1) + '. ' + r.dimensionValues[0].value + ' (' + r.metricValues[0].value + ' views)');
      });
    }
  } else {
    console.log('  Error:', JSON.stringify(rpt.body).slice(0, 400));
  }

  // 5. Save config
  if (measurementId) {
    const cfg = {
      account: 'accounts/403611706',
      property: PROPERTY_NAME,
      propertyId: PROPERTY_ID,
      measurementId: measurementId,
      dataStream: streamId,
      gtagUrl: 'https://www.googletagmanager.com/gtag/js?id=' + measurementId
    };
    fs.writeFileSync(path.join(__dirname, 'ga4-config.json'), JSON.stringify(cfg, null, 2));
    console.log('\n=== CONFIG SAVED: ga4-config.json ===');
    console.log(JSON.stringify(cfg, null, 2));
  }
})();
