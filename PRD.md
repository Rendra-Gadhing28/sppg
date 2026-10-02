# Product Requirement Document (PRD) — Sistem Informasi SPPG (Dapur MBG)

## 1. Latar Belakang & Objektif
Sistem Informasi Operasional SPPG untuk pengelolaan dapur program Makanan Bergizi Gratis (MBG) yang melayani sekolah penerima manfaat.
- **Tujuan**: Memastikan presensi pekerja tervalidasi, kalkulasi kebutuhan bahan tepat sasaran sesuai menu & porsi sekolah, serta stok terpantau akurat secara realtime.
- **Strategi Rilis**: Bertahap (Fase 1 MVP Single Dapur, dilanjutkan Fase 2-4).

---

## 2. Aktor & Matriks Hak Akses (RBAC)

| Role | Hak Akses Utama |
|---|---|
| **Super Admin** | Akses penuh seluruh sistem, kelola akun pengguna, konfigurasi dapur. |
| **Admin SPPG** | Operasional harian, master sekolah, data anggota, shift kerja, rekap presensi. |
| **Ahli Gizi** | Kelola menu harian, resep/BOM (Bill of Materials), kalkulasi gizi, approval menu. |
| **Kepala Dapur** | Jadwal masak harian, pantau status produksi, checklist dapur. |
| **Petugas Stok** | Input stok masuk/keluar, audit mutasi bahan, stock opname dasar. |
| **Driver / Kurir** | Presensi harian, rute & serah terima distribusi (Fase 2). |
| **Pimpinan** | Dashboard monitoring, laporan agregat HPP & presensi (read-only). |

---

## 3. Ruang Lingkup Sistem

### In Scope — Fase 1 (MVP)
1. **Autentikasi & Otorisasi**: Login nomor HP/email + password, JWT HttpOnly, RBAC.
2. **Manajemen Anggota & Shift**: Data NIK, profil pekerja, master shift kerja, penugasan shift mingguan.
3. **Presensi Digital**:
   - Presensi via web mobile/PWA (kamera selfie + GPS Geolocation).
   - Validasi radius jarak terhadap koordinat dapur tunggal (Haversine).
   - Pencatatan status otomatis (`tepat_waktu`, `terlambat`).
   - Anti-duplikasi absen masuk/keluar per hari.
4. **Master Sekolah**: Daftar sekolah, target porsi siswa, koordinat lokasi, kontak PIC, jam makan.
5. **Menu & Resep (BOM)**:
   - Menu harian seragam dengan data makronutrisi.
   - Resep per porsi (`resep_item`) memetakan gramasi bahan baku.
   - Approval gizi oleh Ahli Gizi.
6. **Kalkulasi Kebutuhan & Stok Dasar**:
   - Agregasi kebutuhan bahan harian = $\sum (\text{porsi sekolah}) \times \text{gramasi resep}$.
   - Master bahan baku dengan satuan standar.
   - Pencatatan transaksi stok (masuk, keluar produksi, penyesuaian).
   - Constraint saldo stok non-negatif.
7. **Dashboard Operasional Dasar**: Ringkasan presensi hari ini, status menu hari ini, peringatan stok menipis.

### Out of Scope (Roadmap Lanjutan)
- **Fase 2**: Supplier, PO, QC bahan datang, distribusi armada, bukti serah terima foto/ttd sekolah, batch & expiry FIFO/FEFO.
- **Fase 3**: Notifikasi WhatsApp gateway, multi-dapur/cabang, offline PWA full sync, analitik HPP & waste.
- **Fase 4**: AI otomatisasi menu bergizi seimbang, optimasi rute armada (VRP).

---

## 4. Kebutuhan Fungsional (Functional Requirements)

### 4.1 Modul Auth & Akun
- **FR-AUTH-01**: Sistem harus memvalidasi login menggunakan nomor HP/email dan password terenkripsi.
- **FR-AUTH-02**: Sistem harus memblokir akses ke rute/API di luar wewenang role pengguna.
- **FR-AUTH-03**: Sistem harus menyediakan mekanisme aktivasi/nonaktivasi akun tanpa menghapus riwayat audit.

### 4.2 Modul Anggota & Jadwal
- **FR-MEM-01**: Admin dapat mencatat profil anggota (NIK unik, nama, jabatan, nomor HP, foto).
- **FR-MEM-02**: Admin dapat mengatur jam shift kerja dan toleransi keterlambatan (menit).
- **FR-MEM-03**: Admin dapat menetapkan jadwal shift mingguan per anggota.

### 4.3 Modul Presensi Digital
- **FR-ATT-01**: Anggota melakukan presensi masuk/keluar melalui kamera selfie dan lokasi GPS perangkat.
- **FR-ATT-02**: Sistem menghitung jarak koordinat pengguna ke titik koordinat dapur.
- **FR-ATT-03**: Sistem menandai `is_in_radius = TRUE` bila jarak $\le$ radius meter dapur; menandai `FALSE` bila di luar radius.
- **FR-ATT-04**: Sistem menentukan status kehadiran berdasarkan waktu rekam terhadap jam shift + toleransi.
- **FR-ATT-05**: Sistem menolak presensi ganda untuk jenis yang sama di hari yang sama.

### 4.4 Modul Sekolah & Alokasi Porsi
- **FR-SCH-01**: Admin dapat mengelola master sekolah (nama, alamat, koordinat, target porsi, PIC).
- **FR-SCH-02**: Sistem mengagregasi total porsi harian dari seluruh sekolah berstatus aktif.

### 4.5 Modul Menu, Gizi, & Resep (BOM)
- **FR-MNU-01**: Ahli gizi dapat membuat master menu lengkap dengan estimasi kalori, protein, lemak, dan karbohidrat.
- **FR-MNU-02**: Ahli gizi menginput resep/BOM (takaran bahan per 1 porsi).
- **FR-MNU-03**: Menu memerlukan status approval ahli gizi sebelum dapat dijadwalkan untuk produksi.
- **FR-MNU-04**: Admin menjadwalkan 1 menu seragam untuk suatu tanggal produksi.

### 4.6 Modul Stok & Mutasi
- **FR-STK-01**: Petugas stok dapat mengelola master bahan (kode unik, nama, kategori, satuan standar, stok minimum).
- **FR-STK-02**: Sistem mengkalkulasi otomatis total kebutuhan bahan berdasarkan menu harian dan total porsi sekolah.
- **FR-STK-03**: Sistem memberi peringatan defisit jika kebutuhan bahan melebihi saldo stok saat ini.
- **FR-STK-04**: Sistem mencatat setiap pergerakan stok ke dalam tabel ledger mutasi secara immutable.
- **FR-STK-05**: Database menolak transaksi yang mengakibatkan saldo stok bahan bernilai negatif.

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Performa**:
   - Respon endpoint kalkulasi bahan $\le 500$ ms.
   - Endpoint pencatatan presensi $\le 1$ detik (termasuk upload berkas foto).
2. **Keamanan & Kepatuhan**:
   - Password di-hash menggunakan algoritma modern (Argon2id / Bcrypt salt factor $\ge 10$).
   - Data koordinat presensi dan NIK dilindungi hak akses ketat (UU PDP).
   - Akses API dilindungi CSRF token dan HttpOnly Secure cookie.
3. **Kompatibilitas**:
   - Halaman presensi dioptimalkan untuk mobile web (Chrome Mobile / Safari iOS).
   - Tampilan dashboard admin responsif untuk tablet dan desktop.
4. **Keandalan (Reliability)**:
   - Seluruh mutasi stok dan pemotongan produksi dieksekusi dalam database transaction (ACID).
   - Seluruh kegagalan presensi tercatat di log error aplikasi.

---

## 6. Alur Kerja Pengguna (User Flow)

### Flow 1: Presensi Pekerja Dapur
```
[Buka Web di HP] 
       ↓ 
[Login / Session Check] 
       ↓ 
[Buka Halaman Presensi] 
       ↓ 
[Ambil Foto Selfie & Deteksi Geolocation] 
       ↓ 
[Submit Payload ke Server] 
       ↓ 
[Server Validasi Radius Dapur & Jam Shift] 
       ↓ 
[Status Tersimpan (Tepat Waktu / Terlambat)]
```

### Flow 2: Siklus Menu ke Pengurangan Stok
```
[Ahli Gizi Buat Menu & Input BOM per Porsi] 
       ↓ 
[Approval Status Menu] 
       ↓ 
[Admin Tetapkan Menu ke Jadwal Harian] 
       ↓ 
[Sistem Hitung: Total Porsi x Gramasi Bahan] 
       ↓ 
[Cek Defisit Stok vs Saldo Saat Ini] 
       ↓ 
[Kepala Dapur Mulai Masak -> Stok Terpotong Otomatis]
```

---

## 7. Metrik Keberhasilan (KPI) Fase 1
- **Akurasi Presensi**: $\ge 90\%$ presensi harian tercatat valid dengan verifikasi geofence.
- **Akurasi Stok**: Selisih fisik vs sistem saat stock opname mingguan $\le 2\%$.
- **Kecepatan Perencanaan**: Kalkulasi kebutuhan bahan harian otomatis terbentuk tanpa hitung manual spreadsheet.
