"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  FileCheck,
  ShieldCheck,
  QrCode,
  Download,
  ExternalLink,
  Plus,
  Hash,
  CheckCircle2,
  Award,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  nomorDokumen: string;
  periodeMulai: string;
  periodeSelesai: string;
  totalPorsiTersaji: number;
  rerataKaloriTercapai: string;
  skorKepatuhanHaccp: string;
  dokumenPdfUrl: string;
  checksumSha256: string;
  qrVerifikasiUrl: string;
  createdAt: string;
  dapur?: {
    namaDapur: string;
    tipeDapur?: string;
    tipe?: string;
  } | null;
}

interface DapurOption {
  id: string;
  namaDapur: string;
  tipeDapur?: string;
  tipe?: string;
}

interface BgnTabProps {
  onRefreshAll?: () => void;
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const labelCls = "block text-[11px] font-bold text-brand-dark/80 mb-1";

export default function BgnTab({ onRefreshAll }: BgnTabProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [daftarDapur, setDaftarDapur] = useState<DapurOption[]>([]);
  const [badanPengawas, setBadanPengawas] = useState<string>("");
  const [statusSertifikasi, setStatusSertifikasi] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [dapurId, setDapurId] = useState<string>("");
  const [periodeMulai, setPeriodeMulai] = useState<string>("2026-10-01");
  const [periodeSelesai, setPeriodeSelesai] = useState<string>("2026-10-31");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/bgn");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.auditLogs || []);
        setDaftarDapur(data.daftarDapur || []);
        setBadanPengawas(data.badanPengawas || "Badan Gizi Nasional RI");
        setStatusSertifikasi(data.statusSertifikasi || "TERVERIFIKASI_HACCP_GRADE_A");
        if (data.daftarDapur?.length > 0 && !dapurId) {
          setDapurId(data.daftarDapur[0].id);
        }
      }
    } catch {
      setToast({ type: "error", message: "Gagal memuat portal BGN." });
    } finally {
      setIsLoading(false);
    }
  }, [dapurId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dapurId) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/bgn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dapurId,
          periodeMulai,
          periodeSelesai,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menerbitkan laporan audit BGN");

      setToast({
        type: "success",
        message: `Laporan resmi BGN nomor ${data.laporan.nomorDokumen} berhasil diterbitkan dengan tanda tangan digital SHA-256!`,
      });

      fetchData();
      onRefreshAll?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsSubmitting(false);
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
          <div className="w-12 h-12 rounded-xl bg-brand-green/20 text-brand-dark flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Status Sertifikasi Higiene
            </div>
            <div className="text-lg font-black text-brand-dark mt-0.5">
              HACCP Grade A
            </div>
            <div className="text-[10px] text-brand-dark/60">{badanPengawas}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Dokumen Audit Terbit
            </div>
            <div className="text-2xl font-black text-brand-dark mt-0.5">
              {auditLogs.length} Laporan
            </div>
            <div className="text-[10px] text-brand-dark/60">Tervalidasi Hash SHA-256</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-dark/10 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-gold/20 text-brand-dark flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider">
              Transparansi Publik
            </div>
            <div className="text-lg font-black text-brand-dark mt-0.5">
              100% Terbuka
            </div>
            <div className="text-[10px] text-brand-dark/60">Verifikasi QR Code BGN</div>
          </div>
        </div>
      </div>

      {/* Grid: Form Penerbitan Audit & Banner BGN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Penerbitan Dokumen Audit BGN */}
        <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-brand-dark/10">
            <div className="w-9 h-9 rounded-xl bg-brand-dark text-white flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-dark">Terbitkan Audit Baru</h3>
              <p className="text-xs text-brand-dark/60">Pengesahan dokumen resmi BGN</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Pilih Unit Dapur Cabang</label>
              <select
                value={dapurId}
                onChange={(e) => setDapurId(e.target.value)}
                className={selectCls}
                required
              >
                {daftarDapur.map((d) => {
                  const tipeText = (d.tipeDapur || d.tipe || "").toUpperCase();
                  return (
                    <option key={d.id} value={d.id}>
                      {d.namaDapur} {tipeText ? `(${tipeText})` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Periode Mulai</label>
                <input
                  type="date"
                  value={periodeMulai}
                  onChange={(e) => setPeriodeMulai(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Periode Selesai</label>
                <input
                  type="date"
                  value={periodeSelesai}
                  onChange={(e) => setPeriodeSelesai(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-brand-canvas rounded-xl border border-brand-dark/10 text-[11px] text-brand-dark/70 space-y-1">
              <div className="font-bold text-brand-dark">Klausul Audit Resmi:</div>
              <div>&bull; Rekapitulasi porsi terdistribusi aktual</div>
              <div>&bull; Akumulasi pemenuhan kalori rata-rata</div>
              <div>&bull; Catatan audit sanitasi HACCP dan telemetri suhu</div>
              <div>&bull; Enkripsi SHA-256 untuk proteksi integritas dokumen</div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-brand-dark hover:bg-brand-dark/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md"
            >
              <FileCheck className="w-4 h-4" />
              {isSubmitting ? "Menerbitkan Laporan Resmi..." : "Terbitkan Laporan Audit BGN"}
            </button>
          </form>
        </div>

        {/* Portal Info & Pedoman Pengawasan */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-brand-dark/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-green/30 text-brand-dark flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-dark">Portal Pengawasan Eksternal</h3>
                  <p className="text-xs text-brand-dark/60">Badan Gizi Nasional (BGN) & Dinas Kesehatan</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-brand-green/20 text-brand-dark text-xs font-bold rounded-full border border-brand-green/40 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-dark" /> Terakreditasi
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-brand-canvas border border-brand-dark/10 text-xs text-brand-dark/80 leading-relaxed">
                Portal ini dibuka khusus sebagai kanal audit pihak ketiga bagi Badan Gizi Nasional (BGN),
                Inspektorat Jenderal, dan Dinas Kesehatan setempat guna memverifikasi kepatuhan operasional
                dapur SPPG. Seluruh berkas PDF dilindungi oleh tanda tangan kriptografi <b>SHA-256</b> dan
                dapat diverifikasi seketika via pemindaian kode QR di lapangan.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-brand-dark/10 bg-white">
                  <div className="text-[11px] font-bold text-brand-dark/60 uppercase">Standar AKG BGN</div>
                  <div className="text-base font-black text-brand-dark mt-1">Toleransi &plusmn;10%</div>
                  <p className="text-[10px] text-brand-dark/60 mt-1">
                    PAUD 350-450 kkal &middot; SD 500-650 kkal &middot; SMP/SMA 700-850 kkal.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-brand-dark/10 bg-white">
                  <div className="text-[11px] font-bold text-brand-dark/60 uppercase">Ambang Kritis HACCP</div>
                  <div className="text-base font-black text-brand-dark mt-1">Max 90 Mnt Termal</div>
                  <p className="text-[10px] text-brand-dark/60 mt-1">
                    Suhu makanan hangat &gt;60&deg;C &middot; Chiller 0-4&deg;C &middot; Freezer &le;-18&deg;C.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-brand-dark/10 flex items-center justify-between text-xs text-brand-dark/60">
            <span>Standar Peraturan Presiden No. 83 Tahun 2024 tentang Badan Gizi Nasional</span>
            <span className="font-bold text-brand-dark">Versi Sistem: SPPG v4.0</span>
          </div>
        </div>
      </div>

      {/* Tabel Daftar Laporan Audit Resmi */}
      <div className="bg-white rounded-2xl border border-brand-dark/10 p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-brand-dark mb-4">
          Buku Besar Berkas Audit Resmi BGN & Verifikasi Checksum SHA-256
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-dark/10 text-brand-dark/60 font-bold uppercase text-[10px]">
                <th className="pb-3 px-4">Nomor Dokumen</th>
                <th className="pb-3 px-4">Unit Dapur</th>
                <th className="pb-3 px-4">Periode Audit</th>
                <th className="pb-3 px-4">Total Porsi</th>
                <th className="pb-3 px-4">Rerata Kalori</th>
                <th className="pb-3 px-4">Skor HACCP</th>
                <th className="pb-3 px-4">Integritas Hash (SHA-256)</th>
                <th className="pb-3 px-4">Verifikasi QR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5 font-semibold text-brand-dark">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-brand-dark/50">
                    Memuat dokumen audit...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-brand-dark/50">
                    Belum ada dokumen audit resmi yang diterbitkan.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-canvas/50">
                    <td className="py-3 px-4 font-mono font-bold text-brand-dark">
                      {log.nomorDokumen}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {log.dapur?.namaDapur || "Dapur Pusat"}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {log.periodeMulai} s/d {log.periodeSelesai}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {log.totalPorsiTersaji.toLocaleString("id-ID")} Porsi
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {log.rerataKaloriTercapai} kkal
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {log.skorKepatuhanHaccp}%
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-brand-dark/60">
                      <span className="truncate block max-w-[120px]" title={log.checksumSha256}>
                        {log.checksumSha256.substring(0, 16)}...
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={log.qrVerifikasiUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-800 hover:bg-blue-100 transition"
                      >
                        <QrCode className="w-3 h-3" /> Verifikasi
                      </a>
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
