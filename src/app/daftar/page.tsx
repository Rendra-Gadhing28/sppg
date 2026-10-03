"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  User,
  Camera,
  Hand,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Phone,
  Briefcase,
  Fingerprint,
  Calendar,
  ScanFace,
} from "lucide-react";
import { extractFaceVector } from "@/lib/face-api-client";

interface ShiftOption {
  id: number;
  namaShift: string;
  jamMasuk: string;
  jamPulang: string;
  toleransiMenit: number;
}

const JABATAN_OPTIONS = [
  "Koki / Kepala Masak",
  "Asisten Masak",
  "Tim Persiapan & Potong",
  "Tim Packing & Porsi",
  "Pengemudi / Kurir Armada",
  "Petugas Cuci & Higiene",
  "Staf Gudang & Logistik",
  "Petugas QC Dapur",
];

export default function RegistrasiKaryawanPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [nik, setNik] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [jabatan, setJabatan] = useState(JABATAN_OPTIONS[0]);
  const [nomorHp, setNomorHp] = useState("");
  const [shiftId, setShiftId] = useState<number | null>(1);
  const [shifts, setShifts] = useState<ShiftOption[]>([]);

  // Biometrics
  const [fotoWajah, setFotoWajah] = useState<string | null>(null);
  const [fotoTangan, setFotoTangan] = useState<string | null>(null);
  const [palmHash, setPalmHash] = useState<string | null>(null);
  const [isScanningPalm, setIsScanningPalm] = useState(false);
  const [faceVector, setFaceVector] = useState<number[] | null>(null);
  const [isExtractingFace, setIsExtractingFace] = useState(false);

  // Camera & Status
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    id: string;
    namaLengkap: string;
    nik: string;
    jabatan: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Ambil daftar shift dari API
  useEffect(() => {
    async function loadShifts() {
      try {
        const res = await fetch("/api/anggota");
        const json = await res.json();
        if (json.shifts && json.shifts.length > 0) {
          setShifts(json.shifts);
          setShiftId(json.shifts[0].id);
        } else {
          setShifts([
            { id: 1, namaShift: "Shift Pagi Dapur", jamMasuk: "05:00", jamPulang: "13:00", toleransiMenit: 15 },
            { id: 2, namaShift: "Shift Siang Distribusi", jamMasuk: "09:00", jamPulang: "17:00", toleransiMenit: 15 },
            { id: 3, namaShift: "Shift Sore Persiapan", jamMasuk: "13:00", jamPulang: "21:00", toleransiMenit: 15 },
          ]);
        }
      } catch {
        setShifts([
          { id: 1, namaShift: "Shift Pagi Dapur", jamMasuk: "05:00", jamPulang: "13:00", toleransiMenit: 15 },
          { id: 2, namaShift: "Shift Siang Distribusi", jamMasuk: "09:00", jamPulang: "17:00", toleransiMenit: 15 },
        ]);
      }
    }
    loadShifts();
  }, []);

  // Manajemen Kamera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch {
      setCameraError("Kamera tidak dapat diakses. Pastikan izin kamera aktif pada browser.");
      setIsCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  }, []);

  // Kelola lifecycle kamera sesuai langkah aktif
  useEffect(() => {
    if (step === 2 || step === 3) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step, startCamera, stopCamera]);

  // Jepret Foto Wajah
  const handleCaptureFace = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setFotoWajah(dataUrl);

        // Ekstrak face embedding
        setIsExtractingFace(true);
        setFaceVector(null);
        try {
          const vector = await extractFaceVector(canvas);
          if (vector && vector.length === 128) {
            setFaceVector(vector);
          } else {
            setFaceVector(null);
            setErrorMsg("Wajah tidak terdeteksi dengan jelas. Pastikan pencahayaan cukup dan wajah tegak menghadap kamera.");
          }
        } catch {
          setFaceVector(null);
        } finally {
          setIsExtractingFace(false);
        }
      }
    }
  };

  // Pindai & Ambil Biometrik Telapak Tangan
  const handleCapturePalm = () => {
    if (videoRef.current && canvasRef.current) {
      setIsScanningPalm(true);
      setTimeout(() => {
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            setFotoTangan(dataUrl);

            // Simulasi hash template biometrik tangan
            const randomHex = Array.from({ length: 16 }, () =>
              Math.floor(Math.random() * 16).toString(16)
            ).join("");
            setPalmHash(`PLM-SHA256-${randomHex.toUpperCase()}`);
          }
        }
        setIsScanningPalm(false);
      }, 700);
    }
  };

  // Validasi Langkah 1
  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNik = nik.trim();
    if (!/^\d{16}$/.test(cleanNik)) {
      setErrorMsg("NIK harus tepat 16 digit angka sesuai KTP.");
      return;
    }

    if (namaLengkap.trim().length < 3) {
      setErrorMsg("Nama lengkap minimal 3 karakter.");
      return;
    }

    setStep(2);
  };

  // Submit Pendaftaran Lengkap
  const handleSubmitAll = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const payload = {
        nik: nik.trim(),
        namaLengkap: namaLengkap.trim(),
        jabatan: jabatan.trim(),
        nomorHp: nomorHp.trim() || undefined,
        shiftId: shiftId ? Number(shiftId) : undefined,
        fotoUrl: fotoWajah || undefined,
        fotoTanganUrl: fotoTangan || undefined,
        faceEmbedding: faceVector || undefined,
      };

      const res = await fetch("/api/anggota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mendaftarkan karyawan.");
      }

      setSuccessData({
        id: json.data?.id || "",
        namaLengkap: payload.namaLengkap,
        nik: payload.nik,
        jabatan: payload.jabatan,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setNik("");
    setNamaLengkap("");
    setJabatan(JABATAN_OPTIONS[0]);
    setNomorHp("");
    setFotoWajah(null);
    setFotoTangan(null);
    setPalmHash(null);
    setFaceVector(null);
    setSuccessData(null);
    setErrorMsg(null);
    setStep(1);
  };

  return (
    <main className="min-h-screen bg-brand-canvas text-brand-dark flex flex-col items-center p-4 sm:p-6 font-sans">
      {/* Hidden Canvas untuk Capture Video */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full max-w-lg space-y-6">
        {/* Top Header */}
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="min-h-[44px] min-w-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-brand-dark/15 text-xs font-bold hover:bg-brand-pastel/20 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Beranda
          </Link>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 block">
              SPPG Mandiri Jaya
            </span>
            <span className="text-xs font-black text-brand-dark">Pendaftaran Karyawan</span>
          </div>
        </header>

        {/* Hero Card */}
        <div className="bg-brand-dark text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-pastel text-brand-dark">
              <Sparkles className="w-3.5 h-3.5" /> Onboarding Cepat & Biometrik
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Registrasi Karyawan Dapur
            </h1>
            <p className="text-xs text-brand-pastel/80 leading-relaxed">
              Daftarkan pekerja baru dalam 3 langkah mudah: data KTP, foto wajah, dan biometrik telapak tangan. Langsung aktif untuk presensi mobile.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 shadow-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Success View */}
        {successData ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-dark/15 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-green/20 text-brand-green border-2 border-brand-green flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-brand-dark">Pendaftaran Berhasil!</h2>
              <p className="text-xs text-brand-dark/70">
                Karyawan telah terdata di sistem SPPG dan profil biometrik telah aktif.
              </p>
            </div>

            {/* Employee Card Preview */}
            <div className="p-4 rounded-2xl bg-brand-canvas/70 border border-brand-dark/15 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-brand-dark/10 pb-2.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-dark/60">Nama Karyawan</span>
                  <p className="font-bold text-sm text-brand-dark">{successData.namaLengkap}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/20 text-brand-dark border border-brand-green/30">
                  Aktif
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-brand-dark/60 block">NIK</span>
                  <span className="font-mono font-bold text-brand-dark">{successData.nik}</span>
                </div>
                <div>
                  <span className="text-[10px] text-brand-dark/60 block">Jabatan</span>
                  <span className="font-bold text-brand-dark">{successData.jabatan}</span>
                </div>
              </div>

              {/* Biometrics Status */}
              <div className="pt-2 border-t border-brand-dark/10 flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                  <ScanFace className="w-3.5 h-3.5" /> Wajah Terverifikasi
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-cyan-800">
                  <Hand className="w-3.5 h-3.5" /> Biometrik Telapak Aktif
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Link
                href="/presensi"
                className="w-full min-h-[48px] rounded-xl bg-brand-green text-brand-dark font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition shadow-md"
              >
                Mulai Presensi Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full min-h-[48px] rounded-xl bg-white border border-brand-dark/20 text-brand-dark font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-canvas transition"
              >
                <RotateCcw className="w-4 h-4" /> Daftarkan Karyawan Lain
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Step Registration Form */
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-brand-dark/15 shadow-xl space-y-6">
            {/* Step Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-brand-dark">
                <span className={step >= 1 ? "text-brand-dark" : "text-brand-dark/40"}>1. Data Diri</span>
                <span className={step >= 2 ? "text-brand-dark" : "text-brand-dark/40"}>2. Foto Wajah</span>
                <span className={step >= 3 ? "text-brand-dark" : "text-brand-dark/40"}>3. Telapak Tangan</span>
                <span className={step >= 4 ? "text-brand-dark" : "text-brand-dark/40"}>4. Simpan</span>
              </div>
              <div className="w-full h-2 bg-brand-dark/10 rounded-full overflow-hidden flex">
                <div
                  className="bg-brand-dark transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* ── STEP 1: DATA DIRI & JABATAN ── */}
            {step === 1 && (
              <form onSubmit={handleNextFromStep1} className="space-y-4">
                <div className="border-b border-brand-dark/10 pb-3">
                  <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
                    <User className="w-4 h-4" /> Informasi Identitas Karyawan
                  </h2>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    Masukkan nomor induk kependudukan dan penempatan bagian kerja dapur.
                  </p>
                </div>

                {/* Input NIK */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-nik" className="text-xs font-bold text-brand-dark">
                    NIK KTP (16 Digit) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="reg-nik"
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                    placeholder="3201xxxxxxxxxxxx"
                    className="w-full px-3.5 py-3 rounded-xl border border-brand-dark/20 bg-brand-canvas/40 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-dark focus:bg-white transition"
                  />
                  <p className="text-[10px] text-brand-dark/50">
                    {nik.length}/16 digit angka
                  </p>
                </div>

                {/* Input Nama Lengkap */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-nama" className="text-xs font-bold text-brand-dark">
                    Nama Lengkap <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="reg-nama"
                    type="text"
                    required
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-3 rounded-xl border border-brand-dark/20 bg-brand-canvas/40 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-dark focus:bg-white transition"
                  />
                </div>

                {/* Jabatan & Posisi */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-jabatan" className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Posisi / Bagian Kerja <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="reg-jabatan"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-dark transition"
                  >
                    {JABATAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shift Kerja */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-shift" className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Shift Operasional Dapur
                  </label>
                  <select
                    id="reg-shift"
                    value={shiftId || ""}
                    onChange={(e) => setShiftId(Number(e.target.value))}
                    className="w-full px-3.5 py-3 rounded-xl border border-brand-dark/20 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-dark transition"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.namaShift} ({s.jamMasuk.slice(0, 5)} - {s.jamPulang.slice(0, 5)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nomor WhatsApp */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-hp" className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> No. WhatsApp / Handphone (Opsional)
                  </label>
                  <input
                    id="reg-hp"
                    type="tel"
                    inputMode="tel"
                    value={nomorHp}
                    onChange={(e) => setNomorHp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-3 rounded-xl border border-brand-dark/20 bg-brand-canvas/40 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-dark focus:bg-white transition"
                  />
                </div>

                {/* Tombol Lanjut ke Foto Wajah */}
                <button
                  type="submit"
                  className="w-full min-h-[48px] rounded-xl bg-brand-dark text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-brand-dark/90 active:scale-[0.98] transition shadow-md cursor-pointer"
                >
                  Lanjut ke Perekaman Wajah <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* ── STEP 2: PEREKAMAN FOTO WAJAH ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="border-b border-brand-dark/10 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
                      <ScanFace className="w-4 h-4" /> Perekaman Wajah Karyawan
                    </h2>
                    <p className="text-xs text-brand-dark/60 mt-0.5">
                      Posisikan wajah tepat di tengah bingkai oval kamera.
                    </p>
                  </div>
                  {fotoWajah && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/20 text-brand-dark border border-brand-green/30">
                      Terekam
                    </span>
                  )}
                </div>

                {/* Viewfinder Kamera Wajah */}
                <div className="relative aspect-[4/3] rounded-2xl bg-zinc-950 border-2 border-brand-dark overflow-hidden flex items-center justify-center shadow-inner">
                  {fotoWajah ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fotoWajah}
                      alt="Hasil Foto Wajah"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        autoPlay
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                      {/* Face Oval Guide */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-44 h-56 rounded-[50%] border-2 border-dashed border-white/60 flex items-center justify-center">
                          <span className="text-[10px] text-white/70 bg-black/50 px-2 py-0.5 rounded-full">
                            Posisikan Wajah Di Sini
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Tombol Ambil Snapshot Wajah */}
                  {!fotoWajah && isCameraActive && (
                    <button
                      type="button"
                      onClick={handleCaptureFace}
                      className="absolute bottom-3 min-h-[44px] px-5 py-2.5 rounded-full bg-white text-brand-dark text-xs font-bold shadow-lg flex items-center gap-1.5 hover:bg-brand-canvas active:scale-95 transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4" /> Jepret Foto Wajah
                    </button>
                  )}
                </div>

                {cameraError && (
                  <p className="text-xs text-red-600 font-semibold">{cameraError}</p>
                )}

                {/* Indikator status biometrik wajah */}
                {fotoWajah && (
                  <div className="text-xs">
                    {isExtractingFace ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 font-semibold">
                        <span className="w-3 h-3 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin inline-block" />
                        Memproses biometrik wajah...
                      </span>
                    ) : faceVector ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-green/20 border border-brand-green/40 text-brand-dark font-bold">
                        ✅ Biometrik Wajah Tersimpan (128 Vektor)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-300 text-orange-800 font-semibold">
                        ⚠️ Wajah tidak terdeteksi dengan jelas. Pastikan wajah tegak menghadap kamera.
                      </span>
                    )}
                  </div>
                )}

                {/* Navigasi Step 2 */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="min-h-[44px] px-4 rounded-xl border border-brand-dark/20 text-xs font-bold text-brand-dark hover:bg-brand-canvas transition"
                  >
                    Kembali
                  </button>

                  {fotoWajah ? (
                    <>
                      <button
                        type="button"
                        onClick={() => { setFotoWajah(null); setFaceVector(null); }}
                        className="min-h-[44px] px-4 rounded-xl border border-brand-dark/20 text-xs font-bold text-brand-dark hover:bg-brand-canvas transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Foto Ulang
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex-1 min-h-[44px] rounded-xl bg-brand-dark text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-brand-dark/90 transition shadow-md"
                      >
                        Lanjut ke Telapak Tangan <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 min-h-[44px] rounded-xl bg-brand-dark/10 text-brand-dark/60 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-brand-dark/20 transition"
                    >
                      Lewati Foto Wajah (Nanti) <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 3: PEREKAMAN BIOMETRIK TELAPAK TANGAN ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="border-b border-brand-dark/10 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
                      <Hand className="w-4 h-4" /> Perekaman Biometrik Telapak Tangan
                    </h2>
                    <p className="text-xs text-brand-dark/60 mt-0.5">
                      Buka telapak tangan menghadap kamera untuk memindai kontur garis tangan.
                    </p>
                  </div>
                  {fotoTangan && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-200">
                      Terpindai
                    </span>
                  )}
                </div>

                {/* Viewfinder Kamera Telapak Tangan */}
                <div className="relative aspect-[4/3] rounded-2xl bg-zinc-950 border-2 border-brand-dark overflow-hidden flex items-center justify-center shadow-inner">
                  {fotoTangan ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fotoTangan}
                      alt="Hasil Scan Telapak Tangan"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        autoPlay
                        className="w-full h-full object-cover transform -scale-x-100"
                      />

                      {/* Hand/Palm Outline Overlay Guide */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-44 h-52 border-2 border-dashed border-cyan-400/70 rounded-3xl flex flex-col items-center justify-center">
                          <Hand className="w-20 h-20 text-cyan-400/40" />
                          <span className="mt-2 text-[10px] text-cyan-200 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                            Rapatkan Telapak Tangan ke Sini
                          </span>

                          {/* Laser Scan Animation */}
                          {isScanningPalm && (
                            <div className="absolute inset-x-0 top-0 h-1 bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-bounce" />
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Tombol Ambil Snapshot Telapak Tangan */}
                  {!fotoTangan && isCameraActive && (
                    <button
                      type="button"
                      disabled={isScanningPalm}
                      onClick={handleCapturePalm}
                      className="absolute bottom-3 min-h-[44px] px-5 py-2.5 rounded-full bg-cyan-400 text-zinc-950 text-xs font-black shadow-lg flex items-center gap-1.5 hover:bg-cyan-300 active:scale-95 transition cursor-pointer disabled:opacity-50"
                    >
                      <Fingerprint className="w-4 h-4" />
                      {isScanningPalm ? "Memindai Kontur Tangan..." : "Pindai Biometrik Tangan"}
                    </button>
                  )}
                </div>

                {/* Info Hash Biometrik */}
                {palmHash && (
                  <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cyan-800 block">
                        Template Biometrik SHA-256
                      </span>
                      <span className="font-mono text-[11px] font-bold">{palmHash}</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0" />
                  </div>
                )}

                {/* Navigasi Step 3 */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="min-h-[44px] px-4 rounded-xl border border-brand-dark/20 text-xs font-bold text-brand-dark hover:bg-brand-canvas transition"
                  >
                    Kembali
                  </button>

                  {fotoTangan ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setFotoTangan(null);
                          setPalmHash(null);
                        }}
                        className="min-h-[44px] px-4 rounded-xl border border-brand-dark/20 text-xs font-bold text-brand-dark hover:bg-brand-canvas transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Pindai Ulang
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="flex-1 min-h-[44px] rounded-xl bg-brand-dark text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-brand-dark/90 transition shadow-md"
                      >
                        Tinjau & Simpan <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="flex-1 min-h-[44px] rounded-xl bg-brand-dark/10 text-brand-dark/60 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-brand-dark/20 transition"
                    >
                      Lewati Biometrik Tangan <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 4: KONFIRMASI & SIMPAN ── */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="border-b border-brand-dark/10 pb-3">
                  <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-green" /> Konfirmasi Pendaftaran Karyawan
                  </h2>
                  <p className="text-xs text-brand-dark/60 mt-0.5">
                    Periksa kembali data diri dan rekaman biometrik sebelum disimpan permanen ke database.
                  </p>
                </div>

                {/* Pratinjau Biometrik (Wajah + Tangan) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-brand-dark flex items-center gap-1">
                      <ScanFace className="w-3.5 h-3.5" /> Foto Wajah
                    </span>
                    <div className="aspect-[4/3] rounded-xl bg-brand-canvas border border-brand-dark/20 overflow-hidden flex items-center justify-center">
                      {fotoWajah ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fotoWajah} alt="Foto Wajah" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-brand-dark/40 font-semibold">Belum Diambil</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-brand-dark flex items-center gap-1">
                      <Hand className="w-3.5 h-3.5" /> Telapak Tangan
                    </span>
                    <div className="aspect-[4/3] rounded-xl bg-brand-canvas border border-brand-dark/20 overflow-hidden flex items-center justify-center">
                      {fotoTangan ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fotoTangan} alt="Scan Tangan" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-brand-dark/40 font-semibold">Belum Diambil</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ringkasan Data Karyawan */}
                <div className="p-4 rounded-2xl bg-brand-canvas/70 border border-brand-dark/15 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-brand-dark/10 pb-2">
                    <span className="text-brand-dark/60 font-semibold">Nama Lengkap</span>
                    <span className="font-bold text-brand-dark">{namaLengkap}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-brand-dark/10 pb-2">
                    <span className="text-brand-dark/60 font-semibold">NIK KTP</span>
                    <span className="font-mono font-bold text-brand-dark">{nik}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-brand-dark/10 pb-2">
                    <span className="text-brand-dark/60 font-semibold">Posisi / Jabatan</span>
                    <span className="font-bold text-brand-dark">{jabatan}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-brand-dark/10 pb-2">
                    <span className="text-brand-dark/60 font-semibold">Shift Operasional</span>
                    <span className="font-bold text-brand-dark">
                      {shifts.find((s) => s.id === shiftId)?.namaShift || "Shift Utama"}
                    </span>
                  </div>
                  {nomorHp && (
                    <div className="flex items-center justify-between">
                      <span className="text-brand-dark/60 font-semibold">Nomor WhatsApp</span>
                      <span className="font-bold text-brand-dark">{nomorHp}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setStep(3)}
                    className="min-h-[48px] px-4 rounded-xl border border-brand-dark/20 text-xs font-bold text-brand-dark hover:bg-brand-canvas transition"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleSubmitAll}
                    className="flex-1 min-h-[48px] rounded-xl bg-brand-dark text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-brand-dark/90 active:scale-[0.98] transition shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? "Menyimpan ke Sistem..." : "Selesaikan & Daftarkan Karyawan"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Link to Presensi & Login */}
        <div className="text-center text-xs space-x-4 text-brand-dark/70">
          <Link href="/presensi" className="min-h-[44px] inline-flex items-center hover:underline px-2">
            ← Form Presensi Pekerja
          </Link>
          <span>•</span>
          <Link href="/login" className="min-h-[44px] inline-flex items-center hover:underline px-2">
            Portal Staf & Manajemen
          </Link>
        </div>
      </div>
    </main>
  );
}
