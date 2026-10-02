import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Clock,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Users,
  UtensilsCrossed,
  Boxes,
  School,
  Truck,
  FileSpreadsheet,
  Layers,
  PenTool,
  Smartphone,
  ExternalLink,
  ArrowRight,
  Package,
  Building,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Navigation,
  Thermometer,
  Award,
  FileCheck,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-canvas text-brand-dark flex flex-col">
      {/* Top Header */}
      <header className="bg-brand-dark text-white border-b border-brand-dark/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-pastel text-brand-dark font-bold flex items-center justify-center text-lg">
              SP
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">SPPG MANDIRI JAYA</h1>
              <p className="text-xs text-brand-pastel/80">Sistem Informasi Dapur MBG</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-green/20 text-brand-green border border-brand-green/30">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
              Operasional Aktif
            </span>
            <span className="px-3 py-1 text-xs font-bold bg-brand-pastel text-brand-dark rounded-md">
              Fase 4 (AI Menu, VRP, IoT HACCP & BGN)
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-12">
        {/* Hero Banner */}
        <section className="bg-brand-pastel/40 border border-brand-pastel rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white text-brand-dark text-xs font-bold border border-brand-dark/10">
              <ShieldCheck className="w-4 h-4 text-brand-dark" /> Single & Multi Dapur MBG &middot; Fase 4 Aktif Penuh
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-dark">
              Pengelolaan Presensi, PO Supplier, QC Batch FEFO, & Distribusi Armada
            </h2>
            <p className="text-sm text-brand-dark/80 leading-relaxed">
              Solusi end-to-end terintegrasi: presensi selfie GPS pekerja, kalkulasi takaran gizi (BOM), pengadaan Purchase Order, inspeksi QC bahan datang dengan pelacakan kedaluwarsa FEFO, serta serah terima sekolah berbukti foto dan tanda tangan digital.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/distribusi"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-dark text-white font-bold text-sm hover:bg-brand-dark/90 transition shadow-sm"
            >
              <Smartphone className="w-4 h-4" /> Portal Kurir HP
            </Link>
            <Link
              href="/presensi"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-dark border border-brand-dark/20 font-bold text-sm hover:bg-brand-canvas transition"
            >
              <Camera className="w-4 h-4" /> Presensi Pekerja
            </Link>
            <Link
              href="/dashboard"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green text-brand-dark font-black text-sm hover:brightness-105 transition shadow-sm"
            >
              Dashboard Dapur <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Section 1: Mobile Attendance Simulation */}
        <section id="presensi-preview" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-brand-dark">1. Antarmuka Presensi Mobile</h3>
              <p className="text-xs text-brand-dark/70">Dioptimalkan untuk HP pekerja dapur (selfie + GPS geofence)</p>
            </div>
            <Link
              href="/presensi"
              className="min-h-[44px] inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline px-2"
            >
              Buka Form Presensi <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-[380px] bg-white rounded-3xl border-2 border-brand-dark shadow-xl overflow-hidden flex flex-col">
              {/* Mobile Status Bar */}
              <div className="bg-brand-dark text-white px-5 py-3 flex items-center justify-between text-xs">
                <span className="font-semibold">05:08 WIB</span>
                <span className="text-brand-pastel">Shift Pagi</span>
              </div>

              {/* Shift Info Banner */}
              <div className="p-4 bg-brand-pastel/30 border-b border-brand-pastel flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-brand-dark">Shift Pagi Dapur</p>
                  <p className="text-[11px] text-brand-dark/70">05:00 - 13:00 WIB (Toleransi 05:15)</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-brand-green/20 text-brand-dark border border-brand-green/40">
                  Tepat Waktu
                </span>
              </div>

              {/* Viewfinder Camera Box */}
              <div className="p-5 flex flex-col items-center gap-4">
                <div className="w-full aspect-[4/3] rounded-2xl bg-zinc-900 border-2 border-brand-dark relative flex flex-col items-center justify-center text-zinc-400 overflow-hidden">
                  <Camera className="w-12 h-12 text-zinc-500 mb-2" />
                  <p className="text-xs font-medium">Kamera Siap</p>
                  <div className="absolute inset-x-4 top-4 bottom-4 border border-dashed border-white/20 rounded-xl pointer-events-none"></div>
                </div>

                {/* GPS Status Badge */}
                <div className="w-full p-3 rounded-xl bg-brand-green/15 border border-brand-green/40 flex items-start gap-2.5">
                  <MapPin className="w-5 h-5 text-brand-dark shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-brand-dark">Dalam Radius Dapur (18 m)</p>
                    <p className="text-brand-dark/75 text-[11px]">Batas aman geofence: maks 100 m</p>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href="/presensi"
                  className="w-full h-12 rounded-xl bg-brand-dark text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 hover:bg-brand-dark/90 transition shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  BUKA HALAMAN PRESENSI ASLI
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Desktop Operations Dashboard */}
        <section id="dashboard-preview" className="space-y-4 pt-6 border-t border-brand-dark/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-brand-dark">2. Dashboard Operasional Dapur & BOM</h3>
              <p className="text-xs text-brand-dark/70">Kalkulasi otomatis porsi sekolah & pemotongan stok bahan terintegrasi FEFO</p>
            </div>
            <Link
              href="/dashboard"
              className="min-h-[44px] inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline px-2"
            >
              Buka Tab Operasional <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-brand-dark/15 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-brand-dark/70">
                <span className="text-xs font-semibold">Total Target Porsi</span>
                <UtensilsCrossed className="w-4 h-4 text-brand-dark" />
              </div>
              <p className="text-2xl font-bold text-brand-dark">2.450 <span className="text-xs font-normal text-brand-dark/60">Porsi</span></p>
              <p className="text-[11px] text-brand-dark/70">Akumulasi dari 3 sekolah binaan</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-brand-dark/15 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-brand-dark/70">
                <span className="text-xs font-semibold">Presensi Pekerja</span>
                <Users className="w-4 h-4 text-brand-dark" />
              </div>
              <p className="text-2xl font-bold text-brand-dark">18 / 20 <span className="text-xs font-normal text-brand-green font-semibold">Hadir</span></p>
              <p className="text-[11px] text-brand-dark/70">2 orang belum clock-in</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-brand-dark/15 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-brand-dark/70">
                <span className="text-xs font-semibold">Status Menu Hari Ini</span>
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
              </div>
              <p className="text-lg font-bold text-brand-dark truncate">Ayam Semur + Sayur</p>
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-brand-gold/25 text-brand-dark border border-brand-gold/50">
                Approved Ahli Gizi
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-brand-dark/15 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-brand-dark/70">
                <span className="text-xs font-semibold">Peringatan Bahan</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-700">1 Item <span className="text-xs font-normal text-brand-dark/60">Defisit</span></p>
              <p className="text-[11px] text-brand-dark/70">Wortel segar kurang 23.5 kg</p>
            </div>
          </div>
        </section>

        {/* Section 3: Phase 2 Procurement & QC FEFO */}
        <section id="pengadaan-preview" className="space-y-4 pt-6 border-t border-brand-dark/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200 mb-1">
                Fase 2
              </div>
              <h3 className="text-lg font-bold text-brand-dark">3. Pengadaan PO & QC Kedatangan Bahan (Batch FEFO)</h3>
              <p className="text-xs text-brand-dark/70">
                Pemesanan bahan ke mitra supplier, verifikasi inspeksi suhu chiller, dan alokasi otomatis First Expired First Out
              </p>
            </div>
            <Link
              href="/dashboard"
              className="min-h-[44px] inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline px-2"
            >
              Buka Tab PO & QC <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kartu Contoh PO & QC */}
            <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-brand-dark/10 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase text-brand-dark/60">Purchase Order Aktif</span>
                  <p className="font-bold text-sm text-brand-dark">PO-MBG-20261001-1001</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/20 text-brand-dark border border-brand-green/40">
                  <CheckCircle2 className="w-3 h-3 text-brand-green" /> QC Lolos Sempurna
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <p>Mitra Supplier: <strong>PT Unggas Mandiri Bersaudara</strong></p>
                <p>Item Dipesan: <strong>Daging Ayam Fillet (100.0 kg)</strong></p>
                <p>Hasil QC Suhu: <span className="font-mono font-bold text-blue-700">3.5°C (Chiller Dingin Standar)</span></p>
                <p className="text-[11px] text-brand-dark/70">Kemasan vakum higienis, segel utuh, lolos uji organoleptik.</p>
              </div>
            </div>

            {/* Kartu Batch FEFO Tracking */}
            <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-brand-dark/10 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase text-brand-dark/60">FEFO Expiry Ledger</span>
                  <p className="font-bold text-sm text-brand-dark">Pelacakan Tanggal Kedaluwarsa</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Prioritas Masak H-2
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-brand-dark">BATCH-WTL-20260928-01 (Wortel Segar)</p>
                    <p className="text-[11px] text-brand-dark/70">Sisa Stok: 20.0 kg &middot; Exp: 2 Hari Lagi</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-1 rounded">
                    FEFO Urutan 1
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-canvas border border-brand-dark/10 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-brand-dark">BATCH-AYM-20261001-01 (Ayam Fillet)</p>
                    <p className="text-[11px] text-brand-dark/70">Sisa Stok: 100.0 kg &middot; Exp: 5 Hari Lagi</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded">
                    Aman
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Phase 2 Fleet Distribution & School Proof */}
        <section id="distribusi-preview" className="space-y-4 pt-6 border-t border-brand-dark/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 mb-1">
                Fase 2
              </div>
              <h3 className="text-lg font-bold text-brand-dark">4. Distribusi Armada & Bukti Serah Terima Sekolah</h3>
              <p className="text-xs text-brand-dark/70">
                Surat jalan pengantaran dengan armada boks termal dan bukti penerimaan digital (Foto & Tanda Tangan Digital)
              </p>
            </div>
            <Link
              href="/distribusi"
              className="min-h-[44px] inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline px-2"
            >
              Buka Form Serah Terima <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Status Armada Mobil Box */}
            <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-dark text-white flex items-center justify-center">
                  <Truck className="w-5 h-5 text-brand-pastel" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-dark">Armada B 9142 SPG</h4>
                  <p className="text-xs text-brand-dark/60">Mobil Box Termal MBG (2.000 Porsi)</p>
                </div>
              </div>
              <div className="pt-2 border-t border-brand-dark/10 space-y-1.5 text-xs">
                <p>Driver Bertugas: <strong>Doni Prasetyo</strong></p>
                <p>Nomor Surat Jalan: <strong>SJ-MBG-20261002-001</strong></p>
                <p>Status: <span className="font-bold text-blue-700">Dalam Perjalanan (08:45 WIB)</span></p>
              </div>
            </div>

            {/* Sekolah Penerima & Progres */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                  <School className="w-4 h-4 text-brand-dark" /> Rute Sekolah Penerima Hari Ini
                </h4>
                <span className="text-xs font-bold text-brand-green">1 dari 3 Selesai Serah Terima</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-emerald-950">SDN 01 Pagi</p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-emerald-900 font-extrabold text-sm">450 Porsi Diterima</p>
                  <p className="text-[11px] text-emerald-800">PIC: Bpk. Joko (09:35 WIB)</p>
                  <span className="inline-block mt-1 text-[10px] font-bold bg-white text-emerald-900 px-2 py-0.5 rounded border border-emerald-200">
                    Foto & TTD Lengkap
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-brand-canvas border border-brand-dark/10 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-brand-dark">SMPN 03</p>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="text-brand-dark font-extrabold text-sm">800 Porsi</p>
                  <p className="text-[11px] text-brand-dark/70">Jam Makan: 11:30 WIB</p>
                  <span className="inline-block mt-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    Menunggu Kurir
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-brand-canvas border border-brand-dark/10 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-brand-dark">SDN 04 Ceria</p>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="text-brand-dark font-extrabold text-sm">1.200 Porsi</p>
                  <p className="text-[11px] text-brand-dark/70">Jam Makan: 10:00 WIB</p>
                  <span className="inline-block mt-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    Menunggu Kurir
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Section 5: Phase 3 Multi-Kitchen, WA, HPP/Waste & Complaints */}
        <section id="fase3-preview" className="space-y-4 pt-6 border-t border-brand-dark/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200 mb-1">
                Fase 3 Aktif
              </div>
              <h3 className="text-lg font-bold text-brand-dark">5. Multi-Dapur Cabang, Notifikasi WA & Analitik HPP/Waste</h3>
              <p className="text-xs text-brand-dark/70">
                Hierarki Central & Satellite Kitchens, notifikasi WhatsApp otomatis, transparansi HPP riil vs standar, dan investigasi aduan sekolah
              </p>
            </div>
            <Link
              href="/dashboard"
              className="min-h-[44px] inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline px-2"
            >
              Buka Modul Fase 3 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark/80 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-purple-700" /> Multi-Dapur & Transfer
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800">
                  3 Unit
                </span>
              </div>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                Central Kitchen terhubung ke 2 Satellite Kitchens (Tebet & Cilandak) dengan pengawasan mutasi stok terenkripsi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark/80 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-teal-700" /> WhatsApp Gateway
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800">
                  Auto-Queue
                </span>
              </div>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                Pengingat shift subuh, alert darurat stok menipis, notifikasi PO ke supplier, dan tracking ETA armada ke PIC sekolah.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark/80 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-700" /> HPP & Food Waste
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                  Buku Besar
                </span>
              </div>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                Kalkulasi HPP teoritis (bahan + overhead Rp 2.500) serta pencatatan audit limbah makanan (prep waste, cooking loss, retur).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark/80 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" /> Penanganan Komplain
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800">
                  SLA &le; 60m
                </span>
              </div>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                Form aduan digital sekolah, investigasi penelusuran batch oleh QC, dan SOP penggantian porsi steril darurat langsung di lokasi.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Phase 4 AI Nutrition Planner, VRP Routing, IoT HACCP & BGN Audit */}
        <section id="fase4-preview" className="space-y-4 pt-6 border-t border-brand-dark/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-200 mb-1">
                Fase 4 Terintegrasi Penuh
              </div>
              <h3 className="text-lg font-bold text-brand-dark">
                6. AI Menu Planner, VRP Routing, IoT Cold-Chain & Pengawasan BGN
              </h3>
              <p className="text-xs text-brand-dark/70">
                Siklus menu cerdas linear programming, peramalan stok dinamis ROP, optimasi rute armada termal &le;90 menit, telemetri sensor cold-chain, dan laporan audit BGN tervalidasi SHA-256
              </p>
            </div>
            <Link
              href="/dashboard"
              className="min-h-[44px] inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline px-2"
            >
              Buka Modul Fase 4 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark/80 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-700" /> AI Menu & ROP
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800">
                  AKG Kemenkes
                </span>
              </div>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                Optimasi gizi otomatis per jenjang (PAUD, SD, SMP, SMA), batasan anti-repetisi 5 hari, eliminasi alergen, serta peramalan Reorder Point dinamis.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark/80 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-blue-700" /> VRP CVRPTW Rute
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800">
                  &le; 90 Menit
                </span>
              </div>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                Algoritma geospasial menentukan urutan singgah sekolah tercepat, kapasitas muat armada, serta kepatuhan batas termal hangat makanan (&gt;60&deg;C).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark/80 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-cyan-700" /> IoT Cold-Chain
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800">
                  HACCP Grade A
                </span>
              </div>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                Telemetri live sensor chiller (0-4&deg;C), freezer (&le;-18&deg;C), dan boks armada hangat dengan alert anomali otomatis.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark/80 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> Portal Audit BGN
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                  SHA-256 + QR
                </span>
              </div>
              <p className="text-xs text-brand-dark/70 leading-relaxed">
                Portal pengawasan publik BGN RI dan Dinkes: sertifikasi digital, rekap kepatuhan kalori, dan verifikasi QR keabsahan dokumen audit resmi.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-brand-dark/10 py-6 bg-white text-center text-xs text-brand-dark/60">
        SPPG Mandiri Jaya — Sistem Operasional Makanan Bergizi Gratis (MBG) Fase 1 - 4 Lengkap &copy; 2026
      </footer>
    </main>
  );
}
