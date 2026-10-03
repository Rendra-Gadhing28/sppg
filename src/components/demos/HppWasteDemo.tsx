"use client";

import React, { useState } from "react";
import { ClaySlider } from "../ui/ClaySlider";
import { ClayChip } from "../ui/ClayChip";

export function HppWasteDemo() {
  const [kenaikanBahan, setKenaikanBahan] = useState<number[]>([2]);

  const kenaikan = kenaikanBahan[0];
  const hppEstimasi = 12000;
  const deviasiPersen = Number((1.2 + 0.5 * kenaikan).toFixed(1));
  const hppAktual = Math.round(hppEstimasi * (1 + deviasiPersen / 100));

  let deviasiTone: "daun" | "telur" | "cabai" = "daun";
  let deviasiStatus = "Terkendali";

  if (deviasiPersen > 5) {
    deviasiTone = "cabai";
    deviasiStatus = "Pembengkakan anggaran";
  } else if (deviasiPersen > 3) {
    deviasiTone = "telur";
    deviasiStatus = "Perlu perhatian";
  }

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Slider Kenaikan Harga Bahan */}
      <div className="bg-padi-50/70 p-3 rounded-[16px] clay-sm">
        <ClaySlider
          label="Kenaikan Harga Komoditas Bahan Pasar"
          value={kenaikanBahan}
          onValueChange={setKenaikanBahan}
          min={0}
          max={10}
          step={1}
          tone="wortel"
          formatValue={(val) => `+${val}%`}
        />
      </div>

      {/* HPP Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
        <div className="p-3 rounded-[16px] clay-inset flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-ink-600">HPP Estimasi (Resep)</span>
            <span className="text-[11px] font-semibold text-daun-700 bg-daun-100 px-2 py-0.5 rounded-full">
              BOM Baku
            </span>
          </div>
          <div className="font-display font-extrabold text-xl text-ink-900 tabular-nums my-1">
            Rp {new Intl.NumberFormat("id-ID").format(hppEstimasi)}
            <span className="text-xs font-normal text-ink-600"> / porsi</span>
          </div>
          <div className="w-full h-2 rounded-full clay-inset overflow-hidden">
            <div className="w-3/4 h-full bg-daun-400 rounded-full" />
          </div>
        </div>

        <div className="p-3 rounded-[16px] clay-inset flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-ink-600">HPP Riil Aktual</span>
            <ClayChip tone={deviasiTone} className="h-6 text-[11px] px-2">
              {deviasiStatus} (+{deviasiPersen}%)
            </ClayChip>
          </div>
          <div className="font-display font-extrabold text-xl text-ink-900 tabular-nums my-1">
            Rp {new Intl.NumberFormat("id-ID").format(hppAktual)}
            <span className="text-xs font-normal text-ink-600"> / porsi</span>
          </div>
          <div className="w-full h-2 rounded-full clay-inset overflow-hidden">
            <div
              style={{ width: `${Math.min(75 + deviasiPersen * 3, 100)}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                deviasiTone === "cabai"
                  ? "bg-cabai-400"
                  : deviasiTone === "telur"
                  ? "bg-telur-400"
                  : "bg-daun-400"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Food Waste Donut Breakdown (3 Categories) */}
      <div className="p-3 rounded-[16px] bg-padi-50/80 clay-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Mini SVG Donut Chart */}
          <div className="relative w-14 h-14 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#d9ebd0" strokeWidth="6" />
              {/* Persiapan 50% (green) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#3dbe7a"
                strokeWidth="6"
                strokeDasharray="44 100"
                strokeDashoffset="0"
              />
              {/* Produksi 30% (yellow) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#ffd04d"
                strokeWidth="6"
                strokeDasharray="26 100"
                strokeDashoffset="-44"
              />
              {/* Distribusi 20% (orange) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#ffa24d"
                strokeWidth="6"
                strokeDasharray="18 100"
                strokeDashoffset="-70"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-[11px] text-ink-900">
              3.8%
            </div>
          </div>

          <div>
            <div className="font-display font-bold text-xs text-ink-900">
              Food Waste Terkendali (3,8% &lt; Target 4%)
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-ink-600 mt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-daun-400" /> Sisa Persiapan (50%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-telur-400" /> Sisa Masak (30%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-wortel-400" /> Piring/Distribusi (20%)
              </span>
            </div>
          </div>
        </div>

        <ClayChip tone="daun" className="self-start sm:self-auto text-[11px]">
          Target ≤ 4% Tercapai
        </ClayChip>
      </div>
    </div>
  );
}
