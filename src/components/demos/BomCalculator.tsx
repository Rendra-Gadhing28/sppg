"use client";

import React, { useState, useEffect } from "react";
import { ClaySlider } from "../ui/ClaySlider";
import { ClayButton } from "../ui/ClayButton";
import { ClayChip } from "../ui/ClayChip";
import { WarningCircle, CheckCircle, ShoppingBagOpen } from "@phosphor-icons/react";

interface Ingredient {
  name: string;
  gramasi: number; // in grams per portion
  stokKg: number; // available warehouse stock in kg
}

const INGREDIENTS: Ingredient[] = [
  { name: "Beras Premium", gramasi: 90, stokKg: 650 },
  { name: "Daging Ayam Fillet", gramasi: 60, stokKg: 400 },
  { name: "Tahu Putih Segar", gramasi: 40, stokKg: 250 },
  { name: "Sayur (Wortel & Buncis)", gramasi: 50, stokKg: 300 },
  { name: "Buah (Pisang & Jeruk)", gramasi: 80, stokKg: 500 },
];

export function BomCalculator() {
  const [porsi, setPorsi] = useState<number[]>([3000]);
  const [poStep, setPoStep] = useState<"idle" | "draft" | "diajukan" | "dikirim">("idle");

  const currentPorsi = porsi[0];

  // Calculate needs and deficits
  const items = INGREDIENTS.map((ing) => {
    const butuhKg = Math.round((currentPorsi * ing.gramasi) / 1000);
    const defisitKg = Math.max(0, butuhKg - ing.stokKg);
    const rasio = Math.min(butuhKg / ing.stokKg, 2.0); // capped for bar visual
    return {
      ...ing,
      butuhKg,
      defisitKg,
      rasio,
      isDefisit: defisitKg > 0,
    };
  });

  const totalDefisitBahan = items.filter((i) => i.isDefisit).length;

  const handleBuatPo = () => {
    setPoStep("draft");
  };

  useEffect(() => {
    if (poStep === "draft") {
      const t1 = setTimeout(() => setPoStep("diajukan"), 1200);
      return () => clearTimeout(t1);
    }
    if (poStep === "diajukan") {
      const t2 = setTimeout(() => setPoStep("dikirim"), 1200);
      return () => clearTimeout(t2);
    }
    if (poStep === "dikirim") {
      const t3 = setTimeout(() => setPoStep("idle"), 4000);
      return () => clearTimeout(t3);
    }
  }, [poStep]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Slider Porsi */}
      <div className="bg-padi-50/80 p-3 sm:p-4 rounded-[20px] clay-sm">
        <ClaySlider
          label="Target Porsi Masak Hari Ini"
          value={porsi}
          onValueChange={setPorsi}
          min={500}
          max={10000}
          step={250}
          tone="wortel"
          formatValue={(val) => `${new Intl.NumberFormat("id-ID").format(val)} porsi`}
        />
      </div>

      {/* Ingredient Rows */}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.name}
            className={`p-2.5 sm:p-3 rounded-[16px] transition-colors flex flex-col gap-1.5 ${
              item.isDefisit ? "bg-cabai-100/60 border border-cabai-400/30" : "bg-padi-50/60"
            }`}
          >
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-ink-900">
              <span className="font-display font-bold">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-ink-600 text-[11px] sm:text-xs">
                  Stok: {item.stokKg} kg
                </span>
                <span className="tabular-nums font-bold text-ink-900">
                  Butuh: {item.butuhKg} kg
                </span>
                {item.isDefisit ? (
                  <ClayChip tone="cabai">
                    Defisit {item.defisitKg} kg
                  </ClayChip>
                ) : (
                  <span className="text-xs text-daun-700 font-bold hidden sm:inline">
                    Cukup
                  </span>
                )}
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="w-full h-2 rounded-full clay-inset overflow-hidden">
              <div
                style={{
                  transform: `scaleX(${Math.min(item.butuhKg / item.stokKg, 1)})`,
                  transformOrigin: "left",
                }}
                className={`h-full transition-transform duration-300 rounded-full ${
                  item.isDefisit ? "bg-cabai-400" : "bg-daun-400"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action & PO Stepper Simulation */}
      <div className="pt-1 flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/10">
        <div className="flex items-center gap-2">
          {totalDefisitBahan > 0 ? (
            <ClayChip tone="cabai" icon={<WarningCircle size={16} weight="fill" />}>
              {totalDefisitBahan} bahan defisit dari stok gudang
            </ClayChip>
          ) : (
            <ClayChip tone="daun" icon={<CheckCircle size={16} weight="fill" />}>
              Semua bahan tercukupi untuk {new Intl.NumberFormat("id-ID").format(currentPorsi)} porsi
            </ClayChip>
          )}
        </div>

        {poStep === "idle" ? (
          <ClayButton
            size="sm"
            variant="primary"
            tone="wortel"
            disabled={totalDefisitBahan === 0}
            onClick={handleBuatPo}
          >
            <ShoppingBagOpen size={16} weight="bold" className="mr-1" />
            Buat draft PO otomatis
          </ClayButton>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-ink-900 bg-padi-50 p-2 rounded-full clay-sm animate-in fade-in">
            <span className="text-[11px] text-ink-600 px-1">PO-20261003-0001:</span>
            <span className={`px-2 py-0.5 rounded-full ${poStep === "draft" ? "bg-telur-400 text-ink-900" : "bg-daun-100 text-daun-700"}`}>
              Draft
            </span>
            <span>→</span>
            <span className={`px-2 py-0.5 rounded-full ${poStep === "diajukan" ? "bg-wortel-400 text-ink-900" : poStep === "dikirim" ? "bg-daun-100 text-daun-700" : "opacity-40"}`}>
              Diajukan
            </span>
            <span>→</span>
            <span className={`px-2 py-0.5 rounded-full ${poStep === "dikirim" ? "bg-daun-400 text-ink-900 font-extrabold" : "opacity-40"}`}>
              Terkirim ke Supplier ✓
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
