"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
  Play,
  Check,
  Plus,
  Trash2,
  ChefHat,
  PackagePlus,
  LogOut,
  UserPlus,
  Building2,
  Flame,
  TrendingUp,
  Truck,
  FileSpreadsheet,
  Layers,
  Smartphone,
  ExternalLink,
  Building,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Navigation,
  Thermometer,
  ShieldCheck,
  FileCheck,
} from "lucide-react";

const TabLoadingFallback = () => (
  <div className="p-10 rounded-2xl bg-white border border-brand-dark/10 text-center space-y-3 shadow-sm">
    <div className="w-8 h-8 border-3 border-brand-dark/20 border-t-brand-dark rounded-full animate-spin mx-auto" />
    <p className="text-xs font-semibold text-brand-dark/60">Memuat modul...</p>
  </div>
);

const PengadaanTab = dynamic(() => import("@/components/PengadaanTab"), { loading: TabLoadingFallback });
const QcBatchTab = dynamic(() => import("@/components/QcBatchTab"), { loading: TabLoadingFallback });
const DistribusiTab = dynamic(() => import("@/components/DistribusiTab"), { loading: TabLoadingFallback });
const CabangTab = dynamic(() => import("@/components/CabangTab"), { loading: TabLoadingFallback });
const FinansialTab = dynamic(() => import("@/components/FinansialTab"), { loading: TabLoadingFallback });
const KomplainTab = dynamic(() => import("@/components/KomplainTab"), { loading: TabLoadingFallback });
const WaLogsTab = dynamic(() => import("@/components/WaLogsTab"), { loading: TabLoadingFallback });
const AiPlannerTab = dynamic(() => import("@/components/AiPlannerTab"), { loading: TabLoadingFallback });
const VrpTab = dynamic(() => import("@/components/VrpTab"), { loading: TabLoadingFallback });
const IotTab = dynamic(() => import("@/components/IotTab"), { loading: TabLoadingFallback });
const BgnTab = dynamic(() => import("@/components/BgnTab"), { loading: TabLoadingFallback });

interface Metrics {
  totalPorsi: number;
  totalSekolah: number;
  totalAnggota: number;
  anggotaHadir: number;
  tepatWaktuCount: number;
  defisitCount: number;
  statusProduksi: string;
  totalSupplier?: number;
  poDiajukanCount?: number;
  batchSegeraExpired?: number;
  pengirimanTotal?: number;
  pengirimanSelesai?: number;
  pengirimanJalan?: number;
  totalCabang?: number;
  transferStokAktif?: number;
  foodWasteHariIniKg?: number;
  foodWasteHariIniRp?: number;
  komplainPendingCount?: number;
  waTotalCount?: number;
  aiPresetCount?: number;
  vrpRuteCount?: number;
  iotDeviceCount?: number;
  haccpScore?: number;
  bgnAuditCount?: number;
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
  catatanAlergi?: string | null;
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

interface AnggotaMasterItem {
  id: string;
  nik: string;
  namaLengkap: string;
  jabatan: string;
  statusAktif: boolean;
}

interface ShiftItem {
  id: number;
  namaShift: string;
  jamMasuk: string;
  jamPulang: string;
  toleransiMenit: number;
}

// Reusable styled input/select classes
const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-sm font-semibold text-brand-dark placeholder:text-brand-dark/40 focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const labelCls = "block text-xs font-bold text-brand-dark/80 mb-1";
const submitBtnCls =
  "w-full h-11 rounded-xl bg-brand-dark text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-brand-dark/90 active:scale-[0.98] transition shadow-sm disabled:opacity-50 cursor-pointer";
const sectionHeaderCls =
  "px-6 py-4 border-b border-brand-dark/10 flex items-center justify-between gap-3";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<
    | "operasional"
    | "pengadaan"
    | "qc_batch"
    | "distribusi"
    | "menu"
    | "stok"
    | "sekolah_anggota"
    | "cabang"
    | "finansial"
    | "komplain"
    | "wa_logs"
    | "ai_planner"
    | "vrp"
    | "iot_haccp"
    | "bgn_audit"
  >("operasional");

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
  const [allAnggota, setAllAnggota] = useState<AnggotaMasterItem[]>([]);
  const [allShifts, setAllShifts] = useState<ShiftItem[]>([]);

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

  // Form State: Tambah Sekolah Baru
  const [schNama, setSchNama] = useState<string>("");
  const [schAlamat, setSchAlamat] = useState<string>("");
  const [schPorsi, setSchPorsi] = useState<string>("");
  const [schPicNama, setSchPicNama] = useState<string>("");
  const [schPicKontak, setSchPicKontak] = useState<string>("");
  const [schJamMakan, setSchJamMakan] = useState<string>("10:00");
  const [schCatatanAlergi, setSchCatatanAlergi] = useState<string>("");
  const [isSubmittingSekolah, setIsSubmittingSekolah] = useState<boolean>(false);

  // Form State: Tambah Anggota Dapur Baru
  const [agtNik, setAgtNik] = useState<string>("");
  const [agtNama, setAgtNama] = useState<string>("");
  const [agtJabatan, setAgtJabatan] = useState<string>("");
  const [agtShiftId, setAgtShiftId] = useState<string>("");
  const [isSubmittingAnggota, setIsSubmittingAnggota] = useState<boolean>(false);

  // Fetch Semua Data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [dashRes, bahanRes, menuRes, anggotaRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/bahan"),
        fetch("/api/menu"),
        fetch("/api/anggota"),
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

      if (anggotaRes.ok) {
        const json = await anggotaRes.json();
        setAllAnggota(json.daftarAnggota || []);
        setAllShifts(json.shifts || []);
        if (json.shifts && json.shifts.length > 0 && !agtShiftId) {
          setAgtShiftId(String(json.shifts[0].id));
        }
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, [restockBahanId, agtShiftId]);

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

  // Submit Tambah Sekolah Baru
  const handleSubmitSekolah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schNama || !schAlamat || !schPorsi || !schPicNama || !schPicKontak) {
      setToast({ type: "error", message: "Harap isi seluruh field wajib sekolah." });
      return;
    }

    try {
      setIsSubmittingSekolah(true);
      setToast(null);

      const res = await fetch("/api/sekolah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaSekolah: schNama,
          alamat: schAlamat,
          jumlahPorsiTarget: Number(schPorsi),
          picNama: schPicNama,
          picKontak: schPicKontak,
          jamMakan: schJamMakan,
          catatanAlergi: schCatatanAlergi || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mendaftarkan sekolah.");

      setToast({ type: "success", message: json.message });
      setSchNama("");
      setSchAlamat("");
      setSchPorsi("");
      setSchPicNama("");
      setSchPicKontak("");
      setSchCatatanAlergi("");
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsSubmittingSekolah(false);
    }
  };

  // Submit Tambah Anggota Dapur Baru
  const handleSubmitAnggota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agtNik || !agtNama || !agtJabatan) {
      setToast({ type: "error", message: "NIK, Nama Lengkap, dan Jabatan wajib diisi." });
      return;
    }

    if (!/^\d{16}$/.test(agtNik.trim())) {
      setToast({ type: "error", message: "NIK harus tepat 16 digit angka sesuai KTP." });
      return;
    }

    try {
      setIsSubmittingAnggota(true);
      setToast(null);

      const res = await fetch("/api/anggota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nik: agtNik.trim(),
          namaLengkap: agtNama,
          jabatan: agtJabatan,
          shiftId: agtShiftId ? Number(agtShiftId) : null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mendaftarkan anggota.");

      setToast({ type: "success", message: json.message });
      setAgtNik("");
      setAgtNama("");
      setAgtJabatan("");
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsSubmittingAnggota(false);
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

  // Sekolah dengan jam makan terdekat dari sekarang
  const sekolahTerdekat = sekolahList.length > 0
    ? [...sekolahList].sort((a, b) => a.jamMakan.localeCompare(b.jamMakan))[0]
    : null;

  const defisitCount = metrics?.defisitCount ?? 0;
  const sudahSelesai = metrics?.statusProduksi === "selesai";

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-dark flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-brand-dark text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-xl bg-brand-pastel text-brand-dark font-extrabold flex items-center justify-center text-base hover:opacity-90 transition shrink-0"
            >
              SP
            </Link>
            <div>
              <h1 className="font-extrabold text-sm leading-tight tracking-tight">SPPG MANDIRI JAYA</h1>
              <p className="text-xs text-brand-pastel/80 font-medium">Sistem Operasional Dapur MBG</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/distribusi"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition"
            >
              <Smartphone className="w-3.5 h-3.5" /> Portal Kurir HP <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/presensi"
              className="hidden sm:inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-lg bg-brand-pastel text-brand-dark text-xs font-bold hover:bg-white transition"
            >
              Presensi HP <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
            <button
              type="button"
              onClick={fetchData}
              disabled={isLoading}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-5">
        {/* Toast Notifikasi */}
        {toast && (
          <div
            className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm ${
              toast.type === "success"
                ? "bg-emerald-50 border border-emerald-300 text-emerald-900"
                : "bg-red-50 border border-red-300 text-red-800"
            }`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-xs font-bold ml-4 underline underline-offset-2 cursor-pointer opacity-70 hover:opacity-100 transition"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Tab Navigation (Horizontal swipeable on mobile, wrapping on large screens) */}
        <div
          role="tablist"
          aria-label="Navigasi Modul Dapur SPPG"
          className="flex items-center gap-2 border-b border-brand-dark/15 pb-3 overflow-x-auto scroll-smooth whitespace-nowrap lg:flex-wrap"
        >
          {(
            [
              { key: "operasional", label: "1. Operasional", icon: <UtensilsCrossed className="w-4 h-4" /> },
              { key: "pengadaan", label: "2. Pengadaan (PO)", icon: <FileSpreadsheet className="w-4 h-4" /> },
              { key: "qc_batch", label: "3. QC & Batch FEFO", icon: <Layers className="w-4 h-4" /> },
              { key: "distribusi", label: "4. Distribusi Armada", icon: <Truck className="w-4 h-4" /> },
              { key: "menu", label: "5. Racik Menu & BOM", icon: <ChefHat className="w-4 h-4" /> },
              { key: "stok", label: "6. Master Bahan & Stok", icon: <PackagePlus className="w-4 h-4" /> },
              { key: "sekolah_anggota", label: "7. Sekolah & Anggota", icon: <Building2 className="w-4 h-4" /> },
              { key: "cabang", label: "8. Cabang & Transfer", icon: <Building className="w-4 h-4" /> },
              { key: "finansial", label: "9. HPP & Food Waste", icon: <TrendingUp className="w-4 h-4" /> },
              { key: "komplain", label: "10. Komplain Sekolah", icon: <AlertCircle className="w-4 h-4" /> },
              { key: "wa_logs", label: "11. Log WhatsApp", icon: <MessageSquare className="w-4 h-4" /> },
              { key: "ai_planner", label: "12. AI Menu & ROP", icon: <Sparkles className="w-4 h-4" /> },
              { key: "vrp", label: "13. Rute VRP CVRPTW", icon: <Navigation className="w-4 h-4" /> },
              { key: "iot_haccp", label: "14. IoT Cold-Chain", icon: <Thermometer className="w-4 h-4" /> },
              { key: "bgn_audit", label: "15. Audit BGN RI", icon: <ShieldCheck className="w-4 h-4" /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark ${
                activeTab === tab.key
                  ? "bg-brand-dark text-white shadow-sm"
                  : "bg-white text-brand-dark/60 border border-brand-dark/15 hover:text-brand-dark hover:border-brand-dark/30"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: OPERASIONAL & PRODUKSI                                   */}
        {/* ============================================================== */}
        {activeTab === "operasional" && (
          <div className="space-y-5">

            {/* ── HERO OPERATIONAL PULSE ── */}
            <section
              className={`rounded-2xl p-6 text-white relative overflow-hidden ${
                sudahSelesai
                  ? "bg-emerald-800"
                  : defisitCount > 0
                  ? "bg-amber-800"
                  : "bg-brand-dark"
              }`}
            >
              {/* Background texture */}
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }}
              />

              <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                {/* Kiri: status & info */}
                <div className="space-y-4 flex-1">
                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      sudahSelesai
                        ? "bg-white/15 border-white/30 text-white"
                        : defisitCount > 0
                        ? "bg-amber-200/20 border-amber-300/40 text-amber-100"
                        : "bg-brand-pastel/20 border-brand-pastel/40 text-brand-pastel"
                    }`}>
                      {sudahSelesai ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Produksi Selesai</>
                      ) : defisitCount > 0 ? (
                        <><AlertTriangle className="w-3.5 h-3.5" /> {defisitCount} Bahan Defisit</>
                      ) : (
                        <><Flame className="w-3.5 h-3.5" /> Siap Produksi</>
                      )}
                    </span>
                  </div>

                  {/* Menu hari ini */}
                  <div>
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-1">Menu Hari Ini</p>
                    <h2 className="text-2xl font-extrabold leading-tight tracking-tight">
                      {jadwal?.namaMenu || "Belum Ada Menu Terjadwal"}
                    </h2>
                    {jadwal && (
                      <p className="text-sm text-white/70 mt-1">
                        {jadwal.totalKalori} kkal · {jadwal.proteinGram}g protein · {jadwal.lemakGram}g lemak · {jadwal.karboGram}g karbo
                      </p>
                    )}
                  </div>

                  {/* KPI row */}
                  <div className="flex flex-wrap gap-5">
                    <div>
                      <p className="text-xs text-white/60 font-semibold">Target Porsi</p>
                      <p className="text-3xl font-extrabold tabular-nums leading-none mt-0.5">
                        {metrics?.totalPorsi.toLocaleString("id-ID") || "0"}
                        <span className="text-sm font-semibold text-white/60 ml-1.5">porsi</span>
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">{metrics?.totalSekolah || 0} sekolah penerima</p>
                    </div>
                    <div className="w-px bg-white/20" />
                    <div>
                      <p className="text-xs text-white/60 font-semibold">Hadir Hari Ini</p>
                      <p className="text-3xl font-extrabold tabular-nums leading-none mt-0.5">
                        {metrics?.anggotaHadir || 0}
                        <span className="text-sm font-semibold text-white/60 ml-1">
                          / {metrics?.totalAnggota || 0}
                        </span>
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">{metrics?.tepatWaktuCount || 0} tepat waktu</p>
                    </div>
                    {sekolahTerdekat && (
                      <>
                        <div className="w-px bg-white/20" />
                        <div>
                          <p className="text-xs text-white/60 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Distribusi Terdekat
                          </p>
                          <p className="text-lg font-extrabold tabular-nums leading-none mt-0.5">
                            {sekolahTerdekat.jamMakan.substring(0, 5)} WIB
                          </p>
                          <p className="text-xs text-white/50 mt-0.5 max-w-[160px] truncate">
                            {sekolahTerdekat.namaSekolah}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Kanan: tombol aksi */}
                <div className="flex sm:flex-col items-start gap-3 shrink-0">
                  {sudahSelesai ? (
                    <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 border border-white/25 text-white text-sm font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      Stok Sudah Terpotong
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleMulaiMasak}
                      disabled={isProcessingMasak || !jadwal}
                      className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-brand-green text-brand-dark font-extrabold text-sm hover:brightness-105 active:scale-95 transition shadow-md disabled:opacity-40 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      {isProcessingMasak ? "Memproses..." : "Mulai Masak (Potong Stok)"}
                    </button>
                  )}
                  {defisitCount > 0 && !sudahSelesai && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("stok")}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold hover:bg-white/20 transition cursor-pointer"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Restock Sekarang
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* ── KARTU METRIK FASE 2 (PENGADAAN, BATCH FEFO, DISTRIBUSI) ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark/70 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-blue-700" /> Pengadaan (PO)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                    Fase 2
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-brand-dark">
                    {metrics?.poDiajukanCount || 0}{" "}
                    <span className="text-xs font-normal text-brand-dark/60">PO Berjalan</span>
                  </p>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    {metrics?.totalSupplier || 0} Mitra Supplier Terverifikasi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("pengadaan")}
                  className="w-full h-8 rounded-lg bg-brand-canvas hover:bg-brand-pastel/30 text-brand-dark font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  Kelola Pengadaan & PO <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark/70 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-700" /> QC & Batch Expiry (FEFO)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Fase 2
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-700">
                    {metrics?.batchSegeraExpired || 0}{" "}
                    <span className="text-xs font-normal text-brand-dark/60">Batch Segera Expired</span>
                  </p>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    Prioritas otomatis First Expired First Out
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("qc_batch")}
                  className="w-full h-8 rounded-lg bg-brand-canvas hover:bg-brand-pastel/30 text-brand-dark font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  Pantau Batch Expiry <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark/70 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-700" /> Distribusi Armada
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Fase 2
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-brand-dark">
                    {metrics?.pengirimanSelesai || 0} / {metrics?.pengirimanTotal || 0}{" "}
                    <span className="text-xs font-normal text-brand-dark/60">Pengiriman Selesai</span>
                  </p>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    Foto & Tanda Tangan Digital Sekolah
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("distribusi")}
                  className="w-full h-8 rounded-lg bg-brand-canvas hover:bg-brand-pastel/30 text-brand-dark font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  Buka Distribusi Armada <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── KARTU METRIK FASE 3 (MULTI-DAPUR, HPP/WASTE, KOMPLAIN, WA) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark/70 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-purple-700" /> Multi-Dapur Cabang
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                    Fase 3
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-brand-dark">
                    {metrics?.totalCabang || 0}{" "}
                    <span className="text-xs font-normal text-brand-dark/60">Unit Dapur</span>
                  </p>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    {metrics?.transferStokAktif || 0} Mutasi Transfer Berjalan
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("cabang")}
                  className="w-full h-8 rounded-lg bg-brand-canvas hover:bg-brand-pastel/30 text-brand-dark font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  Kelola Cabang & Transfer <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark/70 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-700" /> HPP & Food Waste
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Fase 3
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-brand-dark">
                    {metrics?.foodWasteHariIniKg || 0} kg{" "}
                    <span className="text-xs font-normal text-brand-dark/60">Waste Hari Ini</span>
                  </p>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    Rp {(metrics?.foodWasteHariIniRp || 0).toLocaleString("id-ID")} Kerugian Limbah
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("finansial")}
                  className="w-full h-8 rounded-lg bg-brand-canvas hover:bg-brand-pastel/30 text-brand-dark font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  Analisis Biaya & Waste <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark/70 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" /> Komplain Sekolah
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-200">
                    Fase 3
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-brand-dark">
                    {metrics?.komplainPendingCount || 0}{" "}
                    <span className="text-xs font-normal text-brand-dark/60">Tiket Terbuka</span>
                  </p>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    Investigasi Higiene SLA &le; 60m
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("komplain")}
                  className="w-full h-8 rounded-lg bg-brand-canvas hover:bg-brand-pastel/30 text-brand-dark font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  Investigasi Aduan <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark/70 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-teal-700" /> WhatsApp Gateway
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
                    Fase 3
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-brand-dark">
                    {metrics?.waTotalCount || 0}{" "}
                    <span className="text-xs font-normal text-brand-dark/60">Pesan Audit</span>
                  </p>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    PO, Shift, Stok & ETA Terintegrasi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("wa_logs")}
                  className="w-full h-8 rounded-lg bg-brand-canvas hover:bg-brand-pastel/30 text-brand-dark font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  Audit Log Gateway <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── KARTU METRIK FASE 4 (AI MENU, VRP ROUTING, IOT COLD-CHAIN, AUDIT BGN) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark/70 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-700" /> AI Menu Planner
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                    Fase 4
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-brand-dark">
                    {metrics?.aiPresetCount || 0}{" "}
                    <span className="text-xs font-normal text-brand-dark/60">Paket Siklus</span>
                  </p>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    Linear Programming & AKG BGN
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("ai_planner")}
                  className="w-full h-8 rounded-lg bg-brand-canvas hover:bg-brand-pastel/30 text-brand-dark font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  Rancang Menu AI <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark/70 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-blue-700" /> VRP Dynamic Route
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                    Fase 4
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-brand-dark">
                    {metrics?.vrpRuteCount || 0}{" "}
                    <span className="text-xs font-normal text-brand-dark/60">Rute CVRPTW</span>
                  </p>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    Batas Termal Hangat &le; 90 Menit
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("vrp")}
                  className="w-full h-8 rounded-lg bg-brand-canvas hover:bg-brand-pastel/30 text-brand-dark font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  Optimasi Rute <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark/70 flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-cyan-700" /> IoT Cold-Chain
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-200">
                    Fase 4
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-brand-dark">
                    {metrics?.haccpScore ?? 100}%{" "}
                    <span className="text-xs font-normal text-brand-dark/60">Skor HACCP</span>
                  </p>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    {metrics?.iotDeviceCount || 0} Unit Sensor Aktif Terpasang
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("iot_haccp")}
                  className="w-full h-8 rounded-lg bg-brand-canvas hover:bg-brand-pastel/30 text-brand-dark font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  Telemetri Sensor <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-brand-dark/15 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark/70 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" /> Audit BGN RI
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Fase 4
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-brand-dark">
                    {metrics?.bgnAuditCount || 0}{" "}
                    <span className="text-xs font-normal text-brand-dark/60">Laporan Resmi</span>
                  </p>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    Enkripsi Integritas SHA-256 & QR
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("bgn_audit")}
                  className="w-full h-8 rounded-lg bg-brand-canvas hover:bg-brand-pastel/30 text-brand-dark font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  Portal Audit BGN <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── BOM TABLE — Kebutuhan Bahan ── */}
            <section className="bg-white rounded-2xl border border-brand-dark/12 shadow-sm overflow-hidden">
              <div className={sectionHeaderCls}>
                <div>
                  <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-brand-dark/70" />
                    Kalkulasi Kebutuhan Bahan (BOM)
                  </h3>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    {jadwal?.namaMenu || "—"} · {metrics?.totalPorsi || 0} porsi
                    {defisitCount > 0 && (
                      <span className="ml-2 text-amber-700 font-bold">· {defisitCount} item defisit</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-brand-canvas text-xs font-bold text-brand-dark/70 uppercase tracking-wide border-b border-brand-dark/10">
                    <tr>
                      <th className="px-6 py-3">Nama Bahan Baku</th>
                      <th className="px-6 py-3">Takaran / Porsi</th>
                      <th className="px-6 py-3">Kebutuhan Hari Ini</th>
                      <th className="px-6 py-3">Saldo Stok</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark/8">
                    {bomList.map((item) => (
                      <tr
                        key={item.bahanId}
                        className={item.isDefisit ? "bg-amber-50" : "hover:bg-brand-canvas/60 transition-colors"}
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-sm text-brand-dark">{item.namaBahan}</span>
                          {item.isDefisit && (
                            <span className="ml-2 text-xs font-semibold text-amber-700">kurang {item.defisit} {item.satuan}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 tabular-nums text-sm text-brand-dark/70">
                          {item.satuan === "kg"
                            ? `${((item.totalKebutuhan / (metrics?.totalPorsi || 1)) * 1000).toFixed(0)} gr`
                            : `${item.totalKebutuhan / (metrics?.totalPorsi || 1)} ${item.satuan}`}
                        </td>
                        <td className="px-6 py-4 tabular-nums font-bold text-sm text-brand-dark">
                          {item.totalKebutuhan} {item.satuan}
                        </td>
                        <td className={`px-6 py-4 tabular-nums font-bold text-sm ${item.isDefisit ? "text-amber-800" : "text-brand-dark"}`}>
                          {item.stokSaatIni} {item.satuan}
                        </td>
                        <td className="px-6 py-4">
                          {item.isDefisit ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-400">
                              <AlertTriangle className="w-3 h-3" />
                              Defisit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Cukup
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {bomList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-sm text-brand-dark/50">
                          Belum ada data BOM. Pastikan menu hari ini sudah dijadwalkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── MONITORING REAL-TIME: Sekolah & Presensi ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Target Sekolah */}
              <section className="bg-white rounded-2xl border border-brand-dark/12 shadow-sm overflow-hidden">
                <div className={sectionHeaderCls}>
                  <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                    <School className="w-4 h-4 text-brand-dark/70" />
                    Target Distribusi Sekolah
                  </h3>
                  <span className="text-xs font-bold text-brand-dark/50 bg-brand-canvas px-2.5 py-1 rounded-lg border border-brand-dark/10">
                    {sekolahList.length} Sekolah
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {sekolahList.length === 0 ? (
                    <p className="text-sm text-center py-6 text-brand-dark/50">Belum ada sekolah terdaftar.</p>
                  ) : (
                    sekolahList.map((sch) => (
                      <div
                        key={sch.id}
                        className="p-4 rounded-xl bg-brand-canvas border border-brand-dark/10 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-brand-dark truncate">{sch.namaSekolah}</p>
                          <p className="text-xs text-brand-dark/60 mt-0.5">
                            Makan: <span className="font-semibold text-brand-dark">{sch.jamMakan.substring(0, 5)} WIB</span>
                            {" · "}PIC: {sch.picNama}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-extrabold tabular-nums text-brand-dark leading-none">
                            {sch.jumlahPorsiTarget}
                          </p>
                          <p className="text-xs text-brand-dark/50 mt-0.5">porsi</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Presensi Tim Dapur */}
              <section className="bg-white rounded-2xl border border-brand-dark/12 shadow-sm overflow-hidden">
                <div className={sectionHeaderCls}>
                  <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-dark/70" />
                    Presensi Tim Dapur Hari Ini
                  </h3>
                  <Link
                    href="/presensi"
                    className="text-xs font-bold text-brand-dark underline underline-offset-2 hover:text-brand-dark/70 transition"
                  >
                    Buka Kamera →
                  </Link>
                </div>
                <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                  {presensiList.length === 0 ? (
                    <p className="text-sm text-center py-6 text-brand-dark/50">
                      Belum ada presensi tercatat hari ini.
                    </p>
                  ) : (
                    presensiList.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-brand-canvas border border-brand-dark/10 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-3">
                          {p.fotoBuktiUrl ? (
                            <button
                              type="button"
                              onClick={() => setActivePhotoModal(p.fotoBuktiUrl)}
                              className="w-9 h-9 rounded-lg overflow-hidden border border-brand-dark/20 shrink-0"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.fotoBuktiUrl} alt="Selfie" className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-brand-dark/10 flex items-center justify-center font-bold text-xs shrink-0 text-brand-dark">
                              {p.namaAnggota.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-sm text-brand-dark">{p.namaAnggota}</p>
                            <p className="text-xs text-brand-dark/60">
                              {new Date(p.waktuCatat).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              WIB · {p.jenis === "masuk" ? "Clock In" : "Clock Out"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${
                            p.status === "tepat_waktu"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-400"
                              : "bg-amber-100 text-amber-900 border border-amber-400"
                          }`}
                        >
                          {p.status === "tepat_waktu" ? "Tepat Waktu" : p.status === "terlambat" ? "Terlambat" : "Pulang Cepat"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: RACIK MENU & BOM (AHLI GIZI)                             */}
        {/* ============================================================== */}
        {activeTab === "menu" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Form Input Menu — Panel Formulir */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-dark/12 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-brand-dark text-white">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <ChefHat className="w-4 h-4" /> Formulir Menu & Resep (BOM) Baru
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Buat formula paket menu bergizi dan tentukan gramasi bahan per 1 porsi.
                  </p>
                </div>

                <div className="p-6">
                  <form onSubmit={handleSubmitMenu} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Nama Menu *</label>
                        <input
                          type="text"
                          required
                          value={newMenuNama}
                          onChange={(e) => setNewMenuNama(e.target.value)}
                          placeholder="Paket B — Nasi Ikan Tongkol & Sop Sayur"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Deskripsi Singkat</label>
                        <input
                          type="text"
                          value={newMenuDeskripsi}
                          onChange={(e) => setNewMenuDeskripsi(e.target.value)}
                          placeholder="Komposisi lauk dan penyajian"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Nilai Gizi */}
                    <div className="p-4 rounded-xl bg-brand-canvas border border-brand-dark/10 space-y-3">
                      <p className="text-xs font-bold text-brand-dark/80 uppercase tracking-wide">Nilai Gizi Per 1 Porsi</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "Kalori (kkal)", val: newMenuKalori, set: setNewMenuKalori },
                          { label: "Protein (gr)", val: newMenuProtein, set: setNewMenuProtein },
                          { label: "Lemak (gr)", val: newMenuLemak, set: setNewMenuLemak },
                          { label: "Karbohidrat (gr)", val: newMenuKarbo, set: setNewMenuKarbo },
                        ].map(({ label, val, set }) => (
                          <div key={label}>
                            <label className={labelCls}>{label}</label>
                            <input
                              type="number"
                              value={val}
                              onChange={(e) => set(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-brand-dark/20 bg-white text-sm font-bold tabular-nums text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/40"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* BOM Resep */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-brand-dark/80 uppercase tracking-wide flex items-center gap-1.5">
                          <Boxes className="w-3.5 h-3.5" /> Kebutuhan Bahan Per 1 Porsi (BOM)
                        </label>
                        <button
                          type="button"
                          onClick={handleAddResepRow}
                          className="px-3 py-1.5 rounded-lg bg-brand-pastel text-brand-dark text-xs font-bold hover:bg-white border border-brand-dark/15 flex items-center gap-1 cursor-pointer transition"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah Bahan
                        </button>
                      </div>

                      {newMenuResepItems.length === 0 ? (
                        <p className="text-sm text-center py-5 bg-brand-canvas rounded-xl text-brand-dark/50 border border-dashed border-brand-dark/20">
                          Klik &quot;Tambah Bahan&quot; untuk memasukkan takaran bahan baku resep.
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
                                className="flex-1 px-3 py-2 rounded-lg border border-brand-dark/20 bg-white text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/40"
                              >
                                {allBahan.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.namaBahan} ({b.satuanStandar})
                                  </option>
                                ))}
                              </select>

                              <div className="w-32 flex items-center gap-1.5">
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
                                  className="w-full px-2.5 py-2 rounded-lg border border-brand-dark/20 bg-white text-sm font-bold tabular-nums text-right text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/40"
                                />
                                <span className="text-xs font-bold text-brand-dark/60 shrink-0">{row.satuan}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveResepRow(idx)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition"
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
                      className={submitBtnCls}
                    >
                      {isSubmittingMenu ? (
                        "Menyimpan..."
                      ) : (
                        <><Check className="w-4 h-4 text-brand-green" /> Simpan Menu & Resep (BOM)</>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Katalog Menu Tersimpan */}
              <div className="bg-white rounded-2xl border border-brand-dark/12 shadow-sm overflow-hidden">
                <div className={sectionHeaderCls}>
                  <div>
                    <h3 className="text-sm font-bold text-brand-dark">Katalog Menu</h3>
                    <p className="text-xs text-brand-dark/50 mt-0.5">{allMenu.length} menu terdaftar</p>
                  </div>
                </div>

                <div className="p-4 space-y-3 max-h-[580px] overflow-y-auto">
                  {allMenu.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-brand-canvas border border-brand-dark/10 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-sm text-brand-dark leading-snug">{m.namaMenu}</p>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-gold/20 text-amber-900 border border-brand-gold/40 shrink-0">
                          {m.totalKalori} kkal
                        </span>
                      </div>
                      {m.deskripsi && (
                        <p className="text-xs text-brand-dark/60">{m.deskripsi}</p>
                      )}

                      {m.resep.length > 0 && (
                        <div className="pt-2 border-t border-brand-dark/10">
                          <p className="text-xs font-bold text-brand-dark/60 mb-1.5">
                            Resep ({m.resep.length} bahan):
                          </p>
                          <ul className="space-y-1">
                            {m.resep.map((r) => (
                              <li key={r.id} className="flex justify-between text-xs text-brand-dark/70">
                                <span>· {r.namaBahan}</span>
                                <span className="font-bold tabular-nums">{r.jumlahPerPorsi} {r.satuan}/porsi</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                  {allMenu.length === 0 && (
                    <p className="text-sm text-center py-8 text-brand-dark/40">Belum ada menu tersimpan.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: KELOLA STOK & RESTOCK                                    */}
        {/* ============================================================== */}
        {activeTab === "stok" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Panel Form Input — Dibedakan visual dari monitoring */}
              <div className="space-y-4">
                {/* Restock */}
                <div className="bg-white rounded-2xl border border-brand-dark/12 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-brand-dark text-white">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <PackagePlus className="w-4 h-4" /> Input Restock Bahan
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">Tambah saldo stok dari supplier.</p>
                  </div>

                  <div className="p-5">
                    <form onSubmit={handleSubmitRestock} className="space-y-4">
                      <div>
                        <label className={labelCls}>Pilih Bahan Baku</label>
                        <select
                          value={restockBahanId}
                          onChange={(e) => setRestockBahanId(e.target.value)}
                          className={selectCls}
                        >
                          {allBahan.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.namaBahan} (Saldo: {b.stokSaatIni} {b.satuanStandar})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelCls}>Jumlah Penambahan</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={restockJumlah}
                          onChange={(e) => setRestockJumlah(e.target.value)}
                          placeholder="Contoh: 50.0"
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>Catatan / No. Surat Jalan</label>
                        <input
                          type="text"
                          value={restockKeterangan}
                          onChange={(e) => setRestockKeterangan(e.target.value)}
                          placeholder="Supplier / No. PO"
                          className={inputCls}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingRestock || !restockJumlah}
                        className={submitBtnCls}
                      >
                        {isSubmittingRestock ? "Memproses..." : "Tambah Saldo Stok"}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Tambah Master Bahan */}
                <div className="bg-white rounded-2xl border border-brand-dark/12 shadow-sm overflow-hidden">
                  <div className={sectionHeaderCls}>
                    <div>
                      <h4 className="text-sm font-bold text-brand-dark">Tambah Master Bahan Baru</h4>
                      <p className="text-xs text-brand-dark/50 mt-0.5">Registrasi bahan baku baru ke sistem.</p>
                    </div>
                  </div>

                  <div className="p-5">
                    <form onSubmit={handleSubmitMasterBahan} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Kode Bahan</label>
                          <input
                            type="text"
                            required
                            placeholder="BHN-004"
                            value={newBahanKode}
                            onChange={(e) => setNewBahanKode(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Nama Bahan</label>
                          <input
                            type="text"
                            required
                            placeholder="Tempe Kedelai"
                            value={newBahanNama}
                            onChange={(e) => setNewBahanNama(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Kategori</label>
                          <select
                            value={newBahanKategori}
                            onChange={(e) => setNewBahanKategori(e.target.value)}
                            className={selectCls}
                          >
                            <option value="pokok">Pokok</option>
                            <option value="lauk_hewani">Lauk Hewani</option>
                            <option value="lauk_nabati">Lauk Nabati</option>
                            <option value="sayur">Sayur</option>
                            <option value="buah">Buah</option>
                            <option value="bumbu">Bumbu</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Satuan</label>
                          <input
                            type="text"
                            required
                            placeholder="kg / liter"
                            value={newBahanSatuan}
                            onChange={(e) => setNewBahanSatuan(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Stok Awal</label>
                          <input
                            type="number"
                            value={newBahanStokAwal}
                            onChange={(e) => setNewBahanStokAwal(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Stok Minimum</label>
                          <input
                            type="number"
                            value={newBahanStokMin}
                            onChange={(e) => setNewBahanStokMin(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingMasterBahan || !newBahanNama}
                        className="w-full py-2.5 rounded-xl bg-brand-pastel text-brand-dark font-bold text-sm hover:bg-white border border-brand-dark/15 transition cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingMasterBahan ? "Menyimpan..." : "Daftarkan Master Bahan"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Panel Monitoring Stok — Real-time data */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-brand-dark/12 shadow-sm overflow-hidden">
                  <div className={sectionHeaderCls}>
                    <div>
                      <h3 className="font-bold text-sm text-brand-dark">Katalog Saldo Stok Bahan Baku</h3>
                      <p className="text-xs text-brand-dark/50 mt-0.5">{allBahan.length} item bahan terdaftar</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-brand-canvas text-xs font-bold text-brand-dark/70 uppercase tracking-wide border-b border-brand-dark/10">
                        <tr>
                          <th className="px-6 py-3">Kode</th>
                          <th className="px-6 py-3">Nama Bahan</th>
                          <th className="px-6 py-3">Kategori</th>
                          <th className="px-6 py-3">Saldo Saat Ini</th>
                          <th className="px-6 py-3">Minimum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-dark/8">
                        {allBahan.map((b) => {
                          const saldoNum = parseFloat(b.stokSaatIni);
                          const minNum = parseFloat(b.stokMinimum);
                          const isLow = saldoNum <= minNum;
                          return (
                            <tr key={b.id} className={isLow ? "bg-amber-50" : "hover:bg-brand-canvas/60 transition-colors"}>
                              <td className="px-6 py-3.5 font-mono text-xs text-brand-dark/60">{b.kodeBahan}</td>
                              <td className="px-6 py-3.5 font-bold text-sm text-brand-dark">{b.namaBahan}</td>
                              <td className="px-6 py-3.5 capitalize text-sm text-brand-dark/70">{b.kategori}</td>
                              <td className={`px-6 py-3.5 tabular-nums font-extrabold text-base ${isLow ? "text-amber-800" : "text-brand-dark"}`}>
                                {b.stokSaatIni} <span className="text-xs font-semibold text-brand-dark/50">{b.satuanStandar}</span>
                              </td>
                              <td className="px-6 py-3.5 tabular-nums text-sm text-brand-dark/50">
                                {b.stokMinimum} {b.satuanStandar}
                              </td>
                            </tr>
                          );
                        })}
                        {allBahan.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-sm text-brand-dark/40">
                              Belum ada bahan baku terdaftar.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Riwayat Mutasi */}
                <div className="bg-white rounded-2xl border border-brand-dark/12 shadow-sm overflow-hidden">
                  <div className={sectionHeaderCls}>
                    <h4 className="font-bold text-sm text-brand-dark">Riwayat Transaksi Ledger Terakhir</h4>
                  </div>
                  <div className="p-4 space-y-2 max-h-52 overflow-y-auto">
                    {mutasiList.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-brand-canvas border border-brand-dark/10 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-sm text-brand-dark">{m.namaBahan}</p>
                          <p className="text-xs text-brand-dark/60 mt-0.5">
                            {m.keterangan || m.jenis} ·{" "}
                            {new Date(m.createdAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            WIB
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold tabular-nums text-sm ${m.jenis === "masuk" ? "text-emerald-700" : "text-red-700"}`}>
                            {m.jenis === "masuk" ? `+${m.jumlah}` : `-${m.jumlah}`}
                          </span>
                          <p className="text-xs text-brand-dark/50 mt-0.5">Saldo: {m.saldoSetelahnya}</p>
                        </div>
                      </div>
                    ))}
                    {mutasiList.length === 0 && (
                      <p className="text-sm text-center py-6 text-brand-dark/40">Belum ada transaksi stok.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SEKOLAH & TIM DAPUR                                      */}
        {/* ============================================================== */}
        {activeTab === "sekolah_anggota" && (
          <div className="space-y-5">
            {/* Form Input — Panel Input Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Form Tambah Sekolah */}
              <div className="bg-white rounded-2xl border border-brand-dark/12 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-brand-dark text-white">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Daftarkan Sekolah Penerima
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Data sekolah penerima MBG dan kuota siswa.
                  </p>
                </div>

                <div className="p-6">
                  <form onSubmit={handleSubmitSekolah} className="space-y-4">
                    {/* Identitas Sekolah */}
                    <fieldset className="space-y-3">
                      <legend className="text-xs font-bold text-brand-dark/60 uppercase tracking-wide pb-1 border-b border-brand-dark/10 w-full">
                        Identitas Sekolah
                      </legend>
                      <div>
                        <label className={labelCls}>Nama Sekolah *</label>
                        <input
                          type="text"
                          required
                          placeholder="SDN 02 Pagi Rawamangun"
                          value={schNama}
                          onChange={(e) => setSchNama(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Alamat Lengkap *</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Alamat sekolah & patokan jalan"
                          value={schAlamat}
                          onChange={(e) => setSchAlamat(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-sm font-semibold text-brand-dark placeholder:text-brand-dark/40 focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition resize-none"
                        />
                      </div>
                    </fieldset>

                    {/* Distribusi */}
                    <fieldset className="space-y-3">
                      <legend className="text-xs font-bold text-brand-dark/60 uppercase tracking-wide pb-1 border-b border-brand-dark/10 w-full">
                        Distribusi Makanan
                      </legend>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Target Porsi Siswa *</label>
                          <input
                            type="number"
                            min="1"
                            required
                            placeholder="450"
                            value={schPorsi}
                            onChange={(e) => setSchPorsi(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Jam Makan *</label>
                          <input
                            type="time"
                            required
                            value={schJamMakan}
                            onChange={(e) => setSchJamMakan(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </fieldset>

                    {/* Kontak PIC */}
                    <fieldset className="space-y-3">
                      <legend className="text-xs font-bold text-brand-dark/60 uppercase tracking-wide pb-1 border-b border-brand-dark/10 w-full">
                        Kontak PIC Sekolah
                      </legend>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Nama PIC *</label>
                          <input
                            type="text"
                            required
                            placeholder="Bpk. Rahmat"
                            value={schPicNama}
                            onChange={(e) => setSchPicNama(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>No. Telepon / WA *</label>
                          <input
                            type="text"
                            required
                            placeholder="081234567890"
                            value={schPicKontak}
                            onChange={(e) => setSchPicKontak(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Catatan Alergi / Khusus</label>
                        <input
                          type="text"
                          placeholder="Contoh: 5 siswa alergi seafood"
                          value={schCatatanAlergi}
                          onChange={(e) => setSchCatatanAlergi(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </fieldset>

                    <button
                      type="submit"
                      disabled={isSubmittingSekolah}
                      className={submitBtnCls}
                    >
                      {isSubmittingSekolah ? "Menyimpan..." : "Daftarkan Sekolah"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Form Tambah Anggota Dapur */}
              <div className="bg-white rounded-2xl border border-brand-dark/12 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-brand-dark text-white">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Daftarkan Anggota Tim Dapur
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Registrasi profil staf juru masak, QC, dan kurir distribusi.
                  </p>
                </div>

                <div className="p-6">
                  <form onSubmit={handleSubmitAnggota} className="space-y-4">
                    {/* Identitas Pekerja */}
                    <fieldset className="space-y-3">
                      <legend className="text-xs font-bold text-brand-dark/60 uppercase tracking-wide pb-1 border-b border-brand-dark/10 w-full">
                        Identitas Pekerja
                      </legend>
                      <div>
                        <label className={labelCls}>NIK KTP (16 Digit) *</label>
                        <input
                          type="text"
                          required
                          maxLength={16}
                          placeholder="3201012345670001"
                          value={agtNik}
                          onChange={(e) => setAgtNik(e.target.value.replace(/\D/g, ""))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-sm font-bold font-mono tracking-wider text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition"
                        />
                        <p className="text-xs text-brand-dark/50 mt-1">Hanya angka 16 digit sesuai identitas resmi.</p>
                      </div>
                      <div>
                        <label className={labelCls}>Nama Lengkap *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ahmad Fauzi"
                          value={agtNama}
                          onChange={(e) => setAgtNama(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </fieldset>

                    {/* Jabatan & Shift */}
                    <fieldset className="space-y-3">
                      <legend className="text-xs font-bold text-brand-dark/60 uppercase tracking-wide pb-1 border-b border-brand-dark/10 w-full">
                        Penugasan
                      </legend>
                      <div>
                        <label className={labelCls}>Posisi / Jabatan *</label>
                        <input
                          type="text"
                          required
                          placeholder="Juru Masak / Asisten / Kurir"
                          value={agtJabatan}
                          onChange={(e) => setAgtJabatan(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Penugasan Shift Kerja</label>
                        <select
                          value={agtShiftId}
                          onChange={(e) => setAgtShiftId(e.target.value)}
                          className={selectCls}
                        >
                          {allShifts.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.namaShift} ({s.jamMasuk.substring(0, 5)} – {s.jamPulang.substring(0, 5)} WIB)
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-brand-dark/50 mt-1">
                          Dijadwalkan aktif untuk hari kerja Senin s/d Jumat.
                        </p>
                      </div>
                    </fieldset>

                    <button
                      type="submit"
                      disabled={isSubmittingAnggota}
                      className={submitBtnCls}
                    >
                      {isSubmittingAnggota ? "Menyimpan..." : "Daftarkan Anggota"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* ── DATA PREVIEW — Monitoring Sekolah & Anggota ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Daftar Sekolah */}
              <div className="bg-white rounded-2xl border border-brand-dark/12 shadow-sm overflow-hidden">
                <div className={sectionHeaderCls}>
                  <div>
                    <h4 className="font-bold text-sm text-brand-dark">
                      Daftar Sekolah Penerima
                    </h4>
                    <p className="text-xs text-brand-dark/50 mt-0.5">{sekolahList.length} sekolah aktif</p>
                  </div>
                  <span className="text-sm font-extrabold tabular-nums text-brand-dark bg-brand-canvas px-3 py-1.5 rounded-xl border border-brand-dark/10">
                    {metrics?.totalPorsi.toLocaleString("id-ID") || 0} porsi
                  </span>
                </div>
                <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                  {sekolahList.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-xl bg-brand-canvas border border-brand-dark/10 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-brand-dark">{s.namaSekolah}</p>
                        <p className="text-xs text-brand-dark/60 mt-0.5 truncate">{s.alamat}</p>
                        <p className="text-xs text-brand-dark/70 mt-0.5 font-medium">
                          PIC: {s.picNama} · {s.picKontak}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-extrabold tabular-nums text-brand-dark leading-none">
                          {s.jumlahPorsiTarget}
                          <span className="text-xs font-semibold text-brand-dark/50 ml-1">porsi</span>
                        </p>
                        <p className="text-xs text-brand-dark/50 mt-0.5">{s.jamMakan.substring(0, 5)} WIB</p>
                      </div>
                    </div>
                  ))}
                  {sekolahList.length === 0 && (
                    <p className="text-sm text-center py-6 text-brand-dark/40">Belum ada sekolah terdaftar.</p>
                  )}
                </div>
              </div>

              {/* Daftar Anggota */}
              <div className="bg-white rounded-2xl border border-brand-dark/12 shadow-sm overflow-hidden">
                <div className={sectionHeaderCls}>
                  <div>
                    <h4 className="font-bold text-sm text-brand-dark">Tim Pekerja Dapur</h4>
                    <p className="text-xs text-brand-dark/50 mt-0.5">{allAnggota.length} anggota terdaftar</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg">
                    Aktif & Siap Presensi
                  </span>
                </div>
                <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                  {allAnggota.map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-dark text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                          {a.namaLengkap.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-brand-dark">{a.namaLengkap}</p>
                          <p className="text-xs text-brand-dark/60">{a.jabatan}</p>
                          <p className="text-xs font-mono text-brand-dark/40 mt-0.5">NIK: {a.nik}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-400 shrink-0">
                        Aktif
                      </span>
                    </div>
                  ))}
                  {allAnggota.length === 0 && (
                    <p className="text-sm text-center py-6 text-brand-dark/40">Belum ada anggota terdaftar.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB FASE 2: PENGADAAN (PURCHASE ORDER & SUPPLIER)              */}
        {/* ============================================================== */}
        {activeTab === "pengadaan" && (
          <PengadaanTab
            allBahan={allBahan.map((b) => ({
              id: b.id,
              namaBahan: b.namaBahan,
              satuanStandar: b.satuanStandar,
            }))}
            onRefreshAll={fetchData}
          />
        )}

        {/* ============================================================== */}
        {/* TAB FASE 2: QC PENERIMAAN & BATCH FEFO                         */}
        {/* ============================================================== */}
        {activeTab === "qc_batch" && (
          <QcBatchTab onRefreshAll={fetchData} />
        )}

        {/* ============================================================== */}
        {/* TAB FASE 2: DISTRIBUSI ARMADA & SERAH TERIMA SEKOLAH          */}
        {/* ============================================================== */}
        {activeTab === "distribusi" && (
          <DistribusiTab
            sekolahList={sekolahList.map((s) => ({
              id: s.id,
              namaSekolah: s.namaSekolah,
              jumlahPorsiTarget: s.jumlahPorsiTarget,
            }))}
            jadwalId={jadwal?.jadwalId}
            onRefreshAll={fetchData}
          />
        )}

        {/* ============================================================== */}
        {/* TAB FASE 3: CABANG & TRANSFER STOK                             */}
        {/* ============================================================== */}
        {activeTab === "cabang" && (
          <CabangTab
            allBahan={allBahan.map((b) => ({
              id: b.id,
              namaBahan: b.namaBahan,
              satuanStandar: b.satuanStandar,
            }))}
            onRefreshAll={fetchData}
          />
        )}

        {/* ============================================================== */}
        {/* TAB FASE 3: HPP & FOOD WASTE                                   */}
        {/* ============================================================== */}
        {activeTab === "finansial" && (
          <FinansialTab
            allBahan={allBahan.map((b) => ({
              id: b.id,
              namaBahan: b.namaBahan,
              satuanStandar: b.satuanStandar,
            }))}
            onRefreshAll={fetchData}
          />
        )}

        {/* ============================================================== */}
        {/* TAB FASE 3: KOMPLAIN SEKOLAH                                   */}
        {/* ============================================================== */}
        {activeTab === "komplain" && (
          <KomplainTab
            allSekolah={sekolahList.map((s) => ({
              id: s.id,
              namaSekolah: s.namaSekolah,
              jumlahPorsiTarget: s.jumlahPorsiTarget,
            }))}
            onRefreshAll={fetchData}
          />
        )}

        {/* ============================================================== */}
        {/* TAB FASE 3: LOG WHATSAPP GATEWAY                               */}
        {/* ============================================================== */}
        {activeTab === "wa_logs" && (
          <WaLogsTab
            allBahan={allBahan.map((b) => ({
              id: b.id,
              namaBahan: b.namaBahan,
              satuanStandar: b.satuanStandar,
            }))}
            onRefreshAll={fetchData}
          />
        )}

        {/* ============================================================== */}
        {/* TAB FASE 4: AI MENU PLANNER & SMART REPLENISHMENT              */}
        {/* ============================================================== */}
        {activeTab === "ai_planner" && (
          <AiPlannerTab onRefreshAll={fetchData} />
        )}

        {/* ============================================================== */}
        {/* TAB FASE 4: OPTIMASI RUTE VRP CVRPTW                           */}
        {/* ============================================================== */}
        {activeTab === "vrp" && (
          <VrpTab onRefreshAll={fetchData} />
        )}

        {/* ============================================================== */}
        {/* TAB FASE 4: IOT COLD-CHAIN & TELEMETRI HACCP                   */}
        {/* ============================================================== */}
        {activeTab === "iot_haccp" && (
          <IotTab onRefreshAll={fetchData} />
        )}

        {/* ============================================================== */}
        {/* TAB FASE 4: PORTAL AUDIT EKSTERNAL BGN RI                      */}
        {/* ============================================================== */}
        {activeTab === "bgn_audit" && (
          <BgnTab onRefreshAll={fetchData} />
        )}
      </main>

      {/* Modal Foto Selfie */}
      {activePhotoModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-foto-presensi-title"
          className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 id="modal-foto-presensi-title" className="font-bold text-sm text-brand-dark">Foto Bukti Presensi</h4>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                aria-label="Tutup modal foto"
                className="min-h-[44px] min-w-[44px] px-3 py-2 inline-flex items-center justify-center text-sm font-bold text-brand-dark/60 hover:text-brand-dark transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activePhotoModal} alt="Foto bukti selfie pekerja dapur" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-brand-dark/10 py-5 bg-white text-center text-xs text-brand-dark/50 mt-10">
        SPPG Mandiri Jaya — Sistem Informasi Dapur MBG &copy; 2026
      </footer>
    </div>
  );
}
