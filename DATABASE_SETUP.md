# 📊 Database Setup Guide - GeoCetak

Panduan lengkap untuk mengisi database dengan konten pembelajaran.

## 📋 Daftar Isi

1. [Struktur Database](#struktur-database)
2. [Cara Mengisi Database](#cara-mengisi-database)
3. [Verifikasi Data](#verifikasi-data)
4. [Troubleshooting](#troubleshooting)

---

## 🗄️ Struktur Database

### Table: `modules`
Menyimpan informasi modul pembelajaran (Tabung, Kerucut, Bola)

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key (auto-generated) |
| `title` | TEXT | Nama modul (misal: "Tabung") |
| `slug` | TEXT | URL-friendly identifier (misal: "tabung") |
| `description` | TEXT | Deskripsi modul |
| `icon_url` | TEXT | URL icon (nullable) |
| `order_index` | INTEGER | Urutan tampilan |
| `is_published` | BOOLEAN | Status publikasi |
| `created_at` | TIMESTAMP | Waktu dibuat |
| `updated_at` | TIMESTAMP | Waktu diupdate |

### Table: `lessons`
Menyimpan konten pembelajaran untuk setiap modul

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key (auto-generated) |
| `module_id` | UUID | Foreign key ke modules |
| `slug` | TEXT | URL-friendly identifier |
| `title` | TEXT | Judul lesson |
| `lesson_type` | TEXT | Tipe lesson (misal: "interactive") |
| `order_index` | INTEGER | Urutan lesson |
| `scene_config` | **JSONB** | **Konten pembelajaran (PENTING!)** |
| `estimated_duration_minutes` | INTEGER | Estimasi durasi (menit) |
| `xp_reward` | INTEGER | XP reward |
| `is_published` | BOOLEAN | Status publikasi |
| `created_at` | TIMESTAMP | Waktu dibuat |
| `updated_at` | TIMESTAMP | Waktu diupdate |

### ⚠️ PENTING: Struktur `scene_config` (JSONB)

Kolom `scene_config` menyimpan konten dalam format JSON dengan struktur:

```json
{
  "concept": {
    "title": "🎯 Konsep dan Unsur-unsur Tabung",
    "content": "<p>Penjelasan konsep...</p>",
    "elements": [
      {
        "type": "card",
        "title": "Judul Card",
        "content": "<p>Konten card...</p>"
      }
    ]
  },
  "net": {
    "title": "🔄 Jaring-jaring Tabung",
    "content": "<p>Penjelasan jaring-jaring...</p>"
  },
  "formula": {
    "title": "🧮 Penemuan Rumus Tabung",
    "content": "<p>Penjelasan rumus...</p>",
    "elements": [...]
  },
  "quiz": {
    "title": "📝 Quiz dan Latihan",
    "content": "<p>Soal latihan...</p>"
  }
}
```

Aplikasi akan mem-parsing `scene_config` menjadi `content` property secara otomatis.

---

## 🚀 Cara Mengisi Database

### Metode 1: Via Supabase SQL Editor (Recommended)

1. **Buka Supabase Dashboard**
   - Login ke [https://supabase.com](https://supabase.com)
   - Pilih project Anda

2. **Buka SQL Editor**
   - Klik menu "SQL Editor" di sidebar kiri
   - Klik "New Query"

3. **Jalankan Script**
   - Buka file `database-seed.sql`
   - Copy seluruh isi file
   - Paste ke SQL Editor
   - Klik tombol **"Run"** atau tekan `Ctrl + Enter`

4. **Tunggu Hasil**
   - Script akan menampilkan hasil di bawah
   - Cek apakah ada error

### Metode 2: Via Command Line (Advanced)

```bash
# Install Supabase CLI jika belum
npm install -g supabase

# Login ke Supabase
supabase login

# Link ke project
supabase link --project-ref YOUR_PROJECT_REF

# Jalankan script
supabase db push --file database-seed.sql
```

---

## ✅ Verifikasi Data

### 1. Cek via SQL Editor

Jalankan query berikut untuk memverifikasi data:

```sql
-- Cek modules
SELECT
  title,
  slug,
  order_index,
  is_published
FROM modules
WHERE slug IN ('tabung', 'kerucut', 'bola')
ORDER BY order_index;

-- Cek lessons
SELECT
  m.title as module_name,
  l.title as lesson_name,
  l.slug,
  l.lesson_type,
  l.is_published,
  l.scene_config::text as content_preview
FROM modules m
LEFT JOIN lessons l ON l.module_id = m.id
WHERE m.slug IN ('tabung', 'kerucut', 'bola')
ORDER BY m.order_index, l.order_index;

-- Cek struktur scene_config
SELECT
  m.title as module_name,
  l.title as lesson_name,
  jsonb_object_keys(l.scene_config) as content_keys
FROM modules m
JOIN lessons l ON l.module_id = m.id
WHERE m.slug IN ('tabung', 'kerucut', 'bola')
ORDER BY m.order_index;
```

### 2. Cek via Aplikasi

1. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```

2. **Buka browser**
   - Akses http://localhost:5173
   - Klik salah satu modul (Tabung/Kerucut/Bola)
   - Cek semua tab: Konsep, Jaring-jaring, Rumus, Quiz

3. **Verifikasi konten**
   - Pastikan konten muncul dengan benar
   - Pastikan tidak ada fallback warning di console
   - Cek perhitungan step-by-step di tab "Rumus"

### 3. Expected Result

Jika berhasil, Anda akan melihat:

✅ **3 Modules:**
- Tabung (slug: `tabung`)
- Kerucut (slug: `kerucut`)
- Bola (slug: `bola`)

✅ **3 Lessons** (1 per modul):
- Pembelajaran Tabung
- Pembelajaran Kerucut
- Pembelajaran Bola

✅ **Content Structure** (per lesson):
- Tab "Konsep" dengan unsur-unsur bangun
- Tab "Jaring-jaring" dengan penjelasan
- Tab "Rumus" dengan contoh soal step-by-step
- Tab "Quiz" dengan latihan soal

---

## 🔧 Troubleshooting

### Problem 1: "ON CONFLICT" Error

**Error:**
```
ERROR: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

**Solution:**
Pastikan ada UNIQUE constraint pada kolom `slug`:

```sql
-- Tambahkan unique constraint jika belum ada
ALTER TABLE modules ADD CONSTRAINT modules_slug_unique UNIQUE (slug);
ALTER TABLE lessons ADD CONSTRAINT lessons_slug_unique UNIQUE (slug);
```

### Problem 2: Foreign Key Error

**Error:**
```
ERROR: insert or update on table "lessons" violates foreign key constraint
```

**Solution:**
Pastikan modules sudah ter-insert terlebih dahulu. Jalankan script secara berurutan:
1. Insert modules dulu
2. Baru insert lessons

### Problem 3: JSONB Parsing Error

**Error:**
```
ERROR: invalid input syntax for type json
```

**Solution:**
- Cek format JSON di `scene_config`
- Pastikan semua string di-escape dengan benar
- Gunakan `jsonb_build_object()` untuk keamanan

### Problem 4: Konten Tidak Muncul di Aplikasi

**Checklist:**
1. ✅ Cek `is_published = true`
2. ✅ Cek `module_id` sesuai
3. ✅ Cek struktur `scene_config` benar
4. ✅ Cek browser console untuk error
5. ✅ Clear cache browser (Ctrl + Shift + R)

### Problem 5: Konten Masih Pakai Fallback

Jika aplikasi masih menggunakan fallback data (hardcoded):

1. **Cek apakah data benar-benar ada di database**
   ```sql
   SELECT COUNT(*) FROM lessons WHERE is_published = true;
   ```

2. **Cek console browser**
   - Buka Developer Tools (F12)
   - Lihat tab Console
   - Cari warning: "Database error, using fallback"

3. **Cek koneksi Supabase**
   - Pastikan `.env` atau `.env.local` berisi:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Restart development server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

## 📝 Menambahkan Konten Baru

### Menambahkan Modul Baru

```sql
INSERT INTO modules (id, title, slug, description, order_index, is_published)
VALUES (
  gen_random_uuid(),
  'Prisma',
  'prisma',
  'Deskripsi modul prisma...',
  4,
  true
);
```

### Menambahkan Lesson Baru

```sql
INSERT INTO lessons (
  id, module_id, slug, title, lesson_type, order_index,
  scene_config, estimated_duration_minutes, xp_reward, is_published
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM modules WHERE slug = 'prisma'),
  'prisma-pembelajaran',
  'Pembelajaran Prisma',
  'interactive',
  1,
  jsonb_build_object(
    'concept', jsonb_build_object(
      'title', '🎯 Konsep Prisma',
      'content', '<p>Penjelasan konsep prisma...</p>'
    )
  ),
  30,
  100,
  true
);
```

---

## 🎯 Next Steps

Setelah database terisi:

1. ✅ Test semua modul di aplikasi
2. ✅ Tambahkan quiz questions (table `quiz_questions`)
3. ✅ Setup user authentication
4. ✅ Buat assignments untuk siswa
5. ✅ Konfigurasi badges dan gamification

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL JSONB Guide](https://www.postgresql.org/docs/current/datatype-json.html)
- [SQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

---

**Happy Coding! 🚀**

Jika ada masalah, cek:
- File: `database-seed.sql`
- File: `datastructure.json`
- Console browser untuk error
