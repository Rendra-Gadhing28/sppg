"use client";

import React from "react";
import { DAFTAR_PERAN } from "@/content/peran";
import {
  Shield,
  Gear,
  Compass,
  BowlFood,
  CookingPot,
  Microscope,
  Warehouse,
  Truck,
  Receipt,
  GraduationCap,
  Certificate,
  ChartBar,
} from "@phosphor-icons/react";

const ICON_MAP: Record<string, React.ReactNode> = {
  Shield: <Shield size={18} weight="fill" />,
  Gear: <Gear size={18} weight="fill" />,
  Compass: <Compass size={18} weight="fill" />,
  BowlFood: <BowlFood size={18} weight="fill" />,
  CookingPot: <CookingPot size={18} weight="fill" />,
  Microscope: <Microscope size={18} weight="fill" />,
  Warehouse: <Warehouse size={18} weight="fill" />,
  Truck: <Truck size={18} weight="fill" />,
  Receipt: <Receipt size={18} weight="fill" />,
  GraduationCap: <GraduationCap size={18} weight="fill" />,
  Certificate: <Certificate size={18} weight="fill" />,
  ChartBar: <ChartBar size={18} weight="fill" />,
};

export function RoleMarquee() {
  return (
    <section
      aria-label="Peran pengguna"
      className="py-6 sm:py-8 border-y border-ink-900/10 bg-padi-200/40 overflow-hidden relative"
    >
      <div className="flex animate-marquee gap-3 sm:gap-4 px-4">
        {/* First set of 12 roles */}
        {DAFTAR_PERAN.map((peran) => (
          <div
            key={peran.id}
            data-tone={peran.tone}
            className="clay-sm px-4 py-2 flex items-center gap-2.5 whitespace-nowrap cursor-default hover:scale-105 transition-transform"
          >
            <span className="text-ink-900 shrink-0">
              {ICON_MAP[peran.iconName] || <Shield size={18} />}
            </span>
            <span className="font-display font-bold text-sm text-ink-900">
              {peran.nama}
            </span>
            <span className="text-[11px] font-semibold text-ink-600 bg-white/60 px-1.5 py-0.5 rounded-full">
              {peran.fase}
            </span>
          </div>
        ))}

        {/* Second set (duplicate for infinite loop marquee, marked aria-hidden) */}
        {DAFTAR_PERAN.map((peran) => (
          <div
            key={`dup-${peran.id}`}
            aria-hidden="true"
            data-tone={peran.tone}
            className="clay-sm px-4 py-2 flex items-center gap-2.5 whitespace-nowrap cursor-default hover:scale-105 transition-transform"
          >
            <span className="text-ink-900 shrink-0">
              {ICON_MAP[peran.iconName] || <Shield size={18} />}
            </span>
            <span className="font-display font-bold text-sm text-ink-900">
              {peran.nama}
            </span>
            <span className="text-[11px] font-semibold text-ink-600 bg-white/60 px-1.5 py-0.5 rounded-full">
              {peran.fase}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
