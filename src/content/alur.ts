export interface StageItem {
  id: number;
  judul: string;
  subjudul: string;
  fase: string;
  peran: string[];
  deskripsi: string;
  buktiData: string[];
  visualType:
    | "resep"
    | "po"
    | "qc"
    | "batch"
    | "masak"
    | "kirim"
    | "epod"
    | "laporan";
}

export const TAHAPAN_ALUR: StageItem[] = [
  {
    id: 1,
    judul: "Menu dan BOM",
    subjudul: "Formulasi resep per porsi dan persetujuan gizi",
    fase: "Fase 1",
    peran: ["Ahli Gizi"],
    deskripsi:
      "Ahli Gizi menyusun resep per porsi (gramasi tiap bahan) lalu menyetujui menu harian. Menu yang belum disetujui tidak dapat dijadwalkan ke jadwal masak.",
    buktiData: [
      "Standar AKG Kalori",
      "Komposisi 5 Unsur Pangan",
      "Veto Human-in-the-Loop",
    ],
    visualType: "resep",
  },
  {
    id: 2,
    judul: "Kebutuhan dan PO",
    subjudul: "Perhitungan otomatis defisit bahan terhadap stok riil",
    fase: "Fase 1–3",
    peran: ["Petugas Stok", "Admin SPPG"],
    deskripsi:
      "Sistem mengalikan porsi target dengan gramasi resep, memeriksa saldo gudang saat itu juga, dan mengubah kekurangan stok menjadi draft dokumen PO otomatis.",
    buktiData: ["PO-20261003-0007", "Status: Draft diajukan", "Defisit 250 kg ayam"],
    visualType: "po",
  },
  {
    id: 3,
    judul: "QC Bahan Datang",
    subjudul: "Inspeksi gerbang masuk bahan di dermaga penerimaan",
    fase: "Fase 2",
    peran: ["Petugas QC / Lab"],
    deskripsi:
      "Petugas mengukur suhu kendaraan pengirim, memeriksa keutuhan segel kemasan, uji organoleptik, dan mengunggah foto bukti. Bahan ditolak tidak akan menambah stok gudang.",
    buktiData: ["QC-20261003-0004", "Suhu kendaraan 3 °C", "Segel utuh & Lolos"],
    visualType: "qc",
  },
  {
    id: 4,
    judul: "Batch dan FEFO",
    subjudul: "Pemberian identitas batch dan urutan pemotongan",
    fase: "Fase 2",
    peran: ["Petugas Stok"],
    deskripsi:
      "Bahan yang lolos QC diberi kode batch dan tanggal kedaluwarsa. Sistem memprioritaskan pemotongan stok pada batch yang paling dekat masa simpannya (First-Expired, First-Out).",
    buktiData: [
      "BATCH-AYM-20261001-001",
      "Kedaluwarsa 2 hari",
      "Prioritas keluar pertama",
    ],
    visualType: "batch",
  },
  {
    id: 5,
    judul: "Masak di Dapur",
    subjudul: "Eksekusi produksi dengan pemotongan stok atomik",
    fase: "Fase 1–3",
    peran: ["Kepala Dapur"],
    deskripsi:
      "Kepala Dapur menekan tombol eksekusi produksi. Pengurangan stok berjalan dalam satu transaksi atomik database terisolasi, mencegah ketidaksesuaian saldo fisik dan sistem.",
    buktiData: [
      "Transaksi ACID Atomik",
      "Ledger Saldo Otomatis",
      "Pencatatan Waste Masak",
    ],
    visualType: "masak",
  },
  {
    id: 6,
    judul: "Kirim & Telemetri Suhu",
    subjudul: "Distribusi armada dengan batas waktu tempuh",
    fase: "Fase 2–4",
    peran: ["Driver / Kurir", "Admin SPPG"],
    deskripsi:
      "Surat jalan menghubungkan armada, sekolah tujuan, dan driver. Sensor IoT pada boks termal memantau suhu agar konsisten di atas 60 °C selama perjalanan maksimal 90 menit.",
    buktiData: [
      "SJ-20261003-0012",
      "Boks termal 62 °C (Aman)",
      "ETA sekolah 10.45 WIB",
    ],
    visualType: "kirim",
  },
  {
    id: 7,
    judul: "Serah Terima e-POD",
    subjudul: "Bukti penerimaan digital aman dan nir-kertas",
    fase: "Fase 2–3",
    peran: ["Driver / Kurir", "PIC Sekolah"],
    deskripsi:
      "Driver menghitung porsi fisik bersama PIC Sekolah, memeriksa kondisi boks, meminta tanda tangan digital di layar sentuh, dan mengambil foto bukti di lokasi.",
    buktiData: [
      "300 porsi terverifikasi",
      "Tanda tangan PIC Sekolah",
      "Tersimpan offline PWA",
    ],
    visualType: "epod",
  },
  {
    id: 8,
    judul: "Audit dan Laporan",
    subjudul: "Transparansi terpusat untuk akuntan dan pengawas",
    fase: "Fase 3–4",
    peran: ["Akuntan / Finance", "Auditor / BGN"],
    deskripsi:
      "Rekonsiliasi HPP aktual vs estimasi dan buku besar food waste disajikan dalam laporan bertanda tangan digital QR code dan checksum SHA-256 siap unduh.",
    buktiData: [
      "Deviasi HPP 1,4% (Terkendali)",
      "Food waste 3,2%",
      "Verifikasi SHA-256",
    ],
    visualType: "laporan",
  },
];
