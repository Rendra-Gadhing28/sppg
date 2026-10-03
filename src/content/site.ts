// Source of truth penamaan & konfigurasi situs SPPG
// TODO: ganti nama brand bila pemilik produk menggunakan penamaan instansi lain

export const SITE_CONFIG = {
  brandName: "SPPG",
  brandFullName: "Satuan Pelayanan Pemenuhan Gizi",
  subLabel: "Sistem Informasi Dapur MBG",
  programName: "Makan Bergizi Gratis (MBG)",
  agencyName: "Badan Gizi Nasional (BGN)",
  whatsappNumber: "6281234567890",
  whatsappDefaultMessage:
    "Halo Admin SPPG, saya ingin menjadwalkan konsultasi dan demo operasional sistem dapur umum MBG.",
  capacity: "Hingga 10.000 porsi per hari untuk 50+ sekolah mitra",
  copyright: `© ${new Date().getFullYear()} SPPG Mandiri Jaya. Sistem Informasi Dapur MBG.`,
};

export const NAV_LINKS = [
  { label: "Alur", href: "#alur" },
  { label: "Fitur", href: "#fitur" },
  { label: "AI & IoT", href: "#cerdas" },
  { label: "Peran", href: "#peran" },
  { label: "Target", href: "#target" },
  { label: "FAQ", href: "#faq" },
] as const;
