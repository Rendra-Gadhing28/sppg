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
  ShieldCheck,
  Eye,
  Plus,
  Trash2,
  ChefHat,
  PackagePlus,
  LogOut,
  Layers,
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

interface MasterBahanItem {
  id: string;
  kodeBahan: string;
  namaBahan: string;
  kategori: string;
  satuanStandar: string;
  stokSaatIni: string;
  stokMinimum: string;
}

interface MenuFullItem {
  id: string;
  namaMenu: string;
  deskripsi: string | null;
  totalKalori: string;
  proteinGram: string;
  lemakGram: string;
  karboGram: string;
  isApprovedGizi: boolean;
  resep: Array<{
    id: string;
    namaBahan: string;
    jumlahPerPorsi: string;
    satuan: string;
  }>;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"operasional" | "menu" | "stok">("operasional");

  // Dashboard Data
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [jadwal, setJadwal] = useState<JadwalInfo | null>(null);
  const [bomList, setBomList] = useState<BOMItem[]>([]);
  const [sekolahList, setSekolahList] = useState<SekolahItem[]>([]);
  const [presensiList, setPresensiList] = useState<PresensiItem[]>([]);
  const [mutasiList, setMutasiList] = useState<MutasiItem[]>([]);

  // Master Data
  const [allBahan, setAllBahan] = useState<MasterBahanItem[]>([]);
  const [allMenu, setAllMenu] = useState<MenuFullItem[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessingMasak, setIsProcessingMasak] = useState<boolean>(false);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State: Restock
  const [restockBahanId, setRestockBahanId] = useState<string>("");
  const [restockJumlah, setRestockJumlah] = useState<string>("");
  const [restockKeterangan, setRestockKeterangan] = useState<string>("");
  const [isSubmittingRestock, setIsSubmittingRestock] = useState<boolean>(false);

  // Form State: Buat Menu Baru
  const [newMenuNama, setNewMenuNama] = useState<string>("");
  const [newMenuDeskripsi, setNewMenuDeskripsi] = useState<string>("");
  const [newMenuKalori, setNewMenuKalori] = useState<string>("500");
  const [newMenuProtein, setNewMenuProtein] = useState<string>("25");
  const [newMenuLemak, setNewMenuLemak] = useState<string>("15");
  const [newMenuKarbo, setNewMenuKarbo] = useState<string>("65");
  const [newMenuResepItems, setNewMenuResepItems] = useState<
    Array<{ bahanId: string; jumlahPerPorsi: number; satuan: string }>
  >([]);
  const [isSubmittingMenu, setIsSubmittingMenu] = useState<boolean>(false);

  // Form State: Tambah Master Bahan Baru
  const [newBahanKode, setNewBahanKode] = useState<string>("");
  const [newBahanNama, setNewBahanNama] = useState<string>("");
  const [newBahanKategori, setNewBahanKategori] = useState<string>("sayur");
  const [newBahanSatuan, setNewBahanSatuan] = useState<string>("kg");
  const [newBahanStokAwal, setNewBahanStokAwal] = useState<string>("0");
  const [newBahanStokMin, setNewBahanStokMin] = useState<string>("10");
  const [isSubmittingMasterBahan, setIsSubmittingMasterBahan] = useState<boolean>(false);

  // Fetch Semua Data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [dashRes, bahanRes, menuRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/bahan"),
        fetch("/api/menu"),
      ]);

      if (dashRes.ok) {
        const json = await dashRes.json();
        setMetrics(json.metrics);
        setJadwal(json.jadwal);
        setBomList(json.bomList || []);
        setSekolahList(json.daftarSekolah || []);
        setPresensiList(json.presensiHariIni || []);
        setMutasiList(json.mutasiTerbaru || []);
      }

      if (bahanRes.ok) {
        const json = await bahanRes.json();
        setAllBahan(json.daftarBahan || []);
        if (json.daftarBahan && json.daftarBahan.length > 0 && !restockBahanId) {
          setRestockBahanId(json.daftarBahan[0].id);
        }
      }

      if (menuRes.ok) {
        const json = await menuRes.json();
        setAllMenu(json.daftarMenu || []);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, [restockBahanId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aksi Mulai Masak (Potong Stok)
  const handleMulaiMasak = async () => {
    if (!confirm("Mulai proses masak dan potong otomatis stok bahan baku di database?")) return;

    try {
      setIsProcessingMasak(true);
      setToast(null);

      const res = await fetch("/api/produksi/potong-stok", { method: "POST" });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Gagal memotong stok.");

      setToast({ type: "success", message: json.message || "Stok berhasil dipotong!" });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsProcessingMasak(false);
    }
  };

  // Submit Restock
  const handleSubmitRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockBahanId || !restockJumlah) return;

    try {
      setIsSubmittingRestock(true);
      setToast(null);

      const res = await fetch("/api/bahan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restock",
          bahanId: restockBahanId,
          jumlah: Number(restockJumlah),
          keterangan: restockKeterangan,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal restock.");

      setToast({ type: "success", message: json.message });
      setRestockJumlah("");
      setRestockKeterangan("");
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsSubmittingRestock(false);
    }
  };

  // Submit Tambah Master Bahan Baru
  const handleSubmitMasterBahan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBahanKode || !newBahanNama) return;

    try {
      setIsSubmittingMasterBahan(true);
      setToast(null);

      const res = await fetch("/api/bahan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tambah_master",
          kodeBahan: newBahanKode,
          namaBahan: newBahanNama,
          kategori: newBahanKategori,
          satuanStandar: newBahanSatuan,
          stokAwal: Number(newBahanStokAwal),
          stokMinimum: Number(newBahanStokMin),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambah master bahan.");

      setToast({ type: "success", message: json.message });
      setNewBahanKode("");
      setNewBahanNama("");
      setNewBahanStokAwal("0");
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsSubmittingMasterBahan(false);
    }
  };

  // Submit Menu Baru & BOM
  const handleSubmitMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuNama) return;

    try {
      setIsSubmittingMenu(true);
      setToast(null);

      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaMenu: newMenuNama,
          deskripsi: newMenuDeskripsi,
          totalKalori: Number(newMenuKalori),
          proteinGram: Number(newMenuProtein),
          lemakGram: Number(newMenuLemak),
          karboGram: Number(newMenuKarbo),
          isApprovedGizi: true,
          resep: newMenuResepItems,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan menu.");

      setToast({ type: "success", message: json.message });
      setNewMenuNama("");
      setNewMenuDeskripsi("");
      setNewMenuResepItems([]);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsSubmittingMenu(false);
    }
  };

  // Helper tambah baris resep di form menu
  const handleAddResepRow = () => {
    if (allBahan.length === 0) return;
    const defaultBahan = allBahan[0];
    setNewMenuResepItems([
      ...newMenuResepItems,
      {
        bahanId: defaultBahan.id,
        jumlahPerPorsi: 0.05,
        satuan: defaultBahan.satuanStandar,
      },
    ]);
  };

  const handleRemoveResepRow = (idx: number) => {
    setNewMenuResepItems(newMenuResepItems.filter((_, i) => i !== idx));
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
              <p className="text-xs text-brand-pastel/80">Sistem Operasional & Dapur MBG</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/presensi"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-pastel text-brand-dark text-xs font-bold hover:bg-white transition"
            >
              Presensi HP <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
            <button
              type="button"
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center justify-center cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        {/* Toast Notifikasi */}
        {toast && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-brand-dark/15 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("operasional")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "operasional"
                ? "bg-brand-dark text-white shadow-sm"
                : "bg-white text-brand-dark/70 border border-brand-dark/15 hover:text-brand-dark"
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" /> 1. Operasional & Produksi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("menu")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "menu"
                ? "bg-brand-dark text-white shadow-sm"
                : "bg-white text-brand-dark/70 border border-brand-dark/15 hover:text-brand-dark"
            }`}
          >
            <ChefHat className="w-4 h-4" /> 2. Racik Menu & BOM (Ahli Gizi)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("stok")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "stok"
                ? "bg-brand-dark text-white shadow-sm"
                : "bg-white text-brand-dark/70 border border-brand-dark/15 hover:text-brand-dark"
            }`}
          >
            <PackagePlus className="w-4 h-4" /> 3. Kelola Stok & Restock
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: OPERASIONAL & PRODUKSI                                   */}
        {/* ============================================================== */}
        {activeTab === "operasional" && (
          <div className="space-y-6">
            {/* Top Summary KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-2xs space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-dark/70">
                  Target Porsi Hari Ini
                </span>
                <p className="text-3xl font-bold text-brand-dark tabular-nums">
                  {metrics?.totalPorsi.toLocaleString("id-ID") || 0}{" "}
                  <span className="text-xs font-normal text-brand-dark/60">porsi</span>
                </p>
                <p className="text-[11px] text-brand-dark/70">
                  {metrics?.totalSekolah || 0} sekolah penerima aktif
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-2xs space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-dark/70">
                  Presensi Pekerja
                </span>
                <p className="text-3xl font-bold text-brand-dark tabular-nums">
                  {metrics?.anggotaHadir || 0}{" "}
                  <span className="text-base font-semibold text-brand-dark/60">
                    / {metrics?.totalAnggota || 0}
                  </span>
                </p>
                <p className="text-[11px] text-emerald-800 font-semibold">
                  {metrics?.tepatWaktuCount || 0} Tepat Waktu
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-2xs space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-dark/70">
                  Menu Terjadwal
                </span>
                <p className="text-base font-bold text-brand-dark truncate">
                  {jadwal?.namaMenu || "Belum ada menu"}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-gold/25 text-brand-dark border border-brand-gold/50">
                    {jadwal?.isApprovedGizi ? "Approved Gizi" : "Draft"}
                  </span>
                  <span className="text-[11px] text-brand-dark/60">
                    {jadwal?.totalKalori} kkal
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-brand-dark/15 shadow-2xs space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-dark/70">
                  Peringatan Bahan
                </span>
                <p
                  className={`text-3xl font-bold tabular-nums ${
                    (metrics?.defisitCount || 0) > 0 ? "text-amber-800" : "text-brand-dark"
                  }`}
                >
                  {metrics?.defisitCount || 0}{" "}
                  <span className="text-xs font-normal text-brand-dark/60">Item Defisit</span>
                </p>
                <p className="text-[11px] text-brand-dark/70">
                  {(metrics?.defisitCount || 0) > 0
                    ? "Segera lakukan restock di tab 3"
                    : "Semua bahan baku tercukupi"}
                </p>
              </div>
            </section>

            {/* BOM Table */}
            <section className="bg-white rounded-2xl border border-brand-dark/15 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-brand-canvas border-b border-brand-dark/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-brand-dark" /> Kalkulasi Kebutuhan Bahan (BOM)
                  </h3>
                  <p className="text-xs text-brand-dark/70">
                    {jadwal?.namaMenu || "-"} • Total: {metrics?.totalPorsi || 0} Porsi
                  </p>
                </div>

                <div>
                  {metrics?.statusProduksi === "selesai" ? (
                    <span className="px-3.5 py-1.5 rounded-lg bg-brand-green/20 text-brand-dark text-xs font-bold border border-brand-green flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-800" /> Selesai Dimasak (Stok Terpotong)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleMulaiMasak}
                      disabled={isProcessingMasak || !jadwal}
                      className="px-4 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-brand-dark/90 active:scale-95 transition flex items-center gap-1.5 shadow-sm disabled:opacity-40 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-brand-green" /> Mulai Masak (Potong Stok)
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
                      <th className="px-6 py-3.5">Kebutuhan Hari Ini</th>
                      <th className="px-6 py-3.5">Saldo Stok Saat Ini</th>
                      <th className="px-6 py-3.5">Status Ketersediaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark/10">
                    {bomList.map((item) => (
                      <tr
                        key={item.bahanId}
                        className={item.isDefisit ? "bg-amber-50/70" : "hover:bg-brand-canvas/40"}
                      >
                        <td className="px-6 py-3.5 font-bold text-brand-dark">{item.namaBahan}</td>
                        <td className="px-6 py-3.5 tabular-nums text-brand-dark/80">
                          {item.satuan === "kg"
                            ? `${((item.totalKebutuhan / (metrics?.totalPorsi || 1)) * 1000).toFixed(0)} gr`
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
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Alokasi Sekolah & Log Presensi */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alokasi Sekolah */}
              <div className="bg-white rounded-2xl border border-brand-dark/15 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                    <School className="w-4 h-4 text-brand-dark" /> Target Sekolah Penerima
                  </h3>
                  <span className="text-xs text-brand-dark/60">{sekolahList.length} Sekolah</span>
                </div>
                <div className="space-y-2.5">
                  {sekolahList.map((sch) => (
                    <div
                      key={sch.id}
                      className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-brand-dark text-sm">{sch.namaSekolah}</p>
                        <p className="text-[11px] text-brand-dark/70">
                          Makan: {sch.jamMakan.substring(0, 5)} WIB • PIC: {sch.picNama}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-brand-dark tabular-nums">
                          {sch.jumlahPorsiTarget} <span className="text-xs font-normal">porsi</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Log Presensi Pekerja */}
              <div className="bg-white rounded-2xl border border-brand-dark/15 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-dark" /> Presensi Tim Dapur Hari Ini
                  </h3>
                  <Link href="/presensi" className="text-xs font-bold text-brand-dark underline">
                    Buka Kamera Presensi
                  </Link>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {presensiList.length === 0 ? (
                    <p className="text-xs text-center py-6 text-brand-dark/60 bg-brand-canvas rounded-xl">
                      Belum ada presensi tercatat hari ini.
                    </p>
                  ) : (
                    presensiList.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-brand-canvas border border-brand-dark/10 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {p.fotoBuktiUrl ? (
                            <button
                              type="button"
                              onClick={() => setActivePhotoModal(p.fotoBuktiUrl)}
                              className="w-9 h-9 rounded-lg overflow-hidden border border-brand-dark/20 relative group shrink-0"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.fotoBuktiUrl} alt="Selfie" className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-brand-dark/10 flex items-center justify-center text-brand-dark font-bold text-xs shrink-0">
                              {p.namaAnggota.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-brand-dark">{p.namaAnggota}</p>
                            <p className="text-[10px] text-brand-dark/70">
                              {new Date(p.waktuCatat).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              WIB • {p.jenis === "masuk" ? "Clock In" : "Clock Out"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === "tepat_waktu"
                                ? "bg-brand-green/20 text-brand-dark border border-brand-green/40"
                                : "bg-amber-100 text-amber-900 border border-amber-300"
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: RACIK MENU & BOM (AHLI GIZI)                             */}
        {/* ============================================================== */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Input Menu Baru */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-dark/15 p-6 shadow-xs space-y-5">
                <div>
                  <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-brand-dark" /> Formulir Menu & Resep (BOM) Baru
                  </h3>
                  <p className="text-xs text-brand-dark/70 mt-0.5">
                    Buat formula paket menu bergizi dan tentukan gramasi bahan baku per 1 porsi.
                  </p>
                </div>

                <form onSubmit={handleSubmitMenu} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-dark">Nama Menu</label>
                      <input
                        type="text"
                        required
                        value={newMenuNama}
                        onChange={(e) => setNewMenuNama(e.target.value)}
                        placeholder="Contoh: Paket B — Nasi Ikan Tongkol & Sop Sayur"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-dark"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-dark">Deskripsi Singkat</label>
                      <input
                        type="text"
                        value={newMenuDeskripsi}
                        onChange={(e) => setNewMenuDeskripsi(e.target.value)}
                        placeholder="Komposisi lauk dan penyajian"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-dark"
                      />
                    </div>
                  </div>

                  {/* Nilai Makronutrisi */}
                  <div className="p-4 rounded-xl bg-brand-canvas border border-brand-dark/10 space-y-2">
                    <p className="text-xs font-bold text-brand-dark">Nilai Gizi Per Porsi</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-[11px] text-brand-dark/70">Kalori (kkal)</span>
                        <input
                          type="number"
                          value={newMenuKalori}
                          onChange={(e) => setNewMenuKalori(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-brand-dark/20 bg-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-brand-dark/70">Protein (gr)</span>
                        <input
                          type="number"
                          value={newMenuProtein}
                          onChange={(e) => setNewMenuProtein(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-brand-dark/20 bg-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-brand-dark/70">Lemak (gr)</span>
                        <input
                          type="number"
                          value={newMenuLemak}
                          onChange={(e) => setNewMenuLemak(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-brand-dark/20 bg-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-brand-dark/70">Karbohidrat (gr)</span>
                        <input
                          type="number"
                          value={newMenuKarbo}
                          onChange={(e) => setNewMenuKarbo(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-brand-dark/20 bg-white text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resep BOM Items */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                        <Boxes className="w-4 h-4" /> Kebutuhan Bahan Per 1 Porsi (BOM)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddResepRow}
                        className="px-3 py-1.5 rounded-lg bg-brand-pastel text-brand-dark text-xs font-bold hover:bg-white border border-brand-dark/15 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Bahan
                      </button>
                    </div>

                    {newMenuResepItems.length === 0 ? (
                      <p className="text-xs text-center py-4 bg-brand-canvas rounded-xl text-brand-dark/60">
                        Klik tombol &quot;Tambah Bahan&quot; untuk memasukkan takaran bahan baku resep.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {newMenuResepItems.map((row, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-brand-canvas p-2.5 rounded-xl border border-brand-dark/10"
                          >
                            <select
                              value={row.bahanId}
                              onChange={(e) => {
                                const selected = allBahan.find((b) => b.id === e.target.value);
                                const updated = [...newMenuResepItems];
                                updated[idx].bahanId = e.target.value;
                                updated[idx].satuan = selected?.satuanStandar || "kg";
                                setNewMenuResepItems(updated);
                              }}
                              className="flex-1 px-2.5 py-2 rounded-lg border border-brand-dark/20 bg-white text-xs font-semibold"
                            >
                              {allBahan.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.namaBahan} ({b.satuanStandar})
                                </option>
                              ))}
                            </select>

                            <div className="w-32 flex items-center gap-1">
                              <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={row.jumlahPerPorsi}
                                onChange={(e) => {
                                  const updated = [...newMenuResepItems];
                                  updated[idx].jumlahPerPorsi = Number(e.target.value);
                                  setNewMenuResepItems(updated);
                                }}
                                className="w-full px-2 py-2 rounded-lg border border-brand-dark/20 bg-white text-xs font-bold text-right"
                              />
                              <span className="text-xs font-bold text-brand-dark/70">
                                {row.satuan}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveResepRow(idx)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Hapus Baris"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingMenu || !newMenuNama}
                    className="w-full h-11 rounded-xl bg-brand-dark text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-brand-dark/90 active:scale-98 transition shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingMenu ? (
                      "Menyimpan..."
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-brand-green" /> Simpan Menu & Resep (BOM)
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Daftar Menu Tersimpan */}
              <div className="bg-white rounded-2xl border border-brand-dark/15 p-5 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-brand-dark">Katalog Menu Tersimpan</h3>
                  <p className="text-xs text-brand-dark/60">{allMenu.length} Menu terdaftar</p>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {allMenu.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-brand-canvas border border-brand-dark/10 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-brand-dark text-sm leading-tight">{m.namaMenu}</p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-gold/20 text-brand-dark shrink-0">
                          {m.totalKalori} kkal
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-dark/70">{m.deskripsi || "Tanpa deskripsi"}</p>

                      <div className="pt-2 border-t border-brand-dark/10 space-y-1">
                        <p className="text-[10px] font-bold text-brand-dark/70 uppercase">
                          Resep Bahan ({m.resep.length} item):
                        </p>
                        <ul className="space-y-0.5 text-[11px] text-brand-dark/80">
                          {m.resep.map((r) => (
                            <li key={r.id} className="flex justify-between">
                              <span>• {r.namaBahan}</span>
                              <span className="font-bold">
                                {r.jumlahPerPorsi} {r.satuan} / porsi
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: KELOLA STOK & RESTOCK                                    */}
        {/* ============================================================== */}
        {activeTab === "stok" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Input Restock Cepat */}
              <div className="bg-white rounded-2xl border border-brand-dark/15 p-6 shadow-xs space-y-4">
                <div className="border-b border-brand-dark/10 pb-3">
                  <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                    <PackagePlus className="w-4 h-4 text-brand-dark" /> Input Restock Bahan Masuk
                  </h3>
                  <p className="text-xs text-brand-dark/70 mt-0.5">
                    Tambah saldo stok bahan baku yang baru datang dari supplier.
                  </p>
                </div>

                <form onSubmit={handleSubmitRestock} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-brand-dark">Pilih Bahan Baku</label>
                    <select
                      value={restockBahanId}
                      onChange={(e) => setRestockBahanId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-brand-dark/20 bg-white font-semibold"
                    >
                      {allBahan.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.namaBahan} (Saldo: {b.stokSaatIni} {b.satuanStandar})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-brand-dark">Jumlah Penambahan</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={restockJumlah}
                      onChange={(e) => setRestockJumlah(e.target.value)}
                      placeholder="Contoh: 50.0"
                      className="w-full px-3 py-2.5 rounded-xl border border-brand-dark/20 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-brand-dark">Catatan / Keterangan PO</label>
                    <input
                      type="text"
                      value={restockKeterangan}
                      onChange={(e) => setRestockKeterangan(e.target.value)}
                      placeholder="Supplier / No. Surat Jalan"
                      className="w-full px-3 py-2.5 rounded-xl border border-brand-dark/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingRestock || !restockJumlah}
                    className="w-full h-11 rounded-xl bg-brand-dark text-white font-bold uppercase tracking-wider hover:bg-brand-dark/90 active:scale-98 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingRestock ? "Memproses..." : "Tambah Saldo Stok"}
                  </button>
                </form>

                {/* Form Tambah Master Bahan Baru */}
                <div className="pt-4 border-t border-brand-dark/10 space-y-3">
                  <h4 className="text-xs font-bold text-brand-dark">Tambah Master Bahan Baru</h4>
                  <form onSubmit={handleSubmitMasterBahan} className="space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Kode: BHN-004"
                        value={newBahanKode}
                        onChange={(e) => setNewBahanKode(e.target.value)}
                        className="px-2.5 py-2 rounded-lg border border-brand-dark/20 bg-brand-canvas"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Nama Bahan"
                        value={newBahanNama}
                        onChange={(e) => setNewBahanNama(e.target.value)}
                        className="px-2.5 py-2 rounded-lg border border-brand-dark/20 bg-brand-canvas"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newBahanKategori}
                        onChange={(e) => setNewBahanKategori(e.target.value)}
                        className="px-2.5 py-2 rounded-lg border border-brand-dark/20 bg-brand-canvas text-[11px]"
                      >
                        <option value="pokok">Pokok</option>
                        <option value="lauk_hewani">Lauk Hewani</option>
                        <option value="lauk_nabati">Lauk Nabati</option>
                        <option value="sayur">Sayur</option>
                        <option value="buah">Buah</option>
                        <option value="bumbu">Bumbu</option>
                      </select>
                      <input
                        type="text"
                        required
                        placeholder="Satuan: kg / liter"
                        value={newBahanSatuan}
                        onChange={(e) => setNewBahanSatuan(e.target.value)}
                        className="px-2.5 py-2 rounded-lg border border-brand-dark/20 bg-brand-canvas"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingMasterBahan || !newBahanNama}
                      className="w-full py-2 rounded-lg bg-brand-pastel text-brand-dark font-bold text-xs hover:bg-white border border-brand-dark/15 transition cursor-pointer"
                    >
                      {isSubmittingMasterBahan ? "Menyimpan..." : "Daftarkan Master Bahan"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Tabel Saldo Seluruh Bahan Baku */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-dark/15 shadow-xs overflow-hidden">
                <div className="px-6 py-4 bg-brand-canvas border-b border-brand-dark/10 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-brand-dark">Katalog Saldo Stok Bahan Baku</h3>
                  <span className="text-xs text-brand-dark/60">{allBahan.length} Item Bahan</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-canvas/70 text-brand-dark/80 font-bold border-b border-brand-dark/10">
                      <tr>
                        <th className="px-6 py-3.5">Kode</th>
                        <th className="px-6 py-3.5">Nama Bahan</th>
                        <th className="px-6 py-3.5">Kategori</th>
                        <th className="px-6 py-3.5">Saldo Stok Saat Ini</th>
                        <th className="px-6 py-3.5">Batas Minimum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-dark/10">
                      {allBahan.map((b) => (
                        <tr key={b.id} className="hover:bg-brand-canvas/40">
                          <td className="px-6 py-3.5 font-mono text-brand-dark/70">{b.kodeBahan}</td>
                          <td className="px-6 py-3.5 font-bold text-brand-dark">{b.namaBahan}</td>
                          <td className="px-6 py-3.5 capitalize text-brand-dark/80">{b.kategori}</td>
                          <td className="px-6 py-3.5 tabular-nums font-bold text-base text-brand-dark">
                            {b.stokSaatIni} {b.satuanStandar}
                          </td>
                          <td className="px-6 py-3.5 tabular-nums text-brand-dark/60">
                            {b.stokMinimum} {b.satuanStandar}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Audit Trail Riwayat Mutasi */}
                <div className="p-6 border-t border-brand-dark/10 space-y-3">
                  <h4 className="font-bold text-xs text-brand-dark">
                    Riwayat Transaksi Ledger Terakhir
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {mutasiList.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-brand-canvas border border-brand-dark/10 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-brand-dark">{m.namaBahan}</p>
                          <p className="text-[10px] text-brand-dark/60">
                            {m.keterangan || m.jenis} •{" "}
                            {new Date(m.createdAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            WIB
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-bold tabular-nums ${
                              m.jenis === "masuk" ? "text-emerald-700" : "text-red-700"
                            }`}
                          >
                            {m.jenis === "masuk" ? `+${m.jumlah}` : `-${m.jumlah}`}
                          </span>
                          <p className="text-[10px] text-brand-dark/60">Saldo: {m.saldoSetelahnya}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              <img src={activePhotoModal} alt="Selfie" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-brand-dark/10 py-6 bg-white text-center text-xs text-brand-dark/60 mt-12">
        SPPG Mandiri Jaya — Sistem Informasi Dapur MBG &copy; 2026
      </footer>
    </div>
  );
}
