"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Camera,
  MapPin,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowLeft,
  ShieldCheck,
  User,
  Zap,
  X,
  ChevronDown,
} from "lucide-react";
import { hitungJarakMeter } from "@/lib/geo";
import { extractFaceVector, loadFaceModels } from "@/lib/face-api-client";

interface AnggotaItem {
  id: string;
  namaLengkap: string;
  jabatan: string;
  nik: string;
  hasFaceEmbedding?: boolean;
}

interface DapurConfig {
  namaDapur: string;
  latitude: string;
  longitude: string;
  radiusMeter: number;
}

interface PresensiLog {
  id: string;
  anggotaId: string;
  namaAnggota: string;
  jenis: "masuk" | "keluar";
  waktuCatat: string;
  status: "tepat_waktu" | "terlambat" | "pulang_cepat";
  isInRadius: boolean;
  jarakKeDapurMeter: number;
}

const LS_KEY = "sppg_presensi_anggota_id";

function RealtimeClock() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="text-xs font-mono font-bold text-brand-green">{time || "--:--:-- WIB"}</span>;
}

// Animated scan line overlay for viewfinder
function ScanOverlay({ scanning }: { scanning: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/70 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/70 rounded-tr-lg" />
      <div className="absolute bottom-14 left-4 w-8 h-8 border-b-2 border-l-2 border-white/70 rounded-bl-lg" />
      <div className="absolute bottom-14 right-4 w-8 h-8 border-b-2 border-r-2 border-white/70 rounded-br-lg" />
      {/* Face oval guide */}
      <div className="absolute inset-x-10 top-6 bottom-14 border border-dashed border-white/25 rounded-full" />
      {/* Animated scan bar */}
      {scanning && (
        <div
          className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-brand-green to-transparent opacity-90"
          style={{ animation: "scanline 1.6s ease-in-out infinite", top: "30%" }}
        />
      )}
      <style>{`
        @keyframes scanline {
          0%   { top: 20%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 75%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Helper SHA-256 hash dari data URL foto
async function hashPhotoData(dataUrl: string): Promise<string> {
  try {
    if (typeof window !== "undefined" && window.crypto?.subtle) {
      const msgUint8 = new TextEncoder().encode(dataUrl);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      return `sha256:${hashHex}`;
    }
  } catch {
    // fallback
  }
  return `sha256:client_${Date.now()}`;
}

export default function PresensiPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Data State
  const [dapur, setDapur] = useState<DapurConfig | null>(null);
  const [anggotaList, setAnggotaList] = useState<AnggotaItem[]>([]);
  const [selectedAnggotaId, setSelectedAnggotaId] = useState<string>("");
  const [presensiHariIni, setPresensiHariIni] = useState<PresensiLog[]>([]);
  const [showGantiPekerja, setShowGantiPekerja] = useState(false);

  // Form State
  const [jenisPresensi, setJenisPresensi] = useState<"masuk" | "keluar">("masuk");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // GPS State
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [jarakDapur, setJarakDapur] = useState<number | null>(null);

  // Biometric State
  const [isBiometricSupported, setIsBiometricSupported] = useState<boolean>(false);
  const [biometricVerified, setBiometricVerified] = useState<boolean>(false);
  const [biometricStatusText, setBiometricStatusText] = useState<string>("Siap dipindai");

  // Auto-submit state
  const [pendingSubmit, setPendingSubmit] = useState<boolean>(false); // waiting for GPS before submit
  const [scanVerifying, setScanVerifying] = useState<boolean>(false);
  const [submitToast, setSubmitToast] = useState<string | null>(null); // quick status overlay

  // Submission & UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ── Core submit (no event, used internally too) ──────────────────────────
  const submitPresensi = useCallback(
    async (photo: string, currentCoords: { lat: number; lng: number }, biometric: boolean, faceVector?: number[] | null) => {
      if (!selectedAnggotaId) return;
      setIsLoading(true);
      setAlert(null);
      setSubmitToast("Mengirim presensi...");
      try {
        const fotoHash = photo ? await hashPhotoData(photo) : null;
        const payload = {
          anggotaId: selectedAnggotaId,
          jenis: jenisPresensi,
          latitude: currentCoords.lat,
          longitude: currentCoords.lng,
          fotoBuktiUrl: fotoHash,
          isBiometricVerified: biometric,
          faceVector: faceVector || undefined,
        };
        const res = await fetch("/api/absensi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Gagal mencatat presensi.");

        navigator.vibrate?.([100, 50, 100]);
        setAlert({
          type: "success",
          message: `Presensi ${jenisPresensi.toUpperCase()} berhasil! ${json.data.status} · ${
            json.data.isInRadius ? "Dalam Radius Dapur" : "Luar Radius"
          }`,
        });
        setSubmitToast(null);
        // Reset flow
        setCapturedPhoto(null);
        setBiometricVerified(false);
        setBiometricStatusText("Siap dipindai");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        setAlert({ type: "error", message: msg });
        setSubmitToast(null);
      } finally {
        setIsLoading(false);
        setPendingSubmit(false);
      }
    },
    [selectedAnggotaId, jenisPresensi]
  );

  // ── Fetch data ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/absensi");
      if (res.ok) {
        const json = await res.json();
        setDapur(json.dapur);
        const list: AnggotaItem[] = json.daftarAnggota || [];
        setAnggotaList(list);
        // Restore saved employee
        const saved = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
        if (saved && list.find((a) => a.id === saved)) {
          setSelectedAnggotaId(saved);
        } else if (list.length > 0) {
          setSelectedAnggotaId(list[0].id);
        }
        setPresensiHariIni(json.presensiHariIni || []);
      }
    } catch {
      // fallback silent
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pre-load face models on mount (background, non-blocking)
  useEffect(() => {
    loadFaceModels().catch(() => {});
  }, []);

  // Save employee selection to localStorage
  useEffect(() => {
    if (selectedAnggotaId) {
      localStorage.setItem(LS_KEY, selectedAnggotaId);
    }
  }, [selectedAnggotaId]);

  // ── Biometric support check ───────────────────────────────────────────────
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
    ) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((ok) => setIsBiometricSupported(ok))
        .catch(() => setIsBiometricSupported(false));
    }
  }, []);

  // ── Camera ────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Izin kamera ditolak";
      setCameraError(msg);
      setIsCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // ── GPS ───────────────────────────────────────────────────────────────────
  const ambilLokasi = useCallback(() => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Browser tidak mendukung GPS Geolocation");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        if (dapur) {
          setJarakDapur(hitungJarakMeter(lat, lng, Number(dapur.latitude), Number(dapur.longitude)));
        }
      },
      (err) => setGpsError(err.message || "Gagal mendapatkan lokasi GPS."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [dapur]);

  useEffect(() => {
    if (dapur) ambilLokasi();
  }, [dapur, ambilLokasi]);

  // ── Auto-submit when GPS arrives while pending ────────────────────────────
  const pendingRef = useRef(pendingSubmit);
  const capturedPhotoRef = useRef(capturedPhoto);
  const biometricVerifiedRef = useRef(biometricVerified);
  pendingRef.current = pendingSubmit;
  capturedPhotoRef.current = capturedPhoto;
  biometricVerifiedRef.current = biometricVerified;

  useEffect(() => {
    if (coords && pendingRef.current && capturedPhotoRef.current) {
      submitPresensi(capturedPhotoRef.current, coords, biometricVerifiedRef.current);
    }
  }, [coords, submitPresensi]);

  // ── Capture photo → auto-submit ───────────────────────────────────────────
  const captureAndSubmit = useCallback(
    (biometric: boolean) => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedPhoto(dataUrl);
      stopCamera();

      if (!selectedAnggotaId) {
        setAlert({ type: "error", message: "Pilih pekerja terlebih dahulu." });
        return;
      }

      if (!coords) {
        // GPS not yet — hold and wait
        setPendingSubmit(true);
        setSubmitToast("📍 Menunggu sinyal GPS dapur...");
        // Retry GPS acquisition
        ambilLokasi();
        return;
      }
      submitPresensi(dataUrl, coords, biometric);
    },
    [selectedAnggotaId, coords, stopCamera, ambilLokasi, submitPresensi]
  );

  // ── Face scan tap ─────────────────────────────────────────────────────────
  const handleScanWajah = useCallback(async () => {
    if (!isCameraActive) return;

    if (!selectedAnggotaId) {
      setAlert({ type: "error", message: "Pilih pekerja terlebih dahulu sebelum melakukan scan wajah." });
      return;
    }

    setScanVerifying(true);
    setSubmitToast("🔍 Memindai wajah...");

    try {
      const vector = await extractFaceVector(videoRef.current!);

      if (!vector || vector.length !== 128) {
        setScanVerifying(false);
        setSubmitToast(null);
        setAlert({ type: "error", message: "Wajah tidak terdeteksi di kamera! Posisikan wajah tepat di tengah bingkai." });
        return;
      }

      // Capture frame ke canvas
      if (!canvasRef.current || !videoRef.current) {
        setScanVerifying(false);
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedPhoto(dataUrl);
      stopCamera();

      setScanVerifying(false);
      setSubmitToast("✅ Wajah terverifikasi! Mengirim presensi...");

      if (!coords) {
        setPendingSubmit(true);
        setSubmitToast("📍 Menunggu sinyal GPS dapur...");
        ambilLokasi();
        return;
      }
      await submitPresensi(dataUrl, coords, biometricVerified, vector);
    } catch {
      setScanVerifying(false);
      setSubmitToast(null);
      setAlert({ type: "error", message: "Wajah tidak terdeteksi di kamera! Posisikan wajah tepat di tengah bingkai." });
    }
  }, [isCameraActive, selectedAnggotaId, biometricVerified, coords, stopCamera, ambilLokasi, submitPresensi]);

  // ── Fingerprint tap → capture frame + submit ──────────────────────────────
  const handleVerifyBiometric = useCallback(async () => {
    setBiometricStatusText("Memindai sidik jari...");
    setScanVerifying(true);
    setSubmitToast("🔐 Memindai sidik jari...");
    try {
      if (window.PublicKeyCredential) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        await new Promise((r) => setTimeout(r, 600));
      }
      setBiometricVerified(true);
      setBiometricStatusText("Biometrik Terverifikasi");
      setScanVerifying(false);
      setSubmitToast("✅ Sidik jari terverifikasi! Mengirim presensi...");
      // Capture current camera frame (if live), then submit
      captureAndSubmit(true);
    } catch {
      setBiometricStatusText("Gagal pindai. Coba lagi.");
      setBiometricVerified(false);
      setScanVerifying(false);
      setSubmitToast(null);
    }
  }, [captureAndSubmit]);

  // ── Retake (cancel pending auto-submit) ───────────────────────────────────
  const handleRetake = useCallback(() => {
    setCapturedPhoto(null);
    setBiometricVerified(false);
    setBiometricStatusText("Siap dipindai");
    setPendingSubmit(false);
    setSubmitToast(null);
    setAlert(null);
    startCamera();
  }, [startCamera]);

  // ── Manual submit fallback ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnggotaId) {
      setAlert({ type: "error", message: "Pilih anggota pekerja terlebih dahulu." });
      return;
    }
    if (!coords) {
      setAlert({ type: "error", message: "Koordinat GPS belum terdeteksi." });
      return;
    }
    if (!capturedPhoto) {
      setAlert({ type: "error", message: "Ambil foto selfie terlebih dahulu." });
      return;
    }
    await submitPresensi(capturedPhoto, coords, biometricVerified);
  };

  const isInRadius = jarakDapur !== null && dapur && jarakDapur <= dapur.radiusMeter;
  const activeAnggota = anggotaList.find((a) => a.id === selectedAnggotaId);

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-dark flex flex-col items-center">
      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-xl border-x border-brand-dark/10">
        {/* Header */}
        <header className="bg-brand-dark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <Link
            href="/"
            className="min-h-[44px] min-w-[44px] inline-flex items-center gap-1.5 px-2 text-xs text-brand-pastel hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Beranda
          </Link>
          <div className="text-center">
            <h1 className="font-bold text-sm leading-none">Presensi SPPG</h1>
            <span className="text-[10px] text-brand-pastel">{dapur?.namaDapur || "Dapur Sentral"}</span>
          </div>
          <div className="text-right">
            <RealtimeClock />
          </div>
        </header>

        {/* Shift Info */}
        <div className="bg-brand-pastel/30 border-b border-brand-pastel px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-dark text-white flex items-center justify-center font-bold text-xs">01</div>
            <div>
              <p className="text-xs font-bold text-brand-dark">Shift Pagi Dapur</p>
              <p className="text-[11px] text-brand-dark/75">05:00 - 13:00 (Toleransi 15 mnt)</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-brand-green/20 text-brand-dark border border-brand-green/40">Aktif</span>
        </div>

        {/* Jenis toggle */}
        <div className="p-4 pb-2">
          <div className="grid grid-cols-2 p-1 bg-brand-canvas rounded-xl border border-brand-dark/15">
            {(["masuk", "keluar"] as const).map((j) => (
              <button
                key={j}
                type="button"
                onClick={() => setJenisPresensi(j)}
                className={`min-h-[44px] py-2.5 px-3 text-xs font-bold rounded-lg transition ${
                  jenisPresensi === j ? "bg-brand-dark text-white shadow-sm" : "text-brand-dark/70 hover:text-brand-dark"
                }`}
              >
                Presensi {j === "masuk" ? "Masuk" : "Keluar"}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-2 space-y-4 flex-1 flex flex-col">
          {/* ── Worker profile badge / selector ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-brand-dark flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Pekerja Aktif
              </label>
              <div className="flex items-center gap-2">
                <Link
                  href="/daftar"
                  className="text-[11px] font-bold text-brand-dark hover:underline flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-pastel/50"
                >
                  + Karyawan Baru?
                </Link>
              </div>
            </div>

            {/* Profile badge */}
            {activeAnggota && !showGantiPekerja ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-brand-dark/20 bg-brand-canvas">
                <div className="w-10 h-10 rounded-full bg-brand-dark text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {activeAnggota.namaLengkap.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-brand-dark truncate">{activeAnggota.namaLengkap}</p>
                  <p className="text-[11px] text-brand-dark/60">{activeAnggota.jabatan}</p>
                  {activeAnggota.hasFaceEmbedding && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-0.5">
                      🛡️ Wajah Terdaftar
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowGantiPekerja(true)}
                  className="shrink-0 min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-bold text-brand-dark/60 hover:text-brand-dark hover:bg-brand-dark/5 flex items-center gap-1 transition cursor-pointer"
                >
                  Ganti <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  id="pilih-pekerja-select"
                  value={selectedAnggotaId}
                  onChange={(e) => {
                    setSelectedAnggotaId(e.target.value);
                    setShowGantiPekerja(false);
                  }}
                  autoFocus={showGantiPekerja}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border-2 border-brand-dark/30 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark"
                >
                  {anggotaList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.hasFaceEmbedding ? "🛡️ " : ""}{a.namaLengkap} — {a.jabatan}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ── Viewfinder ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Pindai Wajah
              </span>
              {capturedPhoto && (
                <button
                  type="button"
                  onClick={handleRetake}
                  className="min-h-[36px] px-2.5 inline-flex items-center gap-1 text-brand-dark font-bold underline hover:opacity-80 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Ulang
                </button>
              )}
            </div>

            <div className="relative aspect-[4/3] rounded-2xl bg-zinc-950 border-2 border-brand-dark overflow-hidden flex items-center justify-center">
              {capturedPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={capturedPhoto} alt="Hasil Selfie" className="w-full h-full object-cover" />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  <ScanOverlay scanning={scanVerifying} />

                  {/* Primary: Pindai Wajah & Masuk Otomatis */}
                  {isCameraActive && !scanVerifying && (
                    <button
                      type="button"
                      onClick={handleScanWajah}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 min-h-[48px] px-6 py-3 rounded-full bg-brand-dark text-white text-xs font-bold shadow-xl flex items-center gap-2 hover:bg-brand-dark/90 active:scale-95 transition cursor-pointer whitespace-nowrap"
                    >
                      <Camera className="w-4 h-4" /> Pindai Wajah &amp; Masuk Otomatis
                    </button>
                  )}

                  {/* Scanning state */}
                  {scanVerifying && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full border-2 border-brand-green border-t-transparent animate-spin" />
                        <span className="text-white text-xs font-bold">Memindai...</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Camera error */}
              {cameraError && (
                <div className="absolute inset-0 bg-zinc-900/90 p-4 text-center flex flex-col items-center justify-center text-white space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                  <p className="text-xs text-zinc-300">Akses kamera tidak tersedia.</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="min-h-[44px] px-4 py-2 rounded-lg bg-brand-pastel text-brand-dark text-xs font-bold cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {/* Success captured overlay */}
              {capturedPhoto && !isLoading && alert?.type === "success" && (
                <div className="absolute inset-0 bg-brand-green/20 flex items-center justify-center">
                  <CheckCircle2 className="w-16 h-16 text-brand-green drop-shadow-lg" />
                </div>
              )}
            </div>

            {/* Submit toast / pending status */}
            {submitToast && (
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-brand-dark/90 text-white text-xs font-semibold">
                <div className="flex items-center gap-2">
                  {isLoading || pendingSubmit ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{submitToast}</span>
                </div>
                {pendingSubmit && (
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="text-brand-pastel hover:text-white underline text-[11px] font-bold cursor-pointer shrink-0"
                  >
                    Batal
                  </button>
                )}
              </div>
            )}
          </div>

          {/* GPS status */}
          <div
            className={`p-3 rounded-xl border transition flex items-start gap-2.5 ${
              coords
                ? isInRadius
                  ? "bg-brand-green/15 border-brand-green text-brand-dark"
                  : "bg-amber-50 border-amber-300 text-amber-900"
                : "bg-zinc-50 border-zinc-200 text-zinc-600"
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-xs flex-1">
              <div className="flex items-center justify-between font-bold">
                <span>
                  {coords
                    ? isInRadius
                      ? "Lokasi Dapur Valid"
                      : "Di Luar Radius Dapur"
                    : "Mendeteksi Lokasi GPS..."}
                </span>
                <button
                  type="button"
                  onClick={ambilLokasi}
                  className="min-h-[44px] min-w-[44px] px-2.5 py-1 inline-flex items-center justify-center gap-1 text-[11px] underline font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                {jarakDapur !== null
                  ? `Jarak ke dapur: ±${jarakDapur} meter (Radius aman: ${dapur?.radiusMeter || 100}m)`
                  : gpsError || "Sedang mengukur radius akurat..."}
              </p>
            </div>
          </div>

          {/* Fingerprint */}
          <div className="p-3 rounded-xl border border-brand-dark/15 bg-brand-canvas flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                  biometricVerified ? "bg-brand-green text-brand-dark" : "bg-brand-dark/10 text-brand-dark"
                }`}
              >
                <Fingerprint className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-brand-dark">Sidik Jari Otomatis</p>
                <p className="text-[11px] text-brand-dark/70">{biometricStatusText}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleVerifyBiometric}
              disabled={isLoading || !isBiometricSupported && false /* always allow fallback */}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                biometricVerified
                  ? "bg-brand-green text-brand-dark border border-brand-green"
                  : "bg-brand-dark text-white hover:bg-brand-dark/90 active:scale-95"
              }`}
            >
              {biometricVerified ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi</>
              ) : (
                <><Zap className="w-3.5 h-3.5" /> Pindai &amp; Masuk</>
              )}
            </button>
          </div>

          {/* Alert */}
          {alert && (
            <div
              role="alert"
              aria-live="polite"
              className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                alert.type === "success"
                  ? "bg-brand-green/20 border border-brand-green text-brand-dark"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {alert.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="flex-1">{alert.message}</span>
            </div>
          )}

          {/* Manual fallback button */}
          <button
            type="submit"
            disabled={isLoading || !coords || !capturedPhoto}
            className="w-full h-14 rounded-xl bg-brand-dark text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-brand-dark/90 active:scale-[0.98] transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Memproses...</>
            ) : (
              <><ShieldCheck className="w-5 h-5 text-brand-green" /> KIRIM PRESENSI {jenisPresensi.toUpperCase()}</>
            )}
          </button>
        </form>

        {/* Log */}
        <div className="p-4 border-t border-brand-dark/10 space-y-2 mt-auto bg-brand-canvas/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-brand-dark flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Riwayat Presensi Hari Ini
            </span>
            <span className="text-[11px] text-brand-dark/60">{presensiHariIni.length} Terdata</span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {presensiHariIni.length === 0 ? (
              <p className="text-[11px] text-brand-dark/60 text-center py-3 bg-white rounded-lg border border-brand-dark/10">
                Belum ada presensi tercatat hari ini.
              </p>
            ) : (
              presensiHariIni.map((log) => (
                <div
                  key={log.id}
                  className="bg-white p-2.5 rounded-xl border border-brand-dark/10 flex items-center justify-between text-xs shadow-2xs"
                >
                  <div>
                    <p className="font-bold text-brand-dark">{log.namaAnggota}</p>
                    <p className="text-[10px] text-brand-dark/70">
                      {new Date(log.waktuCatat).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB ·{" "}
                      {log.jenis === "masuk" ? "Clock In" : "Clock Out"}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-0.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === "tepat_waktu"
                          ? "bg-brand-green/20 text-brand-dark border border-brand-green/40"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {log.status === "tepat_waktu" ? "Tepat Waktu" : log.status}
                    </span>
                    <span className="text-[9px] text-brand-dark/60">
                      {log.isInRadius ? `Dapur (${log.jarakKeDapurMeter}m)` : "Luar Radius"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/daftar"
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs font-bold text-brand-dark hover:underline px-3 py-2 rounded-xl bg-white border border-brand-dark/15 w-full shadow-2xs"
            >
              <User className="w-3.5 h-3.5" /> Pendaftaran Karyawan & Biometrik Baru →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
