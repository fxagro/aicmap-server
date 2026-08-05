// ga4_report.js - Pull GA4 analytics data (users, pages, conversions)
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const credFile = path.join(__dirname, 'gsc-credentials.json');
const configFile = path.join(__dirname, 'ga4-config.json');
const cred = JSON.parse(fs.readFileSync(credFile, 'utf8'));
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const { client_email, private_key, token_uri } = cred;
const { propertyId } = config;

const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

function b64u(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64u(JSON.stringify({ iss: client_email, scope: SCOPE, aud: token_uri, exp: now + 3600, iat: now }));
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

function apiPost(token, path, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: 'analyticsdata.googleapis.com',
      path: path,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch (e) { resolve({ status: res.statusCode, body: d.slice(0, 500) }); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('GA4 Report for:', config.property, '(' + config.measurementId + ')\n');

  const token = await getAccessToken();

  // 1. Overview (last 30 days)
  console.log('=== OVERVIEW (30 days) ===');
  const r1 = await apiPost(token, '/v1beta/properties/' + propertyId + ':runReport', {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
    ]
  });
  if (r1.status === 200 && r1.body.totals && r1.body.totals.length) {
    const m = r1.body.totals[0].metricValues;
    console.log('  Active users:', m[0]?.value || 0);
    console.log('  Sessions:', m[1]?.value || 0);
    console.log('  Page views:', m[2]?.value || 0);
    console.log('  Avg session (sec):', m[3]?.value || 0);
    console.log('  Bounce rate:', m[4]?.value || 0);
  } else {
    console.log('  No data yet (normal for new property)');
    console.log('  Status:', r1.status, JSON.stringify(r1.body).slice(0, 200));
  }

  // 2. Top pages
  console.log('\n=== TOP PAGES (30 days) ===');
  const r2 = await apiPost(token, '/v1beta/properties/' + propertyId + ':runReport', {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
    dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 15
  });
  if (r2.status === 200 && r2.body.rows) {
    r2.body.rows.forEach((r, i) => {
      console.log('  ' + (i+1) + '. ' + r.dimensionValues[0].value);
      console.log('     ' + r.dimensionValues[1].value);
      console.log('     Views: ' + r.metricValues[0].value + ' | Users: ' + r.metricValues[1].value);
    });
  }

  // 3. Booking clicks (custom event)
  console.log('\n=== BOOKING CLICKS (30 days) ===');
  const r3 = await apiPost(token, '/v1beta/properties/' + propertyId + ':runReport', {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'eventCount' }],
    dimensions: [{ name: 'eventName' }, { name: 'customEvent:partner' }],
    dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'booking_click' } } },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 20
  });
  if (r3.status === 200 && r3.body.rows && r3.body.rows.length) {
    r3.body.rows.forEach(r => {
      console.log('  ' + r.dimensionValues[1].value + ': ' + r.metricValues[0].value + ' clicks');
    });
  } else {
    console.log('  No booking clicks yet (users need to visit + click)');
  }

  // 4. Traffic sources
  console.log('\n=== TRAFFIC SOURCES (30 days) ===');
  const r4 = await apiPost(token, '/v1beta/properties/' + propertyId + ':runReport', {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'sessions' }],
    dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10
  });
  if (r4.status === 200 && r4.body.rows) {
    r4.body.rows.forEach((r, i) => {
      console.log('  ' + (i+1) + '. ' + r.dimensionValues[0].value + ' / ' + r.dimensionValues[1].value + ': ' + r.metricValues[0].value + ' sessions');
    });
  }

  // 5. Device breakdown
  console.log('\n=== DEVICES (30 days) ===');
  const r5 = await apiPost(token, '/v1beta/properties/' + propertyId + ':runReport', {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
    dimensions: [{ name: 'deviceCategory' }],
  });
  if (r5.status === 200 && r5.body.rows) {
    r5.body.rows.forEach(r => {
      console.log('  ' + r.dimensionValues[0].value + ': ' + r.metricValues[0].value + ' sessions, ' + r.metricValues[1].value + ' users');
    });
  }

  console.log('\nDone.');
})();
