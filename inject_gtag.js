// inject_gta4.js - Inject gtag into seo.js
'use strict';
const fs = require('fs');
const file = '/srv/aicmap-server/seo.js';
const html = fs.readFileSync(file, 'utf8');
if (html.includes('G-5QCP5QF51T')) { console.log('gtag already present, skipping'); process.exit(0); }
const gtag = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-5QCP5QF51T"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-5QCP5QF51T', { send_page_view: true, cookie_flags: 'SameSite=None;Secure' });
document.addEventListener('click', function(e) {
  var el = e.target.closest('a[href*="/go?u="]');
  if (el) {
    var partner = el.className.match(/booking|agoda|traveloka|trip\\.com|expedia/) || ['unknown'];
    gtag('event', 'booking_click', { partner: partner[0], hotel: location.pathname.split('/').pop(), outbound_url: el.href });
  }
});
</script>`;
const tag = '<meta name="robots" content="index,follow">';
const idx = html.indexOf(tag);
if (idx === -1) { console.error('robots meta not found'); process.exit(1); }
const newHtml = html.slice(0, idx + tag.length) + '\n' + gtag + html.slice(idx + tag.length);
fs.writeFileSync(file, newHtml);
console.log('gtag injected at line', (newHtml.slice(0, idx + tag.length).split('\n').length));
