export interface RoleItem {
  id: number;
  nama: string;
  fase: string;
  ringkasan: string;
  aksi: [string, string, string];
  tone: "daun" | "telur" | "es" | "terung" | "wortel";
  iconName: string;
}

export const DAFTAR_PERAN: RoleItem[] = [
  {
    id: 1,
    nama: "Super Admin",
    fase: "Fase 1–4",
    ringkasan:
      "Konfigurasi sistem global, audit log seluruh mutasi, kelola cabang dapur, dan manajemen parameter AI/IoT.",
    aksi: [
      "Mengatur izin RBAC dan kunci otentikasi seluruh cabang",
      "Memantau audit trail immutable setiap aksi berisiko finansial",
      "Mengonfigurasi ambang batas alarm telemetri sensor IoT",
    ],
    tone: "daun",
    iconName: "Shield",
  },
  {
    id: 2,
    nama: "Admin SPPG",
    fase: "Fase 1–4",
    ringkasan:
      "Operasional harian dapur, data master sekolah mitra, jadwal shift pekerja, dan rekap presensi.",
    aksi: [
      "Menetapkan master kuota porsi harian per sekolah tujuan",
      "Mengatur pembagian regu kerja dan jadwal shift pagi dapur",
      "Menerbitkan surat jalan resmi pengiriman makanan",
    ],
    tone: "telur",
    iconName: "Gear",
  },
  {
    id: 3,
    nama: "Koordinator Regional",
    fase: "Fase 3–4",
    ringkasan:
      "Supervisi klaster multi-dapur, alokasi kuota bahan, dan persetujuan transfer stok antar-cabang.",
    aksi: [
      "Menyetujui permohonan transfer bahan antar dapur satelit",
      "Memantau kapasitas produksi agregat dapur pusat dan satelit",
      "Mengalokasikan cadangan darurat saat lonjakan kebutuhan porsi",
    ],
    tone: "es",
    iconName: "Compass",
  },
  {
    id: 4,
    nama: "Ahli Gizi",
    fase: "Fase 1–4",
    ringkasan:
      "Penyusunan menu harian, formula gramasi BOM, kalkulasi pemenuhan AKG, dan hak veto rekomendasi AI.",
    aksi: [
      "Merumuskan takaran gramasi per porsi untuk 5 unsur pangan pokok",
      "Memvalidasi kecukupan kalori jenjang PAUD, SD, hingga SMA",
      "Menggunakan hak veto human-in-the-loop terhadap susunan AI",
    ],
    tone: "terung",
    iconName: "BowlFood",
  },
  {
    id: 5,
    nama: "Kepala Dapur",
    fase: "Fase 1–4",
    ringkasan:
      "Pimpinan eksekusi masak di lantai produksi, pemotongan stok otomatis, dan checklist higienitas.",
    aksi: [
      "Mengeksekusi pemotongan stok bahan masak dalam satu klik atomik",
      "Memeriksa kesiapan peralatan sanitasi dan kepatuhan APD kru",
      "Mencatat kendala masak dan residu proses produksi secara riil",
    ],
    tone: "wortel",
    iconName: "CookingPot",
  },
  {
    id: 6,
    nama: "Petugas QC / Lab",
    fase: "Fase 2–4",
    ringkasan:
      "Inspeksi gerbang bahan datang, pengujian organoleptik, dan audit sampel makanan matang sebelum kirim.",
    aksi: [
      "Mengukur dan memvalidasi suhu armada pengangkut bahan supplier",
      "Memeriksa keutuhan kemasan, kebersihan, dan label sertifikasi",
      "Menerbitkan tiket keputusan lolos atau penolakan retur stok",
    ],
    tone: "daun",
    iconName: "Microscope",
  },
  {
    id: 7,
    nama: "Petugas Stok",
    fase: "Fase 1–4",
    ringkasan:
      "Penerbitan draft PO, penerimaan barang, stock opname batch FEFO, dan pencatatan waste bahan baku.",
    aksi: [
      "Mengubah kalkulasi defisit bahan menjadi dokumen draft PO",
      "Mendaftarkan nomor batch dan tanggal kedaluwarsa bahan baru",
      "Mengatur tata letak rak gudang sesuai prioritas tanggal FEFO",
    ],
    tone: "telur",
    iconName: "Warehouse",
  },
  {
    id: 8,
    nama: "Driver / Kurir",
    fase: "Fase 1–4",
    ringkasan:
      "Presensi lapangan, pemuatan boks termal kendaraan, navigasi rute efisien, dan e-POD digital.",
    aksi: [
      "Melakukan presensi selfie geofence sebelum jadwal muat armada",
      "Memantau suhu boks termal tetap di atas 60 °C selama perjalanan",
      "Mengambil foto dan tanda tangan PIC Sekolah via portal e-POD",
    ],
    tone: "es",
    iconName: "Truck",
  },
  {
    id: 9,
    nama: "Akuntan / Finance",
    fase: "Fase 3–4",
    ringkasan:
      "Analisis HPP riil per porsi, rekonsiliasi invoice supplier vs PO, dan evaluasi dampak biaya food waste.",
    aksi: [
      "Membandingkan HPP estimasi resep dengan realisasi belanja aktual",
      "Melakukan pencocokan 3-way matching antara PO, QC, dan invoice",
      "Menghitung kerugian finansial akibat residu bahan dan retur makanan",
    ],
    tone: "wortel",
    iconName: "Receipt",
  },
  {
    id: 10,
    nama: "PIC Sekolah (Eksternal)",
    fase: "Fase 2–4",
    ringkasan:
      "Penerimaan porsi makan di sekolah, rating kelayakan makanan, catatan siswa absen, dan pelaporan mutu.",
    aksi: [
      "Memverifikasi jumlah boks porsi yang tiba sesuai pesanan",
      "Membubuhkan tanda tangan serah terima digital di layar kurir",
      "Mengirimkan ulasan organoleptik atau keluhan suhu makanan",
    ],
    tone: "terung",
    iconName: "GraduationCap",
  },
  {
    id: 11,
    nama: "Auditor / BGN / Dinkes",
    fase: "Fase 4",
    ringkasan:
      "Portal audit read-only independen untuk kepatuhan AKG, sertifikasi sanitasi, dan pelacakan batch nasional.",
    aksi: [
      "Mengakses rekam jejak telemetri suhu boks termal distribusi",
      "Memverifikasi keaslian laporan audit via pemindai QR & SHA-256",
      "Menilai kepatuhan pemenuhan gizi makro dan mikro harian",
    ],
    tone: "daun",
    iconName: "Certificate",
  },
  {
    id: 12,
    nama: "Pimpinan / Eksekutif",
    fase: "Fase 1–4",
    ringkasan:
      "Dashboard agregat eksekutif, realisasi anggaran program, SLA pengantaran tepat waktu, dan performa dapur.",
    aksi: [
      "Melihat capaian porsi tersalurkan hari ini di seluruh wilayah",
      "Mengawasi kepatuhan SLA ketibaan makanan sebelum pukul 11.00",
      "Mengevaluasi tren efisiensi operasional dan serapan anggaran",
    ],
    tone: "telur",
    iconName: "ChartBar",
  },
];
