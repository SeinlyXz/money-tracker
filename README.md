# Money Tracker

Simple SvelteKit money tracker untuk mencatat pengeluaran dan pemasukan. App ini memakai:

- SvelteKit 2 + Svelte 5
- Tailwind CSS 4
- Drizzle ORM
- SQLite via `better-sqlite3`
- DeepSeek Chat Completion JSON mode untuk input cepat
- PWA manifest + service worker untuk install ke iPhone/Android

## Setup

Install dependency:

```sh
bun install
```

Siapkan environment:

```sh
cp .env.example .env
```

Isi `DEEPSEEK_API_KEY` di `.env`. Form manual tetap berjalan tanpa API key, tetapi input cepat AI membutuhkan key.

```env
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
SQLITE_DB_PATH=./data/money-tracker.sqlite
```

Jalankan development server:

```sh
bun run dev
```

SQLite akan dibuat otomatis di `data/money-tracker.sqlite` saat app pertama kali dibuka.

## Scripts

```sh
bun run check
bun run lint
bun run build
```

## PWA di iPhone

Buka app dari Safari, lalu gunakan Share -> Add to Home Screen. App sudah memiliki manifest, apple touch icon, theme color, dan service worker cache dasar.

## Halaman

- `/` untuk dashboard ringkas dan quick add.
- `/add` untuk input cepat AI dan input manual.
- `/transactions` untuk riwayat transaksi dan hapus data.
- `/insights` untuk ringkasan dan kategori pengeluaran.
- `/profile` untuk set password lokal dan menambahkan passkey.

Navigasi utama tersedia sebagai bottom navbar agar nyaman dipakai satu tangan di iPhone.

Passkey membutuhkan secure context: HTTPS atau localhost. Saat dibuka dari iPhone melalui jaringan lokal biasa, browser bisa menolak WebAuthn jika origin tidak aman.
