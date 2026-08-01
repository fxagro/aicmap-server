# ⚙️ MyTriv Virtual Hotel Monopoly Backend API & SSR Server

Selamat datang di repositori **Backend API & SSR Renderer** (`/srv/aicmap-server/`) untuk MyTriv Virtual Hotel Monopoly & Aggregator.

---

## 🏗️ Arsitektur Centralized Git 4-PC

Backend API ini dikelola dengan **Centralized Bare Git Repository** pada server VPS internal.

### 📌 Struktur Git Server:
- **Central Bare Repo**: `/srv/git/aicmap-server.git`
- **Live Production Path**: `/srv/aicmap-server` (Running PM2 process `aicmap-api` on Port `3099`)
- **Production Branch**: `ai-agent/hotels-monopoly`

---

## 🛠️ Alur Kerja Multi-PC (Branching Strategy)

Setiap PC / Developer / AI Agent bekerja pada branch masing-masing:
- **AI Agent**: `ai-agent/hotels-monopoly`
- **PC 1 (Developer A)**: `pc-win`
- **PC 2 (Developer B)**: `pc-mac`

### 📥 1. Cara Clone di PC Baru (Hanya 1x):
```bash
git clone ssh://root@194.163.138.207:48622/srv/git/aicmap-server.git
```

### 🌿 2. Buat Branch Sendiri:
```bash
git checkout -b <nama-pc-kamu>
git push -u origin <nama-pc-kamu>
```

### 🔄 3. Alur Pengembangan Harian:
1. **Pull Perubahan Terbaru**:
   ```bash
   git pull origin <nama-branch-kamu>
   ```
2. **Commit Pekerjaan**:
   ```bash
   git add .
   git commit -m "feat: deskripsi backend API"
   ```
3. **Push ke Server**:
   ```bash
   git push origin <nama-branch-kamu>
   ```

### 🚀 4. Cara Deploy ke Live Production Server:
Di server VPS (`/srv/aicmap-server`):
```bash
git pull origin ai-agent/hotels-monopoly && pm2 restart aicmap-api
```

---

## 🔑 Panduan Daftarkan SSH Key PC Baru

1. Di PC baru, buat SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "pc-nama@mytriv.com"
   ```
2. Salin isi file `~/.ssh/id_ed25519.pub`.
3. Tempelkan isi public key tersebut ke file `/root/.ssh/authorized_keys` di server VPS (`194.163.138.207`).
