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
├── db/               # Skema & seed database (hotels, dsb.)
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
| `hotels` | Katalog hotel kurasi dunia (134k+ hotel, diimpor dari OSM/Overpass) — sumber utama `/api/hotels/*` |

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

## Kapasitas & Load Test

Dokumentasi hasil load test kapasitas server (6-core AMD EPYC, 11GB RAM).
Metode: `loadtest_param.js` — N concurrent x N rounds, header `X-Forwarded-For`
unik per request (simulasi user dari IP beda), test langsung ke port `3099`.

### Hasil Load Test (100 → 3000 concurrent)

| Concurrent | properties | leaderboard | search-china | search-indo | CPU | Pool DB | Status |
|---|---|---|---|---|---|---|---|
| 100 | 200/200 OK | 200/200 OK | 200/200 OK | 200/200 OK | 36% | 30 idle | ✅ Santai |
| 200 | 400/400 OK | 400/400 OK | 400/400 OK | 400/400 OK | 78% | 30 idle | ✅ Sehat |
| 500 | 1000/1000 OK | 1000/1000 OK | 1000/1000 OK | 1000/1000 OK | 100% (2s) | 30 idle | ✅ Aman |
| 1000 | 2000/2000 OK | 2000/2000 OK | 2000/2000 OK | 2000/2000 OK | 100% (12s) | 30 full | ⚠️ Tertekan |
| 2000 | 4000/4000 OK | 4000/4000 OK | 4000/4000 OK | 4000/4000 OK | 100% sustained | 30 full | 🔶 Di ambang |
| 3000 | 5791/6000 (209 ERR) | 6000/6000 | 6000/6000 | 3380/6000 (2620 ERR) | 100% + pool penuh | 30 full | ❌ BREAKING |

**Titik puncak: ~2,000–2,500 concurrent.** Di 3000 mulai timeout (pool DB 30 habis, CPU 100% sustained).

### Latency per endpoint (avg / p95)

| Endpoint | 100 | 500 | 1000 | 2000 |
|---|---|---|---|---|
| properties | 326ms | 462ms / 641ms | 854ms / 1370ms | 1479ms / 2560ms |
| leaderboard | 65ms | 196ms / 212ms | 408ms / 1162ms | 907ms / 1532ms |
| search-china | 204ms | 710ms / 1116ms | 1306ms / 2407ms | 2547ms / 4545ms |
| search-indo | 332ms | 1222ms / 2152ms | 2519ms / 4346ms | 4620ms / 8446ms |

### Bottleneck (urutan kritis)
1. **CPU** — query search (terutama Indonesia, 12.9k hotel) + count/sort bakar CPU; pool DB penuh 30 saat beban.
2. **Node single-instance** — satu process pakai 1 core saja; 6 core tidak terpakai penuh.
3. **Pool DB 30** — concurrent jauh > 30 koneksi → antrean timeout.
4. RAM masih lega (3.6GB/11GB) — bukan bottleneck.

### Rekomendasi Scaling
- **VERTICAL (scale-up) — gratis/murah dulu:**
  1. PM2 cluster mode (pakai 6 core) — `pm2 start server.js -i 6`.
  2. Naikkan pool DB ke ~50–60 (`max: 50`).
  3. Cache search 30s TTL untuk negara top (US, ID, TH).
  → Perkiraan naik ke **4,000–5,000 concurrent**.
- **HORIZONTAL (scale-out) — setelah ~3000 user:**
  4. Tambah server #2 + nginx upstream load balance (state DB eksternal + sesi Redis).
  5. Pisah PostgreSQL ke server sendiri + read replica → 8,000–10,000 concurrent.
- **Kapan beralih horizontal:** CPU 100% terus-menerus >5 menit saat peak + error rate >1%.

## Deployment

- Dikelola dengan **PM2** sebagai proses `aicmap-api`.
- Nginx mem-proxy `/maps/api/` dan `/hotels/api/` ke `http://127.0.0.1:3099/api/`.

## Versi

Lihat `git log` untuk riwayat. Repo ini dipisah dari frontend (`/srv/mytriv.com/mytriv-landing/hotels/`).
