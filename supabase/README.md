# Panduan Setup Database GeoCetak

Dokumen ini menjelaskan cara melakukan setup database di Supabase untuk proyek GeoCetak.

## Prasyarat
- Proyek [Supabase](https://supabase.com) baru.

## Langkah-langkah Setup

### 1. Jalankan Script Setup Utama
Script ini akan membuat tabel, kolom, dan aturan keamanan (Row Level Security).

1. Buka Dashboard Supabase Anda.
2. Masuk ke menu **SQL Editor**.
3. Klik **New Query**.
4. Salin dan tempel isi dari file [`supabase-setup.sql`](supabase-setup.sql) ke dalam editor.
5. Klik **Run**.

### 2. Jalankan Script Storage
Script ini akan membuat penyimpanan (buckets) untuk file seperti gambar profil, modul, dan model 3D.

1. Buka kembali **SQL Editor**.
2. Klik **New Query**.
3. Salin dan tempel isi dari file [`supabase-storage-setup.sql`](supabase-storage-setup.sql) ke dalam editor.
4. Klik **Run**.

## Peringatan
> [!IMPORTANT]
> Script `supabase-setup.sql` ini dihasilkan dari struktur data yang ada. Jika Anda memiliki data di database yang sudah ada, menjalankan script ini mungkin akan gagal jika tabel sudah ada. Pastikan untuk membackup data Anda atau mulai dengan database kosong.

## Struktur Database
Database ini terdiri dari tabel-tabel berikut:
- **Pengguna & Profil**: `profiles`, `teacher`
- **Pembelajaran**: `modules`, `lessons`, `quiz_questions`, `quiz_attempts`
- **Progres Siswa**: `student_progress`, `gamification`, `lkpd_submissions`, `assignment_submissions`
- **Kelas**: `classrooms`, `classroom_members`, `assignments`
