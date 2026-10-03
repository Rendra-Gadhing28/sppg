"use client";

import React, { useState } from "react";
import { TARGET_KPIS } from "@/content/target";
import { ClayCard } from "../ui/ClayCard";
import { ClayChip } from "../ui/ClayChip";

type CategoryFilter = "Semua" | "Presensi & Gizi" | "Rantai Pasok" | "Distribusi" | "Sistem & Keamanan";

export function TargetSection() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("Semua");

  const filtered =
    activeCategory === "Semua"
      ? TARGET_KPIS
      : TARGET_KPIS.filter((k) => k.kategori === activeCategory);

  return (
    <section
      id="target"
      className="py-20 sm:py-28 lg:py-36 border-b border-ink-900/10 relative"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-[42rem]">
            <div className="inline-flex items-center gap-2 mb-2">
              <ClayChip tone="daun">Standar Kinerja Sistem</ClayChip>
            </div>
            <h2 className="font-display font-extrabold text-ink-900 text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
              Target desain operasional yang terukur secara kuantitatif.
            </h2>
            <p className="mt-4 text-ink-600 font-sans font-medium text-base sm:text-lg leading-relaxed text-pretty">
              Seluruh metrik di bawah merupakan tolok ukur spesifikasi desain sistem untuk menjamin kualitas gizi, ketepatan waktu, dan akuntabilitas anggaran.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div role="tablist" aria-label="Filter target metrik" className="flex flex-wrap gap-2 shrink-0">
            {(
              [
                "Semua",
                "Presensi & Gizi",
                "Rantai Pasok",
                "Distribusi",
                "Sistem & Keamanan",
              ] as CategoryFilter[]
            ).map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  activeCategory === cat
                    ? "clay-sm bg-daun-400 text-ink-900"
                    : "clay-inset text-ink-600 hover:text-ink-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dense Authoritative Grid of 17 KPI Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((kpi) => (
            <ClayCard
              key={kpi.id}
              tone="padi"
              className="p-4 sm:p-5 justify-between bg-padi-50 transition-all hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-ink-600 uppercase tracking-wider">
                    {kpi.kategori}
                  </span>
                  <ClayChip tone="padi" className="h-6 text-[10px] px-2">
                    Fase {kpi.fase}
                  </ClayChip>
                </div>

                <h3 className="font-display font-bold text-base text-ink-900 leading-snug">
                  {kpi.kpi}
                </h3>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  {kpi.keterangan}
                </p>
              </div>

              {/* Big Target Value */}
              <div className="mt-4 pt-3 border-t border-ink-900/10 flex items-baseline justify-between">
                <span className="text-[11px] font-semibold text-ink-600">
                  Target Desain:
                </span>
                <span className="font-display font-black text-xl sm:text-2xl text-daun-700 tabular-nums">
                  {kpi.target}
                </span>
              </div>
            </ClayCard>
          ))}
        </div>
      </div>
    </section>
  );
}
