-- Island-level region markers (searchable island destinations)
-- Run idempotently: ON CONFLICT (slug, country_code) DO NOTHING
INSERT INTO cities (name, slug, country_code, lat, lng, region, population, hotel_count)
VALUES ('Bali', 'bali', 'ID', -8.4095, 115.1889, 'Bali', 4300000, 4664)
ON CONFLICT (slug, country_code) DO NOTHING;
INSERT INTO cities (name, slug, country_code, lat, lng, region, population, hotel_count)
VALUES ('Java', 'java', 'ID', -7.4917, 110.0044, 'Java', 145000000, 2679)
ON CONFLICT (slug, country_code) DO NOTHING;
