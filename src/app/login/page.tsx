"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal masuk ke sistem.");
      }

      // Redirect penuh ke dashboard agar cookie terkirim sempurna ke server middleware
      const redirectUrl =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect") || "/dashboard"
          : "/dashboard";
      window.location.href = redirectUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-dark flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex w-14 h-14 rounded-2xl bg-brand-dark text-white font-bold items-center justify-center text-2xl shadow-md border-2 border-brand-pastel"
          >
            SP
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
            SPPG Mandiri Jaya
          </h1>
          <p className="text-xs text-brand-dark/70">
            Sistem Informasi Operasional Dapur Makanan Bergizi Gratis (MBG)
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-dark/15 shadow-xl space-y-6">
          <div className="border-b border-brand-dark/10 pb-4">
            <h2 className="text-base font-bold text-brand-dark">Masuk ke Sistem</h2>
            <p className="text-xs text-brand-dark/60 mt-0.5">
              Gunakan kredensial akun staf SPPG yang terdaftar.
            </p>
          </div>

          {/* Akses Cepat Presensi Pekerja Tanpa Login */}
          <div className="p-3.5 rounded-2xl bg-brand-green/20 border border-brand-green/40 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                Pekerja Dapur / Tim Armada?
              </p>
              <p className="text-[11px] text-brand-dark/75">
                Presensi mandiri (selfie & GPS) langsung tanpa perlu login akun staf.
              </p>
            </div>
            <Link
              href="/presensi"
              className="shrink-0 px-3.5 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-brand-dark/90 active:scale-95 transition shadow-xs cursor-pointer whitespace-nowrap"
            >
              Presensi HP →
            </Link>
          </div>

          {errorMsg && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Identifier */}
            <div className="space-y-1.5">
              <label htmlFor="login-identifier" className="text-xs font-bold text-brand-dark">
                Email atau No. Handphone
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-dark/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-identifier"
                  type="text"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errorMsg)}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@sppg.id atau 0812..."
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-brand-dark/20 bg-brand-canvas/40 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-dark focus:bg-white transition"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-bold text-brand-dark">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-dark/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errorMsg)}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-brand-dark/20 bg-brand-canvas/40 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-dark focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-dark/50 hover:text-brand-dark rounded-lg cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-brand-dark text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-brand-dark/90 active:scale-[0.98] transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                "Memverifikasi..."
              ) : (
                <>
                  Masuk Sekarang <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Navigation */}
        <div className="text-center text-xs space-y-2 text-brand-dark/70">
          <div>
            <Link
              href="/daftar"
              className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-bold text-brand-dark hover:underline px-3 py-1.5 rounded-xl bg-white border border-brand-dark/15 shadow-2xs"
            >
              Karyawan Baru? Daftarkan Wajah & Biometrik →
            </Link>
          </div>
          <div className="space-x-4">
            <Link href="/" className="min-h-[44px] inline-flex items-center hover:underline px-2">
              ← Kembali ke Beranda
            </Link>
            <span>•</span>
            <Link href="/presensi" className="min-h-[44px] inline-flex items-center hover:underline px-2">
              Presensi Pekerja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
