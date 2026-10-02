"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Truck,
  Users,
  Package,
} from "lucide-react";

interface WaLog {
  id: string;
  nomorTujuan: string;
  tipePesan: "po_supplier" | "reminder_shift" | "alert_stok" | "status_kirim";
  payloadPesan: string;
  status: "queued" | "sent" | "delivered" | "failed";
  externalMessageId: string | null;
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
}

interface WaTabProps {
  onRefreshAll?: () => void;
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const labelCls = "block text-[11px] font-bold text-brand-dark/80 mb-1";

export default function WaTab({ onRefreshAll }: WaTabProps) {
  const [logs, setLogs] = useState<WaLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State: Kirim Pesan / Broadcast Simulator
  const [nomorTujuan, setNomorTujuan] = useState("6281211223344");
  const [tipePesan, setTipePesan] = useState<"po_supplier" | "reminder_shift" | "alert_stok" | "status_kirim">(
    "alert_stok"
  );
  const [payloadPesan, setPayloadPesan] = useState(
    "[ALERT STOK SPPG] Stok Beras Premium tersisa 180 kg (di bawah batas minimum 200 kg). Harap segera ajukan Purchase Order."
  );

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/wa");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      setToast({ type: "error", message: "Gagal memuat log WhatsApp Gateway." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Set template shortcut saat tipe pesan diubah
  const handleTipeChange = (type: typeof tipePesan) => {
    setTipePesan(type);
    if (type === "po_supplier") {
      setNomorTujuan("6281211223344");
      setPayloadPesan(
        "Yth. Supplier CV Tani Makmur Sentosa, PO-20261002-0001 telah diterbitkan untuk 50 kg Beras Premium. Mohon konfirmasi jadwal kirim."
      );
    } else if (type === "reminder_shift") {
      setNomorTujuan("6281233445566");
      setPayloadPesan(
        "Halo Budi Santoso, pengingat shift Pagi Dapur SPPG hari ini dimulai pukul 05:00 WIB. Harap hadir tepat waktu dan lakukan presensi selfie."
      );
    } else if (type === "alert_stok") {
      setNomorTujuan("6281298765432");
      setPayloadPesan(
        "[ALERT STOK SPPG] Stok Beras Premium tersisa 180 kg (di bawah batas minimum 200 kg). Harap segera ajukan Purchase Order."
      );
    } else if (type === "status_kirim") {
      setNomorTujuan("6281244556677");
      setPayloadPesan(
        "Makanan bergizi untuk SDN 01 Merdeka sedang dalam perjalanan bersama Driver Joko (Plat: B 9142 SPG). Estimasi tiba: 09:30 WIB."
      );
    }
  };

  const handleKirimPesan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/wa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorTujuan,
          tipePesan,
          payloadPesan,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengirim pesan");

      setToast({
        type: "success",
        message: `Pesan WhatsApp (${tipePesan}) berhasil diantrekan ke ${nomorTujuan}.`,
      });
      fetchLogs();
      onRefreshAll?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    }
  };

  const sentCount = logs.filter((l) => l.status === "sent" || l.status === "delivered").length;
  const queuedCount = logs.filter((l) => l.status === "queued").length;

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
          <div className="w-12 h-12 rounded-xl bg-brand-green/20 text-brand-dark flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Total Log Gateway
            </div>
            <div className="text-2xl font-black text-brand-dark mt-0.5">
              {logs.length} Pesan
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-pastel/30 text-brand-dark flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Terkirim & Diterima
            </div>
            <div className="text-2xl font-black text-brand-dark mt-0.5">
              {sentCount} Notifikasi
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-gold/20 text-brand-dark flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Antrean Outbox (Queue)
            </div>
            <div className="text-2xl font-black text-brand-dark mt-0.5">
              {queuedCount} Antrean
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Simulator Pengiriman & Panduan Omnichannel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Simulator Gateway */}
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-brand-dark/10">
            <div className="w-9 h-9 rounded-xl bg-brand-green text-brand-dark flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-dark">Simulator WhatsApp Gateway</h3>
              <p className="text-xs text-brand-dark/60">Uji coba kirim pesan otomatis ke supplier, tim, atau sekolah</p>
            </div>
          </div>

          <form onSubmit={handleKirimPesan} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tipe Pesan Notifikasi</label>
                <select
                  value={tipePesan}
                  onChange={(e) => handleTipeChange(e.target.value as typeof tipePesan)}
                  className={selectCls}
                >
                  <option value="alert_stok">Alert Stok Kritis & Expiry</option>
                  <option value="po_supplier">Notifikasi PO ke Supplier</option>
                  <option value="reminder_shift">Pengingat Shift Pekerja</option>
                  <option value="status_kirim">Status Armada ke PIC Sekolah</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Nomor WhatsApp Tujuan</label>
                <input
                  type="text"
                  required
                  placeholder="62812xxxxxxx"
                  value={nomorTujuan}
                  onChange={(e) => setNomorTujuan(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Isi Teks Pesan Notifikasi</label>
              <textarea
                required
                rows={4}
                value={payloadPesan}
                onChange={(e) => setPayloadPesan(e.target.value)}
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-brand-green hover:bg-brand-green/90 text-brand-dark rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" /> Antrekan Pesan ke WhatsApp Gateway
            </button>
          </form>
        </div>

        {/* Panel Informasi Skenario Notifikasi Otomatis */}
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-brand-dark/10">
              <div className="w-9 h-9 rounded-xl bg-brand-pastel/40 text-brand-dark flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-brand-dark">Skenario Otomasi WhatsApp Gateway</h3>
                <p className="text-xs text-brand-dark/60">Integrasi pesan tanpa keterlambatan informasi operasional</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-brand-dark/80">
              <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/5">
                <div className="font-extrabold text-brand-dark flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-brand-dark" />
                  <span>1. Auto-Notif PO ke Supplier Rekanan</span>
                </div>
                <p className="text-brand-dark/70 text-[11px] leading-relaxed">
                  Saat status PO diubah menjadi `dikirim`, sistem otomatis mengirim rincian bahan dan tanggal target ke nomor WA supplier.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/5">
                <div className="font-extrabold text-brand-dark flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-brand-dark" />
                  <span>2. Blast Pengingat Shift Harian (05.00 Pagi)</span>
                </div>
                <p className="text-brand-dark/70 text-[11px] leading-relaxed">
                  Pekerja dapur yang dijadwalkan masuk menerima notifikasi personal untuk meminimalkan keterlambatan persiapan masak.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-canvas border border-brand-dark/5">
                <div className="font-extrabold text-brand-dark flex items-center gap-2 mb-1">
                  <Truck className="w-4 h-4 text-brand-dark" />
                  <span>3. ETA & Tracking Armada ke Sekolah</span>
                </div>
                <p className="text-brand-dark/70 text-[11px] leading-relaxed">
                  Saat driver menekan `Mulai Kirim`, PIC Sekolah menerima pesan plat mobil, nama driver, dan estimasi jam tiba.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-brand-green/20 border border-brand-green/40 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-dark shrink-0" />
            <div className="text-[11px] font-bold text-brand-dark">
              Status Server Gateway: Terhubung Aktif (Queue Worker Mock)
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Log Pesan WhatsApp Keluar */}
      <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-brand-dark mb-4">
          Audit Log Pesan WhatsApp Gateway Keluar
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-dark/10 text-brand-dark/60 font-bold uppercase text-[10px]">
                <th className="pb-3 px-4">Waktu Buat</th>
                <th className="pb-3 px-4">Nomor Tujuan</th>
                <th className="pb-3 px-4">Tipe Notifikasi</th>
                <th className="pb-3 px-4">Isi Pesan</th>
                <th className="pb-3 px-4">Status Pengiriman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5 font-semibold text-brand-dark">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-brand-dark/50">
                    Memuat log pesan...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-brand-dark/50">
                    Belum ada log pesan WhatsApp tercatat.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-brand-canvas/50">
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {new Date(l.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{l.nomorTujuan}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-pastel/40 text-brand-dark">
                        {l.tipePesan.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-dark/80 text-[11px] max-w-md truncate">
                      {l.payloadPesan}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          l.status === "delivered" || l.status === "sent"
                            ? "bg-brand-green/20 text-brand-dark"
                            : l.status === "queued"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-red-100 text-red-900"
                        }`}
                      >
                        {l.status === "delivered" || l.status === "sent" ? (
                          <CheckCircle2 className="w-3 h-3 text-brand-dark" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {l.status.toUpperCase()}
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
