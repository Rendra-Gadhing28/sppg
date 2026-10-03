"use client";

import React, { useId, useState, useEffect, useRef } from "react";
import {
  ThermometerHot,
  MapPin,
  Truck,
  ChatsTeardrop,
} from "@phosphor-icons/react";
import { IconBubble } from "../ui/IconBubble";

export function Tray() {
  const idPrefix = useId().replace(/:/g, "");
  const [squished, setSquished] = useState(false);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax on hover/pointer fine
  useEffect(() => {
    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (rect.width / 2);
      const dy = (e.clientY - centerY) / (rect.height / 2);

      // Clamp between -1 and 1
      const cx = Math.max(-1, Math.min(1, dx));
      const cy = Math.max(-1, Math.min(1, dy));
      setPointerOffset({ x: cx, y: cy });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSquish = () => {
    setSquished(true);
    setTimeout(() => setSquished(false), 450);
  };

  // Parallax offsets
  const trayTransform = `translate(${pointerOffset.x * 6}px, ${pointerOffset.y * 6}px) scale(${
    squished ? "0.96, 1.04" : "1"
  })`;
  const cardTransform = `translate(${pointerOffset.x * 14}px, ${pointerOffset.y * 14}px)`;
  const blobTransform = `translate(${pointerOffset.x * 22}px, ${pointerOffset.y * 22}px)`;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[640px] aspect-[4/3] flex items-center justify-center select-none"
    >
      {/* 3 Background decorative clay blobs */}
      <div
        style={{ transform: blobTransform }}
        className="absolute -top-6 -right-6 w-44 h-44 rounded-full bg-brand-pastel/50 clay-gloss blur-sm transition-transform duration-300 pointer-events-none -z-10"
      />
      <div
        style={{ transform: blobTransform }}
        className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-brand-gold/30 clay-gloss blur-sm transition-transform duration-300 pointer-events-none -z-10"
      />
      <div
        style={{ transform: blobTransform }}
        className="absolute top-1/2 -right-4 w-24 h-24 rounded-full bg-brand-green/30 clay-gloss blur-xs transition-transform duration-300 pointer-events-none -z-10"
      />

      {/* SVG Ompreng + Food Tray */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleSquish}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSquish();
          }
        }}
        style={{ transform: trayTransform }}
        className="w-full h-full cursor-pointer transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-daun-700/40 rounded-3xl"
        title="Ketuk ompreng untuk efek kenyal"
        aria-label="Ompreng makanan bergizi gratis interaktif, tekan untuk efek kenyal"
      >
        <svg
          viewBox="0 0 640 480"
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="Ompreng makanan bergizi gratis dengan nasi, ayam, sayur, dan buah"
        >
          <defs>
            {/* Stainless Steel Tray Gradient */}
            <linearGradient id={`${idPrefix}-tray-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#b4dfe9" />
              <stop offset="100%" stopColor="#8cbcc9" />
            </linearGradient>

            {/* Inset Compartment Shade */}
            <linearGradient id={`${idPrefix}-inset-grad`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#071e49" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
            </linearGradient>

            {/* Rice Gradient */}
            <radialGradient id={`${idPrefix}-rice-grad`} cx="30%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f8fafb" />
              <stop offset="100%" stopColor="#b4dfe9" />
            </radialGradient>

            {/* Chicken / Ayam Gradient */}
            <radialGradient id={`${idPrefix}-ayam-grad`} cx="30%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#feeee1" />
              <stop offset="55%" stopColor="#ffa24d" />
              <stop offset="100%" stopColor="#ba5f14" />
            </radialGradient>

            {/* Vegetables / Sayur Gradient */}
            <radialGradient id={`${idPrefix}-veg-grad`} cx="30%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#eaf6df" />
              <stop offset="60%" stopColor="#92d05d" />
              <stop offset="100%" stopColor="#4e8223" />
            </radialGradient>

            {/* Fruit / Buah Gradient */}
            <radialGradient id={`${idPrefix}-fruit-grad`} cx="30%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#fbf5e7" />
              <stop offset="60%" stopColor="#d1b06c" />
              <stop offset="100%" stopColor="#8c6e31" />
            </radialGradient>

            {/* Filter Drop Shadow with Brand Dark Tint */}
            <filter id={`${idPrefix}-tray-shadow`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="24" stdDeviation="16" floodColor="#071e49" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Group Ompreng with Drop Shadow */}
          <g filter={`url(#${idPrefix}-tray-shadow)`}>
            {/* Base Tray: 560x360 rounded rect, r=56 */}
            <rect
              x="40"
              y="60"
              width="560"
              height="360"
              rx="56"
              fill={`url(#${idPrefix}-tray-grad)`}
              stroke="#ffffff"
              strokeWidth="4"
            />
            {/* Tray Rim Inner Highlight */}
            <rect
              x="44"
              y="64"
              width="552"
              height="352"
              rx="52"
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="2"
            />

            {/* 4 Sekat Cekung (Compartments) */}
            {/* Sekat 1: Besar di kiri (Nasi) */}
            <rect
              x="68"
              y="88"
              width="240"
              height="304"
              rx="36"
              fill={`url(#${idPrefix}-inset-grad)`}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
            />

            {/* Sekat 2: Kanan-Atas (Lauk Hewani / Ayam) */}
            <rect
              x="332"
              y="88"
              width="240"
              height="92"
              rx="24"
              fill={`url(#${idPrefix}-inset-grad)`}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
            />

            {/* Sekat 3: Kanan-Tengah (Sayur) */}
            <rect
              x="332"
              y="194"
              width="240"
              height="92"
              rx="24"
              fill={`url(#${idPrefix}-inset-grad)`}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
            />

            {/* Sekat 4: Kanan-Bawah (Buah) */}
            <rect
              x="332"
              y="300"
              width="240"
              height="92"
              rx="24"
              fill={`url(#${idPrefix}-inset-grad)`}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
            />

            {/* --- MAKANAN CLAY --- */}
            {/* Sekat Nasi: Gundukan Nasi + Butir-Butir */}
            <g className={squished ? "opacity-95" : ""}>
              {/* Gundukan dasar */}
              <ellipse cx="188" cy="240" rx="96" ry="110" fill={`url(#${idPrefix}-rice-grad)`} />
              {/* Highlight elips putih 45% */}
              <ellipse cx="168" cy="190" rx="55" ry="40" fill="#ffffff" fillOpacity="0.45" />

              {/* 10 Butir nasi kecil */}
              <ellipse cx="150" cy="210" rx="8" ry="4" fill="#ffffff" transform="rotate(-15 150 210)" />
              <ellipse cx="180" cy="195" rx="9" ry="4" fill="#ffffff" transform="rotate(25 180 195)" />
              <ellipse cx="210" cy="220" rx="8" ry="4" fill="#ffffff" transform="rotate(-30 210 220)" />
              <ellipse cx="160" cy="250" rx="9" ry="4" fill="#ffffff" transform="rotate(10 160 250)" />
              <ellipse cx="195" cy="265" rx="8" ry="4" fill="#ffffff" transform="rotate(-20 195 265)" />
              <ellipse cx="225" cy="250" rx="7" ry="4" fill="#ffffff" transform="rotate(45 225 250)" />
              <ellipse cx="140" cy="280" rx="8" ry="4" fill="#ffffff" transform="rotate(5 140 280)" />
              <ellipse cx="175" cy="300" rx="9" ry="4" fill="#ffffff" transform="rotate(-15 175 300)" />
              <ellipse cx="210" cy="290" rx="8" ry="4" fill="#ffffff" transform="rotate(35 210 290)" />
              <ellipse cx="185" cy="230" rx="7" ry="4" fill="#ffffff" transform="rotate(-5 185 230)" />
            </g>

            {/* Sekat Ayam (2 potong ayam panggang clay) */}
            <g className={squished ? "opacity-95" : ""}>
              {/* Potong 1 */}
              <ellipse cx="400" cy="134" rx="46" ry="26" fill={`url(#${idPrefix}-ayam-grad)`} transform="rotate(-12 400 134)" />
              <ellipse cx="390" cy="126" rx="24" ry="12" fill="#ffffff" fillOpacity="0.4" />
              {/* Potong 2 */}
              <ellipse cx="485" cy="134" rx="42" ry="24" fill={`url(#${idPrefix}-ayam-grad)`} transform="rotate(10 485 134)" />
              <ellipse cx="475" cy="128" rx="20" ry="10" fill="#ffffff" fillOpacity="0.4" />
            </g>

            {/* Sekat Sayur (Gerombol daun 3 bulatan) */}
            <g className={squished ? "opacity-95" : ""}>
              <circle cx="390" cy="240" r="28" fill={`url(#${idPrefix}-veg-grad)`} />
              <ellipse cx="382" cy="232" rx="14" ry="8" fill="#ffffff" fillOpacity="0.4" />
              <circle cx="440" cy="236" r="32" fill={`url(#${idPrefix}-veg-grad)`} />
              <ellipse cx="432" cy="226" rx="16" ry="10" fill="#ffffff" fillOpacity="0.4" />
              <circle cx="490" cy="242" r="26" fill={`url(#${idPrefix}-veg-grad)`} />
              <ellipse cx="484" cy="234" rx="12" ry="7" fill="#ffffff" fillOpacity="0.4" />
              {/* Bintik wortel di sayur */}
              <circle cx="415" cy="250" r="7" fill="#ffa24d" />
              <circle cx="465" cy="248" r="8" fill="#ffa24d" />
            </g>

            {/* Sekat Buah (Irisan pisang & jeruk) */}
            <g className={squished ? "opacity-95" : ""}>
              <circle cx="395" cy="346" r="24" fill={`url(#${idPrefix}-fruit-grad)`} />
              <ellipse cx="390" cy="340" rx="12" ry="7" fill="#ffffff" fillOpacity="0.4" />
              <circle cx="452" cy="346" r="24" fill="#ffa24d" />
              <ellipse cx="446" cy="340" rx="12" ry="7" fill="#ffffff" fillOpacity="0.4" />
              <circle cx="508" cy="346" r="22" fill={`url(#${idPrefix}-fruit-grad)`} />
              <ellipse cx="504" cy="340" rx="10" ry="6" fill="#ffffff" fillOpacity="0.4" />
            </g>

            {/* Uap Hangat (3 S-curve paths rising & fading over rice & chicken) */}
            <g className="opacity-75">
              <path
                d="M 160 140 Q 150 115 165 90 T 160 50"
                fill="none"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
                className="animate-[steam_3.2s_ease-in-out_infinite]"
              />
              <path
                d="M 195 130 Q 210 105 195 80 T 205 45"
                fill="none"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
                className="animate-[steam_3.2s_ease-in-out_1.1s_infinite]"
              />
              <path
                d="M 440 100 Q 430 75 445 55 T 440 25"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="animate-[steam_3.2s_ease-in-out_2.1s_infinite]"
              />
            </g>
          </g>
        </svg>
      </div>

      {/* 4 Floating UI Cards */}
      {/* 1. Suhu Boks (Top Left) */}
      <div
        style={{ transform: cardTransform }}
        className="absolute -top-3 -left-3 sm:-left-8 w-44 sm:w-52 p-3 sm:p-3.5 rounded-[22px] clay bg-white transition-transform duration-300 pointer-events-auto border border-brand-pastel/40"
      >
        <div className="flex items-center gap-2.5">
          <IconBubble tone="es" size="sm">
            <ThermometerHot size={18} weight="fill" className="text-brand-dark" />
          </IconBubble>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-brand-dark/70 truncate">Suhu boks</div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-base sm:text-lg text-brand-dark tabular-nums">
                62 °C
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            </div>
          </div>
        </div>
        <div className="mt-1 text-[10px] sm:text-[11px] font-bold text-brand-dark truncate">
          Aman, 60 °C atau lebih
        </div>
      </div>

      {/* 2. Presensi (Top Right) */}
      <div
        style={{ transform: cardTransform }}
        className="absolute -top-4 -right-3 sm:-right-6 w-44 sm:w-48 p-3 sm:p-3.5 rounded-[22px] clay bg-white transition-transform duration-300 pointer-events-auto border border-brand-pastel/40"
      >
        <div className="flex items-center gap-2.5">
          <IconBubble tone="navy" size="sm">
            <MapPin size={18} weight="fill" className="text-white" />
          </IconBubble>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-brand-dark/70 truncate">Presensi</div>
            <div className="font-display font-bold text-sm sm:text-base text-brand-dark truncate">
              Dalam radius
            </div>
          </div>
        </div>
        <div className="mt-1 text-[10px] sm:text-[11px] font-medium text-brand-dark/70">
          Jarak dapur: 42 m
        </div>
      </div>

      {/* 3. Armada ETA (Bottom Left - Hidden on small mobile to reduce clutter) */}
      <div
        style={{ transform: cardTransform }}
        className="hidden sm:flex flex-col absolute -bottom-4 -left-6 w-48 p-3.5 rounded-[22px] clay bg-white transition-transform duration-300 pointer-events-auto border border-brand-pastel/40"
      >
        <div className="flex items-center gap-2.5">
          <IconBubble tone="telur" size="sm">
            <Truck size={18} weight="fill" className="text-brand-dark" />
          </IconBubble>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-brand-dark/70 truncate">Armada B 1234 XY</div>
            <div className="font-display font-extrabold text-sm text-brand-dark tabular-nums">
              ETA 10.45
            </div>
          </div>
        </div>
        <div className="mt-2 w-full h-1.5 rounded-full clay-inset overflow-hidden">
          <div className="h-full bg-brand-gold w-3/4 rounded-full" />
        </div>
      </div>

      {/* 4. PO Status (Bottom Right) */}
      <div
        style={{ transform: cardTransform }}
        className="absolute -bottom-3 -right-2 sm:-right-8 w-44 sm:w-52 p-3 sm:p-3.5 rounded-[22px] clay bg-white transition-transform duration-300 pointer-events-auto border border-brand-pastel/40"
      >
        <div className="flex items-center gap-2.5">
          <IconBubble tone="daun" size="sm">
            <ChatsTeardrop size={18} weight="fill" className="text-brand-dark" />
          </IconBubble>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold text-brand-dark/70 truncate">
              PO-20261003-0007
            </div>
            <div className="font-display font-bold text-xs sm:text-sm text-brand-dark truncate">
              Terkirim ke supplier
            </div>
          </div>
        </div>
        <div className="mt-1 text-[10px] font-bold text-brand-dark flex items-center gap-1">
          <span>✓</span> Terkirim otomatis via WA
        </div>
      </div>
    </div>
  );
}
