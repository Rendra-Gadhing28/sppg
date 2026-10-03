export interface FeatureTile {
  id: string;
  judul: string;
  manfaat: string;
  fase: string;
  colSpanDesktop: number; // 12-col grid
  isInteractive: boolean;
  tone: "daun" | "telur" | "wortel" | "es" | "terung" | "cabai";
  iconName: string;
}

export const FITUR_TILES: FeatureTile[] = [
  {
    id: "geofence",
    judul: "Presensi Geofence",
    manfaat:
      "Hadir di dapur, bukan di rumah. Selfie dan GPS divalidasi terhadap radius dapur 100 meter.",
    fase: "Fase 1",
    colSpanDesktop: 5,
    isInteractive: true,
    tone: "daun",
    iconName: "MapPin",
  },
  {
    id: "bom",
    judul: "Kalkulator BOM & Resep",
    manfaat:
      "Geser jumlah porsi, lihat kebutuhan bahan gramasi per porsi dan defisit stok seketika.",
    fase: "Fase 1",
    colSpanDesktop: 7,
    isInteractive: true,
    tone: "wortel",
    iconName: "Calculator",
  },
  {
    id: "fefo",
    judul: "Stok Batch FEFO",
    manfaat:
      "Yang lebih dulu kedaluwarsa, lebih dulu dipakai, otomatis berurutan antar batch.",
    fase: "Fase 2",
    colSpanDesktop: 4,
    isInteractive: true,
    tone: "telur",
    iconName: "Archive",
  },
  {
    id: "qc",
    judul: "QC Bahan Datang",
    manfaat:
      "Suhu, kemasan, dan organoleptik diperiksa sebelum bahan masuk menjadi saldo gudang.",
    fase: "Fase 2",
    colSpanDesktop: 4,
    isInteractive: true,
    tone: "es",
    iconName: "ShieldCheck",
  },
  {
    id: "epod",
    judul: "e-POD & Tanda Tangan",
    manfaat:
      "Serah terima sah: verifikasi porsi, kondisi makanan, foto boks, dan tanda tangan PIC.",
    fase: "Fase 2",
    colSpanDesktop: 4,
    isInteractive: true,
    tone: "daun",
    iconName: "Signature",
  },
  {
    id: "offline",
    judul: "PWA Offline Sync",
    manfaat:
      "Tanpa sinyal pun data tetap tercatat di IndexedDB dan terkirim otomatis saat online kembali.",
    fase: "Fase 3",
    colSpanDesktop: 7,
    isInteractive: true,
    tone: "terung",
    iconName: "ArrowsClockwise",
  },
  {
    id: "notif",
    judul: "WhatsApp Gateway",
    manfaat:
      "PO ke supplier, pengingat shift jam 05.00, peringatan stok, dan ETA ke sekolah lewat pesan terarah.",
    fase: "Fase 3",
    colSpanDesktop: 5,
    isInteractive: true,
    tone: "daun",
    iconName: "ChatsTeardrop",
  },
  {
    id: "hpp",
    judul: "HPP & Food Waste",
    manfaat:
      "HPP estimasi vs aktual, serta pelacakan limbah makanan dalam tiga kategori baku.",
    fase: "Fase 3",
    colSpanDesktop: 7,
    isInteractive: true,
    tone: "wortel",
    iconName: "ChartPieSlice",
  },
  {
    id: "multidapur",
    judul: "Multi-Dapur Cabang",
    manfaat:
      "Dapur pusat dan dapur satelit, pengajuan transfer stok, dan data terisolasi per cabang.",
    fase: "Fase 3",
    colSpanDesktop: 5,
    isInteractive: true,
    tone: "es",
    iconName: "Buildings",
  },
];
