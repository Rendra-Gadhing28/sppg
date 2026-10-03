"use client";

import React from "react";

export interface IconBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
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
  size?: "sm" | "md" | "lg";
}

export function IconBubble({
  tone = "daun",
  size = "md",
  children,
  className = "",
  ...props
}: IconBubbleProps) {
  const sizeClasses = {
    sm: "w-10 h-10 rounded-[14px] text-lg",
    md: "w-12 h-12 rounded-[18px] text-2xl",
    lg: "w-16 h-16 rounded-[22px] text-3xl",
  }[size];

  return (
    <div
      data-tone={tone}
      className={`clay-sm clay-gloss flex items-center justify-center shrink-0 text-ink-900 transition-transform select-none ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
