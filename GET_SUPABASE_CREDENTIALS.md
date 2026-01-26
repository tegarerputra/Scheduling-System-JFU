# Cara Mendapatkan Supabase Credentials

## Step-by-Step:

### 1. Buka Supabase Project
- Go to: https://supabase.com/dashboard
- Klik project kamu: **scheduling-system-JFU**

### 2. Get Project URL
1. Di sidebar kiri, klik **"Settings"** (icon ⚙️)
2. Klik **"API"**
3. Lihat bagian **"Project URL"**
4. Copy URL-nya (contoh: `https://abcdefghijk.supabase.co`)

### 3. Get Anon Key
1. Masih di halaman yang sama (Settings → API)
2. Scroll ke bawah ke bagian **"Project API keys"**
3. Cari key dengan label **"anon"** atau **"public"**
4. Klik icon copy di sebelah kanan key tersebut
5. Key-nya panjang, dimulai dengan `eyJ...`

### 4. Update File .env
1. Buka file `.env` di project kamu
2. Ganti nilai-nilai ini:
   - `VITE_SUPABASE_URL=` → paste Project URL
   - `VITE_SUPABASE_ANON_KEY=` → paste Anon Key

### 5. Save File

## Contoh .env yang Sudah Lengkap:

```env
# Supabase
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MzY0ODM2MzIsImV4cCI6MTk1MjA1OTYzMn0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google OAuth
VITE_GOOGLE_CLIENT_ID=451981591067-ngih5n6a343phr3tmbpumkuejmjsa1q8.apps.googleusercontent.com

# Google Calendar
VITE_SHARED_CALENDAR_ID=c_6788a2bdd3c617b3b7d755a3a6124305b8b4d3dc97717f528b943a9d10c55af3@group.calendar.google.com
```

---

## ✅ Setelah Update .env:

Restart dev server jika sudah running:
1. Stop server (Ctrl+C di terminal)
2. Start lagi: `npm run dev`

Atau jika belum running:
```bash
cd "/Users/jakpat/GarCode/Scheduling System 1.0"
npm run dev
```

Buka browser: http://localhost:5173
