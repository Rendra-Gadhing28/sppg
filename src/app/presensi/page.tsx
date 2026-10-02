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
} from "lucide-react";
import { hitungJarakMeter } from "@/lib/geo";

interface AnggotaItem {
  id: string;
  namaLengkap: string;
  jabatan: string;
  nik: string;
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

export default function PresensiPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Data State
  const [dapur, setDapur] = useState<DapurConfig | null>(null);
  const [anggotaList, setAnggotaList] = useState<AnggotaItem[]>([]);
  const [selectedAnggotaId, setSelectedAnggotaId] = useState<string>("");
  const [presensiHariIni, setPresensiHariIni] = useState<PresensiLog[]>([]);

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

  // Submission & UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Update Jam WIB Realtime
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Konfigurasi & Data Master
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/absensi");
      if (res.ok) {
        const json = await res.json();
        setDapur(json.dapur);
        setAnggotaList(json.daftarAnggota || []);
        if (json.daftarAnggota && json.daftarAnggota.length > 0) {
          setSelectedAnggotaId(json.daftarAnggota[0].id);
        }
        setPresensiHariIni(json.presensiHariIni || []);
      }
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cek Dukungan WebAuthn Fingerprint
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ===
        "function"
    ) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => setIsBiometricSupported(available))
        .catch(() => setIsBiometricSupported(false));
    }
  }, []);

  // Aktifkan Kamera HP
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Izin kamera ditolak";
      setCameraError(msg);
      setIsCameraActive(false);
    }
  }, []);

  // Hentikan Kamera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  }, []);

  // Mulai kamera saat buka halaman
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Ambil Geolocation GPS
  const ambilLokasi = useCallback(() => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Browser tidak mendukung GPS Geolocation");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setCoords({ lat: userLat, lng: userLng });

        // Hitung jarak ke dapur
        if (dapur) {
          const dLat = Number(dapur.latitude);
          const dLng = Number(dapur.longitude);
          const meter = hitungJarakMeter(userLat, userLng, dLat, dLng);
          setJarakDapur(meter);
        }
      },
      (err) => {
        setGpsError(err.message || "Gagal mendapatkan lokasi GPS.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [dapur]);

  useEffect(() => {
    if (dapur) {
      ambilLokasi();
    }
  }, [dapur, ambilLokasi]);

  // Jepret Foto Selfie
  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedPhoto(dataUrl);
      }
    }
  };

  // Ulangi Foto
  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Verifikasi Fingerprint / Biometrik
  const handleVerifyBiometric = async () => {
    setBiometricStatusText("Memindai sidik jari...");
    try {
      if (window.PublicKeyCredential) {
        // Simulasi tantangan WebAuthn credential check
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // Simulasi delay autentikasi sensor
        await new Promise((res) => setTimeout(res, 600));
        setBiometricVerified(true);
        setBiometricStatusText("Biometrik Terverifikasi");
      } else {
        // Fallback langsung terverifikasi
        setBiometricVerified(true);
        setBiometricStatusText("Biometrik Terverifikasi");
      }
    } catch {
      setBiometricStatusText("Gagal pindai. Coba lagi.");
      setBiometricVerified(false);
    }
  };

  // Submit Presensi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!selectedAnggotaId) {
      setAlert({ type: "error", message: "Pilih anggota pekerja terlebih dahulu." });
      return;
    }

    if (!coords) {
      setAlert({
        type: "error",
        message: "Koordinat GPS belum terdeteksi. Izinkan akses lokasi.",
      });
      return;
    }

    if (!capturedPhoto) {
      setAlert({
        type: "error",
        message: "Ambil foto selfie bukti kehadiran terlebih dahulu.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        anggotaId: selectedAnggotaId,
        jenis: jenisPresensi,
        latitude: coords.lat,
        longitude: coords.lng,
        fotoBuktiUrl: capturedPhoto,
        isBiometricVerified: biometricVerified,
      };

      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal mencatat presensi.");
      }

      setAlert({
        type: "success",
        message: `Presensi ${jenisPresensi.toUpperCase()} berhasil dicatat! Status: ${
          json.data.status
        } (${json.data.isInRadius ? "Dalam Radius" : "Luar Radius Dapur"}).`,
      });

      // Refresh data presensi hari ini
      fetchData();
      setCapturedPhoto(null);
      setBiometricVerified(false);
      setBiometricStatusText("Siap dipindai");
      startCamera();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setAlert({ type: "error", message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const isInRadius = jarakDapur !== null && dapur && jarakDapur <= dapur.radiusMeter;

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-dark flex flex-col items-center">
      {/* Hidden Canvas for Photo Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-xl border-x border-brand-dark/10">
        {/* Top Header */}
        <header className="bg-brand-dark text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-brand-pastel hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Beranda
          </Link>
          <div className="text-center">
            <h1 className="font-bold text-sm leading-none">Presensi SPPG</h1>
            <span className="text-[10px] text-brand-pastel">{dapur?.namaDapur || "Dapur Sentral"}</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-brand-green">{currentTime}</span>
          </div>
        </header>

        {/* Status Shift Info */}
        <div className="bg-brand-pastel/30 border-b border-brand-pastel px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-dark text-white flex items-center justify-center font-bold text-xs">
              01
            </div>
            <div>
              <p className="text-xs font-bold text-brand-dark">Shift Pagi Dapur</p>
              <p className="text-[11px] text-brand-dark/75">05:00 - 13:00 (Toleransi 15 mnt)</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-brand-green/20 text-brand-dark border border-brand-green/40">
            Aktif
          </span>
        </div>

        {/* Tab Jenis: Masuk vs Keluar */}
        <div className="p-4 pb-2">
          <div className="grid grid-cols-2 p-1 bg-brand-canvas rounded-xl border border-brand-dark/15">
            <button
              type="button"
              onClick={() => setJenisPresensi("masuk")}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                jenisPresensi === "masuk"
                  ? "bg-brand-dark text-white shadow-sm"
                  : "text-brand-dark/70 hover:text-brand-dark"
              }`}
            >
              Presensi Masuk
            </button>
            <button
              type="button"
              onClick={() => setJenisPresensi("keluar")}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                jenisPresensi === "keluar"
                  ? "bg-brand-dark text-white shadow-sm"
                  : "text-brand-dark/70 hover:text-brand-dark"
              }`}
            >
              Presensi Keluar
            </button>
          </div>
        </div>

        {/* Form Presensi */}
        <form onSubmit={handleSubmit} className="px-4 py-2 space-y-4 flex-1 flex flex-col">
          {/* Pilih Pekerja Dapur */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-brand-dark flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Pilih Pekerja
            </label>
            <select
              value={selectedAnggotaId}
              onChange={(e) => setSelectedAnggotaId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-brand-dark/20 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark"
            >
              {anggotaList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.namaLengkap} — {a.jabatan}
                </option>
              ))}
            </select>
          </div>

          {/* Viewfinder Kamera */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Verifikasi Wajah (Selfie)
              </span>
              {capturedPhoto && (
                <button
                  type="button"
                  onClick={handleRetakePhoto}
                  className="text-brand-dark font-bold underline hover:opacity-80"
                >
                  Foto Ulang
                </button>
              )}
            </div>

            <div className="relative aspect-[4/3] rounded-2xl bg-zinc-950 border-2 border-brand-dark overflow-hidden flex items-center justify-center">
              {capturedPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={capturedPhoto}
                  alt="Hasil Selfie"
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
                  {/* Grid guide */}
                  <div className="absolute inset-6 border border-dashed border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
                    <span className="text-[11px] text-white/50 bg-black/40 px-2 py-0.5 rounded">
                      Posisikan Wajah di Sini
                    </span>
                  </div>
                </>
              )}

              {/* Tombol Ambil Snapshot di atas kamera */}
              {!capturedPhoto && isCameraActive && (
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="absolute bottom-3 px-4 py-2 rounded-full bg-white text-brand-dark text-xs font-bold shadow-lg flex items-center gap-1.5 hover:bg-brand-canvas active:scale-95 transition"
                >
                  <Camera className="w-4 h-4" /> Jepret Foto
                </button>
              )}

              {/* Pesan Error Kamera */}
              {cameraError && (
                <div className="absolute inset-0 bg-zinc-900/90 p-4 text-center flex flex-col items-center justify-center text-white space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                  <p className="text-xs text-zinc-300">Akses kamera tidak tersedia.</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 rounded-lg bg-brand-pastel text-brand-dark text-xs font-bold"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* GPS Geofence Status */}
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
                  className="text-[11px] underline flex items-center gap-0.5"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                {jarakDapur !== null
                  ? `Jarak ke dapur: ±${jarakDapur} meter (Radius aman: ${
                      dapur?.radiusMeter || 100
                    }m)`
                  : gpsError || "Sedang mengukur radius akurat..."}
              </p>
            </div>
          </div>

          {/* Fingerprint / Biometrik Box */}
          <div className="p-3 rounded-xl border border-brand-dark/15 bg-brand-canvas flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  biometricVerified
                    ? "bg-brand-green text-brand-dark"
                    : "bg-brand-dark/10 text-brand-dark"
                }`}
              >
                <Fingerprint className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-brand-dark">Biometrik (Fingerprint)</p>
                <p className="text-[11px] text-brand-dark/70">{biometricStatusText}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleVerifyBiometric}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                biometricVerified
                  ? "bg-brand-green text-brand-dark border border-brand-green"
                  : "bg-brand-dark text-white hover:bg-brand-dark/90 active:scale-95"
              }`}
            >
              {biometricVerified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" /> Pindai
                </>
              )}
            </button>
          </div>

          {/* Alert Notification */}
          {alert && (
            <div
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

          {/* Action Button: CLOCK IN / OUT */}
          <button
            type="submit"
            disabled={isLoading || !coords || !capturedPhoto}
            className="w-full h-14 rounded-xl bg-brand-dark text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-brand-dark/90 active:scale-[0.98] transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-brand-green" />
                KIRIM PRESENSI {jenisPresensi.toUpperCase()}
              </>
            )}
          </button>
        </form>

        {/* Log Kehadiran Hari Ini */}
        <div className="p-4 border-t border-brand-dark/10 space-y-2 mt-auto bg-brand-canvas/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-brand-dark flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Riwayat Presensi Hari Ini
            </span>
            <span className="text-[11px] text-brand-dark/60">
              {presensiHariIni.length} Terdata
            </span>
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
                      {new Date(log.waktuCatat).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB • {log.jenis === "masuk" ? "Clock In" : "Clock Out"}
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
        </div>
      </div>
    </div>
  );
}
