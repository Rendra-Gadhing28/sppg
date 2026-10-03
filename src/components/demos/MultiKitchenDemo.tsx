"use client";

import React, { useState } from "react";
import { ClayButton } from "../ui/ClayButton";
import { Buildings, ArrowRight } from "@phosphor-icons/react";

const STEPS = [
  "1. Permintaan Stok Satelit",
  "2. Persetujuan Koordinator",
  "3. Surat Jalan Terbit",
  "4. QC Terima di Satelit",
];

export function MultiKitchenDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);

  const startTransfer = () => {
    setIsTransferring(true);
    setCurrentStep(1);

    const t1 = setTimeout(() => setCurrentStep(2), 1000);
    const t2 = setTimeout(() => setCurrentStep(3), 2000);
    const t3 = setTimeout(() => {
      setCurrentStep(4);
      setIsTransferring(false);
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsTransferring(false);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Hub and Spoke Diagram */}
      <div className="relative w-full h-[180px] rounded-[18px] bg-padi-50/70 clay-inset flex items-center justify-center overflow-hidden">
        {/* Connection Spoke Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#4d6757" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="#4d6757" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="50%" y1="50%" x2="20%" y2="75%" stroke="#4d6757" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="#4d6757" strokeWidth="2" strokeDasharray="3 3" />
        </svg>

        {/* Central Kitchen (Hub) */}
        <div className="z-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full clay-sm bg-daun-400 flex items-center justify-center text-ink-900 shadow-md">
            <Buildings size={28} weight="fill" />
          </div>
          <span className="font-display font-extrabold text-xs text-ink-900 mt-1">
            Dapur Pusat CK-01
          </span>
          <span className="text-[10px] text-ink-600">Kapasitas 6.000 porsi</span>
        </div>

        {/* 4 Satellite Kitchens */}
        <div className="absolute top-3 left-4 flex flex-col items-center">
          <div className="w-9 h-9 rounded-full clay-sm bg-es-400 flex items-center justify-center text-ink-900">
            <span className="text-[11px] font-bold">SK-01</span>
          </div>
          <span className="text-[10px] font-semibold text-ink-600">Satelit Utara</span>
        </div>

        <div className="absolute top-3 right-4 flex flex-col items-center">
          <div
            className={`w-9 h-9 rounded-full clay-sm flex items-center justify-center text-ink-900 transition-all ${
              currentStep > 0 ? "bg-wortel-400 ring-2 ring-wortel-700 animate-pulse" : "bg-es-400"
            }`}
          >
            <span className="text-[11px] font-bold">SK-02</span>
          </div>
          <span className="text-[10px] font-bold text-ink-900">Satelit Timur (B)</span>
        </div>

        <div className="absolute bottom-3 left-4 flex flex-col items-center">
          <div className="w-9 h-9 rounded-full clay-sm bg-es-400 flex items-center justify-center text-ink-900">
            <span className="text-[11px] font-bold">SK-03</span>
          </div>
          <span className="text-[10px] font-semibold text-ink-600">Satelit Barat</span>
        </div>

        <div className="absolute bottom-3 right-4 flex flex-col items-center">
          <div className="w-9 h-9 rounded-full clay-sm bg-es-400 flex items-center justify-center text-ink-900">
            <span className="text-[11px] font-bold">SK-04</span>
          </div>
          <span className="text-[10px] font-semibold text-ink-600">Satelit Selatan</span>
        </div>

        {/* Transferring Token Animation */}
        {isTransferring && (
          <div className="absolute z-20 px-2 py-1 rounded-full bg-wortel-400 text-[10px] font-bold text-ink-900 shadow-md animate-pulse">
            50 kg Beras Transfer
          </div>
        )}
      </div>

      {/* 4 Steps Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStep >= stepNum;
          const isCurrent = currentStep === stepNum;

          return (
            <div
              key={step}
              className={`p-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all ${
                isDone
                  ? "bg-daun-100 text-daun-700 clay-sm"
                  : isCurrent
                  ? "bg-wortel-100 text-wortel-700 clay-sm"
                  : "bg-padi-50/50 text-ink-600/60"
              }`}
            >
              {step}
            </div>
          );
        })}
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-ink-600">
          Transfer stok antar-cabang terpantau penuh oleh Koordinator Regional.
        </span>
        <div className="flex items-center gap-2">
          {currentStep === 4 && (
            <button
              onClick={handleReset}
              className="text-xs font-bold text-ink-600 hover:text-ink-900 underline cursor-pointer"
            >
              Reset
            </button>
          )}
          <ClayButton
            size="sm"
            variant="primary"
            tone="es"
            disabled={isTransferring}
            onClick={startTransfer}
          >
            <ArrowRight size={16} weight="bold" className="mr-1" />
            Ajukan transfer 50 kg dari Satelit B
          </ClayButton>
        </div>
      </div>
    </div>
  );
}
