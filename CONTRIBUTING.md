# Panduan Kontribusi GeoCetak

Terima kasih atas ketertarikan Anda untuk berkontribusi pada GeoCetak! Dokumen ini menyediakan panduan dan instruksi untuk berkontribusi pada proyek ini.

## Kode Etik (Code of Conduct)

Dengan berpartisipasi dalam proyek ini, Anda diharapkan untuk menjunjung tinggi [Kode Etik](CODE_OF_CONDUCT.md) kami.

## Cara Berkontribusi

### Melaporkan Bug

Jika Anda menemukan bug, silakan buat GitHub Issue dengan informasi berikut:
- Langkah-langkah untuk mereproduksi bug
- Perilaku yang diharapkan
- Perilaku aktual
- Screenshot (jika ada)

### Menyarankan Peningkatan

Kami menyambut ide-ide baru! Buka issue untuk mendiskusikan saran Anda sebelum mulai mengerjakannya.

### Proses Pull Request

1.  **Fork** repositori ini ke akun GitHub Anda.
2.  **Clone** hasil fork Anda ke komputer lokal.
3.  **Buat branch baru** untuk fitur atau perbaikan Anda:
    ```bash
    git checkout -b fitur/fitur-keren
    ```
4.  **Lakukan perubahan**. Pastikan Anda mengikuti gaya kode (lihat di bawah).
5.  **Commit** perubahan Anda dengan pesan yang deskriptif:
    ```bash
    git commit -m "Menambahkan fitur keren"
    ```
6.  **Push** ke fork Anda:
    ```bash
    git push origin fitur/fitur-keren
    ```
7.  **Buka Pull Request** (PR) dari fork Anda ke repositori utama.

## Setup Pengembangan

1.  **Prasyarat**: Node.js >= 18.0.0, npm >= 8.0.0.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Setup Environment**:
    - Salin `.env.example` ke `.env.local`.
    - Isi kredensial Supabase yang diperlukan.
4.  **Jalankan Server Development**:
    ```bash
    npm run dev
    ```

## Gaya Kode (Code Style)

- Kami menggunakan **TypeScript** untuk keamanan tipe data.
- **ESLint** dan **Prettier** digunakan untuk linting dan formatting.
- Jalankan linting sebelum melakukan commit:
    ```bash
    npm run lint
    ```
