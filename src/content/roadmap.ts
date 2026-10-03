export interface RoadmapPhase {
  fase: number;
  nama: string;
  status: "Selesai" | "Terimplementasi" | "Spesifikasi lengkap";
  statusTone: "daun" | "telur" | "es" | "terung";
  deskripsi: string;
  poinKunci: string[];
}

export const ROADMAP_FASES: RoadmapPhase[] = [
  {
    fase: 1,
    nama: "MVP Satu Dapur Sentral",
    status: "Selesai",
    statusTone: "daun",
    deskripsi:
      "Fondasi operasional satu dapur: autentikasi RBAC, presensi geofence, master sekolah, penyusunan resep BOM, dan dashboard produksi.",
    poinKunci: [
      "Autentikasi JWT HttpOnly aman & manajemen peran pengguna",
      "Presensi selfie dengan validasi radius GPS Haversine 100 m",
      "Kalkulasi Bill of Materials (BOM) otomatis per target porsi",
      "Dashboard pemotongan stok produksi dengan transaksi atomik",
    ],
  },
  {
    fase: 2,
    nama: "Rantai Pasok, QC, FEFO & Distribusi",
    status: "Terimplementasi",
    statusTone: "daun",
    deskripsi:
      "Integrasi hulu ke hilir: manajemen supplier & PO, inspeksi gerbang QC bahan datang, penomoran batch FEFO, serta e-POD driver.",
    poinKunci: [
      "Pengadaan PO supplier otomatis berdasarkan defisit bahan",
      "Pemeriksaan QC gerbang masuk: suhu, kemasan, organoleptik",
      "Pelacakan kedaluwarsa First-Expired, First-Out (FEFO)",
      "Surat jalan armada dan serah terima digital e-POD di sekolah",
    ],
  },
  {
    fase: 3,
    nama: "Multi-Dapur Cabang & Analitik Biaya",
    status: "Spesifikasi lengkap",
    statusTone: "es",
    deskripsi:
      "Skalabilitas regional: jaringan dapur pusat & satelit, WhatsApp notification gateway, PWA offline sync, dan audit HPP / food waste.",
    poinKunci: [
      "Arsitektur klaster multi-dapur dengan alur transfer stok antar-cabang",
      "WhatsApp gateway otomatis untuk PO supplier dan notifikasi shift",
      "PWA offline-first dengan antrean IndexedDB dan idempotensi",
      "Buku besar food waste 3 kategori dan pengendalian deviasi HPP",
    ],
  },
  {
    fase: 4,
    nama: "AI Menu Planner, VRP & IoT HACCP",
    status: "Spesifikasi lengkap",
    statusTone: "terung",
    deskripsi:
      "Otomasi cerdas dan pemantauan ketat: perencanaan menu linear programming, rute armada VRP teroptimasi, dan sensor suhu cold-chain.",
    poinKunci: [
      "AI perencana siklus menu minim HPP dengan pemenuhan batas AKG",
      "Vehicle Routing Problem (VRP) optimasi rute 10 armada & 50 sekolah",
      "Telemetri sensor IoT chiller, freezer, dan boks termal (min 60 °C)",
      "Portal verifikasi read-only nasional ber-QR code dan SHA-256",
    ],
  },
];
