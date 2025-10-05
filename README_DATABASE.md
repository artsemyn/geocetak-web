# 🗄️ GeoCetak Database - Quick Guide

## 📁 File Structure

```
geocetak-web/
├── database-seed.sql      # ⭐ SQL script untuk seed database
├── DATABASE_SETUP.md      # 📖 Panduan lengkap + troubleshooting
├── SEED_SUMMARY.md        # 📊 Summary data yang di-insert
└── datastructure.json     # 🏗️ Database schema reference
```

---

## 🚀 Quick Start (5 Menit)

### Step 1: Buka Supabase
1. Login ke https://supabase.com
2. Pilih project GeoCetak
3. Klik **SQL Editor** di sidebar

### Step 2: Run Script
1. Buka file `database-seed.sql`
2. Copy **seluruh isi** file
3. Paste ke SQL Editor
4. Klik **Run** (atau Ctrl+Enter)

### Step 3: Verifikasi
Akan muncul hasil query di bawah:
```
✅ 3 modules inserted/updated
✅ 3 lessons inserted/updated
```

### Step 4: Test di Aplikasi
```bash
npm run dev
```
Buka http://localhost:5173 dan cek setiap modul!

---

## 📊 What Gets Inserted?

### Modules (3)
- 🔵 **Tabung** - Pembelajaran tabung dengan 3D interaktif
- 🔺 **Kerucut** - Pembelajaran kerucut dengan garis pelukis
- ⚽ **Bola** - Pembelajaran bola dengan simetri sempurna

### Lessons (3)
Setiap modul punya 1 lesson dengan 4 tab:
1. **Konsep** - Unsur-unsur bangun ruang
2. **Jaring-jaring** - Visualisasi 2D/3D
3. **Rumus** - Step-by-step calculation
4. **Quiz** - Latihan soal

---

## ✅ Post-Seed Checklist

- [ ] Cek Supabase Table Editor (3 modules + 3 lessons)
- [ ] Test aplikasi di browser
- [ ] Verifikasi semua tab muncul
- [ ] Cek console tidak ada error
- [ ] Test slider & perhitungan real-time

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| ON CONFLICT error | ✅ Already fixed - script uses DO block |
| Konten tidak muncul | Clear cache + restart dev server |
| Fallback masih aktif | Cek `.env` Supabase credentials |
| JSONB error | Re-run script, struktur sudah benar |

---

## 📚 Dokumentasi Lengkap

- **Setup Guide**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **Data Summary**: [SEED_SUMMARY.md](./SEED_SUMMARY.md)
- **Schema**: [datastructure.json](./datastructure.json)

---

## 💡 Tips

1. **Jika data sudah ada**: Script akan UPDATE, bukan duplicate
2. **Reset data**: Uncomment bagian DELETE di awal script
3. **Custom content**: Edit JSONB di `scene_config` column
4. **Add new module**: Copy-paste pattern dari script

---

## 🎯 Next Steps Setelah Seed

1. ✅ Tambahkan quiz questions
2. ✅ Setup user authentication
3. ✅ Buat classroom & assignments
4. ✅ Konfigurasi gamification

---

**Happy Coding! 🚀**

Need help? Check [DATABASE_SETUP.md](./DATABASE_SETUP.md)
