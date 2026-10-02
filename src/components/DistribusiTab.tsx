"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Plus,
  School,
  FileText,
  Smartphone,
  Eye,
} from "lucide-react";

interface ArmadaItem {
  id: string;
  nomorKendaraan: string;
  jenisKendaraan: string;
  kapasitasPorsi: number;
  status: string;
}

interface SerahTerimaSekolahItem {
  id: string;
  sekolahId: string;
  porsiKirim: number;
  porsiDiterima: number;
  statusSerahTerima: string;
  waktuDiterima: string | null;
  namaPenerimaSekolah: string | null;
  kontakPenerimaSekolah: string | null;
  fotoSerahTerimaUrl: string | null;
  ttdDigitalUrl: string | null;
  kondisiMakanan: string;
  catatan: string | null;
  sekolah: {
    namaSekolah: string;
    alamat: string;
    picNama: string;
    picKontak: string;
  };
}

interface DistribusiItem {
  id: string;
  nomorSuratJalan: string;
  tanggal: string;
  status: string;
  jamBerangkat: string | null;
  jamSelesai: string | null;
  catatan: string | null;
  armada: {
    nomorKendaraan: string;
    jenisKendaraan: string;
  } | null;
  jadwalMenu: {
    menu: {
      namaMenu: string;
    };
  } | null;
  serahTerimaList: SerahTerimaSekolahItem[];
}

interface DistribusiTabProps {
  sekolahList: Array<{ id: string; namaSekolah: string; jumlahPorsiTarget: number }>;
  jadwalId?: string;
  onRefreshAll?: () => void;
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/50 focus:border-brand-dark transition";
const labelCls = "block text-[11px] font-bold text-brand-dark/80 mb-1";

export default function DistribusiTab({
  sekolahList,
  jadwalId,
  onRefreshAll,
}: DistribusiTabProps) {
  const [armadaList, setArmadaList] = useState<ArmadaItem[]>([]);
  const [distribusiList, setDistribusiList] = useState<DistribusiItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal Bukti Serah Terima
  const [activeBukti, setActiveBukti] = useState<SerahTerimaSekolahItem | null>(null);

  // Form State: Armada Baru
  const [platNomor, setPlatNomor] = useState<string>("");
  const [jenisKendaraan, setJenisKendaraan] = useState<string>("Mobil Box Termal MBG");
  const [kapasitas, setKapasitas] = useState<string>("1500");
  const [isSubmittingArmada, setIsSubmittingArmada] = useState<boolean>(false);

  // Form State: Surat Jalan Baru
  const [selectedArmadaId, setSelectedArmadaId] = useState<string>("");
  const [catatanSuratJalan, setCatatanSuratJalan] = useState<string>("");
  const [alokasiSekolah, setAlokasiSekolah] = useState<
    Array<{ sekolahId: string; porsiKirim: number }>
  >([]);
  const [isSubmittingSuratJalan, setIsSubmittingSuratJalan] = useState<boolean>(false);

  const fetchDistribusiData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resArmada, resDist] = await Promise.all([
        fetch("/api/armada"),
        fetch("/api/distribusi"),
      ]);

      if (resArmada.ok) {
        const json = await resArmada.json();
        setArmadaList(json.daftarArmada || []);
        if (json.daftarArmada && json.daftarArmada.length > 0 && !selectedArmadaId) {
          setSelectedArmadaId(json.daftarArmada[0].id);
        }
      }

      if (resDist.ok) {
        const json = await resDist.json();
        setDistribusiList(json.daftarDistribusi || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [selectedArmadaId]);

  useEffect(() => {
    fetchDistribusiData();
  }, [fetchDistribusiData]);

  // Sync sekolah list to alokasi state
  useEffect(() => {
    if (sekolahList.length > 0 && alokasiSekolah.length === 0) {
      setAlokasiSekolah(
        sekolahList.map((s) => ({
          sekolahId: s.id,
          porsiKirim: s.jumlahPorsiTarget,
        }))
      );
    }
  }, [sekolahList, alokasiSekolah.length]);

  // Submit Armada
  const handleSubmitArmada = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingArmada(true);
      const res = await fetch("/api/armada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorKendaraan: platNomor,
          jenisKendaraan,
          kapasitasPorsi: Number(kapasitas),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambah armada.");
      setToast({ type: "success", message: "Armada baru berhasil didaftarkan!" });
      setPlatNomor("");
      fetchDistribusiData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsSubmittingArmada(false);
    }
  };

  // Submit Surat Jalan Distribusi
  const handleSubmitSuratJalan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jadwalId) {
      setToast({ type: "error", message: "Belum ada jadwal menu aktif hari ini untuk dikirim." });
      return;
    }
    if (!selectedArmadaId) {
      setToast({ type: "error", message: "Pilih armada kendaraan pengiriman." });
      return;
    }

    try {
      setIsSubmittingSuratJalan(true);
      const res = await fetch("/api/distribusi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jadwalMenuId: jadwalId,
          armadaId: selectedArmadaId,
          catatan: catatanSuratJalan,
          alokasiSekolah,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menerbitkan surat jalan.");

      setToast({ type: "success", message: "Surat Jalan distribusi berhasil diterbitkan!" });
      setCatatanSuratJalan("");
      fetchDistribusiData();
      if (onRefreshAll) onRefreshAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setToast({ type: "error", message: msg });
    } finally {
      setIsSubmittingSuratJalan(false);
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
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/30 text-brand-dark mb-1">
            Fase 2: Distribusi Armada & Serah Terima Sekolah
          </span>
          <h2 className="text-base font-bold text-brand-dark">
            Pemantauan Armada Pengantaran & Bukti Tanda Terima Digital
          </h2>
          <p className="text-xs text-brand-dark/70">
            Kawal pengiriman makanan bergizi ke sekolah dengan pencatatan suhu termal, foto serah terima, dan tanda tangan digital.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/distribusi"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-dark text-white font-bold text-xs hover:bg-brand-dark/90 active:scale-95 transition shadow-sm"
          >
            <Smartphone className="w-4 h-4" /> Buka Portal Kurir HP <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Penerbitan Surat Jalan */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-dark/15 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-dark/10">
            <FileText className="w-4 h-4 text-brand-dark" />
            <h3 className="font-bold text-sm text-brand-dark">Terbitkan Surat Jalan Distribusi Hari Ini</h3>
          </div>

          <form onSubmit={handleSubmitSuratJalan} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Pilih Armada Pengiriman *</label>
                <select
                  value={selectedArmadaId}
                  onChange={(e) => setSelectedArmadaId(e.target.value)}
                  className={selectCls}
                  required
                >
                  {armadaList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nomorKendaraan} — {a.jenisKendaraan} (Maks {a.kapasitasPorsi} Porsi)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Catatan Rute / Instruksi Pengantaran</label>
                <input
                  type="text"
                  placeholder="Contoh: Rute Wilayah Selatan, pastikan boks termal tertutup rapat"
                  value={catatanSuratJalan}
                  onChange={(e) => setCatatanSuratJalan(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Alokasi Sekolah */}
            <div>
              <label className={labelCls}>Alokasi Target Porsi Tiap Sekolah Tujuan *</label>
              <div className="space-y-2">
                {sekolahList.map((sch, idx) => (
                  <div
                    key={sch.id}
                    className="p-3 rounded-xl bg-brand-canvas/60 border border-brand-dark/10 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <p className="font-bold text-brand-dark">{sch.namaSekolah}</p>
                      <p className="text-[11px] text-brand-dark/60">
                        Standar Kuota: {sch.jumlahPorsiTarget} Porsi
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-brand-dark/70">Kirim:</span>
                      <input
                        type="number"
                        min="1"
                        value={
                          alokasiSekolah.find((a) => a.sekolahId === sch.id)?.porsiKirim ||
                          sch.jumlahPorsiTarget
                        }
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAlokasiSekolah((prev) =>
                            prev.map((item) =>
                              item.sekolahId === sch.id ? { ...item, porsiKirim: val } : item
                            )
                          );
                        }}
                        className="w-24 px-2.5 py-1.5 rounded-lg border border-brand-dark/20 text-center font-bold text-xs bg-white"
                      />
                      <span className="text-[11px] font-bold text-brand-dark">Porsi</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingSuratJalan || !jadwalId}
              className="w-full h-11 rounded-xl bg-brand-dark text-white font-bold text-xs hover:bg-brand-dark/90 active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSubmittingSuratJalan ? "Menerbitkan Surat Jalan..." : "TERBITKAN SURAT JALAN & BERANGKATKAN"}
            </button>
          </form>
        </div>

        {/* Form Tambah Armada Baru */}
        <div className="bg-white rounded-2xl border border-brand-dark/15 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-dark/10">
            <Truck className="w-4 h-4 text-brand-dark" />
            <h3 className="font-bold text-sm text-brand-dark">Daftarkan Armada Kendaraan</h3>
          </div>

          <form onSubmit={handleSubmitArmada} className="space-y-3">
            <div>
              <label className={labelCls}>Nomor Polisi / Plat Kendaraan *</label>
              <input
                type="text"
                placeholder="Contoh: B 9542 SPG"
                value={platNomor}
                onChange={(e) => setPlatNomor(e.target.value)}
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Jenis Kendaraan *</label>
              <input
                type="text"
                placeholder="Contoh: Mobil Box Termal MBG"
                value={jenisKendaraan}
                onChange={(e) => setJenisKendaraan(e.target.value)}
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Kapasitas Angkut Maksimal (Porsi) *</label>
              <input
                type="number"
                min="100"
                placeholder="Contoh: 1500"
                value={kapasitas}
                onChange={(e) => setKapasitas(e.target.value)}
                className={inputCls}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingArmada}
              className="w-full h-11 rounded-xl bg-brand-dark text-white font-bold text-xs hover:bg-brand-dark/90 active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSubmittingArmada ? "Menyimpan..." : "SIMPAN KENDARAAN BARU"}
            </button>
          </form>

          {/* List Armada Terdaftar */}
          <div className="pt-3 border-t border-brand-dark/10 space-y-2">
            <p className="text-[11px] font-bold text-brand-dark/70">Armada Tersedia:</p>
            {armadaList.map((arm) => (
              <div
                key={arm.id}
                className="p-2.5 rounded-lg bg-brand-canvas border border-brand-dark/10 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-brand-dark">{arm.nomorKendaraan}</p>
                  <p className="text-[10px] text-brand-dark/60">{arm.jenisKendaraan}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-pastel text-brand-dark">
                  {arm.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monitoring Pengiriman Aktif & Bukti Serah Terima */}
      <div className="bg-white rounded-2xl border border-brand-dark/15 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-dark/10 flex items-center justify-between bg-brand-canvas/60">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-dark" />
            <h3 className="font-bold text-sm text-brand-dark">
              Status Pengiriman & Bukti Serah Terima Sekolah
            </h3>
          </div>
          <span className="text-xs text-brand-dark/60 font-semibold">
            {distribusiList.length} Rute Pengiriman Terdata
          </span>
        </div>

        <div className="p-6 space-y-4">
          {isLoading ? (
            <p className="text-center py-6 text-xs text-brand-dark/60 font-medium">
              Memuat data pengiriman...
            </p>
          ) : distribusiList.length === 0 ? (
            <p className="text-center py-6 text-xs text-brand-dark/60 font-medium">
              Belum ada rute distribusi pengiriman yang diterbitkan.
            </p>
          ) : (
            distribusiList.map((dist) => (
              <div
                key={dist.id}
                className="p-4 rounded-xl border border-brand-dark/15 bg-brand-canvas/30 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-dark/10 pb-2.5">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand-dark">
                      {dist.nomorSuratJalan}
                    </span>
                    <p className="text-xs font-semibold text-brand-dark/80">
                      Armada: {dist.armada?.nomorKendaraan} ({dist.armada?.jenisKendaraan}) • Menu:{" "}
                      {dist.jadwalMenu?.menu?.namaMenu}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        dist.status === "selesai"
                          ? "bg-brand-green/20 text-brand-dark border-brand-green/40"
                          : "bg-blue-100 text-blue-900 border-blue-300"
                      }`}
                    >
                      {dist.status === "selesai" ? "Pengiriman Selesai" : "Dalam Perjalanan"}
                    </span>
                  </div>
                </div>

                {/* Grid Sekolah Tujuan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {dist.serahTerimaList.map((st) => {
                    const isDone = st.statusSerahTerima === "diterima";
                    return (
                      <div
                        key={st.id}
                        className={`p-3 rounded-xl border space-y-2 flex flex-col justify-between ${
                          isDone
                            ? "bg-white border-brand-green/40 shadow-xs"
                            : "bg-white/60 border-brand-dark/10"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-brand-dark">
                              {st.sekolah.namaSekolah}
                            </h4>
                            {isDone ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                Selesai
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                Menunggu
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-brand-dark/70 mt-1">
                            Kirim: <strong>{st.porsiKirim} Porsi</strong>
                          </p>
                          {isDone && (
                            <p className="text-[11px] text-brand-dark/60">
                              Diterima: {st.namaPenerimaSekolah} ({st.porsiDiterima} boks)
                            </p>
                          )}
                        </div>

                        {isDone && (
                          <button
                            type="button"
                            onClick={() => setActiveBukti(st)}
                            className="w-full h-8 rounded-lg bg-brand-pastel/30 hover:bg-brand-pastel text-brand-dark font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Lihat Bukti Foto & TTD
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Detail Bukti Foto & TTD Digital */}
      {activeBukti && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border-2 border-brand-dark shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-brand-dark text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-brand-pastel uppercase tracking-wide">
                  Bukti Serah Terima Makanan Bergizi
                </p>
                <h3 className="font-bold text-sm">{activeBukti.sekolah.namaSekolah}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveBukti(null)}
                className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-base flex items-center justify-center cursor-pointer"
                aria-label="Tutup bukti serah terima"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-brand-canvas text-[11px]">
                <div>
                  <span className="text-brand-dark/60 font-semibold">Nama PIC Penerima:</span>
                  <p className="font-bold text-brand-dark">{activeBukti.namaPenerimaSekolah}</p>
                </div>
                <div>
                  <span className="text-brand-dark/60 font-semibold">Jumlah Diterima:</span>
                  <p className="font-bold text-brand-dark">{activeBukti.porsiDiterima} Boks Makanan</p>
                </div>
                <div className="col-span-2 pt-1 border-t border-brand-dark/10">
                  <span className="text-brand-dark/60 font-semibold">Kondisi & Mutu:</span>
                  <p className="font-bold text-emerald-700 capitalize">
                    {activeBukti.kondisiMakanan.replace("_", " ")}
                  </p>
                </div>
              </div>

              {/* Tanda Tangan Digital */}
              <div>
                <p className="font-bold text-brand-dark mb-1">Tanda Tangan Digital Guru / PIC:</p>
                <div className="h-28 border border-brand-dark/20 rounded-xl bg-zinc-50 flex items-center justify-center overflow-hidden p-2">
                  {activeBukti.ttdDigitalUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeBukti.ttdDigitalUrl}
                      alt="Tanda Tangan Digital"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-zinc-400">Tidak ada tanda tangan</span>
                  )}
                </div>
              </div>

              {/* Foto Serah Terima */}
              <div>
                <p className="font-bold text-brand-dark mb-1">Dokumentasi Foto Serah Terima:</p>
                <div className="h-40 border border-brand-dark/20 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden">
                  {activeBukti.fotoSerahTerimaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeBukti.fotoSerahTerimaUrl}
                      alt="Dokumentasi Serah Terima"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-zinc-400">Tidak ada foto</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveBukti(null)}
                className="w-full h-10 rounded-xl bg-brand-dark text-white font-bold hover:bg-brand-dark/90 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
