"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  PenTool,
  AlertTriangle,
  RotateCcw,
  School,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Package,
} from "lucide-react";

interface SerahTerimaItem {
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
  kondisiMakanan: "baik_layak" | "kurang_hangat" | "kemasan_rusak";
  catatan: string | null;
  sekolah: {
    id: string;
    namaSekolah: string;
    alamat: string;
    picNama: string;
    picKontak: string;
    jamMakan: string;
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
    kapasitasPorsi: number;
  } | null;
  jadwalMenu: {
    menu: {
      namaMenu: string;
    };
  } | null;
  serahTerimaList: SerahTerimaItem[];
}

export default function DistribusiPage() {
  const [distribusiList, setDistribusiList] = useState<DistribusiItem[]>([]);
  const [selectedDistribusi, setSelectedDistribusi] = useState<DistribusiItem | null>(null);
  const [activeModalItem, setActiveModalItem] = useState<SerahTerimaItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State Serah Terima
  const [porsiDiterima, setPorsiDiterima] = useState<number>(0);
  const [namaPenerima, setNamaPenerima] = useState<string>("");
  const [kontakPenerima, setKontakPenerima] = useState<string>("");
  const [kondisi, setKondisi] = useState<"baik_layak" | "kurang_hangat" | "kemasan_rusak">(
    "baik_layak"
  );
  const [catatan, setCatatan] = useState<string>("");
  const [fotoBukti, setFotoBukti] = useState<string | null>(null);

  // Canvas Tanda Tangan
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasSignature, setHasSignature] = useState<boolean>(false);

  const fetchDistribusi = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/distribusi");
      if (res.ok) {
        const json = await res.json();
        const list: DistribusiItem[] = json.daftarDistribusi || [];
        setDistribusiList(list);
        if (list.length > 0) {
          // Pilih yang paling aktif
          setSelectedDistribusi(list[0]);
        }
      }
    } catch {
      // Gagal load distribusi ditangani secara graceful
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistribusi();
  }, [fetchDistribusi]);

  // Open modal serah terima
  const openModal = (item: SerahTerimaItem) => {
    setActiveModalItem(item);
    setPorsiDiterima(item.porsiDiterima > 0 ? item.porsiDiterima : item.porsiKirim);
    setNamaPenerima(item.namaPenerimaSekolah || item.sekolah.picNama);
    setKontakPenerima(item.kontakPenerimaSekolah || item.sekolah.picKontak);
    setKondisi(item.kondisiMakanan || "baik_layak");
    setCatatan(item.catatan || "");
    setFotoBukti(item.fotoSerahTerimaUrl || null);
    setHasSignature(!!item.ttdDigitalUrl);

    // Render Canvas after modal mounts
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.lineWidth = 2.5;
          ctx.lineCap = "round";
          ctx.strokeStyle = "#1A1A1A";

          if (item.ttdDigitalUrl) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = item.ttdDigitalUrl;
          }
        }
      }
    }, 150);
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Accessible signature alternative for keyboard / screen reader users
  const handleSignWithText = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "italic 22px 'Brush Script MT', cursive, sans-serif";
    ctx.fillStyle = "#071e49";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const nameToSign = namaPenerima.trim() || "Penerima Sekolah";
    ctx.fillText(nameToSign, canvas.width / 2, canvas.height / 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#071e49";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 80, canvas.height / 2 + 18);
    ctx.lineTo(canvas.width / 2 + 80, canvas.height / 2 + 18);
    ctx.stroke();
    setHasSignature(true);
  };

  // Simulated / real camera capture
  const handleTakeFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFotoBukti(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Demo fallback photo
      setFotoBukti(
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23223023'/><text x='50%25' y='50%25' fill='%23FFFFFF' font-size='16' font-family='sans-serif' text-anchor='middle'>Bukti Serah Terima Terverifikasi</text></svg>"
      );
    }
  };

  // Submit serah terima
  const handleSubmitSerahTerima = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalItem) return;

    if (!hasSignature) {
      setToast({ type: "error", message: "Wajib membubuhkan tanda tangan digital penerima." });
      return;
    }

    try {
      setIsSubmitting(true);
      const canvas = canvasRef.current;
      const ttdUrl = canvas ? canvas.toDataURL("image/png") : null;

      const res = await fetch("/api/distribusi/serah-terima", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serahTerimaId: activeModalItem.id,
          porsiDiterima: Number(porsiDiterima),
          namaPenerimaSekolah: namaPenerima,
          kontakPenerimaSekolah: kontakPenerima,
          fotoSerahTerimaUrl: fotoBukti || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='150'><rect width='200' height='150' fill='%23333'/><text x='100' y='75' fill='%23fff' text-anchor='middle' font-size='12'>Foto Penerima</text></svg>",
          ttdDigitalUrl: ttdUrl,
          kondisiMakanan: kondisi,
          catatan,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mencatat serah terima.");
      }

      setToast({ type: "success", message: `Serah terima ${activeModalItem.sekolah.namaSekolah} berhasil dicatat!` });
      setActiveModalItem(null);
      await fetchDistribusi();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setToast({ type: "error", message: error.message || "Gagal menyimpan serah terima." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selesaiCount =
    selectedDistribusi?.serahTerimaList.filter((s) => s.statusSerahTerima === "diterima").length || 0;
  const totalSekolahCount = selectedDistribusi?.serahTerimaList.length || 0;

  return (
    <main className="min-h-screen bg-brand-canvas text-brand-dark flex flex-col justify-between max-w-lg mx-auto border-x border-brand-dark/15 shadow-2xl relative">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 max-w-[90vw] ${
            toast.type === "success"
              ? "bg-brand-dark text-white border border-brand-green"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
          <button
            type="button"
            onClick={() => setToast(null)}
            className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 inline-flex items-center justify-center underline text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Top Header Mobile */}
      <header className="bg-brand-dark text-white p-4 sticky top-0 z-40 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/"
            className="min-h-[44px] px-2 inline-flex items-center gap-1.5 text-xs text-brand-pastel hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Beranda
          </Link>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-pastel/20 text-brand-pastel border border-brand-pastel/30">
            Fase 2: Distribusi Armada
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-pastel text-brand-dark font-black flex items-center justify-center text-base">
              MBG
            </div>
            <div>
              <h1 className="font-bold text-sm leading-snug">Portal Kurir & Distribusi</h1>
              <p className="text-[11px] text-brand-pastel/80">Doni Prasetyo (Driver Armada)</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="min-h-[44px] px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold inline-flex items-center justify-center transition"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Content Area */}
      <div className="p-4 space-y-4 flex-1">
        {isLoading ? (
          <div className="text-center py-12 text-xs font-semibold text-brand-dark/60 animate-pulse">
            Memuat jadwal distribusi hari ini...
          </div>
        ) : !selectedDistribusi ? (
          <div className="text-center py-12 p-6 rounded-2xl bg-white border border-brand-dark/15 text-xs space-y-2">
            <Truck className="w-10 h-10 mx-auto text-brand-dark/40" />
            <p className="font-bold text-brand-dark">Belum Ada Rute Pengiriman Aktif</p>
            <p className="text-brand-dark/70">
              Admin SPPG belum menerbitkan Surat Jalan distribusi untuk hari ini.
            </p>
          </div>
        ) : (
          <>
            {/* Delivery Run Summary Card */}
            <div className="p-4 rounded-2xl bg-white border-2 border-brand-dark shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60">
                    Surat Jalan Aktif
                  </span>
                  <h2 className="text-base font-bold text-brand-dark leading-snug">
                    {selectedDistribusi.nomorSuratJalan}
                  </h2>
                  <p className="text-xs text-brand-dark/80 mt-0.5">
                    {selectedDistribusi.jadwalMenu?.menu?.namaMenu || "Menu Makanan Bergizi Gratis"}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    selectedDistribusi.status === "selesai"
                      ? "bg-brand-green/20 text-brand-dark border-brand-green/40"
                      : "bg-blue-100 text-blue-900 border-blue-300"
                  }`}
                >
                  {selectedDistribusi.status === "selesai" ? "Selesai Dikirim" : "Dalam Perjalanan"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-dark/10 text-xs">
                <div>
                  <p className="text-[10px] text-brand-dark/60 font-semibold">Armada Mobil Box:</p>
                  <p className="font-bold text-brand-dark">
                    {selectedDistribusi.armada?.nomorKendaraan} ({selectedDistribusi.armada?.jenisKendaraan})
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-brand-dark/60 font-semibold">Progres Pengantaran:</p>
                  <p className="font-bold text-brand-dark">
                    {selesaiCount} dari {totalSekolahCount} Sekolah
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-brand-dark/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-green h-full transition-all duration-300"
                  style={{
                    width: `${totalSekolahCount > 0 ? (selesaiCount / totalSekolahCount) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* School Stops List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-xs uppercase tracking-wider text-brand-dark/70">
                  Daftar Sekolah Penerima ({totalSekolahCount})
                </h3>
                <span className="text-[11px] text-brand-dark/60">Urut berdasarkan jam makan</span>
              </div>

              {selectedDistribusi.serahTerimaList.map((item, idx) => {
                const isDiterima = item.statusSerahTerima === "diterima";
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openModal(item)}
                    aria-label={`Buka form serah terima ${item.sekolah.namaSekolah}. Target ${item.porsiKirim} porsi. Status: ${isDiterima ? "Sudah diterima" : "Belum diterima"}`}
                    className={`w-full text-left p-4 rounded-2xl border transition cursor-pointer shadow-sm relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark ${
                      isDiterima
                        ? "bg-white border-brand-green/50 hover:border-brand-green"
                        : "bg-white border-brand-dark/20 hover:border-brand-dark"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                            isDiterima
                              ? "bg-brand-green text-brand-dark"
                              : "bg-brand-dark text-white"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-brand-dark">
                            {item.sekolah.namaSekolah}
                          </h4>
                          <p className="text-xs text-brand-dark/70 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0" /> {item.sekolah.alamat}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                            <span className="inline-flex items-center gap-1 font-semibold text-brand-dark">
                              <Package className="w-3.5 h-3.5 text-brand-dark" />
                              Target: {item.porsiKirim} Porsi
                            </span>
                            <span className="text-brand-dark/40">•</span>
                            <span className="text-brand-dark/70">
                              Jam Makan: {item.sekolah.jamMakan.slice(0, 5)} WIB
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {isDiterima ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/20 text-brand-dark border border-brand-green/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> Diterima
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-brand-dark/40" />
                      </div>
                    </div>

                    {isDiterima && (
                      <div className="mt-3 pt-2.5 border-t border-brand-dark/10 flex items-center justify-between text-[11px] text-brand-dark/80 bg-brand-pastel/15 -mx-4 -mb-4 px-4 py-2">
                        <span>Penerima: <strong>{item.namaPenerimaSekolah}</strong> ({item.porsiDiterima} boks)</span>
                        <span className="text-emerald-700 font-bold">Kondisi Layak</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Serah Terima Modal (Full Drawer on Mobile) */}
      {activeModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-serah-terima-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-brand-dark/20 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-brand-dark text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-brand-pastel uppercase tracking-wide">
                  Form Bukti Serah Terima
                </p>
                <h3 id="modal-serah-terima-title" className="font-bold text-sm">{activeModalItem.sekolah.namaSekolah}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-base flex items-center justify-center cursor-pointer"
                aria-label="Tutup form serah terima"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitSerahTerima} className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Portion & Quantity Check */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-brand-canvas border border-brand-dark/15">
                <div>
                  <span className="block text-[11px] font-bold text-brand-dark/70 mb-1">
                    Target Alokasi
                  </span>
                  <p className="text-lg font-black text-brand-dark">{activeModalItem.porsiKirim} Porsi</p>
                </div>
                <div>
                  <label htmlFor="porsi-diterima-input" className="block text-[11px] font-bold text-brand-dark/70 mb-1">
                    Porsi Diterima Fisik *
                  </label>
                  <input
                    id="porsi-diterima-input"
                    type="number"
                    min="1"
                    required
                    aria-required="true"
                    value={porsiDiterima}
                    onChange={(e) => setPorsiDiterima(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-brand-dark/20 font-bold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  />
                </div>
              </div>

              {/* Recipient Information */}
              <div className="space-y-2.5">
                <div>
                  <label htmlFor="nama-penerima-input" className="block font-bold text-brand-dark mb-1">
                    Nama Guru / PIC Penerima Sekolah *
                  </label>
                  <input
                    id="nama-penerima-input"
                    type="text"
                    required
                    aria-required="true"
                    value={namaPenerima}
                    onChange={(e) => setNamaPenerima(e.target.value)}
                    placeholder="Contoh: Ibu Siti Rahma (Kepsek / Guru Piket)"
                    className="w-full h-10 px-3 rounded-xl border border-brand-dark/20 font-semibold text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  />
                </div>

                <div>
                  <label htmlFor="kontak-penerima-input" className="block font-bold text-brand-dark mb-1">
                    Nomor Kontak / WhatsApp PIC *
                  </label>
                  <input
                    id="kontak-penerima-input"
                    type="tel"
                    required
                    aria-required="true"
                    value={kontakPenerima}
                    onChange={(e) => setKontakPenerima(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full h-10 px-3 rounded-xl border border-brand-dark/20 font-semibold text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  />
                </div>
              </div>

              {/* Food Condition Check */}
              <div>
                <span id="kondisi-makanan-label" className="block font-bold text-brand-dark mb-1.5">
                  Kondisi & Kualitas Makanan saat Tiba *
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="kondisi-makanan-label"
                  className="grid grid-cols-3 gap-2"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={kondisi === "baik_layak"}
                    onClick={() => setKondisi("baik_layak")}
                    className={`min-h-[48px] p-2.5 rounded-xl border font-bold text-center text-xs transition cursor-pointer ${
                      kondisi === "baik_layak"
                        ? "bg-brand-green/20 border-brand-green text-brand-dark ring-2 ring-brand-green/40"
                        : "bg-white border-brand-dark/20 text-brand-dark/70"
                    }`}
                  >
                    ✓ Hangat & Baik
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={kondisi === "kurang_hangat"}
                    onClick={() => setKondisi("kurang_hangat")}
                    className={`min-h-[48px] p-2.5 rounded-xl border font-bold text-center text-xs transition cursor-pointer ${
                      kondisi === "kurang_hangat"
                        ? "bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-300"
                        : "bg-white border-brand-dark/20 text-brand-dark/70"
                    }`}
                  >
                    ⚠ Kurang Hangat
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={kondisi === "kemasan_rusak"}
                    onClick={() => setKondisi("kemasan_rusak")}
                    className={`min-h-[48px] p-2.5 rounded-xl border font-bold text-center text-xs transition cursor-pointer ${
                      kondisi === "kemasan_rusak"
                        ? "bg-red-100 border-red-400 text-red-900 ring-2 ring-red-300"
                        : "bg-white border-brand-dark/20 text-brand-dark/70"
                    }`}
                  >
                    ✕ Boks Rusak
                  </button>
                </div>
              </div>

              {/* Digital Signature Canvas */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span id="label-ttd-digital" className="font-bold text-brand-dark flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-brand-dark" /> Tanda Tangan Digital Penerima *
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleSignWithText}
                      className="min-h-[44px] px-2.5 inline-flex items-center gap-1 text-[11px] text-brand-dark hover:underline font-bold cursor-pointer"
                      title="Gunakan nama PIC sebagai tanda tangan otomatis (aksesibilitas)"
                    >
                      TTD Nama (A11y)
                    </button>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="min-h-[44px] px-2.5 inline-flex items-center gap-1 text-[11px] text-red-700 hover:underline font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
                <div className="border-2 border-dashed border-brand-dark/30 rounded-2xl bg-zinc-50 overflow-hidden relative">
                  <canvas
                    ref={canvasRef}
                    role="img"
                    aria-labelledby="label-ttd-digital"
                    tabIndex={0}
                    width={380}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[140px] touch-none cursor-crosshair focus:outline-none focus:ring-2 focus:ring-brand-dark"
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-400 font-semibold text-xs">
                      Tanda tangani di sini dengan jari / stylus, atau klik TTD Nama
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Proof */}
              <div className="space-y-1.5">
                <span className="font-bold text-brand-dark flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-brand-dark" /> Foto Penyerahan Makanan di Sekolah
                </span>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="foto-serah-terima-file"
                    className="flex-1 min-h-[48px] h-12 rounded-xl bg-brand-canvas border border-brand-dark/20 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs text-brand-dark hover:bg-brand-pastel/30 transition focus-within:ring-2 focus-within:ring-brand-dark"
                  >
                    <Camera className="w-4 h-4" /> Ambil Foto / Pilih File
                    <input
                      id="foto-serah-terima-file"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleTakeFoto}
                      className="sr-only"
                    />
                  </label>
                  {fotoBukti && (
                    <div className="w-11 h-11 rounded-xl border border-brand-dark/20 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fotoBukti} alt="Bukti penyerahan" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="catatan-distribusi-input" className="block font-bold text-brand-dark mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  id="catatan-distribusi-input"
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Catatan kondisi penerimaan atau masukan dari sekolah..."
                  className="w-full p-2.5 rounded-xl border border-brand-dark/20 font-semibold text-xs bg-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-dark"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-brand-dark text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-brand-dark/90 active:scale-[0.98] transition shadow-md disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? "Menyimpan Data..." : "KONFIRMASI SERAH TERIMA"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Footer */}
      <footer className="p-3 text-center text-[10px] text-brand-dark/50 border-t border-brand-dark/10 bg-white">
        SPPG MBG — Modul Distribusi Armada & Serah Terima Digital &copy; 2026
      </footer>
    </main>
  );
}
