# Panduan Migrasi KataKita CBT - Sistem 2 File (100% Berhasil)

Folder ini berisi versi portabel **KataKita CBT** yang dirancang khusus agar dapat dipasang dengan mudah di **Google Apps Script (GAS)** dalam hitungan menit dan menggunakan **Google Sheets** sebagai database gratis tanpa batas.

Dengan arsitektur **2 file terpadu**, Anda tidak akan mengalami kendala *include* yang lambat atau loading tanpa akhir. Cukup salin dua file ini dan aplikasi Anda dijamin berjalan seketika!

---

## 📁 File yang Dibutuhkan di Google Apps Script
Di dalam editor kode Google Apps Script Anda (https://script.google.com), Anda hanya perlu membuat **dua file** berikut:

1. **`Code.gs`** (Tipe: Script) - Pengelola database server-side Google Sheets.
2. **`Index.html`** (Tipe: HTML) - Tampilan User Interface lengkap (Styles, Auth, Student, Admin, Player, Scripts dimasukkan dalam satu kesatuan file cepat).

---

## 🛠️ Langkah Pemasangan Instan (Kurang dari 3 Menit)

### Langkah 1: Buat Google Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.google.com) lalu buat sebuah spreadsheet kosong baru.
2. Beri nama spreadsheet tersebut bebas, misalnya: `Dataset CBT KataKita`.
3. Buka menu **Ekstensi (Extensions)** -> **Apps Script**. Ini akan membuka editor Google Apps Script yang terikat langsung dengan spreadsheet Anda.

### Langkah 2: Salin Kode ke Apps Script Editor
1. Di editor Apps Script, Anda akan melihat file default bernama `Kode.gs` (atau `Code.gs`). Hapus semua represents kode bawaan di sana, lalu salin dan tempel (copy-paste) seluruh isi dari file **`Code.gs`** dari folder `/gas-export` ini.
2. Buat file baru dengan mengklik tanda plus **`+`** di samping "Berkas" (Files) -> pilih **HTML**.
3. Beri nama file baru tersebut **`Index`** (tanpa menuliskan `.html`, GAS akan mengisinya otomatis).
4. Hapus seluruh baris kode HTML bawaan di file `Index.html` baru tersebut, lalu salin dan tempel (copy-paste) seluruh isi dari file **`Index.html`** dari folder `/gas-export` ini.
5. Klik ikon disket **Simpan Proyek (Save Project)** di baris menu atas.

### Langkah 3: Hubungkan ID Spreadsheet (Hanya jika Standalone Script)
*Jika Anda membuka Apps Script langsung dari Google Sheets (Langkah 1 poin 3), Anda dapat melewati langkah ini!*

1. Jika Anda membuat script ini secara mandiri/standalone di `script.google.com`:
   - Buka `Code.gs` di editor Anda.
   - Pada baris ke-15, temukan kode: `const SPREADSHEET_ID = 'MASUKKAN_ID_SPREADSHEET_ANDA_DISINI';`
   - Ganti `'MASUKKAN_ID_SPREADSHEET_ANDA_DISINI'` dengan ID Google Sheet Anda.
   - *ID Spreadsheet dapat diambil dari URL browser Sheet Anda. Misalnya pada `https://docs.google.com/spreadsheets/d/1A2B3D4D.../edit`, ID-nya adalah `1A2B3D4D...`*

### Langkah 4: Jalankan Inisialisasi Database (Wajib untuk Pertama Kali)
1. Di bagian atas editor Apps Script, pilih fungsi **`initSpreadsheet`** pada menu dropdown fungsi di samping tombol "Jalankan" (Run).
2. Klik tombol **Jalankan (Run)**.
3. Google akan meminta izin akses (Authorization), klik **Tinjau Izin (Review Permissions)**, pilih akun Google Anda.
4. Klik **Lanjutan (Advanced)** -> **Buka Dataset CBT KataKita (tidak aman)**, lalu klik **Izinkan (Allow)**.
5. Setelah fungsi selesai berjalan, buka kembali spreadsheet Google Anda. Anda akan melihat 4 sheet database telah dibuat secara otomatis:
   * 📋 `users` (Menampung data akun admin dan siswa)
   * 📦 `packages` (Menampung status gembok paket tryout)
   * 📝 `questions` (Penyimpanan database bank soal)
   * ⏱️ `attempts` (Data hasil & rekap nilai pengerjaan ujian siswa)

### Langkah 5: Penerapan Aplikasi Web (Deploy Web App)
1. Di kanan atas halaman editor Apps Script, klik tombol **Deploy** -> **Penerapan Baru (New Deployment)**.
2. Klik ikon gir (pilih jenis penerapan), pilih **Aplikasi Web (Web App)**.
3. Isi konfigurasi sebagai berikut:
   * **Deskripsi**: `CBT KataKita Web App`
   * **Jalankan sebagai (Execute as)**: **`Saya (Email Anda)`** *(Sangat penting agar aplikasi memiliki otoritas menulis hasil ujian siswa ke Google Sheets Anda)*.
   * **Siapa yang memiliki akses (Who has access)**: **`Siapa saja (Anyone)`** *(Dipilih agar siswa Anda dapat mendaftar dan melaksanakan ujian secara gratis)*.
4. Klik **Deploy** (Terapkan).
5. Salin tautan **URL Aplikasi Web (Web App URL)** yang ditampilkan di layar. Tautan tersebut adalah URL portal ujian KataKita CBT Anda yang siap dibagikan ke siswa Anda!

---

## 🔑 Akun Akses Default
Setelah database siap, Anda bisa langsung mencoba login menggunakan data berikut:

* **Portal Admin/Guru**:
  * Email: `admin@katakita.id`
  * Password: `admin123`
* **Portal Siswa**:
  Silakan klik tombol **"Buat Akun Siswa Baru"** di halaman depan aplikasi untuk mencoba mendaftar sebagai siswa secara gratis secara instan!
