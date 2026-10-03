"use client";

import React from "react";

export interface ClayProgressProps {
  value: number; // 0 to 100
  max?: number;
  tone?: "daun" | "wortel" | "telur" | "es" | "terung" | "cabai";
  label?: string;
  showValueText?: boolean;
  className?: string;
}

export function ClayProgress({
  value,
  max = 100,
  tone = "daun",
  label,
  showValueText = false,
  className = "",
}: ClayProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {(label || showValueText) && (
        <div className="flex justify-between items-center text-xs font-semibold text-ink-900">
          {label && <span>{label}</span>}
          {showValueText && <span className="tabular-nums">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="w-full h-3.5 rounded-full clay-inset overflow-hidden p-0.5">
        <div
          data-tone={tone}
          style={{ width: `${percentage}%` }}
          className="h-full rounded-full transition-all duration-300 relative overflow-hidden bg-daun-400"
        >
          <div className="absolute inset-x-0 top-0 h-[40%] bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
