"use client";

import React from "react";
import { ROADMAP_FASES } from "@/content/roadmap";
import { ClayCard } from "../ui/ClayCard";
import { ClayChip } from "../ui/ClayChip";
import { CheckCircle, Circle } from "@phosphor-icons/react";

export function RoadmapSection() {
  return (
    <section
      id="roadmap"
      className="py-20 sm:py-28 lg:py-36 bg-padi-200/40 border-b border-ink-900/10 relative"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="max-w-[40rem] mb-12 sm:mb-16">
          <h2 className="font-display font-extrabold text-ink-900 text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
            Peta jalan pengembangan dan kesiapan operasional.
          </h2>
          <p className="mt-4 text-ink-600 font-sans font-medium text-base sm:text-lg leading-relaxed text-pretty">
            Status implementasi ditampilkan apa adanya. Dari pondasi dapur tunggal hingga sistem klaster terdistribusi berskala ribuan porsi.
          </p>
        </div>

        {/* 4 Phases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {ROADMAP_FASES.map((phase) => {
            const isCompleted = phase.status === "Selesai" || phase.status === "Terimplementasi";

            return (
              <ClayCard
                key={phase.fase}
                tone="padi"
                className="p-5 sm:p-6 justify-between bg-padi-50 transition-all hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display font-black text-2xl text-ink-900">
                      0{phase.fase}
                    </span>
                    <ClayChip tone={phase.statusTone}>
                      {isCompleted ? (
                        <CheckCircle size={14} weight="fill" className="text-daun-700 mr-0.5" />
                      ) : (
                        <Circle size={12} weight="fill" className="text-es-700 mr-0.5" />
                      )}
                      {phase.status}
                    </ClayChip>
                  </div>

                  <h3 className="font-display font-bold text-xl text-ink-900 mb-2">
                    {phase.nama}
                  </h3>
                  <p className="text-xs text-ink-600 font-sans leading-relaxed mb-4">
                    {phase.deskripsi}
                  </p>

                  <div className="space-y-2 pt-3 border-t border-ink-900/10">
                    {phase.poinKunci.map((pt) => (
                      <div key={pt} className="flex items-start gap-1.5 text-xs text-ink-900">
                        <span className="text-daun-700 font-bold shrink-0">✓</span>
                        <span className="leading-snug">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-ink-900/5 text-[11px] font-semibold text-ink-600">
                  {isCompleted ? "Telah Aktif di Produksi" : "Arsitektur & Spesifikasi Teruji"}
                </div>
              </ClayCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
