"use client";

import React from "react";
import Link from "next/link";
import { SITE_CONFIG } from "@/content/site";
import { ShieldCheck } from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="bg-padi-50 border-t border-ink-900/10 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-ink-900/10">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-full bg-daun-400 clay-sm flex items-center justify-center text-ink-900">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M4 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4zm0 2h7v8H4V8zm9 0h7v3h-7V8zm0 5h7v3h-7v-3z" />
                </svg>
              </div>
              <div>
                <span className="font-display font-extrabold text-xl text-ink-900 leading-none block">
                  {SITE_CONFIG.brandName}
                </span>
                <span className="text-xs font-semibold text-ink-600">
                  {SITE_CONFIG.subLabel}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed max-w-[22rem]">
              Satu sistem informasi operasional terintegrasi untuk dapur umum program Makan Bergizi Gratis: presensi geofence, takaran resep BOM, stok FEFO, kontrol mutu bahan, hingga audit transparansi BGN.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full clay-sm bg-daun-100 text-xs font-bold text-daun-700">
              <span className="w-2 h-2 rounded-full bg-daun-400 animate-pulse" />
              Sistem Operasional Aktif
            </div>
          </div>

          {/* Quick Nav Anchor Links */}
          <div className="flex flex-col gap-2.5">
            <span className="font-display font-bold text-sm text-ink-900 uppercase tracking-wider mb-1">
              Navigasi
            </span>
            <a href="#beranda" className="text-xs sm:text-sm text-ink-600 hover:text-ink-900">
              Beranda
            </a>
            <a href="#masalah" className="text-xs sm:text-sm text-ink-600 hover:text-ink-900">
              Masalah & Solusi
            </a>
            <a href="#alur" className="text-xs sm:text-sm text-ink-600 hover:text-ink-900">
              Perjalanan Satu Porsi
            </a>
            <a href="#fitur" className="text-xs sm:text-sm text-ink-600 hover:text-ink-900">
              Simulasi Modul Fitur
            </a>
            <a href="#cerdas" className="text-xs sm:text-sm text-ink-600 hover:text-ink-900">
              AI Menu & IoT HACCP
            </a>
          </div>

          {/* Standards & Specs */}
          <div className="flex flex-col gap-2.5">
            <span className="font-display font-bold text-sm text-ink-900 uppercase tracking-wider mb-1">
              Spesifikasi
            </span>
            <a href="#peran" className="text-xs sm:text-sm text-ink-600 hover:text-ink-900">
              12 Peran Pengguna
            </a>
            <a href="#roadmap" className="text-xs sm:text-sm text-ink-600 hover:text-ink-900">
              Roadmap Fase 1–4
            </a>
            <a href="#target" className="text-xs sm:text-sm text-ink-600 hover:text-ink-900">
              17 Target Desain KPI
            </a>
            <a href="#keamanan" className="text-xs sm:text-sm text-ink-600 hover:text-ink-900">
              Keamanan & Privasi Data
            </a>
            <a href="#faq" className="text-xs sm:text-sm text-ink-600 hover:text-ink-900">
              Tanya Jawab (FAQ)
            </a>
          </div>

          {/* Internal Portal Quick Access */}
          <div className="flex flex-col gap-2.5">
            <span className="font-display font-bold text-sm text-ink-900 uppercase tracking-wider mb-1">
              Akses Portal Dapur
            </span>
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-daun-700 hover:underline flex items-center gap-1.5"
            >
              <ShieldCheck size={16} weight="bold" />
              <span>Login Admin / Petugas</span>
            </Link>
            <Link
              href="/presensi"
              className="text-xs sm:text-sm text-ink-600 hover:text-ink-900"
            >
              Presensi Pekerja (Selfie GPS)
            </Link>
            <Link
              href="/distribusi"
              className="text-xs sm:text-sm text-ink-600 hover:text-ink-900"
            >
              Portal Kurir HP (e-POD)
            </Link>
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm text-ink-600 hover:text-ink-900"
            >
              Dashboard Produksi
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-600 font-medium">
          <div>{SITE_CONFIG.copyright}</div>
          <div className="flex items-center gap-4">
            <span>Standar Higienitas & Kepatuhan Gizi</span>
            <span>•</span>
            <a href="#kontak" className="hover:text-ink-900 underline">
              Jadwalkan Konsultasi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
