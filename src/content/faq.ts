export interface FaqItem {
  id: string;
  tanya: string;
  jawab: string;
}

export const DAFTAR_FAQ: FaqItem[] = [
  {
    id: "offline-kurir",
    tanya: "Bagaimana bila kurir tidak mendapat sinyal internet saat tiba di sekolah?",
    jawab:
      "Aplikasi portal kurir berbasis PWA dilengkapi sistem offline-first. Driver tetap dapat mencatat jumlah porsi, mengambil foto bukti, dan meminta tanda tangan digital PIC sekolah. Data disimpan aman di IndexedDB perangkat dan otomatis terkirim begitu ponsel kembali terhubung ke jaringan internet tanpa risiko data ganda (idempotent).",
  },
  {
    id: "perhitungan-bom",
    tanya: "Bagaimana cara sistem menghitung kebutuhan bahan belanja harian?",
    jawab:
      "Kebutuhan dihitung otomatis melalui modul Bill of Materials (BOM). Ahli gizi menetapkan gramasi baku per porsi untuk menu yang disetujui. Ketika admin memasukkan target porsi, sistem mengalikan porsi dengan gramasi, membandingkan dengan stok fisik di gudang, dan otomatis menerbitkan draft dokumen PO untuk bahan yang mengalami defisit.",
  },
  {
    id: "fefo-bahan",
    tanya: "Mengapa sistem menerapkan metode FEFO dan bukan FIFO biasa?",
    jawab:
      "Dalam operasional dapur makanan bergizi, kesegaran dan tanggal kedaluwarsa bahan adalah faktor keamanan pangan yang krusial. FEFO (First-Expired, First-Out) memastikan bahan yang memiliki tanggal batas simpan paling dekat dikeluarkan lebih dahulu oleh sistem saat produksi, terlepas dari tanggal kedatangan bahan tersebut ke gudang.",
  },
  {
    id: "pemantauan-suhu",
    tanya: "Bagaimana standar pemantauan suhu makanan matang selama pengantaran?",
    jawab:
      "Sensor IoT yang terpasang pada boks termal pengangkut memancarkan data telemetri berkala. Batas aman suhu makanan matang dijaga minimal 60 °C dengan batas waktu tempuh maksimal 90 menit dari selesai masak. Jika suhu terdeteksi turun mendekati 55 °C, sistem segera membunyikan peringatan ke driver dan admin operasional.",
  },
  {
    id: "integrasi-bgn",
    tanya: "Apakah data sistem ini bisa diaudit oleh Badan Gizi Nasional (BGN) atau Dinkes?",
    jawab:
      "Ya. SPPG menyediakan portal pengawasan read-only khusus bagi auditor, perwakilan Dinkes, dan BGN. Setiap laporan mutasi bahan, pemenuhan AKG kalori, rekap telemetri suhu, dan e-POD dapat diverifikasi secara independen melalui kode QR serta checksum enkripsi SHA-256.",
  },
  {
    id: "pelatihan-pekerja",
    tanya: "Berapa lama waktu yang dibutuhkan untuk melatih pekerja dapur menggunakan aplikasi?",
    jawab:
      "Antarmuka presensi dan checklist dapur dirancang sangat intuitif dengan tombol besar dan panduan visual sederhana. Pekerja dapur umumnya dapat menguasai presensi selfie geofence dan checklist kerja dalam satu sesi pengenalan berdurasi 15 menit.",
  },
];
