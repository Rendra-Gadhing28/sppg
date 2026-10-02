"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wifi,
} from "lucide-react";

interface WaLog {
  id: string;
  nomorTujuan: string;
  tipePesan: string;
  payload: string;
  status: "queued" | "terkirim" | "gagal";
  createdAt: string;
}

interface WaStats {
  totalPesan: number;
  terkirim: number;
  queued: number;
  gagal: number;
}

interface WaLogsTabProps {
  allBahan?: Array<{ id: string; namaBahan: string; satuanStandar: string }>;
  onRefreshAll?: () => void;
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const labelCls = "block text-[11px] font-bold text-brand-dark/80 mb-1";

const TEMPLATES: Record<string, { label: string; payload: string }> = {
  po_supplier: {
    label: "PO Supplier",
    payload: "Halo {nama_supplier}, PO #{nomor_po} untuk {tanggal_pengiriman} telah diterbitkan. Mohon konfirmasi penerimaan. Terima kasih. - Dapur SPPG",
  },
  reminder_shift: {
    label: "Reminder Shift Kerja",
    payload: "Pengingat: Shift pagi dimulai pukul 05.00 WIB. Harap hadir tepat waktu dan siap presensi via aplikasi. - Manajemen Dapur",
  },
  alert_stok: {
    label: "Alert Stok Menipis",
    payload: "ALERT STOK: Bahan {nama_bahan} tersisa {jumlah_stok} {satuan}, di bawah batas minimum. Segera lakukan pengadaan! - Sistem SPPG",
  },
  status_pengiriman: {
    label: "Status Pengiriman Kurir",
    payload: "Informasi: Pengiriman untuk {nama_sekolah} ({jumlah_porsi} porsi) sedang dalam perjalanan. Estimasi tiba {jam_tiba} WIB. - Kurir SPPG",
  },
};

export default function WaLogsTab({ onRefreshAll }: WaLogsTabProps) {
  const [waLogs, setWaLogs] = useState<WaLog[]>([]);
  const [stats, setStats] = useState<WaStats>({ totalPesan: 0, terkirim: 0, queued: 0, gagal: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form kirim / broadcast
  const [waNomor, setWaNomor] = useState("");
  const [waTemplate, setWaTemplate] = useState("po_supplier");
  const [waPayload, setWaPayload] = useState(TEMPLATES.po_supplier.payload);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/wa");
      if (res.ok) {
        const json = await res.json();
        setWaLogs(json.waLogs || []);
        setStats(json.stats || { totalPesan: 0, terkirim: 0, queued: 0, gagal: 0 });
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTemplateChange = (key: string) => {
    setWaTemplate(key);
    setWaPayload(TEMPLATES[key]?.payload || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/wa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorTujuan: waNomor,
          tipePesan: waTemplate,
          payload: waPayload,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengirim pesan WhatsApp.");
      showToast("success", `Pesan berhasil diantrekan ke ${waNomor}.`);
      setWaNomor("");
      fetchData();
      if (onRefreshAll) onRefreshAll();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusBadge = (status: WaLog["status"]) => {
    const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
      terkirim: { cls: "bg-emerald-100 text-emerald-900 border-emerald-300", icon: <CheckCircle2 className="w-3 h-3" />, label: "Terkirim" },
      queued: { cls: "bg-blue-100 text-blue-900 border-blue-300", icon: <Clock className="w-3 h-3" />, label: "Antrian" },
      gagal: { cls: "bg-red-100 text-red-900 border-red-300", icon: <AlertTriangle className="w-3 h-3" />, label: "Gagal" },
    };
    const s = map[status] || map.queued;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.cls}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm ${toast.type === "success" ? "bg-emerald-50 border border-emerald-300 text-emerald-900" : "bg-red-50 border border-red-300 text-red-900"}`}>
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center underline text-xs cursor-pointer">Tutup</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-white border border-brand-dark/15 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-pastel text-brand-dark mb-1">
            Fase 3: Notifikasi Otomatis
          </span>
          <h2 className="text-base font-bold text-brand-dark">Monitoring WhatsApp Gateway & Log Notifikasi</h2>
          <p className="text-xs text-brand-dark/70">Pantau antrean pesan keluar dan kirim notifikasi operasional melalui WhatsApp Gateway.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300">
          <Wifi className="w-3.5 h-3.5 text-emerald-700" />
          <span className="text-xs font-bold text-emerald-800">Gateway Online</span>
        </div>
      </div>

      {/* Statistik Antrean */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Pesan", value: stats.totalPesan, cls: "text-brand-dark", bg: "bg-white border-brand-dark/15" },
          { label: "Terkirim", value: stats.terkirim, cls: "text-emerald-700", bg: "bg-emerald-50 border-emerald-300" },
          { label: "Antrian", value: stats.queued, cls: "text-blue-700", bg: "bg-blue-50 border-blue-300" },
          { label: "Gagal", value: stats.gagal, cls: "text-red-700", bg: "bg-red-50 border-red-300" },
        ].map(m => (
          <div key={m.label} className={`p-4 rounded-2xl border shadow-sm ${m.bg}`}>
            <p className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wide">{m.label}</p>
            <p className={`text-3xl font-black tabular-nums mt-1 ${m.cls}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Kirim / Broadcast */}
        <div className="bg-white rounded-2xl border border-brand-dark/15 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-dark/10 flex items-center gap-2 bg-brand-canvas/60">
            <Send className="w-4 h-4 text-brand-dark" />
            <h3 className="font-bold text-sm text-brand-dark">Uji Kirim / Broadcast Simulasi</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            <div>
              <label className={labelCls}>Template Notifikasi *</label>
              <select value={waTemplate} onChange={e => handleTemplateChange(e.target.value)} className={selectCls}>
                {Object.entries(TEMPLATES).map(([key, t]) => (
                  <option key={key} value={key}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Nomor Tujuan (WhatsApp) *</label>
              <input
                type="tel"
                value={waNomor}
                onChange={e => setWaNomor(e.target.value)}
                className={inputCls}
                placeholder="628123456789 (tanpa +)"
                required
              />
              <p className="text-[10px] text-brand-dark/50 mt-1">Format: 62 + nomor tanpa angka 0 di depan.</p>
            </div>
            <div>
              <label className={labelCls}>Isi Pesan / Payload</label>
              <textarea
                rows={5}
                value={waPayload}
                onChange={e => setWaPayload(e.target.value)}
                className={`${inputCls} resize-none`}
                placeholder="Isi pesan yang akan dikirim..."
              />
              <p className="text-[10px] text-brand-dark/50 mt-1">Ganti placeholder (&#123;nama_supplier&#125;, dll.) sebelum kirim.</p>
            </div>
            <button type="submit" disabled={isSubmitting || !waNomor} className="w-full h-10 rounded-xl bg-brand-dark text-white font-bold text-xs hover:bg-brand-dark/90 active:scale-95 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "Mengirim..." : "KIRIM PESAN WA"}
            </button>
          </form>
        </div>

        {/* Tabel Log */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-dark/15 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-dark/10 flex items-center justify-between bg-brand-canvas/60">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-dark" />
              <h3 className="font-bold text-sm text-brand-dark">Riwayat Log WhatsApp</h3>
            </div>
            <span className="text-xs text-brand-dark/60 font-semibold">{waLogs.length} pesan</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-canvas/80 text-brand-dark/80 font-bold border-b border-brand-dark/10">
                <tr>
                  <th className="px-5 py-3.5">Nomor Tujuan</th>
                  <th className="px-5 py-3.5">Tipe Pesan</th>
                  <th className="px-5 py-3.5">Preview Payload</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/10">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-brand-dark/60">Memuat log pesan...</td></tr>
                ) : waLogs.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-brand-dark/60">Belum ada riwayat pesan WhatsApp.</td></tr>
                ) : (
                  waLogs.map(w => (
                    <tr key={w.id} className="hover:bg-brand-canvas/40 transition">
                      <td className="px-5 py-4 font-mono font-bold text-brand-dark">{w.nomorTujuan}</td>
                      <td className="px-5 py-4">
                        <span className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold bg-brand-dark/5 text-brand-dark border border-brand-dark/10">
                          {TEMPLATES[w.tipePesan]?.label || w.tipePesan}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-brand-dark/60 max-w-[200px]">
                        <span className="line-clamp-2 leading-relaxed">{w.payload}</span>
                      </td>
                      <td className="px-5 py-4">{statusBadge(w.status)}</td>
                      <td className="px-5 py-4 tabular-nums text-brand-dark/60 whitespace-nowrap">
                        {new Date(w.createdAt).toLocaleString("id-ID", {
                          day: "2-digit", month: "short",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
