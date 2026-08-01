# MyTriv Hotels — Backend API (aicmap-server)

Backend API untuk **MyTriv Global Hotel Map** (`mytriv.com/hotels`).
Menyediakan endpoint untuk fitur community (members/events/chat/leaderboard),
game Virtual Monopoly, aggregator hotel, dan integrasi Travelpayouts.

- **Port**: `3099` (diproxikan via nginx `/maps/api/` dan `/hotels/api/`)
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL (2 koneksi — `aicmap` & `mytriv` untuk SSO Edu)

## Struktur

```
/srv/aicmap-server/
├── server.js         # Seluruh endpoint API (single-file)
├── package.json
└── node_modules/
```

## Database

| Database | Koneksi | Fungsi |
|---|---|---|
| `aicmap` | `postgres://aicmap:MyTrivAI2026!@127.0.0.1:5432/aicmap` | Data utama app (default via `DATABASE_URL`) |
| `mytriv` | `postgres://mytriv:mytriv_password_2026@127.0.0.1:5432/mytriv` | SSO sync user Edu (default via `EDU_DATABASE_URL`) |

### Tabel di DB `aicmap`

| Tabel | Isi |
|---|---|
| `members` | Member global (join jaringan, titik di peta) |
| `events` | Event / meetup |
| `chat_messages` | Chat global |
| `edu_quizzes` | Kuis edukasi (reward TrivCoin) |
| `monopoly_players` | Pemain monopoly (saldo TrivCoin, tier) |
| `monopoly_properties` | Properti virtual (landmark/hotel) |
| `monopoly_listings` | Listing marketplace P2P |
| `token_transactions` | Riwayat transaksi TrivCoin |
| `hotels` | Katalog hotel kurasi dunia (64 hotel, 30+ kota) — sumber utama `/api/hotels/*` |

## Menjalankan

```bash
cd /srv/aicmap-server
npm install
pm2 start server.js --name aicmap-api
# atau langsung
node server.js
```

Akses health check: `curl http://127.0.0.1:3099/health`

## Daftar Endpoint

### Umum
| Method | Path | Keterangan |
|---|---|---|
| GET | `/health` | Health check |

### Auth / SSO
| Method | Path | Keterangan |
|---|---|---|
| POST | `/api/auth/sso-login` | Login SSO via email Edu MyTriv, sinkron tier & bonus TrivCoin |

### Monopoly
| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/monopoly/properties` | Semua properti + pemilik |
| GET | `/api/monopoly/player/:id` | State pemain + properti yang dimiliki |
| GET | `/api/monopoly/leaderboard` | Papan peringkat taipan (balance + jumlah properti) |
| POST | `/api/monopoly/roll-dice` | Kocok dadu, mendarat di properti, bayar sewa jika ada pemilik |
| POST | `/api/monopoly/buy-property` | Beli properti yang belum dimiliki |
| POST | `/api/monopoly/upgrade-property` | Upgrade level properti (biaya 50% harga) |
| POST | `/api/monopoly/answer-quiz` | Jawab kuis, reward TrivCoin jika benar |
| POST | `/api/monopoly/credit-subscription` | Simulasi subscribe, bonus TrivCoin sesuai tier |
| GET | `/api/monopoly/marketplace/listings` | Listing marketplace P2P yang aktif |
| POST | `/api/monopoly/marketplace/list-property` | Pasang properti di marketplace P2P |
| POST | `/api/monopoly/marketplace/buy-listing` | Beli properti dari marketplace P2P |

### Hotel
| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/hotels/search` | Cari hotel dari DB `hotels` (city, harga, bintang, amenity), fallback ke dataset statis jika kosong |
| GET | `/api/hotels/:id` | Detail hotel (dari DB, fallback ke dataset statis) |
| POST | `/api/hotels/redeem-trivcoin` | Tukar TrivCoin jadi voucher diskon hotel |

### Travelpayouts
| Method | Path | Keterangan |
|---|---|---|
| POST | `/api/travelpayouts/generate-link` | Generate partner link affiliate |
| GET | `/api/travelpayouts/hotels/live-city` | Hotel per kota — Hotellook API **dimatikan permanen sejak 20 Okt 2025**, endpoint ini kini memakai DB `hotels` sebagai sumber data + partner link |
| GET | `/api/travelpayouts/config` | Ambil konfigurasi (marker, enabled) |
| POST | `/api/travelpayouts/config` | Simpan konfigurasi |
| GET | `/api/travelpayouts/hotels/search` | Hotel search dengan affiliate URL |

> **Catatan Hotellook**: API `engine.hotellook.com` deprecated & nonaktif sejak 20 Okt 2025
> (affiliate program Hotellook ditutup total oleh Travelpayouts). Tidak ada API hotel pengganti
> dari Travelpayouts. Strategi: data hotel kurasi di tabel `hotels` + redirect booking
> langsung ke Agoda/Booking/Trip/Traveloka via partner link.

### Community
| Method | Path | Keterangan |
|---|---|---|
| GET/POST | `/api/members` | Ambil / daftar member global |
| GET/POST | `/api/events` | Ambil / buat event |
| GET/POST | `/api/chat` | Chat global |
| GET | `/api/leaderboard` | Leaderboard kota & negara |
| PATCH/DELETE | `/api/members/:id` | Verify / hapus member (admin token) |
| DELETE | `/api/events/:id` | Hapus event (admin token) |

> Endpoint admin memakai header `x-admin-token`. Nilai default token: `mytriv-admin-2026`
> (dapat di-override via env `AIMAP_ADMIN_TOKEN`).

## Deployment

- Dikelola dengan **PM2** sebagai proses `aicmap-api`.
- Nginx mem-proxy `/maps/api/` dan `/hotels/api/` ke `http://127.0.0.1:3099/api/`.

## Versi

Lihat `git log` untuk riwayat. Repo ini dipisah dari frontend (`/srv/mytriv.com/mytriv-landing/hotels/`).
