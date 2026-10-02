"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Thermometer,
  Layers,
  FileCheck,
} from "lucide-react";

interface BatchItem {
  id: string;
  nomorBatch: string;
  tanggalMasuk: string;
  tanggalExpired: string;
  jumlahAwal: string;
  jumlahSisa: string;
  statusBatch: string;
  statusExpiry: "aman" | "segera_kedaluwarsa" | "kedaluwarsa";
  sisaHari: number;
  bahan: {
    namaBahan: string;
    satuanStandar: string;
    kategori: string;
  };
}

interface PendingPOItem {
  id: string;
  nomorPo: string;
  targetPengiriman: string;
  supplier: {
    namaSupplier: string;
  };
  items: Array<{
    id: string;
    bahanId: string;
    jumlahPesan: string;
    bahan: {
      id: string;
      namaBahan: string;
      satuanStandar: string;
    };
  }>;
}

interface QcBatchTabProps {
  onRefreshAll?: () => void;
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const labelCls = "block text-[11px] font-bold text-brand-dark/80 mb-1";

export default function QcBatchTab({ onRefreshAll }: QcBatchTabProps) {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [pendingPOs, setPendingPOs] = useState<PendingPOItem[]>([]);
  const [selectedPO, setSelectedPO] = useState<PendingPOItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State QC Modal
  const [qcStatus, setQcStatus] = useState<"lolos" | "lolos_bersyarat" | "ditolak">("lolos");
  const [catatanSuhu, setCatatanSuhu] = useState<string>("4°C (Suhu Dingin Sesuai Standar)");
  const [catatanKebersihan, setCatatanKebersihan] = useState<string>(
    "Kemasan utuh higienis, lolos uji visual dan organoleptik."
  );
  const [qcItems, setQcItems] = useState<
    Array<{
      bahanId: string;
      namaBahan: string;
      satuan: string;
      jumlahDiterima: number;
      nomorBatch: string;
      tanggalExpired: string;
    }>
  >([]);
  const [isSubmittingQc, setIsSubmittingQc] = useState<boolean>(false);

  const fetchBatchAndQc = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resBatch, resPo] = await Promise.all([fetch("/api/batch"), fetch("/api/po")]);
      if (resBatch.ok) {
        const json = await resBatch.json();
        setBatches(json.daftarBatch || []);
      }
      if (resPo.ok) {
        const json = await resPo.json();
        const all: PendingPOItem[] = json.daftarPO || [];
        setPendingPOs(all.filter((p) => (p as unknown as { status: string }).status === "diajukan"));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatchAndQc();
  }, [fetchBatchAndQc]);

  // Open modal QC penerimaan
  const openQcModal = (po: PendingPOItem) => {
    setSelectedPO(po);
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);

    const defaultItems = po.items.map((it, idx) => {
      // Default expiry date: +7 hari untuk bahan umum
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 7);
      const expStr = expDate.toISOString().split("T")[0];

      return {
        bahanId: it.bahan.id,
        namaBahan: it.bahan.namaBahan,
        satuan: it.bahan.satuanStandar,
        jumlahDiterima: Number(it.jumlahPesan),
        nomorBatch: `BATCH-${dateCode}-${randomSuffix + idx}`,
        tanggalExpired: expStr,
      };
    });

    setQcItems(defaultItems);
  };

  const handleItemChange = (idx: number, field: string, val: string | number) => {
    const updated = [...qcItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setQcItems(updated);
  };

  // Submit QC
  const handleSubmitQC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    try {
      setIsSubmittingQc(true);
      const res = await fetch("/api/qc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poId: selectedPO.id,
          status: qcStatus,
          catatanSuhu,
          catatanKebersihan,
          items: qcItems.map((it) => ({
            bahanId: it.bahanId,
            jumlahDiterima: Number(it.jumlahDiterima),
            nomorBatch: it.nomorBatch,
            tanggalExpired: it.tanggalExpired,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memproses QC.");

      setToast({ type: "success", message: json.message || "Pemeriksaan QC berhasil disimpan!" });
      setSelectedPO(null);
      await fetchBatchAndQc();
      if (onRefreshAll) onRefreshAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsSubmittingQc(false);
    }
  };

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
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-gold/30 text-brand-dark mb-1">
            Fase 2: Quality Control & FEFO Expiry
          </span>
          <h2 className="text-base font-bold text-brand-dark">
            QC Kedatangan Bahan & Manajemen Batch (FEFO)
          </h2>
          <p className="text-xs text-brand-dark/70">
            Pastikan bahan yang tiba lolos uji suhu dan higienitas, serta pantau kedaluwarsa dengan sistem First Expired, First Out.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-brand-canvas border border-brand-dark/10 text-center">
            <p className="font-bold text-base text-brand-dark">{pendingPOs.length}</p>
            <p className="text-[10px] text-brand-dark/60">PO Menunggu QC</p>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-canvas border border-brand-dark/10 text-center">
            <p className="font-bold text-base text-amber-700">
              {batches.filter((b) => b.statusExpiry === "segera_kedaluwarsa").length}
            </p>
            <p className="text-[10px] text-brand-dark/60">Segera Expired</p>
          </div>
        </div>
      </div>

      {/* PO Menunggu QC Datang */}
      <div className="bg-white rounded-2xl border border-brand-dark/15 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-dark/10 flex items-center justify-between bg-brand-canvas/60">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-sm text-brand-dark">PO Menunggu Pemeriksaan QC Bahan Datang</h3>
          </div>
          <span className="text-xs text-brand-dark/60 font-semibold">
            {pendingPOs.length} Pengiriman Berjalan
          </span>
        </div>

        <div className="p-6">
          {pendingPOs.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-brand-dark/20 text-xs text-brand-dark/60 bg-brand-canvas/30 space-y-1">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="font-bold text-brand-dark">Tidak ada PO yang menunggu pemeriksaan QC.</p>
              <p>Semua pesanan bahan telah diperiksa atau belum ada PO baru yang diajukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPOs.map((po) => (
                <div
                  key={po.id}
                  className="p-4 rounded-xl border border-brand-dark/15 bg-brand-canvas/40 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-brand-dark">{po.nomorPo}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                        Menunggu QC
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-brand-dark/80">
                      Supplier: {po.supplier?.namaSupplier}
                    </p>
                    <p className="text-[11px] text-brand-dark/60">
                      Target Tiba: {po.targetPengiriman}
                    </p>
                    <div className="pt-1 space-y-1">
                      {po.items?.map((it) => (
                        <p key={it.id} className="text-[11px] text-brand-dark/80 font-medium">
                          • {it.bahan?.namaBahan}: {it.jumlahPesan} {it.bahan?.satuanStandar}
                        </p>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openQcModal(po)}
                    className="w-full h-9 rounded-lg bg-brand-dark text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-brand-dark/90 transition cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" /> Input Hasil Pemeriksaan QC
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabel Batch Stok Aktif (FEFO Order) */}
      <div className="bg-white rounded-2xl border border-brand-dark/15 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-dark/10 flex items-center justify-between bg-brand-canvas/60">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-dark" />
            <div>
              <h3 className="font-bold text-sm text-brand-dark">Stok Batch Aktif (FEFO — First Expired First Out)</h3>
              <p className="text-[11px] text-brand-dark/60">
                Prioritas pemotongan bahan saat produksi otomatis diambil dari batch paling mendekati kedaluwarsa.
              </p>
            </div>
          </div>
          <span className="text-xs text-brand-dark/60 font-semibold">
            {batches.length} Batch Aktif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-canvas/80 text-brand-dark/80 font-bold border-b border-brand-dark/10">
              <tr>
                <th className="px-5 py-3.5">Nomor Batch</th>
                <th className="px-5 py-3.5">Nama Bahan</th>
                <th className="px-5 py-3.5">Tgl Masuk</th>
                <th className="px-5 py-3.5">Tgl Kedaluwarsa</th>
                <th className="px-5 py-3.5">Sisa / Awal Stok</th>
                <th className="px-5 py-3.5">Status FEFO Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-brand-dark/60 font-medium">
                    Memuat daftar batch...
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-brand-dark/60 font-medium">
                    Belum ada batch stok tercatat di gudang dapur.
                  </td>
                </tr>
              ) : (
                batches.map((b) => {
                  const isNear = b.statusExpiry === "segera_kedaluwarsa";
                  const isExp = b.statusExpiry === "kedaluwarsa";
                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-brand-canvas/40 transition ${
                        isNear ? "bg-amber-50/50" : isExp ? "bg-red-50/50" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-bold text-brand-dark font-mono">
                        {b.nomorBatch}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-brand-dark">{b.bahan?.namaBahan}</p>
                        <p className="text-[10px] text-brand-dark/60 uppercase">
                          {b.bahan?.kategori}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-brand-dark/80">
                        {b.tanggalMasuk}
                      </td>
                      <td className="px-5 py-4 font-bold text-brand-dark">
                        {b.tanggalExpired}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-black text-brand-dark text-sm">
                          {b.jumlahSisa}
                        </span>{" "}
                        <span className="text-[11px] text-brand-dark/60">
                          / {b.jumlahAwal} {b.bahan?.satuanStandar}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isExp ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-300">
                            <AlertTriangle className="w-3 h-3 text-red-600" /> Kedaluwarsa ({b.sisaHari} Hari)
                          </span>
                        ) : isNear ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Segera Pakai ({b.sisaHari} Hari Lagi)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/20 text-brand-dark border border-brand-green/40">
                            <CheckCircle2 className="w-3 h-3 text-brand-green" /> Aman ({b.sisaHari} Hari Lagi)
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

      {/* Modal Input Hasil Pemeriksaan QC */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border-2 border-brand-dark shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-brand-dark text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-brand-pastel uppercase tracking-wide">
                  Pemeriksaan QC Bahan Datang
                </p>
                <h3 className="font-bold text-sm">
                  {selectedPO.nomorPo} — {selectedPO.supplier?.namaSupplier}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPO(null)}
                className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-base flex items-center justify-center cursor-pointer"
                aria-label="Tutup form QC"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQC} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Status QC */}
              <div>
                <label className={labelCls}>Status Hasil Pemeriksaan Mutu (QC) *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setQcStatus("lolos")}
                    className={`min-h-[48px] p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                      qcStatus === "lolos"
                        ? "bg-brand-green/20 border-brand-green text-brand-dark ring-2 ring-brand-green/40"
                        : "bg-white border-brand-dark/20 text-brand-dark/70"
                    }`}
                  >
                    ✓ Lolos Sempurna
                  </button>
                  <button
                    type="button"
                    onClick={() => setQcStatus("lolos_bersyarat")}
                    className={`min-h-[48px] p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                      qcStatus === "lolos_bersyarat"
                        ? "bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-300"
                        : "bg-white border-brand-dark/20 text-brand-dark/70"
                    }`}
                  >
                    ⚠ Lolos Bersyarat
                  </button>
                  <button
                    type="button"
                    onClick={() => setQcStatus("ditolak")}
                    className={`min-h-[48px] p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                      qcStatus === "ditolak"
                        ? "bg-red-100 border-red-400 text-red-900 ring-2 ring-red-300"
                        : "bg-white border-brand-dark/20 text-brand-dark/70"
                    }`}
                  >
                    ✕ Ditolak (Retur)
                  </button>
                </div>
              </div>

              {/* Catatan Suhu & Kebersihan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Pemeriksaan Suhu Dingin (Chiller/Freezer)</label>
                  <input
                    type="text"
                    value={catatanSuhu}
                    onChange={(e) => setCatatanSuhu(e.target.value)}
                    placeholder="Contoh: 3.5°C"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Catatan Kondisi Higienitas & Kemasan</label>
                  <input
                    type="text"
                    value={catatanKebersihan}
                    onChange={(e) => setCatatanKebersihan(e.target.value)}
                    placeholder="Kondisi kemasan..."
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Items & Batch Generation */}
              <div className="space-y-3 pt-2">
                <label className={labelCls}>
                  Konfirmasi Jumlah & Penerbitan Nomor Batch Expiry (FEFO) *
                </label>
                {qcItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-brand-canvas border border-brand-dark/15 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-brand-dark">{item.namaBahan}</span>
                      <span className="text-[11px] text-brand-dark/70 font-semibold">
                        Satuan: {item.satuan}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-brand-dark/60 block mb-0.5">
                          Jumlah Fisik Diterima
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={item.jumlahDiterima}
                          onChange={(e) => handleItemChange(idx, "jumlahDiterima", Number(e.target.value))}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-brand-dark/60 block mb-0.5">
                          Nomor Batch Pabrik / Panen
                        </label>
                        <input
                          type="text"
                          required
                          value={item.nomorBatch}
                          onChange={(e) => handleItemChange(idx, "nomorBatch", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-brand-dark/60 block mb-0.5">
                          Tanggal Kedaluwarsa (Exp)
                        </label>
                        <input
                          type="date"
                          required
                          value={item.tanggalExpired}
                          onChange={(e) => handleItemChange(idx, "tanggalExpired", e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-brand-dark/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPO(null)}
                  className="px-4 h-11 rounded-xl bg-brand-canvas text-brand-dark font-bold hover:bg-brand-dark/10 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQc}
                  className="px-6 h-11 rounded-xl bg-brand-dark text-white font-bold hover:bg-brand-dark/90 active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSubmittingQc ? "Menyimpan QC..." : "SIMPAN QC & CATAT STOK BATCH"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
