"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Thermometer,
  ShieldCheck,
  AlertOctagon,
  Activity,
  Plus,
  RefreshCw,
  Send,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface TelemetriItem {
  id: number;
  waktuRekam: string;
  suhuCelsius: string;
  kelembapanPersen: string | null;
  latitude: string | null;
  longitude: string | null;
  isAnomaliHaccp: boolean;
}

interface DeviceItem {
  id: string;
  kodeAlat: string;
  tipePenempatan: "chiller_dapur" | "freezer_dapur" | "boks_armada";
  ambangSuhuMin: string;
  ambangSuhuMax: string;
  statusAktif: boolean;
  dapur?: { namaDapur: string } | null;
  armada?: { nomorKendaraan: string } | null;
  telemetriList: TelemetriItem[];
}

interface SkorKepatuhan {
  totalData: number;
  totalLolos: number;
  totalAnomali: number;
  persentaseKepatuhan: number;
  gradeKepatuhan: "A_SANGAT_BAIK" | "B_BAIK" | "C_PERLU_PERBAIKAN" | "D_KRITIS";
}

interface IotTabProps {
  onRefreshAll?: () => void;
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const labelCls = "block text-[11px] font-bold text-brand-dark/80 mb-1";

export default function IotTab({ onRefreshAll }: IotTabProps) {
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [skor, setSkor] = useState<SkorKepatuhan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Ingest form state
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [inputSuhu, setInputSuhu] = useState<string>("3.5");
  const [inputKelembapan, setInputKelembapan] = useState<string>("70");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/iot");
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
        setSkor(data.skorKepatuhan || null);
        if (data.devices?.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(data.devices[0].id);
        }
      }
    } catch {
      setToast({ type: "error", message: "Gagal memuat telemetri IoT." });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendTelemetri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceId) return;

    try {
      setIsSending(true);
      const res = await fetch("/api/iot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: selectedDeviceId,
          suhuCelsius: parseFloat(inputSuhu),
          kelembapanPersen: parseFloat(inputKelembapan),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal kirim telemetri");

      const statusMsg = data.evaluasiHaccp.isAnomaliHaccp
        ? `PERINGATAN: ${data.evaluasiHaccp.keterangan}`
        : `Normal: ${data.evaluasiHaccp.keterangan}`;

      setToast({
        type: data.evaluasiHaccp.isAnomaliHaccp ? "error" : "success",
        message: statusMsg,
      });

      fetchData();
      onRefreshAll?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsSending(false);
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

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Skor Kepatuhan HACCP
            </div>
            <div className="text-2xl font-black text-brand-dark mt-0.5">
              {skor?.persentaseKepatuhan ?? 100}%
            </div>
            <div className="text-[10px] text-brand-dark/60">
              Grade {skor?.gradeKepatuhan ? skor.gradeKepatuhan.replace(/_/g, " ") : "A SANGAT BAIK"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Sensor IoT Terpasang
            </div>
            <div className="text-2xl font-black text-brand-dark mt-0.5">
              {devices.length} Unit
            </div>
            <div className="text-[10px] text-brand-dark/60">Chiller, Freezer, & Armada</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-gold/20 text-brand-dark flex items-center justify-center font-bold">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Total Pelanggaran Suhu
            </div>
            <div className="text-2xl font-black text-brand-dark mt-0.5">
              {skor?.totalAnomali ?? 0} Kali
            </div>
            <div className="text-[10px] text-brand-dark/60">
              Dari {skor?.totalData ?? 0} rekam telemetri
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Status Sensor & Simulator Ingest Telemetri */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulator Ingest Telemetri */}
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-brand-dark/10">
            <div className="w-9 h-9 rounded-xl bg-cyan-700 text-white flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-dark">Simulator Sensor IoT</h3>
              <p className="text-xs text-brand-dark/60">Pengujian telemetri suhu & HACCP</p>
            </div>
          </div>

          <form onSubmit={handleSendTelemetri} className="space-y-4">
            <div>
              <label className={labelCls}>Pilih Perangkat Sensor</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className={selectCls}
                required
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.kodeAlat} &middot; {d.tipePenempatan.replace(/_/g, " ").toUpperCase()} (
                    {d.dapur?.namaDapur || d.armada?.nomorKendaraan || "Alat"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Suhu Terbaca (&deg;C)</label>
              <input
                type="number"
                step="0.1"
                required
                value={inputSuhu}
                onChange={(e) => setInputSuhu(e.target.value)}
                className={inputCls}
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setInputSuhu("3.2")}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-brand-dark rounded text-[10px] font-bold"
                >
                  Chiller Normal (3.2&deg;C)
                </button>
                <button
                  type="button"
                  onClick={() => setInputSuhu("-19.5")}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-brand-dark rounded text-[10px] font-bold"
                >
                  Freezer Normal (-19.5&deg;C)
                </button>
                <button
                  type="button"
                  onClick={() => setInputSuhu("64.5")}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-brand-dark rounded text-[10px] font-bold"
                >
                  Boks Hangat (64.5&deg;C)
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>Kelembapan (%)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={inputKelembapan}
                onChange={(e) => setInputKelembapan(e.target.value)}
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 px-4 bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
              {isSending ? "Merekam Telemetri..." : "Kirim Data Telemetri"}
            </button>
          </form>
        </div>

        {/* Live Device Monitor Cards */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-brand-dark/10 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-green/30 text-brand-dark flex items-center justify-center font-bold">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-brand-dark">Status Sensor Realtime</h3>
                <p className="text-xs text-brand-dark/60">Cold-chain chiller, freezer, dan boks armada</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="p-2 hover:bg-brand-canvas rounded-xl transition text-brand-dark/70 hover:text-brand-dark cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => {
              const lastTelemetri = device.telemetriList?.[0];
              const suhu = lastTelemetri ? parseFloat(lastTelemetri.suhuCelsius) : null;
              const isAnomali = lastTelemetri?.isAnomaliHaccp ?? false;

              return (
                <div
                  key={device.id}
                  className={`p-4 rounded-2xl border transition ${
                    isAnomali
                      ? "bg-red-50/50 border-red-300"
                      : "bg-white border-brand-dark/10 hover:border-brand-dark/20 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-brand-dark text-white uppercase">
                      {device.kodeAlat}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isAnomali
                          ? "bg-red-100 text-red-800"
                          : "bg-brand-green/30 text-brand-dark"
                      }`}
                    >
                      {isAnomali ? "ANOMALI HACCP" : "SUHU NORMAL"}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <div className="text-2xl font-black text-brand-dark font-mono">
                        {suhu != null ? `${suhu.toFixed(1)}°C` : "N/A"}
                      </div>
                      <div className="text-[11px] text-brand-dark/60 font-semibold mt-0.5">
                        {device.tipePenempatan.replace(/_/g, " ").toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-brand-dark/50">Batas Standar:</div>
                      <div className="text-xs font-bold font-mono text-brand-dark">
                        {device.ambangSuhuMin}&deg;C s/d {device.ambangSuhuMax}&deg;C
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-brand-dark/10 flex items-center justify-between text-[10px] text-brand-dark/60">
                    <span>Lokasi: <b>{device.dapur?.namaDapur || device.armada?.nomorKendaraan || "Pusat"}</b></span>
                    <span>
                      {lastTelemetri
                        ? new Date(lastTelemetri.waktuRekam).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabel Log Telemetri Terkini */}
      <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-brand-dark mb-4">
          Buku Log Telemetri Sensor & Verifikasi Sanitasi HACCP
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-dark/10 text-brand-dark/60 font-bold uppercase text-[10px]">
                <th className="pb-3 px-4">Waktu Rekam</th>
                <th className="pb-3 px-4">Sensor / Alat</th>
                <th className="pb-3 px-4">Tipe Penempatan</th>
                <th className="pb-3 px-4">Suhu Terbaca</th>
                <th className="pb-3 px-4">Kelembapan</th>
                <th className="pb-3 px-4">Status HACCP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5 font-semibold text-brand-dark">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-brand-dark/50">
                    Memuat log telemetri...
                  </td>
                </tr>
              ) : devices.flatMap((d) => d.telemetriList).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-brand-dark/50">
                    Belum ada log telemetri suhu terekam.
                  </td>
                </tr>
              ) : (
                devices.flatMap((d) =>
                  (d.telemetriList || []).map((t) => ({ ...t, device: d }))
                ).slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-brand-canvas/50">
                    <td className="py-3 px-4 font-mono">
                      {new Date(log.waktuRekam).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 font-bold">{log.device.kodeAlat}</td>
                    <td className="py-3 px-4 uppercase text-[10px]">
                      {log.device.tipePenempatan.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sm">
                      {log.suhuCelsius}&deg;C
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {log.kelembapanPersen ? `${log.kelembapanPersen}%` : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          log.isAnomaliHaccp
                            ? "bg-red-100 text-red-900"
                            : "bg-brand-green/20 text-brand-dark"
                        }`}
                      >
                        {log.isAnomaliHaccp ? "ANOMALI KRITIS" : "LOLOS SANITASI"}
                      </span>
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
