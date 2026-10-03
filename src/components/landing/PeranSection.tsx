"use client";

import React, { useState } from "react";
import { DAFTAR_PERAN } from "@/content/peran";
import { ClayCard } from "../ui/ClayCard";
import { ClayChip } from "../ui/ClayChip";
import { IconBubble } from "../ui/IconBubble";
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
  Check,
} from "@phosphor-icons/react";

const ICON_MAP: Record<string, React.ReactNode> = {
  Shield: <Shield size={22} weight="fill" />,
  Gear: <Gear size={22} weight="fill" />,
  Compass: <Compass size={22} weight="fill" />,
  BowlFood: <BowlFood size={22} weight="fill" />,
  CookingPot: <CookingPot size={22} weight="fill" />,
  Microscope: <Microscope size={22} weight="fill" />,
  Warehouse: <Warehouse size={22} weight="fill" />,
  Truck: <Truck size={22} weight="fill" />,
  Receipt: <Receipt size={22} weight="fill" />,
  GraduationCap: <GraduationCap size={22} weight="fill" />,
  Certificate: <Certificate size={22} weight="fill" />,
  ChartBar: <ChartBar size={22} weight="fill" />,
};

export function PeranSection() {
  const [filterFase, setFilterFase] = useState<string>("semua");

  const filteredRoles =
    filterFase === "semua"
      ? DAFTAR_PERAN
      : filterFase === "fase1"
      ? DAFTAR_PERAN.filter((r) => r.fase.includes("1"))
      : filterFase === "fase2"
      ? DAFTAR_PERAN.filter((r) => r.fase.includes("2"))
      : DAFTAR_PERAN.filter((r) => r.fase.includes("3") || r.fase.includes("4"));

  return (
    <section
      id="peran"
      className="py-20 sm:py-28 lg:py-36 border-b border-ink-900/10 relative"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-[40rem]">
            <h2 className="font-display font-extrabold text-ink-900 text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
              Dua belas peran dengan batas tanggung jawab yang tegas.
            </h2>
            <p className="mt-4 text-ink-600 font-sans font-medium text-base sm:text-lg leading-relaxed text-pretty">
              Setiap pihak—dari kru lantai masak, ahli gizi, kurir, hingga auditor BGN—memiliki hak akses dan alur kerja yang terpisah.
            </p>
          </div>

          {/* Filter Pills */}
          <div role="tablist" aria-label="Filter peran operasional" className="flex flex-wrap gap-2">
            {[
              { id: "semua", label: "Semua Peran (12)" },
              { id: "fase1", label: "Fase 1 (Dapur)" },
              { id: "fase2", label: "Fase 2 (Rantai Pasok)" },
              { id: "fase3", label: "Fase 3 & 4 (Skala & AI)" },
            ].map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filterFase === f.id}
                onClick={() => setFilterFase(f.id)}
                className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  filterFase === f.id
                    ? "clay-sm bg-daun-400 text-ink-900 shadow-sm"
                    : "clay-inset text-ink-600 hover:text-ink-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr">
          {filteredRoles.map((role) => (
            <ClayCard
              key={role.id}
              tone="padi"
              className="p-5 sm:p-6 justify-between transition-all duration-200 hover:-translate-y-1 bg-padi-50"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <IconBubble tone={role.tone} size="md">
                    {ICON_MAP[role.iconName]}
                  </IconBubble>
                  <ClayChip tone={role.tone}>{role.fase}</ClayChip>
                </div>

                <h3 className="font-display font-bold text-xl text-ink-900">
                  {role.nama}
                </h3>
                <p className="mt-2 text-ink-600 font-sans text-xs sm:text-sm leading-relaxed">
                  {role.ringkasan}
                </p>

                {/* 3 Concrete Action Bullets */}
                <div className="mt-4 pt-3 border-t border-ink-900/10">
                  <span className="text-[11px] font-bold text-ink-900 block mb-2">
                    Yang bisa dilakukan:
                  </span>
                  <ul className="flex flex-col gap-1.5 text-xs text-ink-900">
                    {role.aksi.map((act) => (
                      <li key={act} className="flex items-start gap-2">
                        <Check size={14} weight="bold" className="text-daun-700 mt-0.5 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-ink-900/5 text-[11px] font-semibold text-ink-600">
                Akses Peran: Terotorisasi RBAC
              </div>
            </ClayCard>
          ))}
        </div>
      </div>
    </section>
  );
}
