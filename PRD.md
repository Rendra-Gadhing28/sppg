# Product Requirement Document (PRD) — Sistem Informasi SPPG (Dapur MBG)

## 1. Latar Belakang & Objektif
Sistem Informasi Operasional SPPG (Satuan Pelayanan Program Gizi) dirancang untuk mengelola seluruh rantai operasional dapur umum Program Makanan Bergizi Gratis (MBG) yang melayani ribuan sekolah dan siswa penerima manfaat.
- **Tujuan Utama**: Menjamin presensi pekerja transparan berbasis lokasi, otomatisasi pengadaan dan kalkulasi bahan baku tepat sasaran (Bill of Materials), pemantauan stok anti-basi (FEFO), kontrol mutu (QC), keterlacakan rantai distribusi makanan hangat ke sekolah (e-POD), audit finansial HPP akurat, hingga automasi cerdas berbasis AI dan IoT pemantauan standar keamanan pangan (HACCP).
- **Strategi Rilis**:
  - **Fase 1 (MVP Single Dapur Operasional)**: Fondasi presensi geofence, master sekolah, menu, BOM, dan mutasi stok dasar. *(Status: Selesai)*
  - **Fase 2 (Rantai Pasok, QC, Batch FEFO & Distribusi)**: Pengadaan PO, inspeksi QC bahan datang, inventaris batch kedaluwarsa FEFO, manajemen armada, dan portal kurir e-POD tanda tangan digital. *(Status: Terimplementasi di Sistem & Skema)*
  - **Fase 3 (Multi-Dapur Regional, Notifikasi WA, PWA Offline-Sync & Analitik HPP/Waste)**: Skalabilitas multi-cabang/satellite kitchen, WhatsApp Gateway otomatis, ketahanan offline PWA di blank spot sinyal, kalkulasi HPP riil vs estimasi, pelacakan food waste, dan modul penanganan komplain sekolah. *(Status: Spesifikasi Lengkap)*
  - **Fase 4 (AI Nutrition Planner, Smart Replenishment, VRP Dynamic Route & IoT HACCP)**: Optimasi menu cerdas berbasis AI linear programming (biaya vs AKG gizi), peramalan permintaan bahan musiman, Vehicle Routing Problem (VRP) rute armada, sensor IoT cold-chain & termal, serta portal pengawasan publik Badan Gizi Nasional (BGN). *(Status: Spesifikasi Lengkap)*

---

## 2. Aktor & Matriks Hak Akses (RBAC)

| Role | Deskripsi & Hak Akses Utama | Cakupan Fase |
|---|---|---|
| **Super Admin** | Akses penuh konfigurasi sistem, audit log global, kelola cabang dapur, konfigurasi parameter AI/IoT, dan manajemen akun pengguna. | Fase 1 - 4 |
| **Admin SPPG** | Operasional harian dapur, master sekolah, data anggota, shift kerja, rekap presensi, dan penerbitan surat jalan. | Fase 1 - 4 |
| **Koordinator Regional** | Supervisi multi-dapur/cabang, alokasi kuota antar-dapur, transfer stok antar-cabang, agregasi laporan regional. | Fase 3 - 4 |
| **Ahli Gizi** | Kelola menu harian, resep/BOM per porsi, kalkulasi makro/mikronutrisi, approval gizi, dan validasi rekomendasi AI menu. | Fase 1 - 4 |
| **Kepala Dapur** | Jadwal masak harian, eksekusi pemotongan bahan produksi, pantau checklist higienitas, dan log kendala dapur. | Fase 1 - 4 |
| **Petugas QC / Lab** | Inspeksi fisik bahan datang (organoleptik, suhu, kemasan), verifikasi kelayakan stok, dan audit sampel makanan jadi sebelum kirim. | Fase 2 - 4 |
| **Petugas Stok** | Input Purchase Order (PO), pencatatan stok masuk/keluar, stock opname batch FEFO, transfer bahan, dan pencatatan waste. | Fase 1 - 4 |
| **Driver / Kurir** | Presensi mobile, ambil muatan boks termal, panduan rute navigasi, upload foto bukti serah terima, dan input tanda tangan PIC sekolah. | Fase 1 - 4 |
| **Akuntan / Finance** | Monitoring HPP per porsi, rekonsiliasi invoice supplier vs PO, audit food waste cost, dan laporan efisiensi anggaran. | Fase 3 - 4 |
| **PIC Sekolah (Eksternal)** | Portal sekolah: konfirmasi penerimaan porsi, rating kondisi makanan, catatan siswa absen/alergi, dan formulir aduan mutu. | Fase 2 - 4 |
| **Auditor / BGN / Dinkes** | Portal pengawasan eksternal read-only: audit kepatuhan AKG, sertifikasi sanitasi dapur, log suhu cold-chain, dan transparansi distribusi. | Fase 4 |
| **Pimpinan / Eksekutif** | Dashboard analitik agregat, realisasi anggaran, performa ketepatan waktu pengantaran, dan SLA layanan sekolah. | Fase 1 - 4 |

---

## 3. Ruang Lingkup Sistem

### 3.1 Fase 1: MVP Single Dapur Operasional
1. **Autentikasi & Akun**: Login nomor HP/email + password, enkripsi bcrypt/argon2, sesi JWT HttpOnly, proteksi rute RBAC.
2. **Anggota & Shift Kerja**: Master NIK pekerja, profil, master shift (jam masuk, pulang, toleransi), jadwal mingguan anggota.
3. **Presensi Digital Geofence**: Presensi selfie kamera + GPS HTML5, kalkulasi jarak Haversine ke dapur, penentuan status tepat waktu/terlambat, proteksi absen ganda.
4. **Master Sekolah**: Profil sekolah penerima manfaat, koordinat GPS, kuota porsi target siswa, kontak PIC, jam jadwal makan.
5. **Menu & Resep (BOM)**: Katalog menu dengan rincian kalori, protein, lemak, karbohidrat; formula takaran bahan baku per 1 porsi; approval gizi oleh Ahli Gizi; penjadwalan menu harian.
6. **Kalkulasi Kebutuhan & Mutasi Stok**: Kalkulasi otomatis total bahan harian ($\sum \text{porsi} \times \text{gramasi BOM}$), deteksi defisit stok, buku besar ledger mutasi stok (in/out/adjustment), proteksi database saldo non-negatif.
7. **Dashboard Operasional**: Ringkasan presensi harian, status menu, dan peringatan stok bahan menipis.

### 3.2 Fase 2: Pengadaan, QC Bahan, Batch FEFO & Distribusi Armada
1. **Mitra Supplier & Purchase Order (PO)**: Master rekanan supplier bahan pangan terkurasi, penerbitan PO otomatis dari kalkulasi defisit BOM, pelacakan siklus hidup status PO (`draft`, `diajukan`, `dikirim`, `diterima`, `batal`).
2. **Quality Control (QC) Bahan Datang**: Formulir digital inspeksi penerimaan bahan (suhu cold-storage kendaraan supplier, kebersihan kemasan, uji visual/organoleptik, foto bukti), validasi lolos/lolos bersyarat/ditolak, auto-reject stok jika tidak lolos.
3. **Manajemen Batch & Kedaluwarsa (FEFO)**: Pembuatan ID batch unik saat barang masuk lolos QC, pencatatan tanggal kedaluwarsa per batch, algoritma pemotongan stok otomatis memprioritaskan batch yang paling mendekati kedaluwarsa (*First Expired, First Out*), indikator status batch (*aktif, expired, habis*).
4. **Armada & Surat Jalan Pengiriman**: Master kendaraan angkut (kapasitas porsi boks termal), penerbitan nomor Surat Jalan resmi per jadwal distribusi, assignment driver armada ke rute sekolah.
5. **Portal Driver & Bukti Serah Terima Digital (e-POD)**: Antarmuka mobile driver (`/distribusi`), checklist kondisi boks makanan (suhu hangat, kemasan utuh), penangkapan koordinat serah terima sekolah, kanvas tanda tangan digital (*signature pad*) PIC sekolah, foto dokumentasi serah terima di sekolah.

### 3.3 Fase 3: Multi-Dapur Regional, Notifikasi WA, PWA Offline-Sync & Analitik HPP/Waste
1. **Multi-Dapur & Hierarki Cabang (Central & Satellite Kitchens)**: Arsitektur multi-tenant berbasis cabang dapur; sentralisasi pengadaan bulk di Dapur Pusat (Central Kitchen) dengan distribusi antar-cabang (Hub-and-Spoke); pembatasan data operasional per unit dapur dengan agregasi data di tingkat Koordinator Regional/Pusat.
2. **Integrasi WhatsApp Gateway & Omnichannel Alerts**:
   - Notifikasi otomatis PO masuk ke nomor WhatsApp supplier rekanan resmi.
   - Blast pengingat shift kerja pekerja dapur (H-1 jam sebelum shift).
   - Alert darurat stok kritis dan batch bahan mendekati kedaluwarsa ($H \le 2$ hari) ke Petugas Stok dan Kepala Dapur.
   - Notifikasi status armada "Makanan Dalam Perjalanan" beserta estimasi waktu tiba (ETA) ke PIC Sekolah.
3. **PWA Offline-First & Background Sync Engine**:
   - Mekanisme penyimpanan lokal (IndexedDB) pada PWA untuk presensi selfie dan serah terima pengiriman driver saat armada masuk wilayah sekolah tanpa sinyal seluler (*blank spot*).
   - Background Sync API / Outbox queue yang secara otomatis melakukan komit mutasi data ke server begitu perangkat kembali online dengan penanganan resolusi konflik (*timestamp-based deterministic merge*).
4. **Analitik Finansial, Kalkulasi HPP & Pelacakan Food Waste**:
   - Perhitungan Harga Pokok Produksi (HPP) riil per porsi makanan (biaya bahan baku + alokasi overhead operasional dapur).
   - Analisis varians biaya: HPP standar/estimasi BOM vs HPP aktual belanja PO.
   - Buku besar pencatatan limbah makanan (*food waste ledger*): sisa persiapan bahan (*prep waste*), sisa proses masak (*cooking loss*), dan sisa makanan retur sekolah (*plate/delivery waste*) guna mendukung target audit *zero food waste*.
5. **Portal Komplain Sekolah & Manajemen Insiden Higiene**:
   - Formulir digital pelaporan kendala porsi dari sekolah (misal: porsi kurang, basi, benda asing, anak bergejala alergi).
   - Ticketing alur investigasi insiden oleh Tim QC dan Ahli Gizi dengan SLA penanganan maksimal 2 jam.

### 3.4 Fase 4: AI Nutrition Planner, Smart Replenishment, VRP Dynamic Route & IoT HACCP
1. **AI Automated Menu Planner & Optimasi Nutrisi**:
   - Algoritma optimasi terprogram (Linear Programming + LLM Nutritionist Agent) untuk menyusun rekomendasi siklus menu 10 hari/30 hari otomatis.
   - Pemenuhan batas ambang Angka Kecukupan Gizi (AKG) nasional per jenjang pendidikan (PAUD: 350-450 kkal, SD: 500-650 kkal, SMP/SMA: 700-850 kkal) dengan kriteria biaya HPP paling efisien.
   - Restriksi keberagaman menu (anti-repetisi lauk utama dalam 5 hari kerja) dan ketersediaan komoditas pangan lokal musiman.
2. **AI Demand Forecasting & Smart Replenishment**:
   - Model peramalan prediktif volume kebutuhan bahan mingguan/bulanan berdasarkan tren historis, kalender akademik sekolah (libur, ujian, kegiatan luar), serta perkiraan fluktuasi harga pasar komoditas.
   - Rekomendasi Reorder Point (ROP) dan Safety Stock dinamis untuk mencegah kelebihan stok bahan perishable.
3. **Vehicle Routing Problem (VRP) & Optimasi Rute Armada**:
   - Mesin optimasi rute armada cerdas dengan pembatas waktu (*Capacitated Vehicle Routing Problem with Time Windows - CVRPTW*).
   - Penentuan urutan rute sekolah dengan batasan: kapasitas muat armada mobil boks, jam istirahat makan masing-masing sekolah (11.00 - 12.30), dan mitigasi penurunan suhu makanan di jalan.
4. **Integrasi Sensor IoT Cold-Chain & Pemantauan HACCP**:
   - Integrasi perangkat sensor nirkabel (BLE / LoRaWAN / GSM telemetry) pada cold-storage dapur (chiller: $0^\circ\text{C}-4^\circ\text{C}$, freezer: $\le -18^\circ\text{C}$) dan boks pengangkut termal armada ($\ge 60^\circ\text{C}$ untuk hidangan panas).
   - Perekaman riwayat suhu realtime (data log per 5 menit) untuk kepatuhan sertifikasi HACCP (Hazard Analysis Critical Control Point).
   - Auto-alarm darurat (buzzer + push message WA/Web) saat terjadi deviasi suhu kritis yang berpotensi menyebabkan pembusukan mikrobiologis.
5. **Portal Pengawasan Eksternal Badan Gizi Nasional (BGN) & Transparansi Publik**:
   - Dashboard analitik terbuka untuk pengawas dinas kesehatan, dinas pendidikan, dan BGN.
   - Pelaporan metrik transparansi: kepatuhan kalori per porsi, tingkat kepuasan sekolah, kepatuhan tepat waktu pengantaran, dan keterlacakan batch pangan dari petani/supplier hingga meja makan siswa.

---

## 4. Kebutuhan Fungsional (Functional Requirements)

### 4.1 Modul Autentikasi, Profil & Keamanan (Fase 1)
- **FR-AUTH-01**: Sistem memvalidasi login menggunakan nomor HP/email unik dan password terenkripsi.
- **FR-AUTH-02**: Sistem membatasi akses endpoint API dan antarmuka pengguna sesuai role JWT yang valid.
- **FR-AUTH-03**: Sistem menerapkan rate-limiting pada endpoint login untuk mencegah serangan brute-force (maksimum 5 percobaan gagal per 5 menit per IP/akun).
- **FR-AUTH-04**: Sistem menyediakan mekanisme aktivasi/nonaktivasi akun tanpa menghapus riwayat audit data (soft-deactivation).
- **FR-AUTH-05**: Sistem menerbitkan access token dengan masa berlaku terukur yang disimpan aman dalam HttpOnly Secure Cookie.

### 4.2 Modul Anggota & Manajemen Shift (Fase 1)
- **FR-MEM-01**: Admin dapat mencatat profil anggota dapur (NIK 16 digit terverifikasi unik, nama lengkap, jabatan, kontak, tautan akun user).
- **FR-MEM-02**: Admin dapat mengatur master shift kerja (jam mulai masuk, jam selesai pulang, serta batas toleransi keterlambatan dalam menit).
- **FR-MEM-03**: Admin dapat menyusun penugasan jadwal shift mingguan anggota dapur (hari Senin - Minggu) dengan validasi tidak ada shift ganda di hari yang sama.
- **FR-MEM-04**: Sistem menampilkan jadwal kerja personal pada antarmuka masing-masing pekerja saat membuka aplikasi.

### 4.3 Modul Presensi Digital & Geofencing (Fase 1)
- **FR-ATT-01**: Anggota melakukan presensi masuk dan keluar melalui penangkapan kamera langsung (selfie) dan lokasi koordinat GPS perangkat.
- **FR-ATT-02**: Sistem menghitung jarak koordinat pengguna terhadap koordinat dapur acuan menggunakan formula Haversine.
- **FR-ATT-03**: Sistem menetapkan `is_in_radius = TRUE` bila jarak $\le$ radius meter konfigurasi dapur, dan `FALSE` bila berada di luar geofence (dengan pencatatan nilai deviasi jarak riil).
- **FR-ATT-04**: Sistem menentukan status presensi secara otomatis: `tepat_waktu` jika absen masuk $\le$ jam shift + toleransi, `terlambat` jika lewat dari toleransi, atau `pulang_cepat` jika absen keluar sebelum jam pulang.
- **FR-ATT-05**: Sistem memblokir presensi ganda untuk jenis yang sama (masuk/keluar) pada tanggal yang sama bagi pekerja yang bersangkutan.
- **FR-ATT-06**: Admin dapat mengunduh rekapitulasi presensi bulanan anggota dalam format Excel/PDF untuk kebutuhan penggajian.

### 4.4 Modul Master Sekolah & Alokasi Porsi (Fase 1)
- **FR-SCH-01**: Admin dapat mengelola master sekolah penerima manfaat (nama sekolah, alamat lengkap, titik koordinat GPS, nama PIC, nomor kontak, jam makan siang siswa).
- **FR-SCH-02**: Admin menginput alokasi kuota target porsi siswa aktif per sekolah (wajib bernilai bilangan bulat $> 0$).
- **FR-SCH-03**: Sistem menyediakan kolom pencatatan data alergi massal sekolah (misal: prevalensi alergi kacang, seafood, atau susu).
- **FR-SCH-04**: Sistem menghitung total kebutuhan porsi harian dapur sebagai hasil penjumlahan seluruh sekolah berstatus aktif.

### 4.5 Modul Menu, Gizi & Resep (BOM) (Fase 1)
- **FR-MNU-01**: Ahli Gizi dapat menginput master menu beserta takaran makronutrisi: total kalori (kkal), protein (g), lemak (g), dan karbohidrat (g).
- **FR-MNU-02**: Ahli Gizi menyusun resep Bill of Materials (BOM) per menu yang merinci gramasi kebutuhan setiap bahan baku untuk 1 porsi saji.
- **FR-MNU-03**: Sistem mewajibkan status `is_approved_gizi = TRUE` oleh Ahli Gizi (disertai timestamp dan ID user approver) sebelum menu dapat dimasukkan ke jadwal produksi.
- **FR-MNU-04**: Admin menjadwalkan 1 menu resmi untuk suatu tanggal kalender operasional dengan agregasi target porsi otomatis dari master sekolah aktif.
- **FR-MNU-05**: Sistem mencegah pengeditan komponen BOM pada menu yang sudah memiliki riwayat produksi aktif demi menjaga integritas data riwayat audit.

### 4.6 Modul Stok & Mutasi Saldo (Fase 1)
- **FR-STK-01**: Petugas Stok dapat mengelola master bahan pangan (kode unik, nama, kategori: pokok/hewani/nabati/sayur/buah/bumbu, satuan standar: kg/liter/butir/ikat, stok minimum peringatan).
- **FR-STK-02**: Sistem mengkalkulasi kebutuhan total bahan harian secara instan berdasarkan perkalian total target porsi hari tersebut dengan gramasi BOM menu terjadwal.
- **FR-STK-03**: Sistem menampilkan peringatan status defisit jika kebutuhan bahan hari H melebihi saldo stok yang tersedia di gudang dapur.
- **FR-STK-04**: Sistem mencatat setiap pergerakan stok (jenis mutasi: `masuk`, `keluar_produksi`, `penyesuaian`, `waste`) ke dalam tabel ledger mutasi secara immutable (*append-only*), mencatat saldo sebelum dan setelah transaksi.
- **FR-STK-05**: Database menerapkan constraint penolakan transaksi jika operasi mutasi menghasilkan nilai saldo stok akhir bernilai negatif.
- **FR-STK-06**: Kepala Dapur dapat mengeksekusi aksi "Mulai Masak / Potong Stok", yang secara otomatis memotong stok bahan sesuai BOM dalam 1 transaksi database atomik (ACID).

---

### 4.7 Modul Rekanan Supplier & Purchase Order (PO) (Fase 2)
- **FR-PO-01**: Petugas Stok / Admin dapat mengelola direktori supplier rekanan resmi (kode supplier unik, nama badan usaha, kategori pasokan, nama kontak, nomor HP/WhatsApp, alamat).
- **FR-PO-02**: Sistem mampu menerbitkan draft Purchase Order (PO) otomatis berdasarkan kalkulasi defisit bahan antara kebutuhan BOM menu vs saldo gudang saat ini.
- **FR-PO-03**: Setiap PO memiliki nomor unik format resmi (`PO-YYYYMMDD-XXXX`), tanggal penerbitan, tanggal target pengiriman ke dapur, rincian kuantitas pesan, dan estimasi harga satuan.
- **FR-PO-04**: Petugas Stok dapat mengubah status PO secara bertahap: `draft` $\rightarrow$ `diajukan` $\rightarrow$ `dikirim` $\rightarrow$ `diterima` $\rightarrow$ `batal`.
- **FR-PO-05**: Sistem memfasilitasi pencatatan penerimaan parsial (*partial fulfillment*) jika barang datang tidak langsung lengkap 100%.
- **FR-PO-06**: Sistem mencetak lembar PO resmi dalam format cetak standar/PDF untuk dikirimkan kepada mitra supplier.

### 4.8 Modul Quality Control (QC) Penerimaan Bahan Datang (Fase 2)
- **FR-QC-01**: Petugas QC melakukan inspeksi wajib saat kendaraan supplier tiba di area bongkar muat dapur terhadap PO yang bersangkutan.
- **FR-QC-02**: Sistem mencatat nomor laporan QC unik (`QC-YYYYMMDD-XXXX`), tanggal/jam pemeriksaan, nama pemeriksa, dan nomor PO rujukan.
- **FR-QC-03**: Formulir QC mencakup checklist parameter fisik: catatan suhu chiller/freezer kendaraan angkut ($^\circ\text{C}$), kepatuhan segel & kebersihan kemasan, uji organoleptik (kesegaran, aroma, warna, tekstur), dan upload foto bukti fisik bahan.
- **FR-QC-04**: Petugas QC menetapkan keputusan status: `lolos` (100% diterima masuk gudang), `lolos_bersyarat` (diterima dengan catatan/pemilahan minor), atau `ditolak` (seluruh atau sebagian bahan diretur langsung).
- **FR-QC-05**: Sistem mengunci penerimaan stok ke sistem inventaris gudang; hanya bahan berstatus `lolos` atau `lolos_bersyarat` yang dapat di-generate menjadi saldo batch inventaris.

### 4.9 Modul Stok Batch & Kedaluwarsa (FEFO Engine) (Fase 2)
- **FR-BAT-01**: Sistem secara otomatis membuat nomor batch unik per bahan yang lolos QC (`BATCH-KODEBAHAN-YYYYMMDD-XXX`) lengkap dengan input tanggal kedaluwarsa (*expiry date*).
- **FR-BAT-02**: Sistem memetakan `jumlah_awal` dan `jumlah_sisa` per batch bahan di dalam gudang.
- **FR-BAT-03**: Algoritma pemotongan stok produksi dapur wajib menerapkan logika FEFO (*First Expired, First Out*), memotong saldo dari batch aktif yang memiliki tanggal kedaluwarsa terdekat.
- **FR-BAT-04**: Jika kuantitas 1 batch tidak mencukupi kebutuhan produksi, sistem membagi pemotongan secara berurutan (*cascading deduction*) ke batch kedaluwarsa terdekat berikutnya.
- **FR-BAT-05**: Sistem menandai batch secara visual: Hijau (aman), Kuning (peringatan: kedaluwarsa dalam $\le 3$ hari), Merah (kedaluwarsa hari ini/sudah lewat).
- **FR-BAT-06**: Database menolak keras pengeluaran bahan untuk produksi dari batch yang telah melewati tanggal kedaluwarsa saat transaksi dijalankan.

### 4.10 Modul Manajemen Armada & Penjadwalan Rute (Fase 2)
- **FR-ARM-01**: Admin dapat mengelola master armada kendaraan distribusi dapur (nomor plat polisi unik, tipe kendaraan: mobil boks termal/motor boks, kapasitas muat boks/porsi, status ketersediaan).
- **FR-ARM-02**: Admin menerbitkan Surat Jalan Pengiriman harian (`SJ-YYYYMMDD-XXXX`) yang menghubungkan jadwal menu, armada kendaraan, driver penanggung jawab, dan daftar sekolah tujuan.
- **FR-ARM-03**: Sistem memvalidasi total porsi sekolah tujuan pada suatu surat jalan tidak melebihi kapasitas muat maksimal armada kendaraan.
- **FR-ARM-04**: Admin/Driver dapat memperbarui status distribusi: `disiapkan` $\rightarrow$ `dalam_perjalanan` (disertai jam berangkat) $\rightarrow$ `selesai` (disertai jam selesai).
- **FR-ARM-05**: Sistem menyediakan cetak dokumen fisik Surat Jalan Pengiriman rangkap 2 untuk arsip dapur dan arsip penerima sekolah.

### 4.11 Modul Portal Kurir & Bukti Serah Terima Digital (e-POD) (Fase 2)
- **FR-POD-01**: Sistem menyediakan portal antarmuka mobile ramah sentuhan khusus role driver pada path `/distribusi`.
- **FR-POD-02**: Driver dapat melihat daftar titik sekolah yang harus dikunjungi hari ini beserta kuota porsi masing-masing sekolah.
- **FR-POD-03**: Pada titik serah terima sekolah, sistem membuka form serah terima yang memverifikasi jumlah porsi dikirim vs jumlah fisik porsi diterima di lokasi.
- **FR-POD-04**: Driver memilih penilaian kondisi makanan: `baik_layak` (makanan hangat & wadah utuh), `kurang_hangat`, atau `kemasan_rusak`.
- **FR-POD-05**: Aplikasi menyediakan kanvas tanda tangan digital (*digital signature pad*) yang wajib ditandatangani langsung oleh guru/PIC sekolah penerima disertai input nama jelas dan nomor kontak.
- **FR-POD-06**: Aplikasi mewajibkan pengunggahan 1 foto dokumentasi penyerahan boks makanan di depan sekolah sebelum status serah terima dapat diselesaikan menjadi `selesai`.

---

### 4.12 Modul Multi-Dapur & Hierarki Cabang (Fase 3)
- **FR-MLT-01**: Super Admin dapat mendaftarkan multi-unit dapur (Dapur Pusat / Central Kitchen dan Dapur Satelit / Cabang SPPG) dengan koordinat geofence, kapasitas produksi harian, dan manajer dapur masing-masing.
- **FR-MLT-02**: Sistem mengisolasi data operasional presensi, stok, jadwal menu, dan pengiriman per dapur berdasarkan relasi dapur cabang aktif pada sesi user.
- **FR-MLT-03**: Super Admin dan Koordinator Regional memiliki akses lintas dapur (*cross-kitchen dashboard*) untuk memantau performa agregat seluruh cabang dalam wilayah kerjanya.
- **FR-MLT-04**: Sistem memfasilitasi modul Transfer Stok Antar-Dapur (*Inter-Kitchen Stock Transfer*) dengan alur: permintaan transfer dari satelit $\rightarrow$ approval gudang pusat $\rightarrow$ surat jalan mutasi keluar $\rightarrow$ QC penerimaan mutasi masuk di satelit.
- **FR-MLT-05**: Sistem mendukung konsolidasi Purchase Order (Bulk Procurement) di mana Dapur Pusat membeli bahan pangan dalam volume besar ke pemasok industri, lalu mendistribusikannya ke beberapa dapur satelit.
- **FR-MLT-06**: Sistem menyediakan pemetaan sekolah penerima manfaat ke dapur penyedia terdekat secara dinamis berdasarkan radius jarak geospasial optimal.

### 4.13 Modul WhatsApp Gateway & Omnichannel Notifikasi (Fase 3)
- **FR-WAG-01**: Sistem terintegrasi dengan WhatsApp Cloud API / Provider WA Gateway resmi menggunakan antrean pesan *asynchronous* (Job Queue / Worker).
- **FR-WAG-02**: Sistem mengirimkan notifikasi Purchase Order otomatis ke nomor WhatsApp supplier saat status PO diubah menjadi `dikirim`, lengkap dengan tautan PDF PO digital.
- **FR-WAG-03**: Sistem mengirimkan pesan blast pengingat shift kerja setiap pukul 05.00 pagi ke nomor WhatsApp pekerja dapur yang dijadwalkan masuk pada hari itu.
- **FR-WAG-04**: Sistem mengirimkan pesan peringatan darurat ke Kepala Dapur dan Petugas Stok ketika: (a) saldo bahan baku berada di bawah batas minimum, atau (b) terdapat batch bahan yang akan kedaluwarsa dalam 48 jam ke depan.
- **FR-WAG-05**: Sistem mengirimkan pesan otomatis kepada PIC Sekolah saat armada kurir mengubah status pengiriman menjadi `dalam_perjalanan`, berisi informasi nama driver, nomor plat kendaraan, dan tautan pantau status.
- **FR-WAG-06**: Sistem mencatat seluruh riwayat pesan keluar dalam log audit pengiriman pesan (`wa_message_logs`) dengan status keberhasilan: `queued`, `sent`, `delivered`, `read`, atau `failed`.

### 4.14 Modul PWA Offline-First & Background Sync Engine (Fase 3)
- **FR-OFF-01**: Aplikasi PWA mengimplementasikan Service Worker dengan strategi caching *Cache-First* untuk aset statis dan *Network-First falling back to Cache* untuk shell aplikasi.
- **FR-OFF-02**: Saat perangkat pekerja/driver tidak memiliki koneksi internet (*offline mode*), PWA tetap dapat membuka halaman presensi dan halaman serah terima pengiriman sekolah.
- **FR-OFF-03**: Data transaksi offline (foto selfie presensi terkompresi Base64/Blob, koordinat GPS perangkat, data serah terima porsi, foto sekolah, tanda tangan digital) disimpan secara lokal pada basis data peramban (IndexedDB Outbox Queue).
- **FR-OFF-04**: Sistem mendeteksi kembalinya status jaringan (*online event listener*) atau memanfaatkan Background Sync API untuk memicu pengiriman antrean transaksi yang tertunda secara berurutan.
- **FR-OFF-05**: Server menerapkan verifikasi stempel waktu klien (*client timestamp verification*) dan mekanisme idempotensi (*request idempotency key*) untuk mencegah duplikasi pencatatan data saat koneksi terputus-putus.
- **FR-OFF-06**: Sistem menampilkan indikator visual status sinkronisasi di bilah atas aplikasi: badge hijau ("Tersinkronisasi"), badge kuning ("Menyimpan Offline - X transaksi tertunda"), atau badge merah ("Gagal Sinkron - Klik untuk coba lagi").

### 4.15 Modul Analitik Finansial, HPP Realtime & Food Waste Audit (Fase 3)
- **FR-FIN-01**: Sistem menghitung estimasi HPP (Harga Pokok Produksi) teoritis per porsi makanan berdasarkan perkalian gramasi BOM menu dengan harga pembelian rata-rata tertimbang (*Moving Weighted Average Cost*) bahan baku.
- **FR-FIN-02**: Sistem menghitung realisasi HPP aktual harian dengan menambahkan biaya pemotongan bahan riil ditambah alokasi beban operasional (biaya gas, listrik, kemasan boks, insentif armada per porsi).
- **FR-FIN-03**: Sistem menyajikan perbandingan varians HPP (Estimasi vs Aktual) dengan indikator persentase deviasi biaya dan peringatan jika terjadi pembengkakan anggaran $> 5\%$.
- **FR-FIN-04**: Petugas Dapur dapat mencatat buku besar limbah makanan harian (*food waste ledger*) yang dikategorikan ke dalam 3 jenis: (a) *Preparation Waste* (kulit, bonggol, sisa trimming bahan mentah), (b) *Production Waste* (makanan gagal masak, gosong, tumpah), dan (c) *Distribution/Plate Waste* (makanan basi di jalan, retur sekolah).
- **FR-FIN-05**: Sistem mengkalkulasi kerugian finansial akibat food waste berdasarkan konversi berat kilogram sampah terbuang dikalikan harga perolehan bahan.
- **FR-FIN-06**: Sistem menghasilkan Laporan Evaluasi Finansial dan Rasio Efisiensi Dapur periode mingguan/bulanan yang dapat diekspor ke format XLSX dan PDF untuk kebutuhan pelaporan pimpinan dan auditor.

### 4.16 Modul Penanganan Komplain & Manajemen Insiden Higiene (Fase 3)
- **FR-CMP-01**: PIC Sekolah dapat mengakses formulir aduan cepat melalui portal sekolah untuk melaporkan ketidaksesuaian penerimaan (kategori: porsi kurang, makanan dingin, kemasan bocor, dugaan kontaminasi aroma/rasa).
- **FR-CMP-02**: Setiap laporan aduan sekolah otomatis menerbitkan tiket insiden (`TIK-YYYYMMDD-XXXX`) dengan status: `baru`, `diinvestigasi`, `tindakan_korektif`, `selesai`, `ditutup`.
- **FR-CMP-03**: Sistem mengirimkan alert instan berprioritas tinggi ke Kepala Dapur dan Ahli Gizi segera setelah komplain diajukan oleh sekolah.
- **FR-CMP-04**: Petugas QC wajib menginput hasil investigasi internal, meliputi penelusuran nomor batch bahan yang digunakan pada tanggal terkait (traceability backward) dan suhu keberangkatan makanan.
- **FR-CMP-05**: Sistem mendokumentasikan tindakan penanganan (misal: penggantian porsi darurat dalam waktu $\le 60$ menit) dan catatan persetujuan penutupan tiket dari pihak sekolah.

---

### 4.17 Modul AI Automated Menu Planner & Optimasi Nutrisi (Fase 4)
- **FR-AI-01**: Ahli Gizi dapat menggunakan generator menu cerdas berbasis AI untuk membuat siklus menu harian (rentang 7 hari s/d 30 hari) secara otomatis.
- **FR-AI-02**: Mesin AI mengoptimalkan parameter menggunakan metode Linear Programming dengan fungsi objektif meminimalkan total HPP bahan pangan terhadap batasan (constraints):
  - Batas standar AKG Kementerian Kesehatan / BGN per jenjang usia (toleransi kalori $\pm 10\%$, batas minimal protein nabati & hewani).
  - Varian kelompok pangan harian (wajib mengandung: makanan pokok, lauk hewani, lauk nabati, sayur, dan buah potong segar).
  - Batasan variasi: lauk utama tidak boleh berulang dalam jangka waktu minimal 5 hari kerja berturut-turut.
  - Prioritas komoditas pangan lokal unggulan daerah yang sedang musim panen raya.
- **FR-AI-03**: Sistem AI menyajikan transparansi rincian skor gizi, estimasi HPP per porsi, dan rekomendasi supplier penyedia bahan untuk rancangan menu yang dihasilkan.
- **FR-AI-04**: Ahli Gizi memiliki kendali penuh untuk meninjau, melakukan perubahan item lauk (swap alternatif), atau menolak rekomendasi AI sebelum memberikan persetujuan resmi (*Human-in-the-loop approval*).
- **FR-AI-05**: Sistem menyimpan histori prompt, versi algoritma, dan bobot parameter yang digunakan pada setiap siklus generasi menu guna keperluan audit mutu gizi.
- **FR-AI-06**: Sistem mampu mendeteksi potensi alergen umum pada menu yang dirancang dan memberikan peringatan jika sekolah binaan memiliki siswa dengan catatan alergi tinggi terhadap bahan tersebut.

### 4.18 Modul AI Demand Forecasting & Smart Replenishment (Fase 4)
- **FR-FST-01**: Sistem memproses data historis konsumsi bahan 90 hari terakhir, data kalender akademik sekolah (hari efektif, libur semester, jadwal ujian, puasa), dan tren musiman untuk memproyeksikan kebutuhan bahan 30 hari ke depan.
- **FR-FST-02**: Mesin peramalan mengintegrasikan tren fluktuasi harga komoditas pangan pasar lokal (misal: kenaikan harga telur/cabai menjelang hari raya) untuk memberikan saran waktu pembelian optimal (*smart procurement timing*).
- **FR-FST-03**: Sistem menghitung titik pemesanan kembali dinamis (*Dynamic Reorder Point - ROP*) dan batas stok pengaman (*Safety Stock*) per bahan dengan mempertimbangkan waktu tunggu pasokan (*lead time*) masing-masing supplier.
- **FR-FST-04**: Sistem menghasilkan rekomendasi daftar Purchase Order otomatis setiap akhir pekan untuk disetujui satu klik oleh Petugas Stok.
- **FR-FST-05**: Sistem mengevaluasi akurasi prediksi menggunakan metrik MAPE (Mean Absolute Percentage Error) dan menampilkan indikator performa prediksi pada dashboard pimpinan.

### 4.19 Modul Vehicle Routing Problem (VRP) & Optimasi Rute Armada (Fase 4)
- **FR-VRP-01**: Sistem mengimplementasikan algoritma VRP dengan Jendela Waktu (*Capacitated Vehicle Routing Problem with Time Windows - CVRPTW*) untuk menentukan pembagian sekolah dan urutan rute pengantaran per kendaraan.
- **FR-VRP-02**: Algoritma VRP memproses parameter masukan: (a) titik koordinat dapur asal, (b) koordinat seluruh sekolah tujuan, (c) kuota porsi masing-masing sekolah, (d) jendela waktu makan siang sekolah (misal: 11.15 - 11.45), (e) kapasitas muat maksimal tiap armada, dan (f) matriks jarak serta estimasi durasi lalu lintas.
- **FR-VRP-03**: Sistem memastikan estimasi waktu perjalanan dari dapur hingga titik sekolah terakhir pada suatu rute tidak melebihi ambang batas penurunan suhu aman makanan hangat (maksimal durasi perjalanan 90 menit dalam boks insulasi termal).
- **FR-VRP-04**: Admin Distribusi dapat meninjau visualisasi peta rute multi-warna di layar dashboard, membandingkan efisiensi total jarak tempuh (km) dan total konsumsi BBM antar-alternatif rute.
- **FR-VRP-05**: Sistem menerbitkan rute terpilih ke aplikasi driver, lengkap dengan integrasi tombol navigasi belokan demi belokan (*turn-by-turn navigation*) ke Google Maps / Waze.
- **FR-VRP-06**: Apabila terjadi kendala armada di jalan (mogok atau kecelakaan), dispatcher admin dapat melakukan *dynamic re-routing* untuk memindahkan sisa sekolah tujuan ke armada cadangan terdekat yang masih memiliki sisa kapasitas muat.

### 4.20 Modul Integrasi Sensor IoT Cold-Chain & Pemantauan HACCP (Fase 4)
- **FR-IOT-01**: Sistem menyediakan gateway API telemetri IoT terstandarisasi (MQTT / HTTPS Webhook) untuk menerima data pembacaan sensor nirkabel dari perangkat keras di dapur dan armada.
- **FR-IOT-02**: Sensor IoT Cold-Storage Dapur mengirimkan data periodik (interval 5 menit) untuk: suhu ($^\circ\text{C}$), kelembapan relatif (%RH), dan status pintu terbuka/tertutup pada chiller bahan baku ($0^\circ\text{C} - 4^\circ\text{C}$) dan freezer daging ($\le -18^\circ\text{C}$).
- **FR-IOT-03**: Sensor IoT Boks Armada mengirimkan data telemetri suhu hidangan makanan matang ($\ge 60^\circ\text{C}$) beserta posisi koordinat GPS armada selama perjalanan distribusi berlangsung.
- **FR-IOT-04**: Sistem memicu alarm darurat seketika (audio alarm di dapur, push notifikasi aplikasi web, dan pesan WhatsApp darurat ke Kepala Dapur & Teknisi) jika suhu chiller melampaui $6^\circ\text{C}$ selama $> 30$ menit berturut-turut atau pintu terbuka $> 10$ menit.
- **FR-IOT-05**: Sistem memicu peringatan kepada kurir dan admin jika suhu boks termal makanan hangat selama di jalan turun di bawah batas kritis HACCP ($< 55^\circ\text{C}$).
- **FR-IOT-06**: Sistem menyusun buku log kepatuhan HACCP otomatis yang menyajikan grafik fluktuasi suhu 24 jam non-stop dan catatan insiden deviasi suhu untuk keperluan sertifikasi kelayakan higienis sanitasi pangan.

### 4.21 Modul Portal Pengawasan Eksternal BGN & Pelaporan Publik (Fase 4)
- **FR-EXT-01**: Sistem menyediakan portal pengawasan khusus dengan akses read-only terverifikasi bagi petugas Badan Gizi Nasional (BGN), Dinas Kesehatan, dan Dinas Pendidikan.
- **FR-EXT-02**: Auditor BGN dapat memverifikasi keterlacakan data (*end-to-end traceability*): memilih tanggal dan sekolah tertentu untuk melihat asal-usul bahan baku (supplier mana, batch kedaluwarsa kapan, lolos QC jam berapa), suhu masak, armada pengirim, hingga foto dan tanda tangan penerima di sekolah.
- **FR-EXT-03**: Portal pengawasan menampilkan metrik kepatuhan gizi agregat per daerah: rata-rata kalori per porsi yang disajikan, persentase keberhasilan pengiriman tepat waktu, dan indeks kepuasan sekolah.
- **FR-EXT-04**: Sistem menyediakan generator laporan kepatuhan regulasi terstandarisasi format pemerintah (format laporan harian, mingguan, bulanan BGN) yang siap diunduh dalam format PDF bertanda tangan elektronik (QR Code Verifikasi Keaslian Dokumen).
- **FR-EXT-05**: Sistem mempublikasikan ringkasan menu bergizi hari ini dan sertifikat kepatuhan sanitasi dapur ke laman publik terbuka sebagai wujud transparansi dan akuntabilitas program MBG kepada masyarakat luas dan wali murid.

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

### 5.1 Performa & Throughput
- Waktu respon rata-rata endpoint transaksional (presensi, mutasi stok, status pengiriman) $\le 300$ ms pada persentil 95 (P95).
- Endpoint kalkulasi agregasi kebutuhan bahan (BOM) skala dapur besar (melayani hingga 10.000 porsi per hari dari 50+ sekolah) harus selesai dieksekusi dalam waktu $\le 800$ ms.
- Algoritma optimasi rute VRP Fase 4 untuk 10 armada dan 50 titik singgah sekolah harus menghasilkan rute optimal dalam waktu $\le 15$ detik.
- Ingestion data telemetri IoT Fase 4 mampu menangani beban hingga 1.000 pesan data suhu per menit tanpa hambatan latensi (*non-blocking event streaming*).

### 5.2 Keamanan, Enkripsi & Kepatuhan Regulasi
- Password akun wajib di-hash menggunakan algoritma modern Argon2id atau Bcrypt dengan salt factor minimal 10 putaran.
- Seluruh komunikasi data client-server wajib menggunakan protokol HTTPS terenkripsi TLS 1.3.
- Data sensitif perseorangan (NIK pekerja, nomor kontak pribadi guru/siswa) dilindungi sesuai prinsip Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022) dengan enkripsi pada tingkat kolom data sensitif (*column-level encryption* AES-256).
- Sesi login dilindungi token JWT dengan atribut `HttpOnly`, `SameSite=Lax`, dan `Secure` flags untuk mencegah serangan Cross-Site Scripting (XSS) dan Session Hijacking.
- Setiap operasi mutasi data bernilai finansial atau inventaris (penerbitan PO, approval menu, pemotongan stok, penerimaan barang) wajib mencatat jejak audit digital immutable (*audit log*: user ID, timestamp mikrodetik, IP address, user-agent, nilai sebelum vs nilai sesudah).

### 5.3 Keandalan & Integritas Data (Reliability & ACID)
- Seluruh operasi pemotongan stok bahan produksi, pemotongan stok bertingkat FEFO, dan transfer stok antar-cabang wajib dibungkus dalam Database Transaction dengan tingkat isolasi serializable/read-committed guna mencegah *race condition* dan data korup (*zero stock anomaly*).
- Ketersediaan sistem (*High Availability SLA*) minimal $99.9\%$ selama jam operasional kritis dapur (pukul 03.00 WIB s/d 14.00 WIB).
- Mekanisme Disaster Recovery dengan pencadangan basis data otomatis (*automated backup*) setiap 6 jam ke penyimpanan cloud terisolasi (*off-site cloud storage*) dengan target RPO (Recovery Point Objective) $\le 1$ jam dan RTO (Recovery Time Objective) $\le 2$ jam.

### 5.4 Kompatibilitas & Ketahanan Offline
- Seluruh antarmuka kurir lapangan dan presensi dirancang responsif mobile-first, kompatibel dengan browser Google Chrome Mobile (v100+), Safari iOS (v15+), dan Samsung Internet.
- Antarmuka dashboard admin dan pimpinan responsif untuk layar tablet (iPad/Android tablet) dan monitor desktop (resolusi 1366x768 hingga 4K).
- PWA mendukung pemasangan ke beranda layar ponsel (*Add to Home Screen*) dengan icon standar dan splash screen resmi.
- Sistem tahan terhadap kondisi jaringan terputus (blank spot); antrean transaksi lokal pada IndexedDB tidak boleh hilang saat tab browser ditutup atau baterai ponsel mati sebelum sinkronisasi berhasil.

### 5.5 Skalabilitas Arsitektur (Multi-Dapur)
- Skema basis data mendukung skalabilitas partisi data log presensi, mutasi stok, dan log IoT per unit dapur dan per tahun/bulan untuk menjaga kecepatan kueri saat data tumbuh hingga jutaan baris.
- Antrean pengiriman pesan WhatsApp dan eksekusi komputasi berat (AI Menu Planner & VRP Engine) dipisahkan ke sistem *Background Worker Queue* (Redis BullMQ / Celery worker) agar tidak membebani web server utama.

---

## 6. Alur Kerja Pengguna Terpadu (User Flows)

### Flow 1: Presensi Pekerja Dapur (Fase 1)
```
[Pekerja Buka Web PWA di HP]
          ↓
[Login / Cek Sesi JWT Aktif]
          ↓
[Buka Halaman Presensi: /presensi]
          ↓
[Kamera Aktif: Ambil Foto Selfie & Tangkap Geolocation HTML5]
          ↓
[Submit Payload (Foto Blob + Lat/Lng) ke Server]
          ↓
[Server: Validasi Radius Haversine vs Koordinat Dapur]
          ↓
[Server: Evaluasi Jam Masuk vs Shift Kerja & Toleransi]
          ↓
[Database Insert: Status 'tepat_waktu' / 'terlambat' & Nilai 'is_in_radius']
          ↓
[Pekerja Menerima Feedback Visual Keberhasilan Presensi]
```

---

### Flow 2: Siklus Menu ke Pengurangan Stok Produksi (Fase 1)
```
[Ahli Gizi Input Menu & Resep BOM Gramasi per Porsi]
          ↓
[Ahli Gizi Tekan 'Approve Menu' (is_approved_gizi = TRUE)]
          ↓
[Admin Menjadwalkan Menu ke Tanggal Produksi]
          ↓
[Sistem Otomatis Hitung: Total Target Porsi Sekolah Aktif x Gramasi BOM]
          ↓
[Sistem Bandingkan Kebutuhan Bahan vs Saldo Gudang Saat Ini]
          ↓
    ┌─────┴────────────────────────────────┐
[Stok Cukup]                        [Defisit Terdeteksi]
    │                                      │
    │                              [Kirim Peringatan Defisit]
    │                              [Auto-Draft Purchase Order]
    ↓                                      │
[Kepala Dapur Mulai Masak]                 │
    ↓                                      │
[Sistem Jalankan Potong Stok (ACID)] <─────┘ (Setelah PO Diterima)
    ↓
[Ledger Mutasi Tercatat: mutasi_jenis = 'keluar_produksi']
```

---

### Flow 3: Pengadaan Bahan, QC Bertingkat & Batch FEFO (Fase 2)
```
[Sistem Deteksi Defisit Bahan dari Jadwal BOM Menu]
          ↓
[Petugas Stok Terbitkan PO Resmi ke Supplier Terdaftar]
          ↓
[Pemberitahuan PO Terkirim ke Supplier]
          ↓
[Supplier Antar Bahan ke Dapur SPPG]
          ↓
[Petugas QC Buka Form Penerimaan Bahan: /api/qc]
          ↓
[Uji Fisik: Ukur Suhu Chiller, Periksa Kemasan, Uji Organoleptik, Foto]
          ↓
    ┌─────┴────────────────────────────────┐
[Status: LOLOS / LOLOS BERSYARAT]   [Status: DITOLAK]
    │                                      │
    │                              [Bahan Diretur ke Supplier]
    │                              [Stok Dapur TIDAK Bertambah]
    ↓                                      │
[Sistem Terbitkan Nomor Batch Baru]        │
[Catat Tanggal Kedaluwarsa Bahan]          │
    ↓                                      │
[Saldo Bahan Masuk ke Gudang]              │
    ↓                                      │
[Saat Masak: Algoritma FEFO Potong]        │
[Batch yang Tanggal Expired Terdekat] <────┘
```

---

### Flow 4: Pengiriman Armada & Serah Terima Digital e-POD (Fase 2)
```
[Admin Siapkan Surat Jalan: Jadwal Menu + Armada Mobil Boks + Driver]
          ↓
[Porsi Makanan Hangat Dimuat ke Boks Termal Kendaraan]
          ↓
[Driver Buka Portal Mobile: /distribusi & Klik 'Mulai Pengiriman']
          ↓
[Status Surat Jalan Berubah Menjadi 'dalam_perjalanan']
          ↓
[Driver Tiba di Titik Sekolah Tujuan]
          ↓
[Hitung Fisik Porsi & Cek Kondisi: 'baik_layak' / 'kurang_hangat']
          ↓
[Buka Form Serah Terima di HP Driver]
          ↓
[Guru / PIC Sekolah Tanda Tangan di Layar Canvas Digital]
          ↓
[Driver Ambil Foto Bukti Penyerahan Makanan di Depan Sekolah]
          ↓
[Submit Data e-POD ke Server]
          ↓
[Status Serah Terima Sekolah Berubah Menjadi 'selesai']
```

---

### Flow 5: Operasional Multi-Dapur & Distribusi Bahan Antar-Cabang (Fase 3)
```
[Dapur Satelit B Mengalami Defisit Stok Bahan Protein]
          ↓
[Kepala Gudang Satelit B Ajukan Permintaan Transfer Stok ke Dapur Pusat]
          ↓
[Koordinator Regional / Super Admin Setujui Alokasi Transfer]
          ↓
[Dapur Pusat Terbitkan Surat Jalan Mutasi Keluar (Stok Pusat Terpotong)]
          ↓
[Armada Logistik Kirim Bahan dari Dapur Pusat ke Satelit B]
          ↓
[Petugas QC Satelit B Periksa Kondisi Bahan Masuk]
          ↓
[Bahan Lolos QC: Saldo Batch Masuk ke Gudang Satelit B]
          ↓
[Dashboard Regional Terupdate Otomatis Memperlihatkan Posisi Stok Realtime]
```

---

### Flow 6: Sinkronisasi Offline-ke-Online PWA Lapangan (Fase 3)
```
[Driver / Pekerja Masuk Area Sekolah Tanpa Sinyal Seluler (Blank Spot)]
          ↓
[Buka Halaman Presensi / Serah Terima di PWA]
          ↓
[Service Worker Sajikan Antarmuka dari Cache Lokal (Offline Mode)]
          ↓
[Pengguna Ambil Foto, Koordinat GPS, dan Tanda Tangan Digital]
          ↓
[PWA Simpan Seluruh Objek Payload ke IndexedDB Outbox Queue]
          ↓
[Tampilan Visual: Badge Kuning 'Menyimpan Offline (1 Transaksi Tertunda)']
          ↓
[Kendaraan Bergerak Menuju Area Terjangkau Sinyal Seluler 4G/WiFi]
          ↓
[PWA Deteksi Event 'online' / Background Sync Terpicu]
          ↓
[Outbox Worker Kirimkan Antrean Payload ke Server Satu per Satu]
          ↓
[Server Terima Data, Validasi Idempotency Key, Simpan ke Database]
          ↓
[PWA Update Tampilan: Badge Hijau 'Semua Data Berhasil Tersinkronisasi']
```

---

### Flow 7: Penyusunan Menu Berbasis AI & Analisis Biaya HPP (Fase 4)
```
[Ahli Gizi Buka Modul AI Menu Planner di Dashboard]
          ↓
[Tentukan Periode (cth: 10 Hari) + Jenjang Sekolah (SD) + Target Plafon HPP]
          ↓
[Mesin Linear Programming AI Mengolah Database Komoditas Pangan & AKG]
          ↓
[Sistem Tampilkan Usulan Siklus Menu Optimal (Nutrisi Seimbang + Biaya Efisien)]
          ↓
[Ahli Gizi Lakukan Peninjauan Nutrisi & Penyesuaian Komponen Lauk]
          ↓
[Ahli Gizi Tekan 'Approve Rekomendasi Menu AI']
          ↓
[Modul Finansial HPP Menghitung Real-time HPP Perkiraan per Porsi]
          ↓
[Jadwal Menu Terbit & Terhubung ke Kalender Operasional Dapur]
```

---

### Flow 8: Pengantaran Pintar VRP & Telemetri Suhu IoT HACCP (Fase 4)
```
[Admin Buka Modul Dispatching Pengiriman]
          ↓
[Sistem VRP Otomatis Kelompokkan 40 Sekolah ke dalam 5 Rute Armada Optimal]
          ↓
[Driver Memulai Perjalanan Sesuai Urutan Rute Panduan Peta VRP]
          ↓
[Sensor IoT Suhu di Boks Termal Mengirim Data per 5 Menit via Jaringan Seluler]
          ↓
[Server Pantau Telemetri: Suhu Makanan Wajib >= 60°C]
          ↓
    ┌─────┴────────────────────────────────┐
[Suhu Aman (>= 60°C)]               [Suhu Turun Kritis (< 55°C)]
    │                                      │
    │                              [Sistem Bunyikan Alarm ke Driver & Admin]
    │                              [Instruksi Darurat: Cek Insulasi Boks]
    ↓                                      │
[Makanan Tiba di Sekolah Tepat Waktu] <────┘
[Suhu Tercatat di e-POD Memenuhi Standar HACCP Bebas Bakteri]
```

---

## 7. Rencana Model Data & Entitas Lanjutan (Fase 1 - Fase 4)

### 7.1 Ringkasan Entitas Terimplementasi (Fase 1 & Fase 2)
1. `konfigurasi_dapur`: Konfigurasi koordinat geofence dapur tunggal, radius meter toleransi.
2. `users`: Akun otentikasi login, hashed password, role pengguna, status keaktifan.
3. `anggota`: Biodata profil pekerja, NIK unik, relasi ke akun users, jabatan.
4. `shift_kerja` & `jadwal_shift`: Master rentang jam shift harian dan penugasan mingguan anggota.
5. `absensi`: Riwayat presensi selfie GPS, stempel waktu, status keterlambatan, validasi radius.
6. `sekolah`: Master data sekolah binaan, koordinat lokasi, alokasi porsi siswa, data PIC.
7. `bahan`: Master komoditas bahan mentah, kategori, satuan baku, saldo stok total gudang.
8. `menu` & `resep_item`: Master hidangan, kandungan gizi AKG, formula resep BOM gramasi per porsi.
9. `jadwal_menu`: Penugasan 1 menu untuk tanggal kalender tertentu, total akumulasi porsi.
10. `stok_mutasi`: Buku besar mutasi inventaris stok non-negatif (*append-only ledger*).
11. `supplier`: Direktori data rekanan supplier bahan pangan terverifikasi.
12. `purchase_order` & `purchase_order_item`: Transaksi pembelian bahan baku ke supplier.
13. `qc_penerimaan`: Laporan inspeksi fisik bahan datang (suhu, kemasan, visual, keputusan lolos).
14. `stok_batch`: Manajemen lot batch bahan lolos QC, pelacakan tanggal kedaluwarsa untuk FEFO.
15. `armada`: Master kendaraan distribusi pengangkut boks makanan dan kapasitas angkut.
16. `distribusi_pengiriman`: Surat jalan operasional armada, supir bertugas, jam berangkat/tiba.
17. `serah_terima_sekolah`: Bukti penyerahan porsi digital (e-POD), kondisi makanan, foto dan TTD digital PIC sekolah.

### 7.2 Entitas Baru Fase 3 (Multi-Dapur, WA, Offline & HPP/Waste)
```sql
-- Cabang unit dapur SPPG (Fase 3)
CREATE TABLE dapur_cabang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_dapur VARCHAR(20) UNIQUE NOT NULL,
  nama_dapur VARCHAR(100) NOT NULL,
  tipe_dapur VARCHAR(30) NOT NULL DEFAULT 'satelit', -- 'pusat' / 'satelit'
  alamat TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  radius_meter INT NOT NULL DEFAULT 100,
  kapasitas_maks_porsi INT NOT NULL DEFAULT 3000,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mutasi transfer stok antar-dapur (Fase 3)
CREATE TABLE transfer_stok_cabang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_transfer VARCHAR(50) UNIQUE NOT NULL,
  dapur_asal_id UUID NOT NULL REFERENCES dapur_cabang(id),
  dapur_tujuan_id UUID NOT NULL REFERENCES dapur_cabang(id),
  bahan_id UUID NOT NULL REFERENCES bahan(id),
  batch_id UUID REFERENCES stok_batch(id),
  jumlah DECIMAL(12,3) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'diajukan', -- 'diajukan', 'dalam_perjalanan', 'diterima', 'batal'
  dikirim_pada TIMESTAMPTZ,
  diterima_pada TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Antrean log pesan WhatsApp Gateway (Fase 3)
CREATE TABLE wa_message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_tujuan VARCHAR(25) NOT NULL,
  tipe_pesan VARCHAR(50) NOT NULL, -- 'po_supplier', 'reminder_shift', 'alert_stok', 'status_kirim'
  payload_pesan TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued', -- 'queued', 'sent', 'delivered', 'failed'
  external_message_id VARCHAR(100),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Jurnal transaksi offline sync PWA (Fase 3)
CREATE TABLE offline_sync_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  entitas_target VARCHAR(50) NOT NULL, -- 'absensi', 'serah_terima_sekolah'
  client_recorded_at TIMESTAMPTZ NOT NULL,
  payload_json JSONB NOT NULL,
  sync_status VARCHAR(20) NOT NULL DEFAULT 'synced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pencatatan buku besar food waste (Fase 3)
CREATE TABLE food_waste_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dapur_id UUID NOT NULL REFERENCES dapur_cabang(id),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  kategori_waste VARCHAR(30) NOT NULL, -- 'prep_waste', 'cooking_loss', 'plate_waste'
  bahan_id UUID REFERENCES bahan(id),
  menu_id UUID REFERENCES menu(id),
  berat_kg DECIMAL(10,3) NOT NULL,
  estimasi_kerugian_rp DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  catatan TEXT,
  dicatat_oleh UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tiket komplain dan aduan kualitas sekolah (Fase 3)
CREATE TABLE komplain_sekolah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_tiket VARCHAR(50) UNIQUE NOT NULL,
  sekolah_id UUID NOT NULL REFERENCES sekolah(id),
  pengiriman_id UUID REFERENCES distribusi_pengiriman(id),
  kategori_kendala VARCHAR(50) NOT NULL, -- 'kurang_porsi', 'makanan_dingin', 'kemasan_rusak', 'dugaan_basi'
  deskripsi TEXT NOT NULL,
  foto_bukti_url TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'baru', -- 'baru', 'investigasi', 'tindakan', 'selesai'
  catatan_investigasi TEXT,
  tindakan_perbaikan TEXT,
  diselesaikan_oleh UUID REFERENCES users(id),
  diselesaikan_pada TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 7.3 Entitas Baru Fase 4 (AI, VRP, IoT Cold-Chain & Pengawasan BGN)
```sql
-- Histori usulan menu cerdas hasil AI (Fase 4)
CREATE TABLE ai_menu_preset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_paket_siklus VARCHAR(100) NOT NULL,
  target_jenjang VARCHAR(30) NOT NULL, -- 'paud', 'sd', 'smp', 'sma'
  target_kalori_min DECIMAL(6,2) NOT NULL,
  target_kalori_max DECIMAL(6,2) NOT NULL,
  estimasi_hpp_rata_rata DECIMAL(12,2) NOT NULL,
  rekomendasi_menu_json JSONB NOT NULL,
  status_approval VARCHAR(30) NOT NULL DEFAULT 'draft', -- 'draft', 'disetujui', 'ditolak'
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rute optimal hasil komputasi VRP (Fase 4)
CREATE TABLE vrp_rute_harian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  armada_id UUID NOT NULL REFERENCES armada(id),
  driver_id UUID REFERENCES users(id),
  urutan_sekolah_json JSONB NOT NULL, -- Urutan stop: [{sekolah_id, urutan, est_jam_tiba, porsi}]
  total_jarak_km DECIMAL(6,2) NOT NULL,
  total_estimasi_menit INT NOT NULL,
  status_rute VARCHAR(30) NOT NULL DEFAULT 'terencana',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Master perangkat sensor nirkabel IoT (Fase 4)
CREATE TABLE iot_sensor_device (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_alat VARCHAR(50) UNIQUE NOT NULL,
  tipe_penempatan VARCHAR(30) NOT NULL, -- 'chiller_dapur', 'freezer_dapur', 'boks_armada'
  dapur_id UUID REFERENCES dapur_cabang(id),
  armada_id UUID REFERENCES armada(id),
  ambang_suhu_min DECIMAL(5,2) NOT NULL,
  ambang_suhu_max DECIMAL(5,2) NOT NULL,
  status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Buku log streaming data telemetri suhu IoT (Fase 4)
CREATE TABLE iot_telemetri_suhu (
  id BIGSERIAL PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES iot_sensor_device(id),
  waktu_rekam TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  suhu_celsius DECIMAL(5,2) NOT NULL,
  kelembapan_persen DECIMAL(5,2),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_anomali_haccp BOOLEAN NOT NULL DEFAULT FALSE
);

-- Log laporan kepatuhan resmi Badan Gizi Nasional (Fase 4)
CREATE TABLE bgn_laporan_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_dokumen VARCHAR(100) UNIQUE NOT NULL,
  periode_mulai DATE NOT NULL,
  periode_selesai DATE NOT NULL,
  dapur_id UUID NOT NULL REFERENCES dapur_cabang(id),
  total_porsi_tersaji INT NOT NULL,
  rerata_kalori_tercapai DECIMAL(6,2) NOT NULL,
  skor_kepatuhan_haccp DECIMAL(5,2) NOT NULL,
  dokumen_pdf_url TEXT NOT NULL,
  checksum_sha256 VARCHAR(64) NOT NULL,
  qr_verifikasi_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 8. Metrik Keberhasilan (KPI) per Fase

### 8.1 KPI Fase 1 (MVP Single Dapur Operasional)
- **Tingkat Kepatuhan Presensi Geofence**: $\ge 95\%$ catatan presensi pekerja terverifikasi valid di dalam radius $\le 100$ meter dapur.
- **Ketepatan Kalkulasi BOM**: $100\%$ kalkulasi bahan harian sesuai formula resep tanpa kesalahan manual hitung spreadsheet.
- **Integritas Stok Non-Negatif**: $0$ kejadian saldo bahan bernilai minus pada database ledger.

### 8.2 KPI Fase 2 (Rantai Pasok, QC, FEFO & Distribusi Armada)
- **Kepatuhan Sortir FEFO**: $100\%$ pengeluaran bahan produksi menggunakan batch kedaluwarsa terdekat.
- **Pencegahan Bahan Basi Masuk**: $0$ kasus bahan pangan kedaluwarsa lolos inspeksi QC ke gudang dapur.
- **Tingkat Keterisian e-POD Serah Terima**: $\ge 98\%$ pengantaran porsi sekolah memiliki kelengkapan foto dan tanda tangan digital PIC sekolah saat serah terima.
- **Ketepatan Waktu Tiba di Sekolah**: $\ge 90\%$ porsi makanan tiba di sekolah sebelum jam makan siang terjadwal (SLA $11.00$ waktu lokal).

### 8.3 KPI Fase 3 (Multi-Dapur, WhatsApp, PWA Offline & HPP/Waste)
- **Keberhasilan Sinkronisasi Offline PWA**: $100\%$ transaksi offline berhasil di-commit ke server tanpa data hilang saat koneksi pulih.
- **Tingkat Keberhasilan Notifikasi WhatsApp**: $\ge 95\%$ pesan operasional penting terkirim dan diterima dalam waktu $< 60$ detik.
- **Pengendalian Deviasi HPP**: Selisih varians HPP estimasi vs HPP riil belanja $\le 3\%$.
- **Pengurangan Food Waste**: Penurunan rasio limbah makanan hingga $\le 4\%$ dari total volume bahan yang diproses di dapur.
- **Kecepatan Respon Insiden Komplain**: Waktu respon awal penanganan tiket aduan sekolah $\le 60$ menit sejak diajukan.

### 8.4 KPI Fase 4 (AI Nutrition, Smart Replenishment, VRP & IoT HACCP)
- **Akurasi Standar Nutrisi AI**: $100\%$ siklus menu AI memenuhi ambang Angka Kecukupan Gizi (AKG) nasional per jenjang sasaran dengan efisiensi biaya HPP optimal.
- **Akurasi Peramalan Permintaan Pangan (AI Forecasting)**: Nilai kesalahan ramalan kebutuhan bahan (MAPE) $\le 8\%$.
- **Efisiensi Rute Armada (VRP)**: Penghematan total jarak tempuh armada kendaraan $\ge 15\%$ dan penghematan biaya bahan bakar armada $\ge 12\%$.
- **Kepatuhan Keamanan Pangan HACCP Suhu Termal**: $\ge 99.5\%$ durasi distribusi makanan hangat berada pada suhu aman $\ge 60^\circ\text{C}$ terpantau sensor IoT.
- **Transparansi Audit Publik BGN**: Penerbitan laporan audit kepatuhan gizi dan sanitasi otomatis selesai maksimal $\le 30$ menit setiap penutupan buku operasional bulanan.

---

## 9. Matriks Risiko & Mitigasi (Risk Management)

| Risiko Operasional / Teknis | Tingkat Dampak | Probabilitas | Rencana Mitigasi Sistem |
|---|---|---|---|
| **Pekerja memalsukan lokasi GPS (Fake GPS / Mock Location)** | Tinggi | Sedang | Deteksi tanda *mock location* via Web API, validasi konsistensi IP address jaringan WiFi dapur, dan wajib menyertakan foto selfie wajah jelas di lingkungan fisik dapur. |
| **Sinyal seluler hilang saat kurir tiba di sekolah terpencil** | Tinggi | Tinggi | Mesin PWA Offline-First dengan IndexedDB Outbox Queue; data foto, porsi, dan tanda tangan tersimpan lokal aman hingga kembali mendapat sinyal tanpa menghambat serah terima. |
| **Bahan makanan rusak atau basi sebelum tanggal kedaluwarsa** | Kritis | Rendah | Prosedur wajib QC inspeksi organoleptik saat kedatangan; integrasi sensor IoT telemetri suhu cold-storage secara realtime untuk mencegah pembiakan kuman/bakteri. |
| **Lonjakan beban pengiriman pesan WhatsApp Gateway (Kena Limit/Blokir)** | Sedang | Sedang | Penggunaan official WhatsApp Cloud API dengan nomor bisnis terverifikasi Meta, penerapan antrean job berbatas kecepatan (*rate-limited message queue*), dan fallback SMS/Email. |
| **Armada distribusi mengalami kecelakaan atau mogok di jalan** | Tinggi | Rendah | Fitur *dynamic re-dispatch* pada modul VRP dispatcher: admin dapat mengalihkan daftar sekolah rute terdampak ke armada terdekat lain yang memiliki sisa kapasitas angkut. |
| **Penurunan suhu makanan di bawah batas higienis (< 60°C)** | Kritis | Sedang | Boks termal berspesifikasi insulasi ganda; pemantauan real-time via sensor nirkabel IoT; pembatasan waktu tempuh maksimal rute VRP $\le 90$ menit dari selesai masak hingga tiba di meja makan siswa. |
| **Rekomendasi AI Menu tidak sesuai dengan ketersediaan pasar lokal** | Sedang | Sedang | Penerapan prinsip *Human-in-the-loop*: Ahli Gizi memegang hak veto mutlak untuk menyetujui, menolak, atau mengganti item resep sebelum diterbitkan ke kalender operasional dapur. |
| **Kebocoran data pribadi (NIK, foto wajah, kontak sekolah)** | Kritis | Rendah | Enkripsi end-to-end HTTPS TLS 1.3, hashing sandi Argon2id, enkripsi kolom basis data untuk data pribadi berisiko, dan pembatasan ketat otorisasi RBAC (kepatuhan UU PDP). |