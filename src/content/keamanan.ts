export interface SecuritySpec {
  kategori: string;
  judul: string;
  uraian: string;
  standar: string;
  tone: "daun" | "telur" | "es" | "terung";
}

export const SPESIFIKASI_KEAMANAN: SecuritySpec[] = [
  {
    kategori: "Autentikasi & Sesi",
    judul: "Cookie HttpOnly & Rate Limiting",
    uraian:
      "Token otentikasi disimpan dalam cookie HttpOnly bertag Secure dan SameSite=Lax untuk mencegah serangan XSS. Percobaan login dibatasi maksimal 5 kali gagal per 5 menit per IP.",
    standar: "OWASP ASVS & JWT RFC 7519",
    tone: "daun",
  },
  {
    kategori: "Kriptografi & Privasi Data",
    judul: "Enkripsi Kolom AES-256 & TLS 1.3",
    uraian:
      "Data sensitif pekerja dapur (NIK, nomor kontak pribadi) dienkripsi pada tingkat kolom database menggunakan AES-256. Seluruh lalu lintas jaringan berjalan di atas protokol TLS 1.3 modern.",
    standar: "Kepatuhan UU PDP No. 27/2022",
    tone: "es",
  },
  {
    kategori: "Integritas Ledger",
    judul: "Append-Only Ledger & Transaksi ACID",
    uraian:
      "Setiap pergerakan stok dicatat dalam buku besar ledger bertipe append-only. Saldo negatif ditolak mutlak di tingkat skema basis data dengan constraint atomik PostgreSQL.",
    standar: "ACID Isolation & Immutable Audit",
    tone: "telur",
  },
  {
    kategori: "Validasi Lapangan",
    judul: "Anti-Mock Location & Geofence Haversine",
    uraian:
      "Sistem memvalidasi deteksi lokasi palsu (mock location), mencocokkan konsistensi geofence radius 100 meter, dan mewajibkan swafoto (selfie) visual di lokasi dapur operasional.",
    standar: "Geofencing Presensi Presisi",
    tone: "daun",
  },
  {
    kategori: "Ketersediaan & Pemulihan",
    judul: "Target 99,9% Uptime Jam Kritis",
    uraian:
      "Arsitektur dirancang untuk ketersediaan tinggi pada jam kritis produksi dan pengantaran (03.00 – 14.00 WIB), pencadangan berkala per 6 jam, RPO maksimal 1 jam, dan RTO maksimal 2 jam.",
    standar: "SLA Operasional Dapur Massal",
    tone: "terung",
  },
  {
    kategori: "Transparansi Publik",
    judul: "Verifikasi QR Code & Checksum SHA-256",
    uraian:
      "Setiap dokumen laporan audit, berita acara e-POD, dan lembar sertifikasi sanitasi dilengkapi QR code publik dan ringkasan kriptografi SHA-256 untuk memastikan keabsahan data tanpa rekayasa.",
    standar: "Audit Trail Badan Gizi Nasional (BGN)",
    tone: "daun",
  },
];
