"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  ShieldAlert,
  FileCheck2,
  School,
  ExternalLink,
} from "lucide-react";

interface TiketKomplain {
  id: string;
  nomorTiket: string;
  sekolahId: string;
  pengirimanId: string | null;
  kategoriKendala: "kurang_porsi" | "makanan_dingin" | "kemasan_rusak" | "dugaan_basi";
  deskripsi: string;
  fotoBuktiUrl: string | null;
  status: "baru" | "investigasi" | "tindakan" | "selesai" | "ditutup";
  catatanInvestigasi: string | null;
  tindakanPerbaikan: string | null;
  diselesaikanPada: string | null;
  createdAt: string;
  sekolah: {
    namaSekolah: string;
    picNama: string;
    picKontak: string;
  };
}

interface KomplainTabProps {
  allSekolah: Array<{ id: string; namaSekolah: string; jumlahPorsiTarget: number }>;
  allBahan?: Array<{ id: string; namaBahan: string; satuanStandar: string }>;
  onRefreshAll?: () => void;
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const labelCls = "block text-[11px] font-bold text-brand-dark/80 mb-1";

export default function KomplainTab({ allSekolah, onRefreshAll }: KomplainTabProps) {
  const [tikets, setTikets] = useState<TiketKomplain[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form Pengajuan Komplain Baru
  const [sekolahId, setSekolahId] = useState("");
  const [kategoriKendala, setKategoriKendala] = useState<
    "kurang_porsi" | "makanan_dingin" | "kemasan_rusak" | "dugaan_basi"
  >("kemasan_rusak");
  const [deskripsi, setDeskripsi] = useState("");
  const [fotoBuktiUrl, setFotoBuktiUrl] = useState("");

  // Modal / Penanganan Tiket Terpilih
  const [selectedTiket, setSelectedTiket] = useState<TiketKomplain | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<string>("investigasi");
  const [catatanInvestigasi, setCatatanInvestigasi] = useState("");
  const [tindakanPerbaikan, setTindakanPerbaikan] = useState("");

  const fetchTikets = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/komplain");
      if (res.ok) {
        const data = await res.json();
        setTikets(data.tikets || []);
      }
    } catch {
      setToast({ type: "error", message: "Gagal memuat tiket komplain." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTikets();
  }, [fetchTikets]);

  const handleSubmitKomplain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/komplain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sekolahId,
          kategoriKendala,
          deskripsi,
          fotoBuktiUrl: fotoBuktiUrl || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengajukan komplain");

      setToast({ type: "success", message: `Tiket ${json.tiket?.nomorTiket} berhasil diterbitkan.` });
      setDeskripsi("");
      setFotoBuktiUrl("");
      fetchTikets();
      onRefreshAll?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    }
  };

  const handleUpdateTiket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTiket) return;

    try {
      const res = await fetch("/api/komplain", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTiket.id,
          status: statusUpdate,
          catatanInvestigasi: catatanInvestigasi || undefined,
          tindakanPerbaikan: tindakanPerbaikan || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui tiket");

      setToast({ type: "success", message: `Tiket ${selectedTiket.nomorTiket} berhasil diperbarui.` });
      setSelectedTiket(null);
      fetchTikets();
      onRefreshAll?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    }
  };

  const openModal = (tiket: TiketKomplain) => {
    setSelectedTiket(tiket);
    setStatusUpdate(tiket.status === "baru" ? "investigasi" : tiket.status);
    setCatatanInvestigasi(tiket.catatanInvestigasi || "");
    setTindakanPerbaikan(tiket.tindakanPerbaikan || "");
  };

  const pendingCount = tikets.filter((t) => t.status === "baru" || t.status === "investigasi").length;
  const selesaiCount = tikets.filter((t) => t.status === "selesai" || t.status === "ditutup").length;

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

      {/* Top Cards: Status Tiket */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Tiket Dalam Penanganan
            </div>
            <div className="text-2xl font-black text-amber-900 mt-0.5">
              {pendingCount} Insiden
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-green/20 text-brand-dark flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Insiden Selesai Ditangani
            </div>
            <div className="text-2xl font-black text-brand-dark mt-0.5">
              {selesaiCount} Tiket
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-pastel/30 text-brand-dark flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              SLA Respon Investigasi
            </div>
            <div className="text-2xl font-black text-brand-dark mt-0.5">
              &le; 60 Menit
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Form Input Komplain Baru & Standar Penanganan Higiene */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Pelaporan Komplain */}
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-brand-dark/10">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-dark">Formulir Pengaduan Sekolah</h3>
              <p className="text-xs text-brand-dark/60">Terbitkan tiket investigasi ketidaksesuaian penerimaan porsi</p>
            </div>
          </div>

          <form onSubmit={handleSubmitKomplain} className="space-y-4">
            <div>
              <label className={labelCls}>Sekolah Pelapor</label>
              <select
                required
                value={sekolahId}
                onChange={(e) => setSekolahId(e.target.value)}
                className={selectCls}
              >
                <option value="">-- Pilih Sekolah Penerima --</option>
                {allSekolah.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.namaSekolah} ({s.jumlahPorsiTarget} Porsi)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Kategori Kendala</label>
              <select
                value={kategoriKendala}
                onChange={(e) =>
                  setKategoriKendala(
                    e.target.value as "kurang_porsi" | "makanan_dingin" | "kemasan_rusak" | "dugaan_basi"
                  )
                }
                className={selectCls}
              >
                <option value="kemasan_rusak">Kemasan Rusak / Segel Terbuka</option>
                <option value="kurang_porsi">Jumlah Porsi Kurang dari Alokasi</option>
                <option value="makanan_dingin">Suhu Makanan Tidak Hangat</option>
                <option value="dugaan_basi">Dugaan Kontaminasi / Bau Asam</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Deskripsi Rincian Insiden</label>
              <textarea
                required
                rows={3}
                placeholder="Rincikan jumlah porsi terdampak, kondisi fisik saat dibuka, waktu terima..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>URL Foto Dokumentasi Bukti (Opsional)</label>
              <input
                type="text"
                placeholder="https://storage.sppg.id/bukti-komplain-xxx.jpg"
                value={fotoBuktiUrl}
                onChange={(e) => setFotoBuktiUrl(e.target.value)}
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Terbitkan Tiket Investigasi Insiden
            </button>
          </form>
        </div>

        {/* SOP & Prosedur Investigasi QC MBG */}
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-brand-dark/10">
              <div className="w-9 h-9 rounded-xl bg-brand-pastel/40 text-brand-dark flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-brand-dark">Protokol Investigasi Higiene (SLA 60m)</h3>
                <p className="text-xs text-brand-dark/60">Langkah wajib tim Quality Control & Ahli Gizi</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-brand-dark/80">
              <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/5">
                <div className="font-extrabold text-brand-dark flex items-center gap-2 mb-1">
                  <span>1. Keterlacakan Batch (Backward Traceability)</span>
                </div>
                <p className="text-brand-dark/70 text-[11px] leading-relaxed">
                  Lakukan penelusuran nomor batch bahan baku pada jadwal produksi hari tersebut guna memastikan sampel retensi uji lab dapur aman.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/5">
                <div className="font-extrabold text-brand-dark flex items-center gap-2 mb-1">
                  <span>2. Penggantian Makanan Darurat (&le; 60 Menit)</span>
                </div>
                <p className="text-brand-dark/70 text-[11px] leading-relaxed">
                  Bila porsi dinyatakan rusak/kurang, armada siaga dapur cadangan wajib mengantarkan porsi pengganti steril sebelum jam makan siswa dimulai.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/5">
                <div className="font-extrabold text-brand-dark flex items-center gap-2 mb-1">
                  <span>3. Berita Acara & Penutupan Bersama Sekolah</span>
                </div>
                <p className="text-brand-dark/70 text-[11px] leading-relaxed">
                  Tiket hanya dapat ditutup setelah PIC Sekolah menandatangani konfirmasi bahwa tindakan perbaikan telah diselesaikan dengan memuaskan.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-brand-green/20 border border-brand-green/40 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-dark shrink-0" />
            <div className="text-[11px] font-bold text-brand-dark">
              Transparansi Kualitas: Setiap Aduan Tercatat Tanpa Manipulasi
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Tiket Komplain Sekolah */}
      <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-brand-dark mb-4">
          Daftar Tiket Aduan Kualitas Makanan Sekolah
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-dark/10 text-brand-dark/60 font-bold uppercase text-[10px]">
                <th className="pb-3 px-4">No. Tiket</th>
                <th className="pb-3 px-4">Sekolah & PIC</th>
                <th className="pb-3 px-4">Kategori Masalah</th>
                <th className="pb-3 px-4">Deskripsi Aduan</th>
                <th className="pb-3 px-4">Status Investigasi</th>
                <th className="pb-3 px-4">Tindakan Perbaikan</th>
                <th className="pb-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5 font-semibold text-brand-dark">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-brand-dark/50">
                    Memuat daftar tiket komplain...
                  </td>
                </tr>
              ) : tikets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-brand-dark/50">
                    Tidak ada tiket komplain aktif.
                  </td>
                </tr>
              ) : (
                tikets.map((t) => (
                  <tr key={t.id} className="hover:bg-brand-canvas/50">
                    <td className="py-3 px-4 font-mono font-bold">{t.nomorTiket}</td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-brand-dark">{t.sekolah?.namaSekolah}</div>
                      <div className="text-[10px] text-brand-dark/60">
                        {t.sekolah?.picNama} ({t.sekolah?.picKontak})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-900">
                        {t.kategoriKendala.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-dark/80 text-[11px] max-w-xs truncate">
                      {t.deskripsi}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.status === "selesai" || t.status === "ditutup"
                            ? "bg-brand-green/20 text-brand-dark"
                            : t.status === "investigasi"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-red-100 text-red-900"
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-dark/70 text-[11px] max-w-xs truncate">
                      {t.tindakanPerbaikan || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openModal(t)}
                        className="px-2.5 py-1 bg-brand-dark hover:bg-brand-dark/90 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                      >
                        Investigasi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Dialog Investigasi QC */}
      {selectedTiket && (
        <div className="fixed inset-0 z-50 bg-brand-dark/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-brand-dark/20 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-dark/10">
              <div className="font-extrabold text-base text-brand-dark">
                Tindakan Tiket {selectedTiket.nomorTiket}
              </div>
              <button
                onClick={() => setSelectedTiket(null)}
                className="text-xs font-bold text-brand-dark/60 hover:text-brand-dark"
              >
                ✕ Batal
              </button>
            </div>

            <div className="text-xs text-brand-dark/80 space-y-1">
              <div>
                <span className="font-bold">Sekolah:</span> {selectedTiket.sekolah?.namaSekolah}
              </div>
              <div>
                <span className="font-bold">Keluhan:</span> {selectedTiket.deskripsi}
              </div>
            </div>

            <form onSubmit={handleUpdateTiket} className="space-y-4">
              <div>
                <label className={labelCls}>Status Penanganan</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className={selectCls}
                >
                  <option value="investigasi">Dalam Investigasi Internal QC</option>
                  <option value="tindakan">Tindakan Perbaikan Dijalankan</option>
                  <option value="selesai">Selesai & Diverifikasi Pihak Sekolah</option>
                  <option value="ditutup">Ditutup Resmi</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Catatan Investigasi QC (Backward Traceability)</label>
                <textarea
                  rows={2}
                  placeholder="Hasil penelusuran batch bahan, suhu pengiriman armada..."
                  value={catatanInvestigasi}
                  onChange={(e) => setCatatanInvestigasi(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Tindakan Perbaikan / Penggantian Porsi</label>
                <textarea
                  rows={2}
                  placeholder="misal: Telah dikirimkan 5 wadah baru pengganti dalam waktu 45 menit..."
                  value={tindakanPerbaikan}
                  onChange={(e) => setTindakanPerbaikan(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTiket(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-dark text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-dark hover:bg-brand-dark/90 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Simpan Tindakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
