# Panduan Deployment ke Vercel (Gratis Domain & SSL)

Rekomendasi terbaik untuk project Vite + React + Supabase adalah menggunakan **Vercel**.
- **Gratis**: Hosting selamanya untuk hobby/personal.
- **Mudah**: Terintegrasi native dengan Vite.
- **Fitur**: Otomatis deploy saat push ke GitHub, HTTPS (SSL) otomatis, dan domain gratis (`nama-project.vercel.app`).

## Langkah-langkah Deployment

### 1. Persiapan Git (Version Control)
Saat ini project belum terhubung ke Git. Kita perlu inisialisasi dulu.
*(Saya bisa bantu lakukan ini langsung di terminal)*

```bash
git init
git add .
git commit -m "Initial commit: Ready for deploy"
```

### 2. Push ke GitHub
1. Buat repository baru di [GitHub.com](https://github.com/new).
   - Beri nama (misal: `scheduling-system`).
   - Jangan centang "Add README" dsb (biarkan kosong).
2. Salin link repository (HTTPS/SSH).
3. Hubungkan project lokal ke GitHub:
   ```bash
   git remote add origin <LINK_REPOSITORY_ANDA>
   git branch -M main
   git push -u origin main
   ```

### 3. Deploy di Vercel
1. Buka [Vercel.com](https://vercel.com) dan login (bisa pakai akun GitHub).
2. Klik **"Add New..."** > **"Project"**.
3. Pilih repository `scheduling-system` yang baru dibuat > Klik **Import**.

### 4. Konfigurasi Environment Variables (PENTING!)
Project ini menggunakan Supabase, jadi Vercel perlu tahu API Keys yang ada di file `.env`.
Di halaman konfigurasi "Configure Project":
1. Buka bagian **Environment Variables**.
2. Masukkan semua key yang ada di file `.env` lokal Anda:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_SHARED_CALENDAR_ID`
   
   *(Salin nilai-nilainya dari file `.env` di komputer Anda)*
   
> **Catatan**: Jangan ikutkan file `.env` ke GitHub (sudah ada di .gitignore), tapi masukkan isinya manual ke dashboard Vercel.

### 5. Deploy
Klik tombol **Deploy**. Tunggu sebentar, dan website akan live di `https://scheduling-system-namaanda.vercel.app`.
