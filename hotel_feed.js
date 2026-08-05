// hotel_feed.js - Generate Google Merchant Center hotel feed (XML)
'use strict';
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap'
});

const SITE = 'https://mytriv.com';

function escXml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

(async () => {
  console.log('Generating Google Merchant Center hotel feed...\n');

  // Fetch hotels with city/country info
  const { rows: hotels } = await pool.query(`
    SELECT h.id, h.name, h.slug, h.city, h.country, h.stars, h.rating, h.reviews,
           h.price_idr, h.price_formatted, h.currency, h.image, h.address,
           h.lat, h.lng, h.amenities, h.description, h.region
    FROM hotels h
    WHERE h.slug IS NOT NULL AND h.name IS NOT NULL
    ORDER BY h.rating DESC NULLS LAST, h.reviews DESC NULLS LAST
    LIMIT 5000
  `);

  console.log('Hotels fetched:', hotels.length);

  // Generate XML feed
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">');
  lines.push('<channel>');
  lines.push('  <title>MyTriv Hotels</title>');
  lines.push('  <link>' + SITE + '</link>');
  lines.push('  <description>270,000+ hotel deals from 8 OTAs</description>');

  for (const h of hotels) {
    const url = SITE + '/hotel/' + h.slug;
    const imageUrl = h.image || (SITE + '/hotels/og-default.jpg');
    const price = h.price_idr ? Math.round(h.price_idr) : 0;
    const priceStr = price > 0 ? price : 0;
    const stars = h.stars || 3;
    const rating = h.rating ? Math.round(h.rating * 10) / 10 : 0;
    const condition = 'new';
    const availability = 'in stock';
    const brand = 'MyTriv Hotels';

    lines.push('  <item>');
    lines.push('    <g:id>' + escXml(h.id) + '</g:id>');
    lines.push('    <g:title>' + escXml(h.name) + '</g:title>');
    lines.push('    <g:description>' + escXml((h.description || h.name + ' - Hotel in ' + h.city + ', ' + h.country).slice(0, 5000)) + '</g:description>');
    lines.push('    <g:link>' + escXml(url) + '</g:link>');
    lines.push('    <g:image_link>' + escXml(imageUrl) + '</g:image_link>');
    lines.push('    <g:availability>' + availability + '</g:availability>');
    lines.push('    <g:price>' + priceStr + '</g:price>');
    lines.push('    <g:currency>IDR</g:currency>');
    lines.push('    <g:brand>' + escXml(brand) + '</g:brand>');
    lines.push('    <g:condition>' + condition + '</g:condition>');
    if (h.stars) lines.push('    <g:loyalty_points>' + stars + '</g:loyalty_points>');
    if (rating > 0) lines.push('    <g:review_count>' + (h.reviews || 0) + '</g:review_count>');
    if (h.lat && h.lng) {
      lines.push('    <g:custom_label_0>' + escXml(h.country) + '</g:custom_label_0>');
      lines.push('    <g:custom_label_1>' + escXml(h.city) + '</g:custom_label_1>');
    }
    // Additional hotel-specific attributes
    if (h.amenities) {
      const amenities = Array.isArray(h.amenities) ? h.amenities : [];
      if (amenities.includes('wifi')) lines.push('    <g:custom_label_2>wifi</g:custom_label_2>');
      if (amenities.includes('pool')) lines.push('    <g:custom_label_3>pool</g:custom_label_3>');
    }
    lines.push('  </item>');
  }

  lines.push('</channel>');
  lines.push('</rss>');

  const xml = lines.join('\n');
  const outFile = path.join(__dirname, 'hotel-feed.xml');
  fs.writeFileSync(outFile, xml);
  console.log('Feed generated:', outFile);
  console.log('Total items:', hotels.length);
  console.log('File size:', (xml.length / 1024 / 1024).toFixed(2) + ' MB');
  console.log('\nNext steps:');
  console.log('1. Go to https://merchants.google.com/');
  console.log('2. Create Merchant Center account');
  console.log('3. Add feed: https://mytriv.com/hotel-feed.xml');
  console.log('4. Verify & claim website');
  console.log('5. Wait for Google review (24-48 hours)');

  await pool.end();
})();
