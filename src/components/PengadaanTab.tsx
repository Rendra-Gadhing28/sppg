"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Ban,
  Package,
} from "lucide-react";

interface SupplierItem {
  id: string;
  kodeSupplier: string;
  namaSupplier: string;
  kategoriPasokan: string;
  kontakPerson: string;
  nomorHp: string;
  alamat: string;
  isActive: boolean;
}

interface POItem {
  id: string;
  nomorPo: string;
  supplierId: string;
  tanggalPo: string;
  targetPengiriman: string;
  status: string;
  totalBiaya: string;
  catatan: string | null;
  supplier: {
    namaSupplier: string;
    nomorHp: string;
  };
  items: Array<{
    id: string;
    jumlahPesan: string;
    jumlahDiterima: string;
    hargaSatuan: string;
    subtotal: string;
    bahan: {
      namaBahan: string;
      satuanStandar: string;
    };
  }>;
}

interface PengadaanTabProps {
  allBahan: Array<{ id: string; namaBahan: string; satuanStandar: string }>;
  onRefreshAll?: () => void;
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const labelCls = "block text-[11px] font-bold text-brand-dark/80 mb-1";

export default function PengadaanTab({ allBahan, onRefreshAll }: PengadaanTabProps) {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [poList, setPoList] = useState<POItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State: Supplier
  const [supKode, setSupKode] = useState<string>("");
  const [supNama, setSupNama] = useState<string>("");
  const [supKategori, setSupKategori] = useState<string>("Bahan Segar");
  const [supKontak, setSupKontak] = useState<string>("");
  const [supHp, setSupHp] = useState<string>("");
  const [supAlamat, setSupAlamat] = useState<string>("");
  const [isSubmittingSup, setIsSubmittingSup] = useState<boolean>(false);

  // Form State: PO
  const [poSupplierId, setPoSupplierId] = useState<string>("");
  const [poTargetDate, setPoTargetDate] = useState<string>("");
  const [poCatatan, setPoCatatan] = useState<string>("");
  const [poItems, setPoItems] = useState<
    Array<{ bahanId: string; jumlahPesan: number; hargaSatuan: number }>
  >([]);
  const [isSubmittingPo, setIsSubmittingPo] = useState<boolean>(false);

  const fetchPengadaan = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resSup, resPo] = await Promise.all([fetch("/api/supplier"), fetch("/api/po")]);
      if (resSup.ok) {
        const json = await resSup.json();
        setSuppliers(json.daftarSupplier || []);
        if (json.daftarSupplier && json.daftarSupplier.length > 0 && !poSupplierId) {
          setPoSupplierId(json.daftarSupplier[0].id);
        }
      }
      if (resPo.ok) {
        const json = await resPo.json();
        setPoList(json.daftarPO || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [poSupplierId]);

  useEffect(() => {
    fetchPengadaan();
    // Default target date: tomorrow
    const t = new Date();
    t.setDate(t.getDate() + 1);
    setPoTargetDate(t.toISOString().split("T")[0]);
  }, [fetchPengadaan]);

  // Tambah baris item PO
  const handleAddPoItem = () => {
    if (allBahan.length === 0) return;
    setPoItems([
      ...poItems,
      {
        bahanId: allBahan[0].id,
        jumlahPesan: 50,
        hargaSatuan: 20000,
      },
    ]);
  };

  const handleRemovePoItem = (idx: number) => {
    setPoItems(poItems.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, val: string | number) => {
    const updated = [...poItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setPoItems(updated);
  };

  // Submit Supplier
  const handleSubmitSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingSup(true);
      const res = await fetch("/api/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kodeSupplier: supKode,
          namaSupplier: supNama,
          kategoriPasokan: supKategori,
          kontakPerson: supKontak,
          nomorHp: supHp,
          alamat: supAlamat,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambah supplier.");
      setToast({ type: "success", message: "Supplier baru berhasil didaftarkan!" });
      setSupKode("");
      setSupNama("");
      setSupKontak("");
      setSupHp("");
      setSupAlamat("");
      fetchPengadaan();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsSubmittingSup(false);
    }
  };

  // Submit PO
  const handleSubmitPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      setToast({ type: "error", message: "Tambahkan minimal 1 item bahan untuk membuat PO." });
      return;
    }
    try {
      setIsSubmittingPo(true);
      const res = await fetch("/api/po", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: poSupplierId,
          targetPengiriman: poTargetDate,
          catatan: poCatatan,
          items: poItems,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat PO.");
      setToast({ type: "success", message: "Purchase Order (PO) berhasil diterbitkan!" });
      setPoItems([]);
      setPoCatatan("");
      fetchPengadaan();
      if (onRefreshAll) onRefreshAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsSubmittingPo(false);
    }
  };

  const totalEstimasiPO = poItems.reduce(
    (acc, curr) => acc + (curr.jumlahPesan || 0) * (curr.hargaSatuan || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm ${
            toast.type === "success"
              ? "bg-emerald-50 border border-emerald-300 text-emerald-900"
              : "bg-red-50 border border-red-300 text-red-900"
          }`}
        >
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center underline text-xs cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {/* Top Banner Fase 2 */}
      <div className="p-4 rounded-2xl bg-white border border-brand-dark/15 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-pastel text-brand-dark mb-1">
            Fase 2: Procurement & Logistik
          </span>
          <h2 className="text-base font-bold text-brand-dark">
            Manajemen Pengadaan Bahan Baku & Purchase Order (PO)
          </h2>
          <p className="text-xs text-brand-dark/70">
            Terbitkan Purchase Order ke mitra supplier terverifikasi dan pantau status pemenuhan bahan dapur MBG.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-brand-canvas border border-brand-dark/10 text-center">
            <p className="font-bold text-base text-brand-dark">{suppliers.length}</p>
            <p className="text-[10px] text-brand-dark/60">Supplier Aktif</p>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-canvas border border-brand-dark/10 text-center">
            <p className="font-bold text-base text-brand-dark">
              {poList.filter((p) => p.status === "diajukan").length}
            </p>
            <p className="text-[10px] text-brand-dark/60">PO Berjalan</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Buat PO Baru */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-dark/15 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-dark/10 flex items-center justify-between bg-brand-canvas/60">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-brand-dark" />
              <h3 className="font-bold text-sm text-brand-dark">Terbitkan Purchase Order (PO) Baru</h3>
            </div>
            <button
              type="button"
              onClick={handleAddPoItem}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-dark text-white text-xs font-bold hover:bg-brand-dark/90 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Bahan
            </button>
          </div>

          <form onSubmit={handleSubmitPO} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Pilih Supplier Mitra *</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className={selectCls}
                  required
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.namaSupplier} ({s.kategoriPasokan})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Target Tanggal Pengiriman *</label>
                <input
                  type="date"
                  value={poTargetDate}
                  onChange={(e) => setPoTargetDate(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
            </div>

            {/* Item Bahan PO */}
            <div>
              <label className={labelCls}>Daftar Kebutuhan Bahan yang Dipesan *</label>
              {poItems.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-brand-dark/20 text-xs text-brand-dark/60 bg-brand-canvas/30 space-y-1">
                  <p className="font-bold">Belum ada item bahan yang ditambahkan.</p>
                  <p>Klik tombol &quot;Tambah Bahan&quot; di atas untuk memilih bahan yang akan dipesan.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {poItems.map((item, idx) => {
                    const bahanObj = allBahan.find((b) => b.id === item.bahanId);
                    const sub = (item.jumlahPesan || 0) * (item.hargaSatuan || 0);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-brand-canvas/60 border border-brand-dark/10 grid grid-cols-12 gap-2 items-center text-xs"
                      >
                        <div className="col-span-5">
                          <select
                            value={item.bahanId}
                            onChange={(e) => handleItemChange(idx, "bahanId", e.target.value)}
                            className={selectCls}
                          >
                            {allBahan.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.namaBahan} ({b.satuanStandar})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            step="any"
                            min="0.1"
                            placeholder="Jumlah"
                            value={item.jumlahPesan}
                            onChange={(e) => handleItemChange(idx, "jumlahPesan", Number(e.target.value))}
                            className={inputCls}
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="Rp / Satuan"
                            value={item.hargaSatuan}
                            onChange={(e) => handleItemChange(idx, "hargaSatuan", Number(e.target.value))}
                            className={inputCls}
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePoItem(idx)}
                            className="p-1 text-red-600 hover:text-red-800 transition cursor-pointer"
                            title="Hapus Baris"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="col-span-12 text-right text-[11px] text-brand-dark/70 font-semibold pr-2">
                          Subtotal: Rp {sub.toLocaleString("id-ID")} ({item.jumlahPesan} {bahanObj?.satuanStandar})
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className={labelCls}>Catatan Pengadaan / Spesifikasi Khusus</label>
              <textarea
                rows={2}
                value={poCatatan}
                onChange={(e) => setPoCatatan(e.target.value)}
                placeholder="Contoh: Daging ayam fillet segar bersertifikat Halal, sayuran panen H-1..."
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Total Nilai & Submit */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-dark/10">
              <div>
                <p className="text-[11px] text-brand-dark/60 font-semibold">Estimasi Total Biaya PO:</p>
                <p className="text-xl font-black text-brand-dark">
                  Rp {totalEstimasiPO.toLocaleString("id-ID")}
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmittingPo || poItems.length === 0}
                className="w-full sm:w-auto px-6 h-11 rounded-xl bg-brand-dark text-white font-bold text-xs hover:bg-brand-dark/90 active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isSubmittingPo ? "Menerbitkan PO..." : "TERBITKAN PURCHASE ORDER"}
              </button>
            </div>
          </form>
        </div>

        {/* Form Tambah Supplier Baru */}
        <div className="bg-white rounded-2xl border border-brand-dark/15 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-dark/10">
            <Building2 className="w-4 h-4 text-brand-dark" />
            <h3 className="font-bold text-sm text-brand-dark">Tambah Mitra Supplier</h3>
          </div>

          <form onSubmit={handleSubmitSupplier} className="space-y-3">
            <div>
              <label className={labelCls}>Kode Supplier *</label>
              <input
                type="text"
                placeholder="Contoh: SUP-003"
                value={supKode}
                onChange={(e) => setSupKode(e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Nama Perusahaan / Kelompok Tani *</label>
              <input
                type="text"
                placeholder="Contoh: PT Agroniaga Nusantara"
                value={supNama}
                onChange={(e) => setSupNama(e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Kategori Pasokan *</label>
              <input
                type="text"
                placeholder="Contoh: Sayur Mayur & Buah"
                value={supKategori}
                onChange={(e) => setSupKategori(e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Nama Kontak Person (PIC) *</label>
              <input
                type="text"
                placeholder="Contoh: Bpk. Haryono"
                value={supKontak}
                onChange={(e) => setSupKontak(e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Nomor HP / WhatsApp *</label>
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={supHp}
                onChange={(e) => setSupHp(e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Alamat Gudang / Lokasi *</label>
              <textarea
                rows={2}
                placeholder="Alamat lengkap supplier..."
                value={supAlamat}
                onChange={(e) => setSupAlamat(e.target.value)}
                className={`${inputCls} resize-none`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingSup}
              className="w-full h-11 rounded-xl bg-brand-dark text-white font-bold text-xs hover:bg-brand-dark/90 active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSubmittingSup ? "Menyimpan..." : "SIMPAN SUPPLIER BARU"}
            </button>
          </form>
        </div>
      </div>

      {/* Tabel Riwayat Purchase Order */}
      <div className="bg-white rounded-2xl border border-brand-dark/15 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-dark/10 flex items-center justify-between bg-brand-canvas/60">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-dark" />
            <h3 className="font-bold text-sm text-brand-dark">Daftar Purchase Order (PO)</h3>
          </div>
          <span className="text-xs text-brand-dark/60 font-semibold">
            {poList.length} PO Terdata
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-canvas/80 text-brand-dark/80 font-bold border-b border-brand-dark/10">
              <tr>
                <th className="px-5 py-3.5">Nomor PO</th>
                <th className="px-5 py-3.5">Mitra Supplier</th>
                <th className="px-5 py-3.5">Target Kirim</th>
                <th className="px-5 py-3.5">Item Pesanan</th>
                <th className="px-5 py-3.5">Total Nilai</th>
                <th className="px-5 py-3.5">Status PO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-brand-dark/60 font-medium">
                    Memuat data Purchase Order...
                  </td>
                </tr>
              ) : poList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-brand-dark/60 font-medium">
                    Belum ada Purchase Order yang diterbitkan.
                  </td>
                </tr>
              ) : (
                poList.map((po) => {
                  const isDiterima = po.status === "diterima";
                  const isBatal = po.status === "batal";
                  return (
                    <tr key={po.id} className="hover:bg-brand-canvas/40 transition">
                      <td className="px-5 py-4 font-bold text-brand-dark">{po.nomorPo}</td>
                      <td className="px-5 py-4 font-medium">
                        <p className="font-bold text-brand-dark">{po.supplier?.namaSupplier}</p>
                        <p className="text-[11px] text-brand-dark/60">{po.supplier?.nomorHp}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-brand-dark/80">
                        {po.targetPengiriman}
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {po.items?.map((it) => (
                            <span
                              key={it.id}
                              className="inline-block mr-2 px-2 py-0.5 rounded bg-brand-dark/5 text-[11px] font-semibold text-brand-dark"
                            >
                              {it.bahan?.namaBahan}: {it.jumlahPesan} {it.bahan?.satuanStandar}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-brand-dark">
                        Rp {Number(po.totalBiaya).toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-4">
                        {isDiterima ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/20 text-brand-dark border border-brand-green/40">
                            <CheckCircle2 className="w-3 h-3 text-brand-green" /> Diterima & QC Lolos
                          </span>
                        ) : isBatal ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-300">
                            <Ban className="w-3 h-3 text-red-600" /> Batal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                            <Clock className="w-3 h-3 text-blue-600" /> Diajukan (Menunggu QC)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
