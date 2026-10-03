"use client";

import React, { useState } from "react";
import { ClaySegmented } from "../ui/ClaySegmented";
import { ClayButton } from "../ui/ClayButton";
import { ClayChip } from "../ui/ClayChip";
import { Warning, CheckCircle, CookingPot } from "@phosphor-icons/react";

interface BatchCrate {
  kode: string;
  qty: number;
  initialQty: number;
  kadaluwarsa: string;
  sisaHari: number;
  status: "expired" | "urgent" | "safe";
}

const INITIAL_BATCHES: BatchCrate[] = [
  {
    kode: "BATCH-AYM-20260928-001",
    qty: 40,
    initialQty: 40,
    kadaluwarsa: "Hari ini (Kedaluwarsa)",
    sisaHari: 0,
    status: "expired",
  },
  {
    kode: "BATCH-AYM-20261001-001",
    qty: 120,
    initialQty: 120,
    kadaluwarsa: "2 hari lagi",
    sisaHari: 2,
    status: "urgent",
  },
  {
    kode: "BATCH-AYM-20261002-001",
    qty: 200,
    initialQty: 200,
    kadaluwarsa: "5 hari lagi",
    sisaHari: 5,
    status: "safe",
  },
  {
    kode: "BATCH-AYM-20261003-001",
    qty: 300,
    initialQty: 300,
    kadaluwarsa: "9 hari lagi",
    sisaHari: 9,
    status: "safe",
  },
];

export function FefoDemo() {
  const [batches, setBatches] = useState<BatchCrate[]>(INITIAL_BATCHES);
  const [targetKg, setTargetKg] = useState<"100" | "250" | "400">("250");
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionMsg, setRejectionMsg] = useState<string | null>(null);
  const [potongSummary, setPotongSummary] = useState<string | null>(null);

  const handlePotongStok = () => {
    setIsProcessing(true);
    setRejectionMsg(null);
    let remainingToCut = parseInt(targetKg, 10);
    const cutLogs: string[] = [];

    const newBatches = batches.map((b) => ({ ...b }));

    // FEFO order: iterate only non-expired batches
    for (const batch of newBatches) {
      if (batch.status === "expired") continue; // FEFO rule: expired is rejected
      if (remainingToCut <= 0) break;

      const toDeduct = Math.min(batch.qty, remainingToCut);
      batch.qty -= toDeduct;
      remainingToCut -= toDeduct;
      cutLogs.push(`${toDeduct} kg dari ${batch.kode.split("-").slice(-2).join("-")}`);
    }

    setTimeout(() => {
      setBatches(newBatches);
      setIsProcessing(false);
      setPotongSummary(`FEFO memotong total ${targetKg} kg: ${cutLogs.join(", ")}.`);
    }, 400);
  };

  const handleCrateClick = (batch: BatchCrate) => {
    if (batch.status === "expired") {
      setRejectionMsg(`Ditolak keras! Batch ${batch.kode} sudah kedaluwarsa hari ini.`);
      setTimeout(() => setRejectionMsg(null), 3000);
    }
  };

  const handleReset = () => {
    setBatches(INITIAL_BATCHES);
    setPotongSummary(null);
    setRejectionMsg(null);
  };

  return (
    <div className="flex flex-col gap-2.5 w-full text-left">
      {/* Target Kebutuhan Masak Selector */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-display font-bold text-xs text-ink-900">
          Kebutuhan Masak:
        </span>
        <ClaySegmented
          value={targetKg}
          onChange={(val) => setTargetKg(val as "100" | "250" | "400")}
          options={[
            { value: "100", label: "100 kg" },
            { value: "250", label: "250 kg" },
            { value: "400", label: "400 kg" },
          ]}
          tone="telur"
          className="scale-90 origin-right"
        />
      </div>

      {/* Crates Rack (clean single-column list) */}
      <div className="flex flex-col gap-1.5">
        {batches.map((batch, idx) => {
          const isExpired = batch.status === "expired";
          const isUrgent = batch.status === "urgent";
          const shortCode = `Batch #${idx + 1} (${batch.kode.slice(-7)})`;

          return (
            <div
              key={batch.kode}
              onClick={() => handleCrateClick(batch)}
              className={`px-3 py-2 rounded-xl clay-sm transition-all duration-200 cursor-pointer flex flex-col gap-1 ${
                isExpired
                  ? "bg-cabai-100/70 border border-cabai-400/50"
                  : isUrgent
                  ? "bg-telur-100/80 border border-telur-400/60"
                  : "bg-daun-100/60 border border-daun-400/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-ink-900">{shortCode}</span>
                  <span className="text-[10px] text-ink-600 font-medium">({batch.kadaluwarsa})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-xs text-ink-900 tabular-nums">
                    {batch.qty} <span className="font-normal text-[10px] text-ink-600">/ {batch.initialQty} kg</span>
                  </span>
                  <ClayChip
                    tone={isExpired ? "cabai" : isUrgent ? "telur" : "daun"}
                    className="h-5 text-[10px] px-1.5"
                  >
                    {isExpired ? "Ditolak" : isUrgent ? "FEFO 1" : "Aman"}
                  </ClayChip>
                </div>
              </div>

              {/* Remaining Bar */}
              <div className="w-full h-1.5 rounded-full clay-inset overflow-hidden">
                <div
                  style={{
                    transform: `scaleX(${batch.qty / batch.initialQty})`,
                    transformOrigin: "left",
                  }}
                  className={`h-full transition-transform duration-300 rounded-full ${
                    isExpired
                      ? "bg-cabai-400"
                      : isUrgent
                      ? "bg-telur-400"
                      : "bg-daun-400"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback Messages */}
      {rejectionMsg && (
        <div className="p-2 rounded-xl bg-cabai-100 text-cabai-700 font-bold text-xs flex items-center gap-2 animate-shake">
          <Warning size={16} weight="fill" className="shrink-0" />
          <span>{rejectionMsg}</span>
        </div>
      )}

      {potongSummary && (
        <div className="p-2 rounded-xl bg-daun-100 text-daun-700 font-semibold text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <CheckCircle size={16} weight="fill" className="shrink-0" />
            <span className="truncate">{potongSummary}</span>
          </div>
          <button
            onClick={handleReset}
            className="text-xs font-bold text-ink-900 underline cursor-pointer shrink-0"
          >
            Reset
          </button>
        </div>
      )}

      {/* Action Button & Subtitle */}
      <div className="flex flex-col gap-1 pt-0.5">
        <ClayButton
          size="sm"
          variant="primary"
          tone="telur"
          loading={isProcessing}
          onClick={handlePotongStok}
          className="w-full text-xs py-2 h-9"
        >
          <CookingPot size={16} weight="bold" className="mr-1.5" />
          Potong Stok FEFO ({targetKg} kg)
        </ClayButton>
        <span className="text-[11px] text-ink-600 text-center">
          Otomatis mengunci urutan batch kedaluwarsa terdekat
        </span>
      </div>
    </div>
  );
}
