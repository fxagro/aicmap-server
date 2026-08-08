#!/bin/bash
cd /srv/aicmap-server
echo "[$(date)] Running Daily SEO Growth Analytics & GSC/GA4 Monitoring..." >> /var/log/seo_daily.log
/usr/bin/node seo_growth.js >> /var/log/seo_daily.log 2>&1
