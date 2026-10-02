"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  ShieldCheck,
  Navigation,
  Sparkles,
} from "lucide-react";

interface StopItem {
  urutan: number;
  sekolahId: string;
  namaSekolah: string;
  porsi: number;
  estJamTiba: string;
  jarakDariSebelumnyaKm?: number;
  durasiMenitDariSebelumnya?: number;
}

interface VrpRuteItem {
  id: string;
  tanggal: string;
  armadaId: string;
  totalJarakKm: string;
  totalEstimasiMenit: number;
  statusRute: "terencana" | "berjalan" | "selesai" | "batal";
  urutanSekolahJson: StopItem[];
  createdAt: string;
  armada?: {
    nomorKendaraan: string;
    jenisKendaraan: string;
    kapasitasPorsi: number;
  } | null;
  driver?: {
    email: string;
    nomorHp: string;
  } | null;
}

interface ArmadaItem {
  id: string;
  nomorKendaraan: string;
  jenisKendaraan: string;
  kapasitasPorsi: number;
  status: string;
}

interface VrpTabProps {
  onRefreshAll?: () => void;
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const labelCls = "block text-[11px] font-bold text-brand-dark/80 mb-1";

export default function VrpTab({ onRefreshAll }: VrpTabProps) {
  const [listRute, setListRute] = useState<VrpRuteItem[]>([]);
  const [daftarArmada, setDaftarArmada] = useState<ArmadaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [selectedArmadaId, setSelectedArmadaId] = useState<string>("");
  const [jamBerangkat, setJamBerangkat] = useState<string>("08:30");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/vrp");
      if (res.ok) {
        const data = await res.json();
        setListRute(data.listRute || []);
        const armadas: ArmadaItem[] = data.daftarArmada || [];
        setDaftarArmada(armadas);
        if (armadas.length > 0 && !selectedArmadaId) {
          setSelectedArmadaId(armadas[0].id);
        }
      }
    } catch {
      setToast({ type: "error", message: "Gagal memuat data rute VRP." });
    } finally {
      setIsLoading(false);
    }
  }, [selectedArmadaId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOptimasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArmadaId) {
      setToast({ type: "error", message: "Pilih armada kendaraan terlebih dahulu." });
      return;
    }

    try {
      setIsOptimizing(true);
      const res = await fetch("/api/vrp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "optimasi",
          armadaId: selectedArmadaId,
          jamBerangkat,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal komputasi rute VRP");

      setToast({
        type: "success",
        message: `Rute optimal armada berhasil dihitung: ${data.hasilVrp.urutanStops.length} sekolah singgah.`,
      });
      fetchData();
      onRefreshAll?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleUpdateStatus = async (id: string, statusRute: "terencana" | "berjalan" | "selesai" | "batal") => {
    try {
      const res = await fetch("/api/vrp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, statusRute }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui status rute");

      setToast({ type: "success", message: `Status rute berhasil diubah: ${statusRute}.` });
      fetchData();
      onRefreshAll?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    }
  };

  const ruteAktif = listRute[0]; // Rute terbaru
  const totalRuteAktifCount = listRute.filter((r) => r.statusRute === "berjalan" || r.statusRute === "terencana").length;

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

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Algoritma CVRPTW
            </div>
            <div className="text-xl font-black text-brand-dark mt-0.5">
              Heuristik Nearest
            </div>
            <div className="text-[10px] text-brand-dark/60">Optimasi Jarak & Muatan</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-green/20 text-brand-dark flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Rute Aktif Hari Ini
            </div>
            <div className="text-2xl font-black text-brand-dark mt-0.5">
              {totalRuteAktifCount} Armada
            </div>
            <div className="text-[10px] text-brand-dark/60">Dari total {daftarArmada.length} armada siap</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Batas Termal HACCP
            </div>
            <div className="text-lg font-black text-emerald-800 mt-0.5">
              &le; 90 Menit
            </div>
            <div className="text-[10px] text-brand-dark/60">Insulasi suhu &gt;60&deg;C aman</div>
          </div>
        </div>
      </div>

      {/* Grid: Form Optimasi Rute & Rute Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Komputasi VRP */}
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-brand-dark/10">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-dark">Komputasi Rute VRP</h3>
              <p className="text-xs text-brand-dark/60">Vehicle Routing Problem otomatis</p>
            </div>
          </div>

          <form onSubmit={handleOptimasi} className="space-y-4">
            <div>
              <label className={labelCls}>Pilih Armada Distribusi</label>
              <select
                value={selectedArmadaId}
                onChange={(e) => setSelectedArmadaId(e.target.value)}
                className={selectCls}
                required
              >
                {daftarArmada.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nomorKendaraan} &middot; {a.jenisKendaraan} ({a.kapasitasPorsi} porsi)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Waktu Mulai Berangkat Dapur</label>
              <input
                type="time"
                value={jamBerangkat}
                onChange={(e) => setJamBerangkat(e.target.value)}
                className={inputCls}
                required
              />
              <p className="text-[10px] text-brand-dark/50 mt-1">
                Jadwal standar keberangkatan makanan siap saji: 08:30 WIB
              </p>
            </div>

            <div className="p-3 bg-brand-canvas rounded-xl border border-brand-dark/10 text-[11px] text-brand-dark/70 space-y-1">
              <div className="font-bold text-brand-dark">Fungsi Objektif:</div>
              <div>&bull; Meminimalkan total jarak tempuh kilometer</div>
              <div>&bull; Prioritas sekolah dengan jam makan siang lebih awal</div>
              <div>&bull; Membatasi waktu tempuh maksimum 90 menit (HACCP)</div>
            </div>

            <button
              type="submit"
              disabled={isOptimizing}
              className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md"
            >
              <Navigation className="w-4 h-4" />
              {isOptimizing ? "Mengalkulasi Koordinat Geospasial..." : "Jalankan Optimasi CVRPTW"}
            </button>
          </form>
        </div>

        {/* Detail Rute Terkini */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-brand-dark/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-green/30 text-brand-dark flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-dark">Urutan Titik Singgah Rute Terkini</h3>
                  <p className="text-xs text-brand-dark/60">
                    {ruteAktif
                      ? `Armada: ${ruteAktif.armada?.nomorKendaraan || "Kendaraan"} (${ruteAktif.armada?.jenisKendaraan})`
                      : "Belum ada rute terhitung"}
                  </p>
                </div>
              </div>
              {ruteAktif && (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ruteAktif.statusRute === "berjalan"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : ruteAktif.statusRute === "selesai"
                        ? "bg-brand-green/30 text-brand-dark border border-brand-green/50"
                        : "bg-blue-100 text-blue-900 border border-blue-300"
                    }`}
                  >
                    {ruteAktif.statusRute.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {!ruteAktif ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-brand-dark/50">
                <Truck className="w-10 h-10 text-brand-dark/30 mb-2" />
                <p className="font-bold text-xs text-brand-dark">Belum Ada Rute Aktif</p>
                <p className="text-[11px] max-w-xs mt-1">
                  Pilih armada dan klik &quot;Jalankan Optimasi CVRPTW&quot; untuk mengomputasi urutan titik sekolah.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Metrik ringkas rute */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-brand-canvas rounded-xl border border-brand-dark/10 text-center">
                  <div>
                    <div className="text-[10px] font-bold text-brand-dark/60 uppercase">Total Jarak</div>
                    <div className="text-base font-black text-brand-dark font-mono">
                      {ruteAktif.totalJarakKm} km
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-brand-dark/60 uppercase">Estimasi Waktu</div>
                    <div className="text-base font-black text-brand-dark font-mono">
                      {ruteAktif.totalEstimasiMenit} Menit
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-brand-dark/60 uppercase">Status Termal</div>
                    <div
                      className={`text-xs font-black mt-0.5 ${
                        ruteAktif.totalEstimasiMenit <= 90 ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {ruteAktif.totalEstimasiMenit <= 90 ? "MEMENUHI HACCP" : "LEBIH DARI 90 MNT"}
                    </div>
                  </div>
                </div>

                {/* List Stops */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {ruteAktif.urutanSekolahJson?.map((stop, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-brand-dark/10 bg-white hover:bg-brand-canvas transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-blue-700 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0">
                          #{stop.urutan}
                        </span>
                        <div>
                          <div className="font-bold text-brand-dark">{stop.namaSekolah}</div>
                          <div className="text-[10px] text-brand-dark/60 flex items-center gap-2">
                            <span>{stop.porsi} Porsi</span>
                            <span>&bull;</span>
                            <span>Est Tiba: <b className="text-brand-dark">{stop.estJamTiba} WIB</b></span>
                            {stop.jarakDariSebelumnyaKm != null && (
                              <>
                                <span>&bull;</span>
                                <span>+{stop.jarakDariSebelumnyaKm} km ({stop.durasiMenitDariSebelumnya} mnt)</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800">
                        Stop Ke-{stop.urutan}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {ruteAktif && (
            <div className="mt-4 pt-4 border-t border-brand-dark/10 flex items-center justify-between">
              <div className="text-xs text-brand-dark/70">
                Tanggal: <b>{ruteAktif.tanggal}</b>
              </div>
              <div className="flex items-center gap-2">
                {ruteAktif.statusRute === "terencana" && (
                  <button
                    onClick={() => handleUpdateStatus(ruteAktif.id, "berjalan")}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" /> Berangkatkan Armada
                  </button>
                )}
                {ruteAktif.statusRute === "berjalan" && (
                  <button
                    onClick={() => handleUpdateStatus(ruteAktif.id, "selesai")}
                    className="px-3.5 py-1.5 bg-brand-green hover:bg-brand-green/90 text-brand-dark rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Selesaikan Pengiriman
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabel Riwayat Rute VRP */}
      <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-brand-dark mb-4">
          Riwayat Komputasi Rute Armada (VRP CVRPTW)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-dark/10 text-brand-dark/60 font-bold uppercase text-[10px]">
                <th className="pb-3 px-4">Tanggal & Waktu</th>
                <th className="pb-3 px-4">Nomor Armada</th>
                <th className="pb-3 px-4">Total Titik Stop</th>
                <th className="pb-3 px-4">Jarak & Durasi</th>
                <th className="pb-3 px-4">Kepatuhan Termal</th>
                <th className="pb-3 px-4">Status Rute</th>
                <th className="pb-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5 font-semibold text-brand-dark">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-brand-dark/50">
                    Memuat riwayat rute...
                  </td>
                </tr>
              ) : listRute.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-brand-dark/50">
                    Belum ada riwayat rute VRP.
                  </td>
                </tr>
              ) : (
                listRute.map((r) => (
                  <tr key={r.id} className="hover:bg-brand-canvas/50">
                    <td className="py-3 px-4 font-mono">
                      {r.tanggal}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {r.armada?.nomorKendaraan || "-"} ({r.armada?.jenisKendaraan})
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {r.urutanSekolahJson?.length || 0} Sekolah
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {r.totalJarakKm} km &middot; {r.totalEstimasiMenit} mnt
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.totalEstimasiMenit <= 90
                            ? "bg-brand-green/20 text-brand-dark"
                            : "bg-red-100 text-red-900"
                        }`}
                      >
                        {r.totalEstimasiMenit <= 90 ? "HACCP Safe (<=90m)" : "Exceeds Limit"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.statusRute === "selesai"
                            ? "bg-brand-green/20 text-brand-dark"
                            : r.statusRute === "berjalan"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-blue-100 text-blue-900"
                        }`}
                      >
                        {r.statusRute.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {r.statusRute === "terencana" && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "berjalan")}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Jalan
                          </button>
                        )}
                        {r.statusRute === "berjalan" && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "selesai")}
                            className="px-2.5 py-1 bg-brand-green hover:bg-brand-green/90 text-brand-dark rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Selesai
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
