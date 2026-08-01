-- Hotels table schema for mytriv.com/hotels
CREATE TABLE IF NOT EXISTS public.hotels (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  city            VARCHAR(100) NOT NULL,
  country         VARCHAR(100) NOT NULL,
  lat             NUMERIC(10,7) NOT NULL,
  lng             NUMERIC(10,7) NOT NULL,
  stars           INTEGER NOT NULL DEFAULT 4,
  rating          NUMERIC(3,2) NOT NULL DEFAULT 4.0,
  reviews         INTEGER NOT NULL DEFAULT 0,
  price_idr       INTEGER NOT NULL,
  price_formatted VARCHAR(80),
  currency        VARCHAR(10) NOT NULL DEFAULT 'idr',
  image           TEXT,
  amenities       JSONB NOT NULL DEFAULT '[]'::jsonb,
  description     TEXT,
  source          VARCHAR(20) NOT NULL DEFAULT 'curated',
  created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hotels_city ON public.hotels (city);
CREATE INDEX IF NOT EXISTS idx_hotels_country ON public.hotels (country);
CREATE INDEX IF NOT EXISTS idx_hotels_price ON public.hotels (price_idr);
CREATE INDEX IF NOT EXISTS idx_hotels_stars ON public.hotels (stars);
