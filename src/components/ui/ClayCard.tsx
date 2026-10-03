"use client";

import React from "react";

export interface ClayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?:
    | "navy"
    | "brand"
    | "pastel"
    | "pastel-soft"
    | "green"
    | "gold"
    | "padi"
    | "padi-soft"
    | "daun"
    | "daun-soft"
    | "telur"
    | "telur-soft"
    | "wortel"
    | "wortel-soft"
    | "es"
    | "es-soft"
    | "terung"
    | "terung-soft"
    | "cabai"
    | "cabai-soft";
  interactive?: boolean;
}

export function ClayCard({
  tone = "padi",
  interactive = false,
  children,
  className = "",
  ...props
}: ClayCardProps) {
  return (
    <div
      data-tone={tone}
      className={`clay p-5 sm:p-6 lg:p-8 flex flex-col transition-all duration-200 ${
        interactive
          ? "hover:-translate-y-1 hover:shadow-lg cursor-pointer"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
