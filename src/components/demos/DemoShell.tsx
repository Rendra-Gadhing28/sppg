"use client";

import React, { useRef, useEffect, useState } from "react";
import { IconBubble } from "../ui/IconBubble";
import { ClayChip } from "../ui/ClayChip";
import { ArrowClockwise } from "@phosphor-icons/react";

export interface DemoShellProps {
  title: string;
  benefit: string;
  fase: string;
  tone: "daun" | "wortel" | "telur" | "es" | "terung" | "cabai";
  icon: React.ReactNode;
  onReset?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function DemoShell({
  title,
  benefit,
  fase,
  tone,
  icon,
  onReset,
  children,
  className = "",
}: DemoShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`clay p-5 sm:p-6 lg:p-7 flex flex-col justify-between h-full bg-padi-50 transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <IconBubble tone={tone} size="md">
            {icon}
          </IconBubble>
          <div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-ink-900 leading-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-ink-600 line-clamp-2 mt-0.5 max-w-[28rem]">
              {benefit}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ClayChip tone={tone}>{fase}</ClayChip>
          {onReset && (
            <button
              onClick={onReset}
              title="Reset simulasi"
              aria-label={`Reset ${title}`}
              className="w-8 h-8 rounded-full clay-sm flex items-center justify-center text-ink-600 hover:text-ink-900 transition-transform active:rotate-180 cursor-pointer"
            >
              <ArrowClockwise size={16} weight="bold" />
            </button>
          )}
        </div>
      </div>

      {/* Screen Area (Clay Inset) */}
      <div className="clay-inset p-4 sm:p-5 rounded-[24px] min-h-[300px] flex flex-col justify-center relative overflow-hidden">
        {/* Pass visibility state to children via cloneElement or context */}
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<{ isVisible?: boolean }>, {
              isVisible,
            })
          : children}
      </div>

      {/* Footer Caption */}
      <div className="mt-3 flex items-center justify-between text-[11px] sm:text-xs text-ink-600/80">
        <span>Contoh ilustrasi, bukan data nyata</span>
        <span className="font-medium">Simulasi Interaktif</span>
      </div>
    </div>
  );
}
