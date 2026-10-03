"use client";

import React, { useState } from "react";
import { MASALAH_SOLUSI } from "@/content/masalah";
import { ClaySegmented } from "../ui/ClaySegmented";
import { ClayCard } from "../ui/ClayCard";
import { ClayChip } from "../ui/ClayChip";
import { IconBubble } from "../ui/IconBubble";
import {
  WarningCircle,
  CheckCircle,
  MapPin,
  Calculator,
  Archive,
  ThermometerHot,
  Signature,
  ClipboardText,
} from "@phosphor-icons/react";

const ICON_MAP: Record<string, React.ReactNode> = {
  MapPin: <MapPin size={24} weight="fill" />,
  Calculator: <Calculator size={24} weight="fill" />,
  Archive: <Archive size={24} weight="fill" />,
  ThermometerHot: <ThermometerHot size={24} weight="fill" />,
  Signature: <Signature size={24} weight="fill" />,
  FileCheck: <ClipboardText size={24} weight="fill" />,
};

export function MasalahSection() {
  const [mode, setMode] = useState<"manual" | "sppg">("sppg");

  return (
    <section
      id="masalah"
      className="py-20 sm:py-28 lg:py-36 border-b border-ink-900/10 relative"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-[40rem]">
            <h2 className="font-display font-extrabold text-ink-900 text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
              Dapur yang melayani ribuan porsi tidak boleh bergantung pada catatan manual.
            </h2>
            <p className="mt-4 text-ink-600 font-sans font-medium text-base sm:text-lg leading-relaxed max-w-[38rem] text-pretty">
              Enam titik rawan yang paling perlu dijaga di dapur MBG, dan cara SPPG menutupnya.
            </p>
          </div>

          {/* Segmented Control */}
          <div className="shrink-0">
            <ClaySegmented
              value={mode}
              onChange={(val) => setMode(val as "manual" | "sppg")}
              options={[
                {
                  value: "manual",
                  label: "Risiko manual",
                  icon: <WarningCircle size={18} weight="fill" className="text-telur-700" />,
                },
                {
                  value: "sppg",
                  label: "Dengan SPPG",
                  icon: <CheckCircle size={18} weight="fill" className="text-daun-700" />,
                },
              ]}
              tone={mode === "sppg" ? "daun" : "telur"}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {/* 6 Cards Grid (3x2 on desktop, 2x3 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr">
          {MASALAH_SOLUSI.map((item) => {
            const isSppg = mode === "sppg";

            return (
              <ClayCard
                key={item.id}
                tone={isSppg ? "daun-soft" : "telur-soft"}
                className="justify-between min-h-[260px] transition-all duration-300"
              >
                <div>
                  {/* Top Bar: Icon + Chip */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <IconBubble tone={isSppg ? "daun" : "telur"} size="md">
                      {ICON_MAP[item.iconName]}
                    </IconBubble>
                    <ClayChip tone={isSppg ? "daun" : "telur"}>
                      {item.chipBukti}
                    </ClayChip>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-xl text-ink-900 leading-snug">
                    {item.judul}
                  </h3>

                  {/* Description based on mode */}
                  <p className="mt-3 text-ink-900 font-sans text-sm sm:text-base leading-relaxed">
                    {isSppg ? item.denganSppg : item.risikoManual}
                  </p>
                </div>

                {/* Footer Status Line */}
                <div className="mt-6 pt-3 border-t border-ink-900/10 flex items-center gap-2 text-xs font-bold text-ink-900">
                  {isSppg ? (
                    <>
                      <CheckCircle size={16} weight="fill" className="text-daun-700 shrink-0" />
                      <span>Tertata otomatis dalam sistem terpadu</span>
                    </>
                  ) : (
                    <>
                      <WarningCircle size={16} weight="fill" className="text-cabai-700 shrink-0" />
                      <span>Rentan human error & sulit diaudit</span>
                    </>
                  )}
                </div>
              </ClayCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
