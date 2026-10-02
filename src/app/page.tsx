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
            <span className="px-3 py-1 text-xs font-medium bg-white/10 rounded-md">
              Fase 1 (MVP)
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-10">
        {/* Hero Banner */}
        <section className="bg-brand-pastel/40 border border-brand-pastel rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white text-brand-dark text-xs font-bold border border-brand-dark/10">
              <ShieldCheck className="w-4 h-4 text-brand-dark" /> Single Dapur Sentral
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-dark">
              Pengelolaan Presensi, Menu Gizi, & Stok Bahan
            </h2>
            <p className="text-sm text-brand-dark/80 leading-relaxed">
              Memastikan presensi pekerja tervalidasi radius dapur, kalkulasi takaran resep (BOM) otomatis berdasarkan kuota porsi sekolah, dan stok bahan termonitor akurat.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#presensi-preview"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-brand-dark text-white font-semibold text-sm hover:bg-brand-dark/90 transition shadow-sm"
            >
              Simulasi Presensi
            </a>
            <a
              href="#dashboard-preview"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-brand-dark border border-brand-dark/20 font-semibold text-sm hover:bg-brand-canvas transition"
            >
              Lihat Dashboard
            </a>
          </div>
        </section>

        {/* Section 1: Mobile Attendance Simulation */}
        <section id="presensi-preview" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-dark">1. Antarmuka Presensi Mobile</h3>
              <p className="text-xs text-brand-dark/70">Dioptimalkan untuk HP pekerja dapur (selfie + GPS geofence)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-brand-dark/5 rounded-full border border-brand-dark/10">
              Viewport HP (390px)
            </span>
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
                <button
                  type="button"
                  className="w-full h-14 rounded-xl bg-brand-dark text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-brand-dark/90 transition shadow-md active:scale-[0.98]"
                >
                  <Camera className="w-5 h-5" />
                  AMBIL FOTO & CLOCK IN
                </button>

                {/* Daily Log Snapshot */}
                <div className="w-full text-xs space-y-1.5 pt-2 border-t border-brand-dark/10">
                  <p className="font-semibold text-brand-dark">Riwayat Hari Ini:</p>
                  <div className="flex items-center justify-between text-brand-dark/80 bg-brand-canvas px-3 py-2 rounded-lg">
                    <span>Masuk: 04:55 WIB</span>
                    <span className="text-emerald-700 font-bold">● Valid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Desktop Operations Dashboard */}
        <section id="dashboard-preview" className="space-y-4 pt-6 border-t border-brand-dark/10">
          <div>
            <h3 className="text-lg font-bold text-brand-dark">2. Dashboard Operasional Dapur</h3>
            <p className="text-xs text-brand-dark/70">Kalkulasi otomatis porsi sekolah & kebutuhan bahan (BOM)</p>
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

          {/* BOM Calculation Table */}
          <div className="bg-white rounded-2xl border border-brand-dark/15 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-brand-canvas border-b border-brand-dark/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-brand-dark">Kalkulasi Bahan Baku (BOM Engine)</h4>
                <p className="text-xs text-brand-dark/70">Target: 2.450 Porsi × Gramasi Standar</p>
              </div>
              <button
                type="button"
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-brand-dark text-white text-xs font-semibold hover:bg-brand-dark/90 transition"
              >
                Mulai Masak (Potong Stok)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-canvas/70 text-brand-dark/80 font-bold border-b border-brand-dark/10">
                  <tr>
                    <th className="px-6 py-3">Nama Bahan</th>
                    <th className="px-6 py-3">Takaran / Porsi</th>
                    <th className="px-6 py-3">Kebutuhan Hari Ini</th>
                    <th className="px-6 py-3">Saldo Stok</th>
                    <th className="px-6 py-3">Status Ketersediaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark/10">
                  <tr>
                    <td className="px-6 py-3.5 font-bold text-brand-dark">Beras Premium</td>
                    <td className="px-6 py-3.5">100.0 gr</td>
                    <td className="px-6 py-3.5 font-semibold">245.0 kg</td>
                    <td className="px-6 py-3.5">500.0 kg</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-green/20 text-brand-dark border border-brand-green/30">
                        Cukup
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-bold text-brand-dark">Ayam Fillet</td>
                    <td className="px-6 py-3.5">80.0 gr</td>
                    <td className="px-6 py-3.5 font-semibold">196.0 kg</td>
                    <td className="px-6 py-3.5">210.0 kg</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-green/20 text-brand-dark border border-brand-green/30">
                        Cukup
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="px-6 py-3.5 font-bold text-brand-dark">Wortel Segar</td>
                    <td className="px-6 py-3.5">30.0 gr</td>
                    <td className="px-6 py-3.5 font-semibold">73.5 kg</td>
                    <td className="px-6 py-3.5 text-amber-700 font-bold">50.0 kg</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                        Defisit 23.5 kg
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* School Targets */}
          <div className="bg-white rounded-2xl border border-brand-dark/15 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                <School className="w-4 h-4 text-brand-dark" /> Alokasi Sekolah Penerima Hari Ini
              </h4>
              <span className="text-xs text-brand-dark/70">3 Sekolah Terdaftar</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/10">
                <p className="font-bold text-xs text-brand-dark">SDN 01 Pagi</p>
                <p className="text-lg font-bold text-brand-dark mt-1">450 <span className="text-xs font-normal">porsi</span></p>
                <p className="text-[11px] text-brand-dark/70 mt-1">Jam Makan: 09:30 WIB • PIC: Bpk. Joko</p>
              </div>
              <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/10">
                <p className="font-bold text-xs text-brand-dark">SMPN 03</p>
                <p className="text-lg font-bold text-brand-dark mt-1">800 <span className="text-xs font-normal">porsi</span></p>
                <p className="text-[11px] text-brand-dark/70 mt-1">Jam Makan: 11:30 WIB • PIC: Ibu Siti</p>
              </div>
              <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/10">
                <p className="font-bold text-xs text-brand-dark">SDN 04 Ceria</p>
                <p className="text-lg font-bold text-brand-dark mt-1">1.200 <span className="text-xs font-normal">porsi</span></p>
                <p className="text-[11px] text-brand-dark/70 mt-1">Jam Makan: 10:00 WIB • PIC: Bpk. Dian</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-brand-dark/10 py-6 bg-white text-center text-xs text-brand-dark/60">
        SPPG Mandiri Jaya — Sistem Operasional Makanan Bergizi Gratis (MBG) &copy; 2026
      </footer>
    </main>
  );
}
