# SPPG — Sistem Informasi Dapur MBG

Sistem informasi operasional terintegrasi untuk seluruh rantai kerja dapur umum program **Makan Bergizi Gratis (MBG)** yang melayani hingga 10.000 porsi per hari untuk 50+ sekolah mitra.

---

## 1. Rencana Desain & Identitas Visual (Claymorphism "Dapur Tanah Liat")

### Palet Warna Pangan
- **Kanvas Netral**: `padi-100` (`#EAF5E4`), `padi-50` (`#F6FBF2`), dan slab latar `padi-200` (`#D9EBD0`).
- **Teks Kontras Tinggi**: Teks utama `ink-900` (`#10281D`), teks sekunder `ink-600` (`#4D6757`).
- **Aksi & Keamanan Pangan**:
  - `daun-400` (`#3DBE7A`) / `daun-700` (`#1F7A4D`): Aksi utama, status aman, kelayakan mutu pangan.
  - `telur-400` (`#FFD04D`): Peringatan lembut, batch FEFO mendekati batas simpan.
  - `wortel-400` (`#FFA24D`): Aksen hangat kuliner, pengadaan BOM.
  - `es-400` (`#86CFFF`): Cold-chain telemetri, IoT sensor.
  - `terung-400` (`#C2B5FF`): Modul kecerdasan buatan (AI Planner & VRP).
  - `cabai-400` (`#FF7E6E`): Alarm bahaya, penolakan QC, kedaluwarsa.

### Tipografi
- **Display**: Baloo 2 (bobot 600, 700, 800) untuk H1–H3, angka tabular besar, dan label tombol.
- **Body**: Plus Jakarta Sans (bobot 400, 500, 600, 700) untuk paragraf dan kontrol formulir.

### Prinsip Desain
1. **Momen Berani**: Hero dibuka langsung dengan ilustrasi inline SVG **ompreng makanan (food tray)** bergaya claymorphism dengan uap hangat dan 4 kartu telemetri melayang.
2. **Peta Affordance Konsisten**:
   - `clay`: Timbul untuk elemen interaktif, tombol, dan panel kartu.
   - `clay-inset`: Cekung untuk wadah layar demo, kanvas tanda tangan, dan formulir input.
   - Rata (tanpa bayangan): Teks naratif dan jawaban FAQ.
3. **Tanpa Anti-Pola**: Tanpa ALL-CAPS eyebrow generik, tanpa panah `→` di akhir tombol, tanpa emoji, dan tanpa testimoni atau metrik fiktif.

---

## 2. Struktur Section Landing Page

- `#beranda`: Hero adegan ompreng clay, 3 chip kemampuan, dan CTA utama.
- Strip Peran: Marquee CSS 12 peran pengguna dengan mode reduced-motion.
- `#masalah`: Perbandingan risiko manual vs solusi SPPG dengan flip kartu.
- `#alur`: Perjalanan 8 tahap satu porsi dari resep BOM hingga audit BGN.
- `#fitur`: Bento grid 12 kolom berisi demo simulasi interaktif (`DemoShell`):
  - `GeofenceDemo`: Simulasi radius 100m dan presensi swafoto.
  - `BomCalculator`: Slider porsi 500–10.000 dengan kalkulasi defisit bahan & stepper PO.
  - `FefoDemo`: Rak batch FEFO dan penolakan bahan kedaluwarsa.
  - `QcDemo`: 4 checklist mutu bahan datang dengan status otomatis.
  - `EpodDemo`: Kanvas tanda tangan digital PIC sekolah dan stepper porsi.
  - `OfflineSyncDemo`: Antrean IndexedDB offline dan sinkronisasi idempotensi.
  - `NotifDemo`: Simulasi pengiriman notifikasi terarah.
  - `HppWasteDemo`: Simulasi deviasi HPP dan donut food waste 3 kategori.
  - `MultiKitchenDemo`: Diagram hub-and-spoke transfer stok antar-dapur satelit.
- `#cerdas`: Modul Fase 4 (AI Menu Planner, VRP armada, IoT Cold-chain HACCP, dan portal audit BGN).
- `#peran`: 12 peran pengguna lengkap dengan ringkasan tugas dan 3 contoh aksi.
- `#roadmap`: Roadmap Fase 1 sampai 4 dengan status pencapaian riil.
- `#target`: 17 Target Desain KPI kuantitatif.
- `#keamanan`: 6 pilar arsitektur keamanan, kriptografi AES-256, dan kepatuhan UU PDP.
- `#faq`: Accordion tanya jawab operasional dapur.
- `#kontak`: Formulir pendaftaran demo dan tautan cepat chat WhatsApp.
- Footer: Navigasi cepat, tautan portal internal (`/login`, `/presensi`, `/distribusi`, `/dashboard`), dan hak cipta.

---

## 3. Asumsi dan Placeholder

1. **Nomor WhatsApp**: Menggunakan placeholder `6281234567890` di `src/content/site.ts`. Pemilik produk dapat menggantinya dengan nomor resmi admin operasional.
2. **Koordinat Dapur**: Koordinat default acuan dapur sentral dikonfigurasi melalui `.env` (`DEFAULT_LATITUDE="-7.01513889"`, `DEFAULT_LONGITUDE="110.44802778"`).
3. **Simulasi Demo**: Seluruh nilai pada modul demo (`src/components/demos/*`) berjalan secara terisolasi di sisi klien (`DemoShell`) untuk sarana simulasi interaktif calon pengguna tanpa mengubah database operasional riil.
4. **Dependensi UI**: Menambahkan `@phosphor-icons/react` untuk kesatuan keluarga ikon tanpa emoji, `lenis` untuk smooth scrolling dengan offset anchor `-96px`, serta `@radix-ui/*` primitives untuk aksesibilitas keyboard dan pembaca layar.

---

## 4. Menjalankan Proyek

```bash
# Instalasi dependensi
npm install

# Menjalankan server dev
npm run dev

# Validasi kode & typecheck
npx tsc --noEmit
npm run test:logic
npm run test:validators

# Membangun untuk produksi
npm run build
npm run start
```
