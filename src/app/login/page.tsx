"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  ChefHat,
  HeartPulse,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Demo Autofill
  const handleQuickFill = (email: string) => {
    setIdentifier(email);
    setPassword("password123");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal masuk ke sistem.");
      }

      // Redirect ke dashboard
      router.push("/dashboard");
      router.refresh();
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

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Identifier */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-dark">
                Email atau No. Handphone
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-dark/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@sppg.id atau 0812..."
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-brand-dark/20 bg-brand-canvas/40 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-dark focus:bg-white transition"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-dark">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-dark/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-brand-dark/20 bg-brand-canvas/40 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-dark focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-dark/50 hover:text-brand-dark"
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

          {/* Quick Demo Accounts */}
          <div className="pt-4 border-t border-brand-dark/10 space-y-2.5">
            <p className="text-[11px] font-bold text-brand-dark/70 text-center uppercase tracking-wider">
              Pilihan Akun Demo (Fase 1)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin@sppg.id")}
                className="p-2.5 rounded-xl border border-brand-dark/15 bg-brand-canvas/70 hover:bg-brand-pastel/30 text-left text-xs transition space-y-0.5 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 font-bold text-brand-dark">
                  <ChefHat className="w-3.5 h-3.5 text-brand-dark" /> Admin SPPG
                </div>
                <p className="text-[10px] text-brand-dark/60 truncate">admin@sppg.id</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("gizi@sppg.id")}
                className="p-2.5 rounded-xl border border-brand-dark/15 bg-brand-canvas/70 hover:bg-brand-pastel/30 text-left text-xs transition space-y-0.5 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 font-bold text-brand-dark">
                  <HeartPulse className="w-3.5 h-3.5 text-brand-gold" /> Ahli Gizi
                </div>
                <p className="text-[10px] text-brand-dark/60 truncate">gizi@sppg.id</p>
              </button>
            </div>
            <p className="text-[10px] text-center text-brand-dark/50">
              Kata sandi default: <span className="font-mono font-bold">password123</span>
            </p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="text-center text-xs space-x-4 text-brand-dark/70">
          <Link href="/" className="hover:underline">
            ← Kembali ke Beranda
          </Link>
          <span>•</span>
          <Link href="/presensi" className="hover:underline">
            Presensi Pekerja (Tanpa Login)
          </Link>
        </div>
      </div>
    </div>
  );
}
