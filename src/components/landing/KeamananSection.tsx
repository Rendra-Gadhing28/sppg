"use client";

import React from "react";
import { SPESIFIKASI_KEAMANAN } from "@/content/keamanan";
import { ClayCard } from "../ui/ClayCard";
import { ClayChip } from "../ui/ClayChip";
import { ShieldCheck } from "@phosphor-icons/react";

export function KeamananSection() {
  return (
    <section
      id="keamanan"
      className="py-20 sm:py-28 lg:py-36 bg-padi-200/50 border-b border-ink-900/10 relative"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="max-w-[42rem] mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <ClayChip tone="daun" icon={<ShieldCheck size={16} weight="fill" />}>
              Keamanan Data & Keandalan
            </ClayChip>
          </div>
          <h2 className="font-display font-extrabold text-ink-900 text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
            Arsitektur tangguh yang melindungi integritas data dan anggaran.
          </h2>
          <p className="mt-4 text-ink-600 font-sans font-medium text-base sm:text-lg leading-relaxed text-pretty">
            Bukan sekadar klaim pemasaran, melainkan spesifikasi rekayasa perangkat lunak ketat yang dibangun di atas fondasi kriptografi modern dan kepatuhan hukum.
          </p>
        </div>

        {/* 6 Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {SPESIFIKASI_KEAMANAN.map((sec, idx) => (
            <ClayCard
              key={sec.judul}
              tone="padi"
              className="p-6 justify-between bg-padi-50 transition-all hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-ink-600 uppercase tracking-wider">
                    {sec.kategori}
                  </span>
                  <ClayChip tone={sec.tone} className="h-6 text-[10px] px-2">
                    Pilar 0{idx + 1}
                  </ClayChip>
                </div>

                <h3 className="font-display font-bold text-lg sm:text-xl text-ink-900 mb-2 leading-snug">
                  {sec.judul}
                </h3>
                <p className="text-xs sm:text-sm text-ink-600 font-sans leading-relaxed">
                  {sec.uraian}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-ink-900/10 flex items-center justify-between text-xs font-bold text-daun-700">
                <span className="truncate">{sec.standar}</span>
                <span>✓</span>
              </div>
            </ClayCard>
          ))}
        </div>
      </div>
    </section>
  );
}
