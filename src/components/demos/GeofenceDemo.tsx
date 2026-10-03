"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Camera, CheckCircle, WarningCircle, User } from "@phosphor-icons/react";
import { ClayButton } from "../ui/ClayButton";
import { ClayChip } from "../ui/ClayChip";

export function GeofenceDemo({ isVisible }: { isVisible?: boolean }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [workerPos, setWorkerPos] = useState({ x: 190, y: 155 }); // center is (180, 140)
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isPresensiDone, setIsPresensiDone] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Center of the kitchen in map coordinates
  const kitchenCenter = { x: 180, y: 140 };
  const radiusPx = 110; // 110px corresponds to 100m

  // Distance in px and converted to meters
  const distPx = Math.hypot(workerPos.x - kitchenCenter.x, workerPos.y - kitchenCenter.y);
  const distMeters = Math.round((distPx / radiusPx) * 100);
  const isValid = distMeters <= 100;

  // Auto idle circular movement before user interaction
  useEffect(() => {
    if (hasUserInteracted || !isVisible || isPresensiDone) return;
    let angle = 0;
    const interval = setInterval(() => {
      angle += 0.04;
      const r = 45 + Math.sin(angle * 2) * 20;
      setWorkerPos({
        x: kitchenCenter.x + Math.cos(angle) * r,
        y: kitchenCenter.y + Math.sin(angle) * r,
      });
    }, 50);

    return () => clearInterval(interval);
  }, [hasUserInteracted, isVisible, isPresensiDone, kitchenCenter.x, kitchenCenter.y]);

  const updateWorkerPosition = useCallback((clientX: number, clientY: number) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(20, Math.min(rect.width - 20, clientX - rect.left));
    const y = Math.max(20, Math.min(rect.height - 20, clientY - rect.top));
    setWorkerPos({ x, y });
    setHasUserInteracted(true);
    setIsPresensiDone(false);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateWorkerPosition(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateWorkerPosition(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleSelfiePresensi = () => {
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
      setIsPresensiDone(true);
    }, 220);
  };

  const handleReset = () => {
    setWorkerPos({ x: 190, y: 155 });
    setHasUserInteracted(false);
    setIsPresensiDone(false);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Map Display */}
      <div
        ref={mapRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-[220px] rounded-[20px] bg-padi-200/50 overflow-hidden cursor-crosshair border border-ink-900/10 touch-none select-none"
      >
        {/* White Flash Effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200" />
        )}

        {/* Map grid & road decor */}
        <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
          <line x1="0" y1="140" x2="400" y2="140" stroke="#4d6757" strokeWidth="14" strokeOpacity="0.25" />
          <line x1="180" y1="0" x2="180" y2="300" stroke="#4d6757" strokeWidth="14" strokeOpacity="0.25" />
          <rect x="40" y="30" width="80" height="60" rx="8" fill="#4d6757" fillOpacity="0.15" />
          <rect x="240" y="40" width="70" height="70" rx="8" fill="#4d6757" fillOpacity="0.15" />
          <rect x="50" y="170" width="90" height="40" rx="8" fill="#4d6757" fillOpacity="0.15" />
        </svg>

        {/* Kitchen Radius Ring (100m) */}
        <div
          style={{
            left: `${kitchenCenter.x - radiusPx}px`,
            top: `${kitchenCenter.y - radiusPx}px`,
            width: `${radiusPx * 2}px`,
            height: `${radiusPx * 2}px`,
          }}
          className={`absolute rounded-full border-2 border-dashed border-daun-700 bg-daun-100/35 pointer-events-none ${
            !hasUserInteracted ? "animate-pulse" : ""
          }`}
        />

        {/* Dashed line connecting Kitchen and Worker */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1={kitchenCenter.x}
            y1={kitchenCenter.y}
            x2={workerPos.x}
            y2={workerPos.y}
            stroke={isValid ? "#1f7a4d" : "#ff7e6e"}
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Kitchen Center Pin */}
        <div
          style={{
            left: `${kitchenCenter.x}px`,
            top: `${kitchenCenter.y}px`,
            transform: "translate(-50%, -50%)",
          }}
          className="absolute z-10 flex flex-col items-center pointer-events-none"
        >
          <div className="w-8 h-8 rounded-full bg-daun-400 text-ink-900 clay-sm flex items-center justify-center font-bold text-xs shadow-md">
            <MapPin size={18} weight="fill" />
          </div>
          <span className="text-[10px] font-bold text-ink-900 bg-white/80 px-1.5 py-0.5 rounded-full mt-0.5 shadow-xs">
            Dapur
          </span>
        </div>

        {/* Worker Pin (Draggable) */}
        <div
          style={{
            left: `${workerPos.x}px`,
            top: `${workerPos.y}px`,
            transform: "translate(-50%, -50%)",
          }}
          className={`absolute z-20 flex flex-col items-center cursor-grab active:cursor-grabbing transition-transform ${
            !isValid ? "animate-shake" : ""
          }`}
        >
          <div
            data-tone={isValid ? "wortel" : "cabai"}
            className="w-9 h-9 rounded-full clay-sm flex items-center justify-center text-ink-900 shadow-lg border border-white"
          >
            <User size={18} weight="bold" />
          </div>
          <span className="text-[10px] font-bold text-ink-900 bg-white px-2 py-0.5 rounded-full mt-0.5 shadow-sm whitespace-nowrap">
            {distMeters} m
          </span>
        </div>

        {/* Drag Hint */}
        {!hasUserInteracted && (
          <div className="absolute bottom-2 left-2 right-2 text-center text-[11px] font-semibold text-ink-600 bg-padi-50/90 py-1 px-2 rounded-full shadow-xs">
            Geser atau sentuh pin pekerja untuk tes radius geofence
          </div>
        )}
      </div>

      {/* Info & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          {isValid ? (
            <ClayChip tone="daun" icon={<CheckCircle size={16} weight="fill" />}>
              Presensi valid (dalam radius 100 m)
            </ClayChip>
          ) : (
            <ClayChip tone="cabai" icon={<WarningCircle size={16} weight="fill" />}>
              Di luar radius, presensi ditandai
            </ClayChip>
          )}
          {isPresensiDone && (
            <span className="text-xs font-bold text-daun-700 bg-daun-100 px-2 py-1 rounded-full">
              Tepat waktu (05.42 WIB)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ClayButton
            size="sm"
            variant="primary"
            tone={isValid ? "daun" : "wortel"}
            onClick={handleSelfiePresensi}
          >
            <Camera size={16} weight="bold" className="mr-1" />
            Ambil selfie & presensi
          </ClayButton>
          {hasUserInteracted && (
            <button
              onClick={handleReset}
              className="text-xs font-bold text-ink-600 hover:text-ink-900 underline ml-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
