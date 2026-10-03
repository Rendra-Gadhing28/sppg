"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { NAV_LINKS, SITE_CONFIG } from "@/content/site";
import { List, X, CalendarCheck, SignIn } from "@phosphor-icons/react";
import { ClayButton } from "../ui/ClayButton";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("#beranda");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 24);

      // Scroll progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress((scrollY / docHeight) * 100);
      }

      // Determine active section using scroll position
      const sections = ["beranda", "alur", "fitur", "cerdas", "peran", "target", "faq", "kontak"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveSection(`#${section}`);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[1100px] transition-all duration-300">
      <nav
        className={`w-full rounded-full clay bg-padi-50/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-all duration-300 relative overflow-hidden ${
          isScrolled ? "h-14 shadow-xl" : "h-16"
        }`}
        aria-label="Navigasi Utama"
      >
        {/* Left: Logo & Wordmark */}
        <a href="#beranda" className="flex items-center gap-2.5 group select-none">
          <div className="w-10 h-10 rounded-xl bg-brand-pastel text-brand-dark font-extrabold flex items-center justify-center text-base hover:opacity-90 transition shrink-0 shadow-sm border border-brand-pastel/80">
            {/* Minimalist Tray Silhouette */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M4 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4zm0 2h7v8H4V8zm9 0h7v3h-7V8zm0 5h7v3h-7v-3z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-lg sm:text-xl text-brand-dark leading-none tracking-tight">
              {SITE_CONFIG.brandName}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-brand-dark/70 leading-tight">
              {SITE_CONFIG.subLabel}
            </span>
          </div>
        </a>

        {/* Center: Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full font-display font-bold text-sm transition-all duration-200 select-none ${
                  isActive
                    ? "clay-inset text-brand-dark bg-brand-pastel/30"
                    : "text-brand-dark/75 hover:text-brand-dark hover:bg-brand-pastel/20"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Right: CTA & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          <Link
            href="/presensi"
            className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full font-display font-bold text-xs bg-brand-green/25 text-brand-dark border border-brand-green/50 hover:bg-brand-green/40 transition-all duration-200 select-none cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Presensi HP</span>
          </Link>

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full font-display font-bold text-sm text-brand-dark hover:bg-brand-pastel/30 transition-all duration-200 select-none cursor-pointer"
          >
            <SignIn size={16} weight="bold" />
            <span>Masuk</span>
          </Link>

          <ClayButton href="#kontak" size="sm" variant="primary" tone="navy" className="hidden sm:inline-flex">
            <CalendarCheck size={16} weight="bold" className="mr-1 text-brand-pastel" />
            Jadwalkan demo
          </ClayButton>

          {/* Mobile Menu Trigger */}
          <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <Dialog.Trigger asChild>
              <button
                className="md:hidden w-10 h-10 rounded-full clay-sm flex items-center justify-center text-brand-dark cursor-pointer"
                aria-label="Buka menu navigasi"
              >
                <List size={22} weight="bold" />
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-brand-dark/40 backdrop-blur-xs z-50 animate-in fade-in" />
              <Dialog.Content className="fixed inset-x-4 top-4 bottom-6 max-h-[90svh] bg-white rounded-[32px] clay p-6 z-50 flex flex-col justify-between overflow-y-auto outline-none animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-4 border-b border-brand-dark/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-pastel text-brand-dark font-extrabold flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M4 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4zm0 2h7v8H4V8zm9 0h7v3h-7V8zm0 5h7v3h-7v-3z" />
                      </svg>
                    </div>
                    <span className="font-display font-bold text-lg text-brand-dark">
                      SPPG Dapur MBG
                    </span>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className="w-10 h-10 rounded-full clay-sm flex items-center justify-center text-brand-dark cursor-pointer"
                      aria-label="Tutup menu"
                    >
                      <X size={20} weight="bold" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Staggered Navigation Links */}
                <div className="flex flex-col gap-3 py-6">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-2xl font-display font-bold text-xl text-brand-dark hover:bg-brand-pastel/20 transition-colors flex items-center justify-between"
                    >
                      <span>{link.label}</span>
                      <span className="text-brand-dark/60 text-sm">→</span>
                    </a>
                  ))}
                </div>

                {/* Bottom Sheet Action */}
                <div className="pt-4 border-t border-brand-dark/10 flex flex-col gap-2.5">
                  <Link
                    href="/presensi"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-brand-green/25 text-brand-dark font-display font-bold text-base border border-brand-green/50 active:scale-[0.98] transition hover:bg-brand-green/40 select-none cursor-pointer"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Presensi Pekerja (Selfie / HP)</span>
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-brand-pastel/40 text-brand-dark font-display font-bold text-base border border-brand-pastel/80 active:scale-[0.98] transition hover:bg-brand-pastel/60 select-none cursor-pointer"
                  >
                    <SignIn size={20} weight="bold" />
                    <span>Masuk ke Sistem</span>
                  </Link>
                  <ClayButton
                    href="#kontak"
                    onClick={() => setMobileMenuOpen(false)}
                    size="lg"
                    variant="primary"
                    tone="navy"
                    className="w-full"
                  >
                    <CalendarCheck size={20} weight="bold" className="mr-2 text-brand-pastel" />
                    Jadwalkan demo sistem
                  </ClayButton>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        {/* Scroll Progress Bar along bottom edge */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-transparent">
          <div
            style={{ width: `${scrollProgress}%` }}
            className="h-full bg-brand-dark transition-all duration-100 ease-out"
          />
        </div>
      </nav>
    </header>
  );
}
