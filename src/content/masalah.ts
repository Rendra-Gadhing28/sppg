export interface ProblemSolutionItem {
  id: string;
  judul: string;
  risikoManual: string;
  denganSppg: string;
  chipBukti: string;
  tone: "telur" | "cabai" | "daun" | "es" | "wortel" | "terung";
  iconName: string;
}

export const MASALAH_SOLUSI: ProblemSolutionItem[] = [
  {
    id: "presensi",
    judul: "Absen titip atau lokasi palsu",
    risikoManual:
      "Daftar hadir kertas mudah dititipkan dan lokasinya sulit dibuktikan kebenarannya.",
    denganSppg:
      "Presensi selfie dan GPS, jarak ke dapur dihitung dengan rumus Haversine, plus deteksi lokasi palsu.",
    chipBukti: "Radius 100 m",
    tone: "daun",
    iconName: "MapPin",
  },
  {
    id: "bom",
    judul: "Hitung bahan di spreadsheet",
    risikoManual:
      "Salah kali gramasi berarti kurang bahan mendadak saat jam masak di hari-H.",
    denganSppg:
      "Kebutuhan dihitung otomatis dari resep × porsi. Kekurangan langsung menjadi draft PO.",
    chipBukti: "Resep × porsi",
    tone: "wortel",
    iconName: "Calculator",
  },
  {
    id: "fefo",
    judul: "Bahan lewat masa simpan",
    risikoManual:
      "Stok lama tertimbun di belakang rak, stok baru terpakai duluan tanpa kontrol.",
    denganSppg:
      "QC saat bahan datang, nomor batch, dan pemotongan FEFO: yang paling dekat kedaluwarsa keluar lebih dulu.",
    chipBukti: "FEFO",
    tone: "telur",
    iconName: "Archive",
  },
  {
    id: "suhu",
    judul: "Makanan dingin di jalan",
    risikoManual:
      "Suhu tidak terpantau setelah boks termal ditutup dan diangkut kendaraan pengantar.",
    denganSppg:
      "Rute dibatasi waktu tempuh, sensor memantau suhu boks, alarm berbunyi sebelum suhu jatuh di bawah batas aman.",
    chipBukti: "60 °C atau lebih",
    tone: "es",
    iconName: "ThermometerHot",
  },
  {
    id: "epod",
    judul: "Bukti serah terima tercecer",
    risikoManual:
      "Tanda tangan kertas hilang, bukti foto tersebar di chat pribadi, sinyal di sekolah kerap putus.",
    denganSppg:
      "e-POD dengan foto, koordinat, dan tanda tangan PIC. Tersimpan di ponsel saat offline, terkirim otomatis saat sinyal kembali.",
    chipBukti: "e-POD offline",
    tone: "daun",
    iconName: "Signature",
  },
  {
    id: "audit",
    judul: "Laporan audit disusun belakangan",
    risikoManual:
      "Menyatukan data dari banyak buku catatan dan nota fisik butuh waktu berhari-hari.",
    denganSppg:
      "Jejak batch dari supplier sampai sekolah tercatat otomatis. Laporan ber-QR siap unduh (target maksimal 30 menit).",
    chipBukti: "QR dan SHA-256",
    tone: "terung",
    iconName: "FileCheck",
  },
];
