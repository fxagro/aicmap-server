// psi_audit.js - PageSpeed Insights audit for hotel pages
'use strict';
const https = require('https');
const { URL } = require('url');

const PSI_KEY = process.argv[2] || ''; // optional API key
const API_BASE = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

function psiFetch(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(API_BASE);
    const params = new URLSearchParams({ url, strategy: 'mobile', category: 'PERFORMANCE', category: 'ACCESSIBILITY', category: 'SEO', category: 'BEST_PRACTICES' });
    if (PSI_KEY) params.set('key', PSI_KEY);
    const path = u.pathname + '?' + params.toString();
    https.get({ hostname: u.hostname, path, timeout: 60000 }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(new Error('parse: ' + d.slice(0, 200))); } });
    }).on('error', reject);
  });
}

function getScore(lhr, cat) {
  const c = (lhr.categories || {})[cat];
  return c ? Math.round(c.score * 100) : null;
}

function getMetric(lhr, id) {
  const m = (lhr.audits || {})[id];
  return m ? m.displayValue || m.numericValue : '-';
}

(async () => {
  const urls = [
    'https://mytriv.com/',
    'https://mytriv.com/hotel/amanjiwo-magelang',
    'https://mytriv.com/hotel/ciputat-alila-scbd',
    'https://mytriv.com/hotels/indonesia',
    'https://mytriv.com/maps/jakarta',
  ];

  console.log('PageSpeed Insights Audit (mobile)\n');

  for (const url of urls) {
    console.log('=== ' + url.replace('https://mytriv.com', '') + ' ===');
    try {
      const r = await psiFetch(url);
      const lhr = r.lighthouseResult;
      if (!lhr) { console.log('  Error:', JSON.stringify(r).slice(0, 200)); continue; }
      console.log('  Performance:', getScore(lhr, 'performance') + '/100');
      console.log('  Accessibility:', getScore(lhr, 'accessibility') + '/100');
      console.log('  SEO:', getScore(lhr, 'seo') + '/100');
      console.log('  Best Practices:', getScore(lhr, 'best-practices') + '/100');
      console.log('  FCP:', getMetric(lhr, 'first-contentful-paint'));
      console.log('  LCP:', getMetric(lhr, 'largest-contentful-paint'));
      console.log('  CLS:', getMetric(lhr, 'cumulative-layout-shift'));
      console.log('  TBT:', getMetric(lhr, 'total-blocking-time'));
      console.log('  Speed Index:', getMetric(lhr, 'speed-index'));
    } catch (e) { console.log('  Error:', e.message); }
    console.log('');
  }
  console.log('Done.');
})();
