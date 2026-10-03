"use client";

import React from "react";
import { DAFTAR_FAQ } from "@/content/faq";
import { ClayAccordion } from "../ui/ClayAccordion";
import { ClayChip } from "../ui/ClayChip";

export function FaqSection() {
  const accordionItems = DAFTAR_FAQ.map((f) => ({
    id: f.id,
    title: f.tanya,
    content: f.jawab,
  }));

  return (
    <section
      id="faq"
      className="py-20 sm:py-28 lg:py-36 border-b border-ink-900/10 relative"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column Header (5 cols) */}
          <div className="lg:col-span-5 max-w-[32rem]">
            <div className="inline-flex items-center gap-2 mb-3">
              <ClayChip tone="telur">Tanya Jawab</ClayChip>
            </div>
            <h2 className="font-display font-extrabold text-ink-900 text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
              Pertanyaan umum seputar implementasi dapur MBG.
            </h2>
            <p className="mt-4 text-ink-600 font-sans font-medium text-base sm:text-lg leading-relaxed text-pretty">
              Hal-hal teknis dan operasional yang paling sering ditanyakan oleh pengelola yayasan, kepala dapur, dan dinas terkait.
            </p>
            <div className="mt-6 p-4 rounded-[22px] clay-sm bg-padi-50/70 inline-block">
              <span className="text-xs font-bold text-ink-900 block">
                Punya pertanyaan teknis khusus?
              </span>
              <a
                href="#kontak"
                className="text-xs font-extrabold text-daun-700 hover:underline mt-1 inline-block"
              >
                Konsultasikan langsung dengan tim kami →
              </a>
            </div>
          </div>

          {/* Right Column Accordion (7 cols) */}
          <div className="lg:col-span-7 bg-padi-50/60 p-6 sm:p-8 rounded-[32px] clay">
            <ClayAccordion items={accordionItems} />
          </div>
        </div>
      </div>
    </section>
  );
}
