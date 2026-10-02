"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building,
  ArrowRightLeft,
  Plus,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  Ban,
  ShieldCheck,
} from "lucide-react";

interface DapurCabang {
  id: string;
  kodeDapur: string;
  namaDapur: string;
  tipeDapur: "pusat" | "satelit";
  alamat: string;
  latitude: string | null;
  longitude: string | null;
  radiusMeter: number;
  kapasitasMaksPorsi: number;
  isActive: boolean;
}

interface TransferItem {
  id: string;
  nomorTransfer: string;
  dapurAsalId: string;
  dapurTujuanId: string;
  bahanId: string;
  batchId: string | null;
  jumlah: string;
  status: "diajukan" | "dalam_perjalanan" | "diterima" | "batal";
  catatan: string | null;
  dikirimPada: string | null;
  diterimaPada: string | null;
  createdAt: string;
  dapurAsal: { namaDapur: string; kodeDapur: string };
  dapurTujuan: { namaDapur: string; kodeDapur: string };
  bahan: { namaBahan: string; satuanStandar: string };
  batch: { nomorBatch: string } | null;
}

interface CabangTabProps {
  allBahan: Array<{ id: string; namaBahan: string; satuanStandar: string }>;
  onRefreshAll?: () => void;
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const labelCls = "block text-[11px] font-bold text-brand-dark/80 mb-1";

export default function CabangTab({ allBahan, onRefreshAll }: CabangTabProps) {
  const [cabangList, setCabangList] = useState<DapurCabang[]>([]);
  const [transferList, setTransferList] = useState<TransferItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form Dapur Cabang
  const [kodeDapur, setKodeDapur] = useState("");
  const [namaDapur, setNamaDapur] = useState("");
  const [tipeDapur, setTipeDapur] = useState<"pusat" | "satelit">("satelit");
  const [alamat, setAlamat] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeter, setRadiusMeter] = useState("100");
  const [kapasitas, setKapasitas] = useState("3000");

  // Form Transfer Stok
  const [asalId, setAsalId] = useState("");
  const [tujuanId, setTujuanId] = useState("");
  const [bahanId, setBahanId] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [catatanTransfer, setCatatanTransfer] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/cabang");
      if (res.ok) {
        const data = await res.json();
        setCabangList(data.cabang || []);
        setTransferList(data.riwayatTransfer || []);
        if (data.cabang?.length > 1) {
          setAsalId((prev) => prev || data.cabang[0]?.id || "");
          setTujuanId((prev) => prev || data.cabang[1]?.id || "");
        }
      }
    } catch {
      setToast({ type: "error", message: "Gagal memuat data cabang & transfer stok." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCabang = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/cabang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kodeDapur,
          namaDapur,
          tipeDapur,
          alamat,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          radiusMeter: parseInt(radiusMeter, 10),
          kapasitasMaksPorsi: parseInt(kapasitas, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat cabang");

      setToast({ type: "success", message: `Dapur cabang ${namaDapur} berhasil didaftarkan.` });
      setKodeDapur("");
      setNamaDapur("");
      setAlamat("");
      setLatitude("");
      setLongitude("");
      fetchData();
      onRefreshAll?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    }
  };

  const handleAjukanTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (asalId === tujuanId) {
        setToast({ type: "error", message: "Dapur asal dan tujuan tidak boleh sama." });
        return;
      }
      const res = await fetch("/api/cabang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "transfer_stok",
          dapurAsalId: asalId,
          dapurTujuanId: tujuanId,
          bahanId,
          jumlah: parseFloat(jumlah),
          catatan: catatanTransfer || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengajukan transfer");

      setToast({ type: "success", message: "Surat mutasi transfer stok berhasil diajukan." });
      setJumlah("");
      setCatatanTransfer("");
      fetchData();
      onRefreshAll?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    }
  };

  const handleUpdateStatusTransfer = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/cabang", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal update status");

      setToast({ type: "success", message: `Status mutasi diperbarui menjadi ${status}.` });
      fetchData();
      onRefreshAll?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    }
  };

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

      {/* Top Section: Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-pastel/30 text-brand-dark flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Total Unit Dapur
            </div>
            <div className="text-2xl font-black text-brand-dark mt-0.5">
              {cabangList.length} Cabang
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-gold/20 text-brand-dark flex items-center justify-center font-bold">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Transfer Berjalan
            </div>
            <div className="text-2xl font-black text-brand-dark mt-0.5">
              {transferList.filter((t) => t.status === "dalam_perjalanan" || t.status === "diajukan").length} Berkas
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-green/30 text-brand-dark flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Kapasitas Terintegrasi
            </div>
            <div className="text-2xl font-black text-brand-dark mt-0.5">
              {cabangList.reduce((acc, c) => acc + c.kapasitasMaksPorsi, 0).toLocaleString("id-ID")} Porsi/Hari
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Form Registrasi Cabang & Form Transfer Stok */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registrasi Unit Dapur Cabang */}
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-brand-dark/10">
            <div className="w-9 h-9 rounded-xl bg-brand-dark text-white flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-dark">Pendaftaran Unit Dapur SPPG</h3>
              <p className="text-xs text-brand-dark/60">Tambah Central Kitchen atau Satellite Kitchen baru</p>
            </div>
          </div>

          <form onSubmit={handleCreateCabang} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Kode Dapur</label>
                <input
                  type="text"
                  required
                  placeholder="misal: SK-03"
                  value={kodeDapur}
                  onChange={(e) => setKodeDapur(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Tipe Dapur</label>
                <select
                  value={tipeDapur}
                  onChange={(e) => setTipeDapur(e.target.value as "pusat" | "satelit")}
                  className={selectCls}
                >
                  <option value="satelit">Dapur Satelit (Cabang)</option>
                  <option value="pusat">Dapur Pusat (Central Kitchen)</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Nama Unit Dapur</label>
              <input
                type="text"
                required
                placeholder="misal: Dapur Satelit SPPG Kebayoran"
                value={namaDapur}
                onChange={(e) => setNamaDapur(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Alamat Lengkap</label>
              <textarea
                required
                rows={2}
                placeholder="Alamat fisik unit operasional dapur..."
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Radius Presensi (Meter)</label>
                <input
                  type="number"
                  required
                  min={20}
                  value={radiusMeter}
                  onChange={(e) => setRadiusMeter(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Kapasitas Maks (Porsi/Hari)</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={kapasitas}
                  onChange={(e) => setKapasitas(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-brand-dark hover:bg-brand-dark/90 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Daftarkan Dapur Baru
            </button>
          </form>
        </div>

        {/* Pengajuan Transfer Stok Antar-Cabang */}
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-brand-dark/10">
            <div className="w-9 h-9 rounded-xl bg-brand-gold/30 text-brand-dark flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-dark">Mutasi Transfer Stok Antar-Dapur</h3>
              <p className="text-xs text-brand-dark/60">Kirim bahan baku dari Central Kitchen ke Satellite Kitchen</p>
            </div>
          </div>

          <form onSubmit={handleAjukanTransfer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Dapur Asal (Pengirim)</label>
                <select
                  required
                  value={asalId}
                  onChange={(e) => setAsalId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">-- Pilih Dapur Pengirim --</option>
                  {cabangList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.kodeDapur} - {c.namaDapur} ({c.tipeDapur.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Dapur Tujuan (Penerima)</label>
                <select
                  required
                  value={tujuanId}
                  onChange={(e) => setTujuanId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">-- Pilih Dapur Penerima --</option>
                  {cabangList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.kodeDapur} - {c.namaDapur} ({c.tipeDapur.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Komoditas Bahan</label>
                <select
                  required
                  value={bahanId}
                  onChange={(e) => setBahanId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">-- Pilih Bahan Baku --</option>
                  {allBahan.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.namaBahan} ({b.satuanStandar})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Volume Jumlah</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  placeholder="Volume kirim..."
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Catatan Mutasi / Surat Jalan</label>
              <textarea
                rows={2}
                placeholder="Keterangan alokasi atau nomor kendaraan armada transfer..."
                value={catatanTransfer}
                onChange={(e) => setCatatanTransfer(e.target.value)}
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-brand-gold hover:bg-brand-gold/90 text-brand-dark rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-xs"
            >
              <ArrowRightLeft className="w-4 h-4" /> Ajukan Surat Mutasi Bahan
            </button>
          </form>
        </div>
      </div>

      {/* Tabel 1: Daftar Unit Dapur SPPG */}
      <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-brand-dark mb-4">Hierarki & Jaringan Dapur SPPG</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-dark/10 text-brand-dark/60 font-bold uppercase text-[10px]">
                <th className="pb-3 px-4">Kode & Nama Dapur</th>
                <th className="pb-3 px-4">Tipe Unit</th>
                <th className="pb-3 px-4">Alamat Lokasi</th>
                <th className="pb-3 px-4">Radius Absen</th>
                <th className="pb-3 px-4">Kapasitas Maksimal</th>
                <th className="pb-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5 font-semibold text-brand-dark">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-brand-dark/50">
                    Memuat data jaringan dapur...
                  </td>
                </tr>
              ) : cabangList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-brand-dark/50">
                    Belum ada unit dapur terdaftar.
                  </td>
                </tr>
              ) : (
                cabangList.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-canvas/50">
                    <td className="py-3 px-4">
                      <div className="font-extrabold">{c.namaDapur}</div>
                      <div className="text-[10px] text-brand-dark/50 font-mono">{c.kodeDapur}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.tipeDapur === "pusat"
                            ? "bg-brand-dark text-white"
                            : "bg-brand-pastel/40 text-brand-dark"
                        }`}
                      >
                        {c.tipeDapur === "pusat" ? "CENTRAL KITCHEN" : "SATELLITE"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-dark/80 max-w-xs truncate">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-dark/40 shrink-0" />
                        <span>{c.alamat}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{c.radiusMeter} Meter</td>
                    <td className="py-3 px-4 font-extrabold">
                      {c.kapasitasMaksPorsi.toLocaleString("id-ID")} Porsi
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/20 text-brand-dark">
                        AKTIF
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel 2: Riwayat Mutasi Transfer Stok Antar-Cabang */}
      <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-brand-dark mb-4">
          Monitoring Riwayat Transfer Stok Antar-Cabang
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-dark/10 text-brand-dark/60 font-bold uppercase text-[10px]">
                <th className="pb-3 px-4">No. Mutasi</th>
                <th className="pb-3 px-4">Dapur Asal → Tujuan</th>
                <th className="pb-3 px-4">Komoditas & Volume</th>
                <th className="pb-3 px-4">Status Pengiriman</th>
                <th className="pb-3 px-4">Catatan</th>
                <th className="pb-3 px-4">Aksi Konfirmasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5 font-semibold text-brand-dark">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-brand-dark/50">
                    Memuat riwayat transfer...
                  </td>
                </tr>
              ) : transferList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-brand-dark/50">
                    Belum ada riwayat mutasi stok antar-cabang.
                  </td>
                </tr>
              ) : (
                transferList.map((t) => (
                  <tr key={t.id} className="hover:bg-brand-canvas/50">
                    <td className="py-3 px-4 font-mono font-bold">{t.nomorTransfer}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{t.dapurAsal?.namaDapur || "Asal"}</span>
                        <ArrowRightLeft className="w-3 h-3 text-brand-dark/50" />
                        <span>{t.dapurTujuan?.namaDapur || "Tujuan"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-brand-dark">{t.bahan?.namaBahan}</div>
                      <div className="text-[10px] text-brand-dark/60 font-mono">
                        {parseFloat(t.jumlah).toLocaleString("id-ID")} {t.bahan?.satuanStandar}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.status === "diterima"
                            ? "bg-brand-green/20 text-brand-dark"
                            : t.status === "dalam_perjalanan"
                            ? "bg-amber-100 text-amber-900"
                            : t.status === "diajukan"
                            ? "bg-blue-100 text-blue-900"
                            : "bg-red-100 text-red-900"
                        }`}
                      >
                        {t.status === "diterima" ? (
                          <CheckCircle2 className="w-3 h-3 text-brand-dark" />
                        ) : t.status === "dalam_perjalanan" ? (
                          <Truck className="w-3 h-3" />
                        ) : t.status === "diajukan" ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <Ban className="w-3 h-3" />
                        )}
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-dark/70 text-[11px] max-w-xs truncate">
                      {t.catatan || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {t.status === "diajukan" && (
                          <button
                            onClick={() => handleUpdateStatusTransfer(t.id, "dalam_perjalanan")}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Kirim
                          </button>
                        )}
                        {t.status === "dalam_perjalanan" && (
                          <button
                            onClick={() => handleUpdateStatusTransfer(t.id, "diterima")}
                            className="px-2.5 py-1 bg-brand-green hover:bg-brand-green/90 text-brand-dark rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Terima
                          </button>
                        )}
                        {(t.status === "diajukan" || t.status === "dalam_perjalanan") && (
                          <button
                            onClick={() => handleUpdateStatusTransfer(t.id, "batal")}
                            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Batal
                          </button>
                        )}
                      </div>
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
