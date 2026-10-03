"use client";

import React from "react";

export interface ClayChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?:
    | "navy"
    | "brand"
    | "pastel"
    | "green"
    | "gold"
    | "daun"
    | "telur"
    | "cabai"
    | "es"
    | "terung"
    | "wortel"
    | "padi";
  icon?: React.ReactNode;
}

export function ClayChip({
  tone = "padi",
  icon,
  children,
  className = "",
  ...props
}: ClayChipProps) {
  return (
    <span
      data-tone={tone}
      className={`inline-flex items-center gap-1.5 h-7 sm:h-8 px-3 rounded-full text-xs sm:text-[13px] font-semibold text-ink-900 clay-sm select-none transition-transform hover:scale-[1.02] ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0 text-ink-900/80">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
}
