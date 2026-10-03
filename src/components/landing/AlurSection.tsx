"use client";

import React, { useState } from "react";
import { TAHAPAN_ALUR, StageItem } from "@/content/alur";
import { ClayCard } from "../ui/ClayCard";
import { ClayChip } from "../ui/ClayChip";
import { IconBubble } from "../ui/IconBubble";
import {
  ForkKnife,
  FileText,
  ShieldCheck,
  Archive,
  CookingPot,
  Truck,
  Signature,
  ClipboardText,
  CheckCircle,
  CaretRight,
  CaretLeft,
} from "@phosphor-icons/react";

const ICON_MAP: Record<string, React.ReactNode> = {
  resep: <ForkKnife size={26} weight="fill" />,
  po: <FileText size={26} weight="fill" />,
  qc: <ShieldCheck size={26} weight="fill" />,
  batch: <Archive size={26} weight="fill" />,
  masak: <CookingPot size={26} weight="fill" />,
  kirim: <Truck size={26} weight="fill" />,
  epod: <Signature size={26} weight="fill" />,
  laporan: <ClipboardText size={26} weight="fill" />,
};

export function AlurSection() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const currentStage: StageItem =
    TAHAPAN_ALUR.find((s) => s.id === activeStep) || TAHAPAN_ALUR[0];

  return (
    <section
      id="alur"
      className="py-20 sm:py-28 lg:py-36 bg-padi-200/50 border-b border-ink-900/10 relative"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="max-w-[40rem] mb-12 sm:mb-16">
          <h2 className="font-display font-extrabold text-ink-900 text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
            Perjalanan satu porsi, dari rencana menu sampai laporan audit.
          </h2>
          <p className="mt-4 text-ink-600 font-sans font-medium text-base sm:text-lg leading-relaxed text-pretty">
            Ikuti perjalanan bahan pangan dari tahap pertama hingga serah terima di sekolah. Setiap tahap meninggalkan jejak data yang bisa ditelusuri.
          </p>
        </div>

        {/* Stepper Progress Bar (Desktop & Tablet) */}
        <div className="mb-10 p-4 sm:p-5 rounded-[28px] clay bg-padi-50">
          {/* 8 Stage Nodes Road */}
          <div className="relative">
            {/* Background Road line */}
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-3 rounded-full clay-inset overflow-hidden -z-0">
              <div
                style={{
                  width: `${((activeStep - 1) / (TAHAPAN_ALUR.length - 1)) * 100}%`,
                }}
                className="h-full bg-daun-400 transition-all duration-300 rounded-full"
              />
            </div>

            {/* Stepper Node Buttons */}
            <ol
              role="list"
              className="relative z-10 flex items-center justify-between gap-1 select-none"
            >
              {TAHAPAN_ALUR.map((stage) => {
                const isCurrent = stage.id === activeStep;
                const isPassed = stage.id < activeStep;

                return (
                  <li key={stage.id} className="flex flex-col items-center">
                    <button
                      onClick={() => setActiveStep(stage.id)}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={`Tahap ${stage.id}: ${stage.judul}`}
                      className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center font-display font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                        isCurrent
                          ? "bg-daun-400 text-ink-900 ring-4 ring-daun-700/30 scale-110 clay-sm shadow-md"
                          : isPassed
                          ? "bg-daun-100 text-daun-700 clay-sm"
                          : "bg-padi-50 text-ink-600 clay-inset hover:bg-padi-200/50"
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle size={18} weight="fill" className="text-daun-700" />
                      ) : (
                        stage.id
                      )}
                    </button>
                    <span
                      className={`hidden lg:block text-[11px] font-bold mt-2 text-center max-w-[85px] truncate ${
                        isCurrent ? "text-daun-700 font-extrabold" : "text-ink-600"
                      }`}
                    >
                      {stage.judul}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Active Stage Detail Panel */}
        <ClayCard
          tone="padi"
          className="p-6 sm:p-8 lg:p-10 transition-all duration-300 bg-padi-50"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Detail Info (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <ClayChip tone="daun">{currentStage.fase}</ClayChip>
                {currentStage.peran.map((p) => (
                  <ClayChip key={p} tone="padi">
                    {p}
                  </ClayChip>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-1">
                <IconBubble tone="daun" size="md">
                  {ICON_MAP[currentStage.visualType]}
                </IconBubble>
                <div>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-ink-900 leading-tight">
                    {currentStage.id}. {currentStage.judul}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-daun-700 mt-0.5">
                    {currentStage.subjudul}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-ink-900 font-sans text-base sm:text-lg leading-relaxed">
                {currentStage.deskripsi}
              </p>

              {/* Data Proof Badges */}
              <div className="mt-6 pt-5 border-t border-ink-900/10 w-full">
                <span className="text-xs font-bold text-ink-600 block mb-2">
                  Bukti Data & Rekam Jejak Lapangan:
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentStage.buktiData.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-white text-ink-900 border border-ink-900/10 clay-sm"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stepper Navigation Buttons */}
              <div className="mt-8 flex items-center gap-3">
                <button
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
                  className="px-4 py-2 rounded-full clay-sm font-display font-bold text-sm text-ink-900 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-padi-200"
                >
                  <CaretLeft size={16} weight="bold" />
                  Tahap sebelumnya
                </button>
                <button
                  disabled={activeStep === TAHAPAN_ALUR.length}
                  onClick={() => setActiveStep((s) => Math.min(TAHAPAN_ALUR.length, s + 1))}
                  className="px-4 py-2 rounded-full clay-sm bg-daun-400 font-display font-bold text-sm text-ink-900 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-daun-500"
                >
                  Tahap berikutnya
                  <CaretRight size={16} weight="bold" />
                </button>
              </div>
            </div>

            {/* Right Mini Visual Representation (5 cols) */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full max-w-[340px] aspect-[4/3] rounded-[24px] clay-inset p-5 flex flex-col items-center justify-center text-center bg-padi-100/60">
                <div className="w-16 h-16 rounded-full clay-sm bg-daun-400 flex items-center justify-center text-ink-900 mb-3 shadow-md">
                  {ICON_MAP[currentStage.visualType]}
                </div>
                <div className="font-display font-bold text-lg text-ink-900">
                  {currentStage.judul}
                </div>
                <div className="text-xs text-ink-600 mt-1 max-w-[200px]">
                  Terintegrasi otomatis ke database operasional dapur
                </div>
                <div className="mt-4 px-3 py-1 rounded-full bg-white text-[11px] font-bold text-daun-700 shadow-xs">
                  SLA Tahap: Terpantau Real-time
                </div>
              </div>
            </div>
          </div>
        </ClayCard>
      </div>
    </section>
  );
}
