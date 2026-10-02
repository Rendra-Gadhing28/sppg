"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Users,
  CheckCircle2,
  AlertTriangle,
  School,
  Boxes,
  Clock,
  ArrowRight,
  RefreshCw,
  MapPin,
  Play,
  Check,
  ChevronRight,
  ShieldCheck,
  Eye,
} from "lucide-react";

interface Metrics {
  totalPorsi: number;
  totalSekolah: number;
  totalAnggota: number;
  anggotaHadir: number;
  tepatWaktuCount: number;
  defisitCount: number;
  statusProduksi: string;
}

interface BOMItem {
  bahanId: string;
  namaBahan: string;
  satuan: string;
  totalKebutuhan: number;
  stokSaatIni: number;
  defisit: number;
  isDefisit: boolean;
}

interface JadwalInfo {
  jadwalId: string;
  tanggal: string;
  menuId: string;
  namaMenu: string;
  deskripsi: string | null;
  totalKalori: string;
  proteinGram: string;
  lemakGram: string;
  karboGram: string;
  isApprovedGizi: boolean;
  statusProduksi: string;
}

interface SekolahItem {
  id: string;
  namaSekolah: string;
  alamat: string;
  jumlahPorsiTarget: number;
  picNama: string;
  picKontak: string;
  jamMakan: string;
}

interface PresensiItem {
  id: string;
  anggotaId: string;
  namaAnggota: string;
  jabatan: string;
  jenis: "masuk" | "keluar";
  waktuCatat: string;
  status: "tepat_waktu" | "terlambat" | "pulang_cepat";
  isInRadius: boolean;
  jarakKeDapurMeter: number;
  fotoBuktiUrl: string | null;
}

interface MutasiItem {
  id: string;
  namaBahan: string;
  jenis: string;
  jumlah: string;
  saldoSetelahnya: string;
  keterangan: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [jadwal, setJadwal] = useState<JadwalInfo | null>(null);
  const [bomList, setBomList] = useState<BOMItem[]>([]);
  const [sekolahList, setSekolahList] = useState<SekolahItem[]>([]);
  const [presensiList, setPresensiList] = useState<PresensiItem[]>([]);
  const [mutasiList, setMutasiList] = useState<MutasiItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessingMasak, setIsProcessingMasak] = useState<boolean>(false);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.metrics);
        setJadwal(json.jadwal);
        setBomList(json.bomList || []);
        setSekolahList(json.daftarSekolah || []);
        setPresensiList(json.presensiHariIni || []);
        setMutasiList(json.mutasiTerbaru || []);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Aksi Mulai Masak & Potong Stok
  const handleMulaiMasak = async () => {
    if (!confirm("Konfirmasi mulai proses masak dan potong saldo stok bahan baku hari ini?")) {
      return;
    }

    try {
      setIsProcessingMasak(true);
      setToast(null);

      const res = await fetch("/api/produksi/potong-stok", {
        method: "POST",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal memproses pemotongan stok.");
      }

      setToast({
        type: "success",
        message: json.message || "Stok bahan berhasil dipotong untuk produksi!",
      });

      // Refresh data
      fetchDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsProcessingMasak(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-dark flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-brand-dark text-white border-b border-brand-dark/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-lg bg-brand-pastel text-brand-dark font-bold flex items-center justify-center text-lg hover:opacity-90 transition"
            >
              SP
            </Link>
            <div>
              <h1 className="font-bold text-base leading-tight">SPPG MANDIRI JAYA</h1>
              <p className="text-xs text-brand-pastel/80">Dashboard Operasional & Monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/presensi"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-pastel text-brand-dark text-xs font-bold hover:bg-white transition"
            >
              Buka Presensi HP <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
            >
              Keluar
            </button>
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center justify-center cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-8">
        {/* Toast Notifikasi */}
        {toast && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm ${
              toast.type === "success"
                ? "bg-brand-green/20 border border-brand-green text-brand-dark"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="underline text-[11px] ml-4 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* 1. Header Overview Bar */}
        <section className="bg-white border border-brand-dark/15 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-brand-pastel/40 text-brand-dark text-xs font-bold border border-brand-pastel">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-dark" /> Single Dapur Sentral
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-dark">
              Status Operasional Dapur Hari Ini
            </h2>
            <p className="text-xs text-brand-dark/70">
              Sinkronisasi realtime kebutuhan porsi sekolah, kalkulasi BOM, dan presensi tim dapur.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-brand-canvas border border-brand-dark/10 text-right">
              <p className="text-[10px] text-brand-dark/60 font-semibold uppercase tracking-wider">
                Status Produksi
              </p>
              <p className="text-sm font-bold capitalize text-brand-dark flex items-center justify-end gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    metrics?.statusProduksi === "selesai"
                      ? "bg-brand-green"
                      : "bg-amber-500 animate-pulse"
                  }`}
                />
                {metrics?.statusProduksi === "selesai"
                  ? "Selesai Dimasak"
                  : metrics?.statusProduksi === "siap_masak"
                  ? "Siap Masak"
                  : "Menunggu Jadwal"}
              </p>
            </div>
          </div>
        </section>

        {/* 2. Top Summary KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Target Porsi */}
          <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-brand-dark/70">
              <span className="text-xs font-bold uppercase tracking-wider">Total Target Porsi</span>
              <div className="w-8 h-8 rounded-lg bg-brand-pastel/30 text-brand-dark flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-brand-dark tabular-nums">
              {metrics?.totalPorsi.toLocaleString("id-ID") || 0}{" "}
              <span className="text-xs font-normal text-brand-dark/60">porsi</span>
            </p>
            <p className="text-[11px] text-brand-dark/70">
              Distribusi ke {metrics?.totalSekolah || 0} sekolah aktif
            </p>
          </div>

          {/* Kehadiran Pekerja */}
          <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-brand-dark/70">
              <span className="text-xs font-bold uppercase tracking-wider">Presensi Pekerja</span>
              <div className="w-8 h-8 rounded-lg bg-brand-green/20 text-brand-dark flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-brand-dark tabular-nums">
              {metrics?.anggotaHadir || 0}{" "}
              <span className="text-base font-semibold text-brand-dark/60">
                / {metrics?.totalAnggota || 0}
              </span>
            </p>
            <p className="text-[11px] text-brand-dark/70 flex items-center gap-1">
              <span className="font-semibold text-emerald-800">
                {metrics?.tepatWaktuCount || 0} Tepat Waktu
              </span>
            </p>
          </div>

          {/* Menu Hari Ini */}
          <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-brand-dark/70">
              <span className="text-xs font-bold uppercase tracking-wider">Menu Terjadwal</span>
              <div className="w-8 h-8 rounded-lg bg-brand-gold/30 text-brand-dark flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-base font-bold text-brand-dark truncate">
              {jadwal?.namaMenu || "Belum ada menu"}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-gold/25 text-brand-dark border border-brand-gold/50">
                {jadwal?.isApprovedGizi ? "Approved Ahli Gizi" : "Draft"}
              </span>
              <span className="text-[11px] text-brand-dark/60">
                {jadwal?.totalKalori} kkal
              </span>
            </div>
          </div>

          {/* Peringatan Stok Defisit */}
          <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-brand-dark/70">
              <span className="text-xs font-bold uppercase tracking-wider">Peringatan Stok</span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  (metrics?.defisitCount || 0) > 0
                    ? "bg-amber-100 text-amber-800"
                    : "bg-brand-green/20 text-brand-dark"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p
              className={`text-3xl font-bold tabular-nums ${
                (metrics?.defisitCount || 0) > 0 ? "text-amber-800" : "text-brand-dark"
              }`}
            >
              {metrics?.defisitCount || 0}{" "}
              <span className="text-xs font-normal text-brand-dark/60">Bahan Defisit</span>
            </p>
            <p className="text-[11px] text-brand-dark/70">
              {(metrics?.defisitCount || 0) > 0
                ? "Segera lakukan penambahan stok"
                : "Semua bahan baku tercukupi"}
            </p>
          </div>
        </section>

        {/* 3. Kalkulasi Resep & Kebutuhan Bahan (BOM Engine) */}
        <section className="bg-white rounded-2xl border border-brand-dark/15 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-brand-canvas border-b border-brand-dark/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                <Boxes className="w-4 h-4 text-brand-dark" /> Kebutuhan Bahan Baku Produksi (BOM Engine)
              </h3>
              <p className="text-xs text-brand-dark/70">
                Kalkulasi otomatis: Takaran per Porsi × {metrics?.totalPorsi.toLocaleString("id-ID") || 0} Target Porsi
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {metrics?.statusProduksi === "selesai" ? (
                <span className="px-3.5 py-1.5 rounded-lg bg-brand-green/20 text-brand-dark text-xs font-bold border border-brand-green flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-800" /> Stok Telah Terpotong
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleMulaiMasak}
                  disabled={isProcessingMasak || !jadwal}
                  className="px-4 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-brand-dark/90 active:scale-95 transition flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isProcessingMasak ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Memproses...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current text-brand-green" /> Mulai Masak (Potong Stok)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-canvas/70 text-brand-dark/80 font-bold border-b border-brand-dark/10">
                <tr>
                  <th className="px-6 py-3.5">Nama Bahan Baku</th>
                  <th className="px-6 py-3.5">Takaran / Porsi</th>
                  <th className="px-6 py-3.5">Total Kebutuhan</th>
                  <th className="px-6 py-3.5">Saldo Stok Saat Ini</th>
                  <th className="px-6 py-3.5">Status Ketersediaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/10">
                {bomList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-brand-dark/60">
                      Tidak ada data bahan untuk kalkulasi.
                    </td>
                  </tr>
                ) : (
                  bomList.map((item) => (
                    <tr
                      key={item.bahanId}
                      className={item.isDefisit ? "bg-amber-50/60" : "hover:bg-brand-canvas/40"}
                    >
                      <td className="px-6 py-3.5 font-bold text-brand-dark">
                        {item.namaBahan}
                      </td>
                      <td className="px-6 py-3.5 tabular-nums text-brand-dark/80">
                        {/* Contoh konversi jika kg */}
                        {item.satuan === "kg"
                          ? `${(item.totalKebutuhan / (metrics?.totalPorsi || 1) * 1000).toFixed(0)} gram`
                          : `${item.totalKebutuhan / (metrics?.totalPorsi || 1)} ${item.satuan}`}
                      </td>
                      <td className="px-6 py-3.5 font-bold tabular-nums text-brand-dark">
                        {item.totalKebutuhan} {item.satuan}
                      </td>
                      <td className="px-6 py-3.5 tabular-nums font-semibold text-brand-dark">
                        {item.stokSaatIni} {item.satuan}
                      </td>
                      <td className="px-6 py-3.5">
                        {item.isDefisit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-800" />
                            Kurang {item.defisit} {item.satuan}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-green/20 text-brand-dark border border-brand-green/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-800" />
                            Cukup
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Split Layout: Sekolah Penerima & Log Presensi Dapur */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alokasi Sekolah */}
          <div className="bg-white rounded-2xl border border-brand-dark/15 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                  <School className="w-4 h-4 text-brand-dark" /> Target Sekolah Penerima
                </h3>
                <p className="text-xs text-brand-dark/70">Jadwal konsumsi & kuota porsi</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-brand-dark/5 text-brand-dark text-xs font-bold">
                {sekolahList.length} Sekolah
              </span>
            </div>

            <div className="space-y-3">
              {sekolahList.map((sch) => (
                <div
                  key={sch.id}
                  className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/10 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-brand-dark text-sm">{sch.namaSekolah}</p>
                    <p className="text-[11px] text-brand-dark/70">{sch.alamat}</p>
                    <p className="text-[11px] text-brand-dark/80 font-medium">
                      PIC: {sch.picNama} ({sch.picKontak})
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-bold text-brand-dark tabular-nums">
                      {sch.jumlahPorsiTarget}{" "}
                      <span className="text-xs font-normal text-brand-dark/60">porsi</span>
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-brand-dark/15">
                      Makan: {sch.jamMakan.substring(0, 5)} WIB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Log Presensi Pekerja Dapur */}
          <div className="bg-white rounded-2xl border border-brand-dark/15 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-dark" /> Log Presensi Tim Hari Ini
                </h3>
                <p className="text-xs text-brand-dark/70">Verifikasi selfie & geofence dapur</p>
              </div>
              <Link
                href="/presensi"
                className="text-xs text-brand-dark font-bold underline hover:opacity-80"
              >
                Form Presensi
              </Link>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {presensiList.length === 0 ? (
                <p className="text-xs text-center py-8 text-brand-dark/60 bg-brand-canvas rounded-xl">
                  Belum ada presensi yang tercatat hari ini.
                </p>
              ) : (
                presensiList.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-brand-canvas border border-brand-dark/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {p.fotoBuktiUrl ? (
                        <button
                          type="button"
                          onClick={() => setActivePhotoModal(p.fotoBuktiUrl)}
                          className="w-10 h-10 rounded-lg overflow-hidden border border-brand-dark/20 relative group shrink-0"
                          title="Lihat Foto Selfie"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.fotoBuktiUrl}
                            alt="Bukti Selfie"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-brand-dark/10 flex items-center justify-center text-brand-dark font-bold text-xs shrink-0">
                          {p.namaAnggota.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-brand-dark">{p.namaAnggota}</p>
                        <p className="text-[11px] text-brand-dark/70">{p.jabatan}</p>
                        <p className="text-[10px] text-brand-dark/60">
                          {new Date(p.waktuCatat).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB • {p.jenis === "masuk" ? "Clock In" : "Clock Out"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === "tepat_waktu"
                            ? "bg-brand-green/20 text-brand-dark border border-brand-green/40"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {p.status === "tepat_waktu" ? "Tepat Waktu" : p.status}
                      </span>
                      <span className="text-[10px] text-brand-dark/70 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-dark" />
                        {p.isInRadius
                          ? `Radius aman (${p.jarakKeDapurMeter}m)`
                          : "Luar radius"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* 5. Riwayat Ledger Mutasi Stok */}
        {mutasiList.length > 0 && (
          <section className="bg-white rounded-2xl border border-brand-dark/15 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-brand-dark">
              Riwayat Mutasi Stok Terbaru (Audit Trail)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-canvas text-brand-dark/70 font-semibold border-b border-brand-dark/10">
                  <tr>
                    <th className="px-4 py-2.5">Waktu</th>
                    <th className="px-4 py-2.5">Nama Bahan</th>
                    <th className="px-4 py-2.5">Tipe Mutasi</th>
                    <th className="px-4 py-2.5">Jumlah</th>
                    <th className="px-4 py-2.5">Saldo Akhir</th>
                    <th className="px-4 py-2.5">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark/10">
                  {mutasiList.map((m) => (
                    <tr key={m.id} className="hover:bg-brand-canvas/30">
                      <td className="px-4 py-2.5 text-brand-dark/70 tabular-nums">
                        {new Date(m.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        WIB
                      </td>
                      <td className="px-4 py-2.5 font-bold text-brand-dark">{m.namaBahan}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-pastel/30 text-brand-dark border border-brand-pastel">
                          {m.jenis}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-bold tabular-nums text-red-700">
                        -{m.jumlah}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums font-semibold">
                        {m.saldoSetelahnya}
                      </td>
                      <td className="px-4 py-2.5 text-brand-dark/70 text-[11px]">
                        {m.keterangan || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Modal Foto Selfie */}
      {activePhotoModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full space-y-3 border-2 border-brand-dark">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-brand-dark">Foto Bukti Presensi</h4>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="text-xs font-bold text-brand-dark underline cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhotoModal}
                alt="Selfie"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-brand-dark/10 py-6 bg-white text-center text-xs text-brand-dark/60 mt-12">
        SPPG Mandiri Jaya — Sistem Operasional Dapur & Presensi MBG &copy; 2026
      </footer>
    </div>
  );
}
