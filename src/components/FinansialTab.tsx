"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingDown,
  Trash2,
  Plus,
  AlertTriangle,
  Receipt,
  PieChart,
  Scale,
  CheckCircle2,
} from "lucide-react";

interface WasteItem {
  id: string;
  tanggal: string;
  kategoriWaste: "prep_waste" | "cooking_loss" | "plate_waste";
  beratKg: string;
  estimasiKerugianRp: string;
  catatan: string | null;
  bahan?: { namaBahan: string; satuanStandar: string } | null;
  menu?: { namaMenu: string } | null;
  dapur?: { namaDapur: string } | null;
}

interface FinansialData {
  tanggal: string;
  hpp: {
    biayaBahanPerPorsi: number;
    overheadPerPorsi: number;
    totalHppPerPorsi: number;
    rincianBahan: Array<{ bahanId: string; biaya: number }>;
  };
  foodWaste: {
    hari_ini: {
      totalBeratKg: number;
      totalKerugianRp: number;
    };
    detail_hari_ini: WasteItem[];
  };
  riwayatWaste: WasteItem[];
}

interface FinansialTabProps {
  allBahan: Array<{ id: string; namaBahan: string; satuanStandar: string }>;
  onRefreshAll?: () => void;
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const labelCls = "block text-[11px] font-bold text-brand-dark/80 mb-1";

export default function FinansialTab({ allBahan, onRefreshAll }: FinansialTabProps) {
  const [data, setData] = useState<FinansialData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State: Food Waste
  const [kategoriWaste, setKategoriWaste] = useState<"prep_waste" | "cooking_loss" | "plate_waste">("prep_waste");
  const [bahanId, setBahanId] = useState("");
  const [beratKg, setBeratKg] = useState("");
  const [estimasiKerugianRp, setEstimasiKerugianRp] = useState("");
  const [catatan, setCatatan] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/finansial");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      setToast({ type: "error", message: "Gagal memuat data finansial & food waste." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/finansial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kategoriWaste,
          bahanId: bahanId || undefined,
          beratKg: parseFloat(beratKg),
          estimasiKerugianRp: estimasiKerugianRp ? parseFloat(estimasiKerugianRp) : 0,
          catatan: catatan || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mencatat food waste");

      setToast({ type: "success", message: "Buku besar food waste berhasil dicatat." });
      setBeratKg("");
      setEstimasiKerugianRp("");
      setCatatan("");
      fetchData();
      onRefreshAll?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    }
  };

  const hpp = data?.hpp || { biayaBahanPerPorsi: 0, overheadPerPorsi: 2500, totalHppPerPorsi: 0 };
  const wasteToday = data?.foodWaste?.hari_ini || { totalBeratKg: 0, totalKerugianRp: 0 };
  const TARGET_HPP_STANDAR = 15000; // Target HPP standar pemerintah Rp 15.000 / porsi
  const deviasiPersen = TARGET_HPP_STANDAR > 0 ? (((hpp.totalHppPerPorsi - TARGET_HPP_STANDAR) / TARGET_HPP_STANDAR) * 100).toFixed(1) : "0";
  const isOverBudget = hpp.totalHppPerPorsi > TARGET_HPP_STANDAR;

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold transition shadow-sm ${
            toast.type === "success"
              ? "bg-brand-green/20 text-brand-dark border border-brand-green/40"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-xs underline ml-4 hover:opacity-75 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Top 4 Cards: Analitik Finansial & HPP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              HPP Bahan / Porsi
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-pastel/30 text-brand-dark flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-brand-dark mt-2 font-mono">
            Rp {hpp.biayaBahanPerPorsi.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-brand-dark/60 mt-1 font-semibold">
            Berdasarkan moving cost BOM menu
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Alokasi Overhead
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-gold/20 text-brand-dark flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-brand-dark mt-2 font-mono">
            Rp {hpp.overheadPerPorsi.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-brand-dark/60 mt-1 font-semibold">
            Gas, listrik, wadah & logistik
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Total HPP Riil / Porsi
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isOverBudget ? "bg-amber-100 text-amber-800" : "bg-brand-green/20 text-brand-dark"
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-brand-dark mt-2 font-mono">
            Rp {hpp.totalHppPerPorsi.toLocaleString("id-ID")}
          </div>
          <div
            className={`text-[11px] mt-1 font-bold ${
              isOverBudget ? "text-amber-700" : "text-brand-dark/70"
            }`}
          >
            Target Rp {TARGET_HPP_STANDAR.toLocaleString("id-ID")} ({Number(deviasiPersen) > 0 ? `+${deviasiPersen}%` : `${deviasiPersen}%`})
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Food Waste Hari Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-700 mt-2 font-mono">
            {wasteToday.totalBeratKg.toLocaleString("id-ID")} kg
          </div>
          <div className="text-[11px] text-red-600 font-bold mt-1">
            Kerugian Rp {wasteToday.totalKerugianRp.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      {/* Grid: Form Input Food Waste & Analisis Varians Anggaran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Pencatatan Food Waste */}
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-brand-dark/10">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-dark">Pencatatan Buku Besar Food Waste</h3>
              <p className="text-xs text-brand-dark/60">Audit sisa persiapan bahan, masak, atau retur sekolah</p>
            </div>
          </div>

          <form onSubmit={handleSubmitWaste} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Kategori Sisa Makanan</label>
                <select
                  value={kategoriWaste}
                  onChange={(e) =>
                    setKategoriWaste(e.target.value as "prep_waste" | "cooking_loss" | "plate_waste")
                  }
                  className={selectCls}
                >
                  <option value="prep_waste">Prep Waste (Trimming Bahan Mentah)</option>
                  <option value="cooking_loss">Cooking Loss (Sisa Proses Masak)</option>
                  <option value="plate_waste">Plate / Delivery Waste (Retur Sekolah)</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Bahan Terkait (Opsional)</label>
                <select
                  value={bahanId}
                  onChange={(e) => setBahanId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">-- Pilih Bahan Baku --</option>
                  {allBahan.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.namaBahan}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Berat Sampah (Kilogram)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="misal: 2.50"
                  value={beratKg}
                  onChange={(e) => setBeratKg(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Estimasi Kerugian Finansial (Rp)</label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  placeholder="misal: 35000"
                  value={estimasiKerugianRp}
                  onChange={(e) => setEstimasiKerugianRp(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Catatan Investigasi / Penyebab</label>
              <textarea
                rows={2}
                placeholder="misal: sisa kulit wortel & bonggol kubis tidak layak pakai..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-brand-dark hover:bg-brand-dark/90 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Catat Food Waste ke Buku Besar
            </button>
          </form>
        </div>

        {/* Panel Informasi Tata Kelola HPP & Target Zero Waste */}
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-brand-dark/10">
              <div className="w-9 h-9 rounded-xl bg-brand-pastel/40 text-brand-dark flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-brand-dark">Panduan Standar HPP & Akuntabilitas</h3>
                <p className="text-xs text-brand-dark/60">Formula kepatuhan Badan Gizi Nasional (BGN)</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-brand-dark/80">
              <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/5">
                <div className="font-extrabold text-brand-dark flex items-center gap-2 mb-1">
                  <span>1. Komponen Biaya Bahan Baku (BOM Moving Cost)</span>
                </div>
                <p className="text-brand-dark/70 text-[11px] leading-relaxed">
                  Dihitung otomatis per menu dari jumlah gramasi resep dikalikan harga pembelian terbaru pada Purchase Order resmi supplier rekanan.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/5">
                <div className="font-extrabold text-brand-dark flex items-center gap-2 mb-1">
                  <span>2. Alokasi Biaya Overhead Tetap (Rp 2.500/Porsi)</span>
                </div>
                <p className="text-brand-dark/70 text-[11px] leading-relaxed">
                  Mencakup beban operasional utilitas (gas elpiji, listrik cold-chain), boks kemasan bersertifikat food-grade, dan insentif pengantaran armada.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/5">
                <div className="font-extrabold text-brand-dark flex items-center gap-2 mb-1">
                  <span>3. Toleransi Varians Anggaran Maksimal 5%</span>
                </div>
                <p className="text-brand-dark/70 text-[11px] leading-relaxed">
                  Jika biaya HPP aktual melebihi Rp 15.750 (+5%), sistem akan menandai status peringatan pembengkakan biaya dan mewajibkan evaluasi resep.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-brand-green/20 border border-brand-green/40 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-dark shrink-0" />
            <div className="text-[11px] font-bold text-brand-dark">
              Target Nasional: Zero Food Waste & Efisiensi Anggaran MBG Transparan
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Riwayat Food Waste */}
      <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-brand-dark mb-4">
          Buku Besar Riwayat Food Waste Harian
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-dark/10 text-brand-dark/60 font-bold uppercase text-[10px]">
                <th className="pb-3 px-4">Tanggal Catat</th>
                <th className="pb-3 px-4">Kategori Waste</th>
                <th className="pb-3 px-4">Komoditas Bahan</th>
                <th className="pb-3 px-4">Berat Limbah</th>
                <th className="pb-3 px-4">Estimasi Kerugian</th>
                <th className="pb-3 px-4">Catatan Penyebab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5 font-semibold text-brand-dark">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-brand-dark/50">
                    Memuat riwayat food waste...
                  </td>
                </tr>
              ) : !data?.riwayatWaste?.length ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-brand-dark/50">
                    Belum ada riwayat pencatatan food waste.
                  </td>
                </tr>
              ) : (
                data.riwayatWaste.map((w) => (
                  <tr key={w.id} className="hover:bg-brand-canvas/50">
                    <td className="py-3 px-4 font-mono font-bold">{w.tanggal}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          w.kategoriWaste === "prep_waste"
                            ? "bg-amber-100 text-amber-900"
                            : w.kategoriWaste === "cooking_loss"
                            ? "bg-orange-100 text-orange-900"
                            : "bg-red-100 text-red-900"
                        }`}
                      >
                        {w.kategoriWaste === "prep_waste"
                          ? "PREP WASTE"
                          : w.kategoriWaste === "cooking_loss"
                          ? "COOKING LOSS"
                          : "PLATE WASTE"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {w.bahan?.namaBahan || w.menu?.namaMenu || "Bahan Umum"}
                    </td>
                    <td className="py-3 px-4 font-mono font-extrabold text-red-700">
                      {parseFloat(w.beratKg).toFixed(2)} kg
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-dark">
                      Rp {parseFloat(w.estimasiKerugianRp).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-brand-dark/70 text-[11px] max-w-xs truncate">
                      {w.catatan || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
