#!/bin/bash
cd /srv/aicmap-server
echo "[$(date)] Running Daily Google Search Console Sitemap Refresh & SEO Analytics..." >> /var/log/seo_daily.log
/usr/bin/node gsc_submit_sitemaps.js >> /var/log/seo_daily.log 2>&1
/usr/bin/node seo_growth.js >> /var/log/seo_daily.log 2>&1
