"use client";

import React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

export interface ClaySwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  tone?: "daun" | "wortel" | "telur" | "es" | "terung";
  disabled?: boolean;
}

export function ClaySwitch({
  checked,
  onCheckedChange,
  label,
  id,
  tone = "daun",
  disabled,
}: ClaySwitchProps) {
  const generatedId = React.useId();
  const switchId = id || generatedId;

  return (
    <div className="inline-flex items-center gap-3 select-none">
      <SwitchPrimitives.Root
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        data-tone={checked ? tone : "padi"}
        className="w-14 h-8 rounded-full clay-inset relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-daun-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SwitchPrimitives.Thumb
          data-tone={checked ? tone : "padi"}
          className={`block w-6 h-6 rounded-full clay-sm transition-transform duration-200 will-change-transform ${
            checked ? "translate-x-7 bg-daun-400" : "translate-x-1 bg-padi-50"
          }`}
        />
      </SwitchPrimitives.Root>
      {label && (
        <label
          htmlFor={switchId}
          className="font-sans font-medium text-sm text-ink-900 cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  );
}
