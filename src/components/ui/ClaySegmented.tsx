"use client";

import React from "react";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface ClaySegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  className?: string;
  tone?: "daun" | "wortel" | "telur" | "es" | "terung";
}

export function ClaySegmented<T extends string>({
  value,
  onChange,
  options,
  className = "",
  tone = "daun",
}: ClaySegmentedProps<T>) {
  return (
    <div
      role="tablist"
      className={`clay-inset p-1.5 flex items-center rounded-full select-none ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.value)}
            data-tone={isSelected ? tone : "padi"}
            className={`flex-1 min-h-[44px] px-4 py-2 rounded-full font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-daun-700 ${
              isSelected
                ? "clay-sm text-ink-900 shadow-sm"
                : "text-ink-600 hover:text-ink-900 hover:bg-black/5"
            }`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
