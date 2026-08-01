-- Seed curated worldwide hotels into public.hotels
INSERT INTO public.hotels (name, city, country, lat, lng, stars, rating, reviews, price_idr, price_formatted, currency, image, amenities, description, source) VALUES
-- INDONESIA (existing + more)
('The Ritz-Carlton Jakarta Pacific Place', 'Jakarta', 'Indonesia', -6.2287, 106.8089, 5, 4.95, 980, 3400000, 'Rp 3,4jt', 'idr', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80', '["Pool","WiFi","Breakfast","Gym","Valet"]', 'Pengalaman menginap ultra-mewah di kawasan bisnis SCBD Jakarta.', 'curated'),
('The Mulia Resort Nusa Dua', 'Bali', 'Indonesia', -8.7951, 115.2289, 5, 4.98, 2310, 4200000, 'Rp 4,2jt', 'idr', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&auto=format&fit=crop&q=80', '["Private Beach","Infinity Pool","Spa","WiFi"]', 'Resort pantai bintang 5 terkemuka di Nusa Dua Bali menghadap Samudra Hindia.', 'curated'),
('Desa Potato Head Seminyak', 'Bali', 'Indonesia', -8.6791, 115.1528, 5, 4.85, 1750, 2850000, 'Rp 2,85jt', 'idr', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80', '["Beach Club","Pool","WiFi","Sunset Bar"]', 'Kawasan gaya hidup boutique hotel paling hits di pantai Seminyak Bali.', 'curated'),
('Padma Hotel Bandung', 'Bandung', 'Indonesia', -6.8523, 107.6074, 5, 4.91, 1890, 1650000, 'Rp 1,65jt', 'idr', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80', '["Heated Pool","Valley View","WiFi","Gym"]', 'Resort lereng lembah di Ciumbuleuit Bandung dengan kolam air hangat luar ruangan.', 'curated'),
('Mulia Senayan Jakarta', 'Jakarta', 'Indonesia', -6.2241, 106.7996, 5, 4.93, 2140, 2650000, 'Rp 2,65jt', 'idr', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&auto=format&fit=crop&q=80', '["Pool","Spa","City View","WiFi"]', 'Hotel ikonik di kawasan Segitiga Emas Jakarta dengan kolam renang skyline.', 'curated'),
('Amanjiwo Magelang', 'Yogyakarta', 'Indonesia', -7.6073, 110.2066, 5, 4.99, 410, 13500000, 'Rp 13,5jt', 'idr', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80', '["Temple View","Private Pool","Spa","Breakfast"]', 'Resort eksklusif di kaki Candi Borobudur dengan arsitektur gaya candi.', 'curated'),
('JW Marriott Surabaya', 'Surabaya', 'Indonesia', -7.2895, 112.7364, 5, 4.87, 1230, 1350000, 'Rp 1,35jt', 'idr', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&auto=format&fit=crop&q=80', '["Pool","Gym","Breakfast","WiFi"]', 'Hotel bisnis premium di jantung kota Surabaya.', 'curated'),
('The Trans Luxury Hotel Bandung', 'Bandung', 'Indonesia', -6.9484, 107.6177, 5, 4.94, 2680, 2200000, 'Rp 2,2jt', 'idr', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&auto=format&fit=crop&q=80', '["Waterpark","Pool","Spa","WiFi"]', 'Hotel mewah terintegrasi dengan pusat hiburan Trans Studio Bandung.', 'curated'),
('Alila Ubud', 'Bali', 'Indonesia', -8.4877, 115.2768, 5, 4.96, 1640, 3500000, 'Rp 3,5jt', 'idr', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80', '["Jungle View","Valley Pool","Spa","WiFi"]', 'Resort di tepi lembah Ayung Ubud dengan kolam infinity yang ikonik.', 'curated'),
('Pullman Central Park Jakarta', 'Jakarta', 'Indonesia', -6.1798, 106.7925, 5, 4.82, 3210, 1450000, 'Rp 1,45jt', 'idr', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80', '["Pool","City View","Gym","WiFi"]', 'Hotel modern menghadap CBD Podomoro City Jakarta Barat.', 'curated'),

-- JAPAN
('Aman Tokyo Otemachi', 'Tokyo', 'Japan', 35.6882, 139.7644, 5, 4.99, 620, 14500000, '¥ 140.000 (~Rp 14,5jt)', 'jpy', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80', '["Ryokan Onsen","City View","Spa","WiFi"]', 'Oase ketenangan zen di puncak Otemachi Tower Tokyo dengan panorama Gunung Fuji.', 'curated'),
('Park Hyatt Tokyo Shinjuku', 'Tokyo', 'Japan', 35.6852, 139.6909, 5, 4.92, 1450, 9800000, '¥ 95.000 (~Rp 9,8jt)', 'jpy', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80', '["Pool","Sky Lounge","Gym","WiFi"]', 'Hotel ikonik di Shinjuku Tokyo tempat lokasi film Lost in Translation.', 'curated'),
('Hoshinoya Kyoto Ryokan', 'Kyoto', 'Japan', 35.0116, 135.6777, 5, 4.97, 510, 12400000, '¥ 120.000 (~Rp 12,4jt)', 'jpy', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80', '["Traditional Onsen","River View","Kaiseki Dinner","WiFi"]', 'Ryokan tradisional tepi sungai Oi di Arashiyama Kyoto dengan akses perahu kayu.', 'curated'),
('The Prince Park Tower Tokyo', 'Tokyo', 'Japan', 35.6655, 139.7506, 5, 4.88, 2210, 7200000, '¥ 70.000 (~Rp 7,2jt)', 'jpy', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80', '["Tokyo Tower View","Pool","Spa","WiFi"]', 'Hotel menara di Taman Shiba menghadap Tokyo Tower.', 'curated'),
('InterContinental Hotel Osaka', 'Osaka', 'Japan', 34.7057, 135.5029, 5, 4.9, 1130, 5200000, '¥ 50.000 (~Rp 5,2jt)', 'jpy', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80', '["City View","Pool","Gym","WiFi"]', 'Hotel mewah di puncak Grand Front Osaka dengan pemandangan kota.', 'curated'),

-- SINGAPORE
('Marina Bay Sands Singapore', 'Singapore', 'Singapore', 1.2834, 103.8607, 5, 4.96, 5400, 7800000, 'S$ 680 (~Rp 7,8jt)', 'sgd', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&auto=format&fit=crop&q=80', '["Rooftop Infinity Pool","Casino","Shopping Mall","WiFi"]', 'Hotel ikonik Singapura dengan kolam renang infinity rooftop terbesar di dunia.', 'curated'),
('Raffles Hotel Singapore', 'Singapore', 'Singapore', 1.2949, 103.8545, 5, 4.98, 820, 11200000, 'S$ 980 (~Rp 11,2jt)', 'sgd', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80', '["Colonial Luxury","Long Bar","Spa","WiFi"]', 'Hotel bersejarah gaya kolonial abad ke-19 tempat lahirnya cocktail Singapore Sling.', 'curated'),
('Pan Pacific Singapore', 'Singapore', 'Singapore', 1.2921, 103.8576, 5, 4.89, 3120, 3600000, 'S$ 320 (~Rp 3,6jt)', 'sgd', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&auto=format&fit=crop&q=80', '["Harbour View","Pool","Spa","WiFi"]', 'Hotel ikonik di Marina Bay menghadap cakrawala pelabuhan Singapura.', 'curated'),

-- FRANCE
('The Ritz Paris Place Vendôme', 'Paris', 'France', 48.8681, 2.3284, 5, 4.97, 890, 18900000, '€ 1.150 (~Rp 18,9jt)', 'eur', 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=600&auto=format&fit=crop&q=80', '["Palace Status","Chanel Spa","WiFi","Gourmet Dining"]', 'Hotel paling legendaris di Place Vendôme Paris melambangkan keanggunan gaya Prancis.', 'curated'),
('Shangri-La Paris', 'Paris', 'France', 48.8635, 2.2896, 5, 4.95, 1320, 14500000, '€ 880 (~Rp 14,5jt)', 'eur', 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=600&auto=format&fit=crop&q=80', '["Eiffel Tower View","Spa","Pool","WiFi"]', 'Istana abad ke-19 menghadap Menara Eiffel di kawasan Trocadéro.', 'curated'),
('Four Seasons George V Paris', 'Paris', 'France', 48.8689, 2.3006, 5, 4.98, 1450, 16200000, '€ 990 (~Rp 16,2jt)', 'eur', 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=600&auto=format&fit=crop&q=80', '["Palace Status","Garden","Spa","WiFi"]', 'Hotel palace paling bergengsi di Avenue George V Paris.', 'curated'),

-- UNITED STATES
('The Plaza Hotel New York', 'New York', 'United States', 40.7645, -73.9745, 5, 4.91, 3200, 13500000, '$ 890 (~Rp 13,5jt)', 'usd', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&auto=format&fit=crop&q=80', '["Central Park View","Butler Service","Spa","WiFi"]', 'Hotel landmark legendaris New York di sudut Fifth Avenue dan Central Park.', 'curated'),
('The St. Regis New York', 'New York', 'United States', 40.7591, -73.9755, 5, 4.94, 1210, 15800000, '$ 1.050 (~Rp 15,8jt)', 'usd', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80', '["Butler Service","Gilded Age","Spa","WiFi"]', 'Hotel bersejarah bergaya Beaux-Arts di Fifth Avenue New York.', 'curated'),
('Bellagio Las Vegas', 'Las Vegas', 'United States', 36.1126, -115.1767, 5, 4.86, 18900, 4200000, '$ 280 (~Rp 4,2jt)', 'usd', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80', '["Fountain View","Casino","Pool","Spa"]', 'Resort kasino ikonik di Las Vegas Strip dengan air mancur menari.', 'curated'),
('The Beverly Hills Hotel', 'Los Angeles', 'United States', 34.0907, -118.4143, 5, 4.9, 1450, 12800000, '$ 850 (~Rp 12,8jt)', 'usd', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80', '["Pool","Celebrity Vibe","Garden","WiFi"]', 'Hotel selebriti ikonik di Sunset Boulevard Beverly Hills.', 'curated'),
('The Four Seasons Miami', 'Miami', 'United States', 25.7774, -80.1895, 5, 4.88, 2340, 7800000, '$ 520 (~Rp 7,8jt)', 'usd', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&auto=format&fit=crop&q=80', '["Ocean View","Pool","Spa","WiFi"]', 'Hotel menara mewah di Brickell Miami menghadap Biscayne Bay.', 'curated'),

-- UNITED KINGDOM
('The Ritz London', 'London', 'United Kingdom', 51.5072, -0.1418, 5, 4.93, 1180, 16500000, '£ 950 (~Rp 16,5jt)', 'gbp', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=80', '["Afternoon Tea","Louis XVI Decor","WiFi","Spa"]', 'Hotel paling mewah di Mayfair London dengan arsitektur Louis XVI.', 'curated'),
('The Savoy London', 'London', 'United Kingdom', 51.51, -0.1201, 5, 4.9, 1980, 14200000, '£ 820 (~Rp 14,2jt)', 'gbp', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=80', '["River View","Art Deco","Theatre","WiFi"]', 'Hotel mewah tepi Sungai Thames di kawasan Strand London.', 'curated'),

-- ITALY
('Hotel de Russie Rome', 'Rome', 'Italy', 41.9105, 12.4829, 5, 4.91, 1320, 9800000, '€ 600 (~Rp 9,8jt)', 'eur', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80', '["Secret Garden","Spa","Piazza View","WiFi"]', 'Hotel butik mewah dengan taman rahasia di dekat Piazza del Popolo Roma.', 'curated'),
('Belmond Hotel Cipriani Venice', 'Venice', 'Italy', 45.428, 12.3406, 5, 4.96, 890, 21200000, '€ 1.300 (~Rp 21,2jt)', 'eur', 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=600&auto=format&fit=crop&q=80', '["Lagoon View","Private Garden","Pool","Spa"]', 'Hotel legendaris di pulau Giudecca Venice dengan pemandangan laguna.', 'curated'),
('The Westin Excelsior Florence', 'Florence', 'Italy', 43.7696, 11.2494, 5, 4.88, 1560, 7600000, '€ 460 (~Rp 7,6jt)', 'eur', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&auto=format&fit=crop&q=80', '["Arno View","Historic","Roof Terrace","WiFi"]', 'Hotel bersejarah menghadap Sungai Arno dekat Ponte Vecchio Florence.', 'curated'),

-- SPAIN
('Mandarin Oriental Barcelona', 'Barcelona', 'Spain', 41.3891, 2.1715, 5, 4.93, 980, 9200000, '€ 560 (~Rp 9,2jt)', 'eur', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80', '["Rooftop Pool","Design","Spa","WiFi"]', 'Hotel desain di Passeig de Gràcia Barcelona dengan arsitektur karya Patricia Urquiola.', 'curated'),
('The Ritz Madrid', 'Madrid', 'Spain', 40.4168, -3.6901, 5, 4.89, 1450, 8400000, '€ 510 (~Rp 8,4jt)', 'eur', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80', '["Palace Status","Spa","Garden","WiFi"]', 'Palace hotel ikonik di jantung Madrid dekat Parque del Retiro.', 'curated'),

-- THAILAND
('The Siam Bangkok', 'Bangkok', 'Thailand', 13.7719, 100.4943, 5, 4.95, 1120, 6800000, '฿ 45.000 (~Rp 6,8jt)', 'thb', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80', '["River View","Pool","Spa","Art Deco"]', 'Resort mewah tepi Sungai Chao Phraya Bangkok bergaya Art Deco.', 'curated'),
('Mandarin Oriental Bangkok', 'Bangkok', 'Thailand', 13.7248, 100.5113, 5, 4.97, 2310, 8900000, '฿ 59.000 (~Rp 8,9jt)', 'thb', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=80', '["River View","Legendary","Spa","WiFi"]', 'Hotel paling legendaris di Bangkok menghadap Sungai Chao Phraya sejak 1876.', 'curated'),

-- MALAYSIA
('Mandarin Oriental Kuala Lumpur', 'Kuala Lumpur', 'Malaysia', 3.155, 101.7123, 5, 4.92, 2670, 3200000, 'RM 980 (~Rp 3,2jt)', 'myr', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&auto=format&fit=crop&q=80', '["Twin Towers View","Pool","Spa","WiFi"]', 'Hotel mewah di KLCC menghadap langsung Menara Kembar Petronas.', 'curated'),
('The Majestic Hotel Kuala Lumpur', 'Kuala Lumpur', 'Malaysia', 3.1439, 101.6958, 5, 4.9, 1780, 2400000, 'RM 740 (~Rp 2,4jt)', 'myr', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&auto=format&fit=crop&q=80', '["Colonial","Heritage","Afternoon Tea","WiFi"]', 'Hotel kolonial bersejarah bergaya Moorish di jantung Kuala Lumpur.', 'curated'),

-- AUSTRALIA
('Sydney Harbour Marriott', 'Sydney', 'Australia', -33.8606, 151.2119, 5, 4.87, 3240, 5200000, 'A$ 620 (~Rp 5,2jt)', 'aud', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&auto=format&fit=crop&q=80', '["Harbour View","Pool","Gym","WiFi"]', 'Hotel di Circular Quay Sydney dengan pemandangan Opera House dan Harbour Bridge.', 'curated'),
('The Langham Melbourne', 'Melbourne', 'Australia', -37.814, 144.9633, 5, 4.89, 1450, 4600000, 'A$ 550 (~Rp 4,6jt)', 'aud', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80', '["Yarra View","Pool","Spa","WiFi"]', 'Hotel mewah tepi Sungai Yarra di Southbank Melbourne.', 'curated'),

-- UAE
('Burj Al Arab Jumeirah', 'Dubai', 'United Arab Emirates', 25.1412, 55.1853, 7, 4.97, 8900, 24500000, 'AED 12.500 (~Rp 24,5jt)', 'aed', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&auto=format&fit=crop&q=80', '["Sail Shape","Private Beach","Butler","Aquarium"]', 'Hotel berbentuk layar paling ikonik di dunia di lepas pantai Dubai.', 'curated'),
('Atlantis The Palm Dubai', 'Dubai', 'United Arab Emirates', 25.1306, 55.1173, 5, 4.88, 12800, 12800000, 'AED 6.500 (~Rp 12,8jt)', 'aed', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&auto=format&fit=crop&q=80', '["Waterpark","Aquarium","Private Beach","Spa"]', 'Resort mewah di Palm Jumeirah dengan akuarium raksasa dan taman air.', 'curated'),

-- SOUTH KOREA
('The Shilla Seoul', 'Seoul', 'South Korea', 37.5547, 127.0035, 5, 4.93, 2350, 5600000, '₩ 560.000 (~Rp 5,6jt)', 'krw', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=80', '["City View","Pool","Spa","WiFi"]', 'Hotel mewah di Namsan Seoul dengan taman tradisional Korea.', 'curated'),
('Lotte Hotel Seoul', 'Seoul', 'South Korea', 37.5658, 126.981, 5, 4.88, 4320, 3800000, '₩ 380.000 (~Rp 3,8jt)', 'krw', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80', '["City View","Shopping","Pool","WiFi"]', 'Hotel menara bersejarah di jantung Myeongdong Seoul.', 'curated'),

-- HONG KONG
('The Peninsula Hong Kong', 'Hong Kong', 'Hong Kong', 22.2968, 114.1708, 5, 4.97, 3210, 11200000, 'HK$ 3.200 (~Rp 11,2jt)', 'hkd', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&auto=format&fit=crop&q=80', '["Harbour View","Rolls-Royce Fleet","Afternoon Tea","Spa"]', 'The Grande Dame of the Far East di Tsim Sha Tsui Hong Kong.', 'curated'),
('The Ritz-Carlton Hong Kong', 'Hong Kong', 'Hong Kong', 22.3036, 114.1606, 5, 4.95, 2780, 9800000, 'HK$ 2.800 (~Rp 9,8jt)', 'hkd', 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=600&auto=format&fit=crop&q=80', '["Sky Pool","Victoria Harbour","Spa","WiFi"]', 'Hotel tertinggi di dunia di lantai 102 ICC dengan pemandangan Victoria Harbour.', 'curated'),

-- GERMANY
('Hotel Adlon Kempinski Berlin', 'Berlin', 'Germany', 52.5165, 13.3789, 5, 4.91, 2130, 7200000, '€ 440 (~Rp 7,2jt)', 'eur', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=80', '["Brandenburg View","Spa","Historic","WiFi"]', 'Hotel legendaris di Unter den Linden Berlin menghadap Gerbang Brandenburg.', 'curated'),
('The Charles Hotel Munich', 'Munich', 'Germany', 48.1444, 11.5784, 5, 4.9, 1240, 6800000, '€ 415 (~Rp 6,8jt)', 'eur', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&auto=format&fit=crop&q=80', '["English Garden View","Spa","Pool","WiFi"]', 'Hotel butik mewah di Maximilianstrasse Munich menghadap English Garden.', 'curated'),

-- TURKEY
('Çirağan Palace Kempinski Istanbul', 'Istanbul', 'Turkey', 41.0436, 29.0135, 5, 4.96, 3420, 8600000, '€ 525 (~Rp 8,6jt)', 'eur', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80', '["Bosphorus View","Ottoman Palace","Pool","Spa"]', 'Istana Ottoman abad ke-19 di tepi Selat Bosphorus Istanbul.', 'curated'),
('The Ritz-Carlton Istanbul', 'Istanbul', 'Turkey', 41.0453, 28.9907, 5, 4.89, 1870, 5200000, '€ 320 (~Rp 5,2jt)', 'eur', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80', '["Bosphorus View","Spa","Pool","WiFi"]', 'Hotel mewah di atas bukit Maçka Istanbul menghadap Selat Bosphorus.', 'curated'),

-- MEXICO
('The Ritz-Carlton Cancún', 'Cancún', 'Mexico', 21.1134, -86.7684, 5, 4.94, 3560, 6400000, 'MX$ 12.000 (~Rp 6,4jt)', 'mxn', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&auto=format&fit=crop&q=80', '["Private Beach","Caribbean View","Pool","Spa"]', 'Resort tepi pantai Karibia di zona hotel Cancún.', 'curated'),

-- CANADA
('Fairmont Banff Springs', 'Banff', 'Canada', 51.1641, -115.5627, 5, 4.92, 4120, 5400000, 'C$ 780 (~Rp 5,4jt)', 'cad', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80', '["Mountain View","Castle Style","Hot Springs","Spa"]', 'Castle hotel ikonik di Pegunungan Rocky Kanada, dijuluki Castle in the Rockies.', 'curated'),
('Fairmont Château Lake Louise', 'Lake Louise', 'Canada', 51.4254, -116.1773, 5, 4.96, 2980, 7200000, 'C$ 1.040 (~Rp 7,2jt)', 'cad', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&auto=format&fit=crop&q=80', '["Lake View","Glacier View","Castle Style","Spa"]', 'Hotel kastil menghadap Danau Louise dengan air warna turquoise yang legendaris.', 'curated'),

-- SWITZERLAND
('Badrutt''s Palace St. Moritz', 'St. Moritz', 'Switzerland', 46.4983, 9.8401, 5, 4.97, 1230, 18500000, 'CHF 1.600 (~Rp 18,5jt)', 'chf', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=80', '["Lake View","Alpine","Spa","WiFi"]', 'Palace hotel legendaris sejak 1896 di jantung St. Moritz Swiss.', 'curated'),

-- EGYPT
('Mena House Cairo', 'Cairo', 'Egypt', 29.9861, 31.1301, 5, 4.93, 2450, 3600000, 'EGP 110.000 (~Rp 3,6jt)', 'egp', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80', '["Pyramid View","Historic","Pool","Spa"]', 'Hotel bersejarah dengan pemandangan langsung Piramida Giza.', 'curated'),

-- PORTUGAL
('Belmond Reid''s Palace Madeira', 'Funchal', 'Portugal', 32.6395, -16.9285, 5, 4.92, 1560, 6800000, '€ 415 (~Rp 6,8jt)', 'eur', 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=600&auto=format&fit=crop&q=80', '["Ocean View","Cliffside","Spa","Garden"]', 'Palace hotel bersejarah di tebing Madeira sejak 1891.', 'curated'),

-- VIETNAM
('Sofitel Legend Metropole Hanoi', 'Hanoi', 'Vietnam', 21.0267, 105.8558, 5, 4.94, 3120, 2400000, '₫ 6.500.000 (~Rp 2,4jt)', 'vnd', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=80', '["Colonial","Heritage","Pool","WiFi"]', 'Grand hotel kolonial Prancis bersejarah sejak 1901 di jantung Hanoi.', 'curated'),

-- PHILIPPINES
('The Peninsula Manila', 'Manila', 'Philippines', 14.5432, 121.0176, 5, 4.9, 1980, 3200000, '₱ 18.000 (~Rp 3,2jt)', 'php', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&auto=format&fit=crop&q=80', '["City View","Pool","Spa","WiFi"]', 'Hotel mewah ikonik di Makati Manila sejak 1976.', 'curated'),

-- NETHERLANDS
('Hotel Pulitzer Amsterdam', 'Amsterdam', 'Netherlands', 52.3738, 4.8907, 5, 4.91, 2450, 6200000, '€ 380 (~Rp 6,2jt)', 'eur', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&auto=format&fit=crop&q=80', '["Canal View","Boutique","Garden","WiFi"]', 'Hotel butik yang terdiri dari 25 kanal house bersejarah di Amsterdam.', 'curated'),

-- INDIA
('The Taj Mahal Palace Mumbai', 'Mumbai', 'India', 18.9218, 72.8343, 5, 4.96, 4320, 7200000, '₹ 72.000 (~Rp 7,2jt)', 'inr', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&auto=format&fit=crop&q=80', '["Harbour View","Historic","Pool","Spa"]', 'Hotel ikonik bersejarah sejak 1903 di tepi Gateway of India Mumbai.', 'curated'),
('The Leela Palace New Delhi', 'New Delhi', 'India', 28.5937, 77.2223, 5, 4.95, 2870, 6800000, '₹ 68.000 (~Rp 6,8jt)', 'inr', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80', '["Palace Style","Spa","Pool","WiFi"]', 'Palace hotel mewah di Diplomatic Enclave New Delhi.', 'curated'),

-- CHINA
('The Peninsula Shanghai', 'Shanghai', 'China', 31.2332, 121.4869, 5, 4.96, 2130, 9800000, 'CN¥ 5.800 (~Rp 9,8jt)', 'cny', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&auto=format&fit=crop&q=80', '["Bund View","Art Deco","Spa","WiFi"]', 'Hotel mewah di The Bund Shanghai menghadap sungai Huangpu.', 'curated'),

-- BRAZIL
('Copacabana Palace Rio', 'Rio de Janeiro', 'Brazil', -22.9672, -43.1781, 5, 4.93, 3450, 6800000, 'R$ 2.100 (~Rp 6,8jt)', 'brl', 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=600&auto=format&fit=crop&q=80', '["Beachfront","Art Deco","Pool","Spa"]', 'Palace hotel ikonik art deco di tepi Pantai Copacabana sejak 1923.', 'curated'),

-- SOUTH AFRICA
('The Silo Hotel Cape Town', 'Cape Town', 'South Africa', -33.9069, 18.424, 5, 4.97, 980, 9200000, 'R 16.000 (~Rp 9,2jt)', 'zar', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=80', '["Table Mountain View","Industrial Design","Rooftop Pool","WiFi"]', 'Hotel desain di dalam silo gandum bersejarah dengan pemandangan Table Mountain.', 'curated'),

-- NEW ZEALAND
('The Langham Auckland', 'Auckland', 'New Zealand', -36.8485, 174.7633, 5, 4.87, 1320, 4200000, 'NZ$ 580 (~Rp 4,2jt)', 'nzd', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&auto=format&fit=crop&q=80', '["City View","Pool","Spa","WiFi"]', 'Hotel mewah bergaya Victoria di pusat kota Auckland.', 'curated')
ON CONFLICT DO NOTHING;
