"use client";

import React from "react";
import { Tray } from "../illustrations/Tray";
import { ClayButton } from "../ui/ClayButton";
import { ClayChip } from "../ui/ClayChip";
import {
  CalendarCheck,
  Truck,
  MapPin,
  Archive,
  ThermometerHot,
} from "@phosphor-icons/react";

export function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-24 lg:pb-32 overflow-x-clip"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & CTAs (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            {/* Top Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full clay-sm bg-brand-pastel/30 text-xs sm:text-sm font-display font-bold text-brand-dark border border-brand-pastel/60">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
                Sistem Operasional Program Makan Bergizi Gratis
              </span>
            </div>

            {/* H1 Headline */}
            <h1 className="font-display font-extrabold text-brand-dark leading-[1.04] tracking-tight text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] text-balance">
              Dapur MBG yang tertib, higienis, dan bisa dilacak sampai meja siswa.
            </h1>

            {/* Lead Paragraph */}
            <p className="mt-5 text-brand-dark/75 font-sans font-medium text-base sm:text-lg lg:text-xl leading-relaxed max-w-[34rem] text-pretty">
              SPPG menyatukan presensi pekerja, resep dan stok, pemeriksaan mutu bahan, pengiriman, sampai audit keamanan pangan dalam satu sistem. Ribuan porsi tiba tepat waktu, sesuai gizi, dan tetap hangat.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <ClayButton
                href="#kontak"
                size="lg"
                variant="primary"
                tone="navy"
                className="w-full sm:w-auto"
              >
                <CalendarCheck size={20} weight="bold" className="mr-2 text-brand-pastel" />
                Jadwalkan demo
              </ClayButton>
              <ClayButton
                href="#alur"
                size="lg"
                variant="secondary"
                tone="padi"
                className="w-full sm:w-auto bg-white text-brand-dark border border-brand-dark/15"
              >
                <Truck size={20} weight="bold" className="mr-2 text-brand-dark" />
                Lihat perjalanan satu porsi
              </ClayButton>
            </div>

            {/* Three Separate Capability Chips */}
            <div className="mt-8 pt-6 border-t border-brand-dark/10 flex flex-wrap gap-2.5 sm:gap-3 w-full">
              <ClayChip
                tone="es"
                icon={<MapPin size={16} weight="fill" className="text-brand-dark" />}
              >
                Presensi selfie dan geofence
              </ClayChip>
              <ClayChip
                tone="telur"
                icon={<Archive size={16} weight="fill" className="text-brand-dark" />}
              >
                Stok FEFO anti-basi
              </ClayChip>
              <ClayChip
                tone="daun"
                icon={<ThermometerHot size={16} weight="fill" className="text-brand-dark" />}
              >
                Suhu boks terpantau sensor
              </ClayChip>
            </div>
          </div>

          {/* Right Column: Heroic Ompreng Tray (6 cols) */}
          <div className="lg:col-span-6 flex items-center justify-center relative w-full">
            <Tray />
          </div>
        </div>
      </div>
    </section>
  );
}
