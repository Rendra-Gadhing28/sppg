"use client";

import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

export interface ClaySliderProps {
  value: number[];
  onValueChange: (val: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  tone?: "daun" | "wortel" | "telur" | "es" | "terung";
  label?: string;
  formatValue?: (val: number) => string;
}

export function ClaySlider({
  value,
  onValueChange,
  min = 500,
  max = 10000,
  step = 250,
  tone = "daun",
  label,
  formatValue = (v) => new Intl.NumberFormat("id-ID").format(v),
}: ClaySliderProps) {
  const currentVal = value[0] ?? min;

  return (
    <div className="w-full flex flex-col gap-2">
      {label && (
        <div className="flex justify-between items-center">
          <span className="font-display font-bold text-sm text-ink-900">
            {label}
          </span>
          <span className="font-display font-extrabold text-base text-ink-900 tabular-nums">
            {formatValue(currentVal)}
          </span>
        </div>
      )}
      <SliderPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        className="relative flex items-center select-none touch-none w-full h-8 cursor-pointer"
      >
        <SliderPrimitive.Track className="relative clay-inset grow rounded-full h-3">
          <SliderPrimitive.Range
            data-tone={tone}
            className="absolute rounded-full h-full bg-daun-400"
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          data-tone={tone}
          aria-label={label || "Slider"}
          className="block w-7 h-7 rounded-full clay-sm bg-padi-50 border-2 border-daun-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-daun-700 transition-transform active:scale-110"
        />
      </SliderPrimitive.Root>
    </div>
  );
}
