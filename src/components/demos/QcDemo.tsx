"use client";

import React, { useState } from "react";
import { ClaySwitch } from "../ui/ClaySwitch";
import { ClayChip } from "../ui/ClayChip";
import { Warning, XCircle, SealCheck } from "@phosphor-icons/react";

export function QcDemo() {
  const [suhuKendaraan, setSuhuKendaraan] = useState(true);
  const [segelUtuh, setSegelUtuh] = useState(true);
  const [organoleptik, setOrganoleptik] = useState(true);
  const [fotoBukti, setFotoBukti] = useState(true);

  // Evaluation logic
  const allTrue = suhuKendaraan && segelUtuh && organoleptik && fotoBukti;
  const falseCount = [suhuKendaraan, segelUtuh, organoleptik, fotoBukti].filter((v) => !v).length;

  let status: "lolos" | "bersyarat" | "ditolak" = "ditolak";
  let catatan = "";

  if (allTrue) {
    status = "lolos";
    catatan = "QC-20261003-0004 terbit. Batch baru resmi menambah saldo gudang.";
  } else if (!suhuKendaraan || falseCount >= 2) {
    status = "ditolak";
    catatan = !suhuKendaraan
      ? "Ditolak keras! Suhu kendaraan tidak sesuai standar HACCP chiller (0-4 °C)."
      : "Ditolak! Terdapat 2 atau lebih parameter mutu yang gagal.";
  } else {
    status = "bersyarat";
    catatan = "Lolos bersyarat dengan catatan pengawasan ketat ahli gizi.";
  }

  return (
    <div className="flex flex-col gap-2.5 w-full text-left">
      {/* 4 Checklist Switches */}
      <div className="grid grid-cols-2 gap-2">
        <div className="px-2.5 py-1.5 rounded-xl bg-padi-50/80 clay-sm flex items-center justify-between gap-1">
          <span className="text-[11px] font-bold text-ink-900 truncate">Suhu Armada (3°C)</span>
          <ClaySwitch checked={suhuKendaraan} onCheckedChange={setSuhuKendaraan} tone="es" />
        </div>
        <div className="px-2.5 py-1.5 rounded-xl bg-padi-50/80 clay-sm flex items-center justify-between gap-1">
          <span className="text-[11px] font-bold text-ink-900 truncate">Segel Kemasan</span>
          <ClaySwitch checked={segelUtuh} onCheckedChange={setSegelUtuh} tone="daun" />
        </div>
        <div className="px-2.5 py-1.5 rounded-xl bg-padi-50/80 clay-sm flex items-center justify-between gap-1">
          <span className="text-[11px] font-bold text-ink-900 truncate">Organoleptik</span>
          <ClaySwitch checked={organoleptik} onCheckedChange={setOrganoleptik} tone="wortel" />
        </div>
        <div className="px-2.5 py-1.5 rounded-xl bg-padi-50/80 clay-sm flex items-center justify-between gap-1">
          <span className="text-[11px] font-bold text-ink-900 truncate">Foto Bahan</span>
          <ClaySwitch checked={fotoBukti} onCheckedChange={setFotoBukti} tone="terung" />
        </div>
      </div>

      {/* Decision Outcome Card */}
      <div
        className={`p-3 rounded-xl clay transition-all duration-300 ${
          status === "lolos"
            ? "bg-daun-100/70 border border-daun-400"
            : status === "bersyarat"
            ? "bg-telur-100/70 border border-telur-400"
            : "bg-cabai-100/70 border border-cabai-400"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {status === "lolos" ? (
              <SealCheck size={20} weight="fill" className="text-daun-700 shrink-0" />
            ) : status === "bersyarat" ? (
              <Warning size={20} weight="fill" className="text-telur-700 shrink-0" />
            ) : (
              <XCircle size={20} weight="fill" className="text-cabai-700 shrink-0" />
            )}
            <span className="font-display font-bold text-sm text-ink-900">
              {status === "lolos"
                ? "Lolos QC"
                : status === "bersyarat"
                ? "Lolos Bersyarat"
                : "Ditolak / Retur"}
            </span>
          </div>
          <ClayChip
            tone={status === "lolos" ? "daun" : status === "bersyarat" ? "telur" : "cabai"}
            className="h-5 text-[10px] px-1.5"
          >
            {status === "lolos" ? "Stok Tambah" : status === "bersyarat" ? "Karantina" : "Diretur"}
          </ClayChip>
        </div>

        <p className="mt-1.5 text-[11px] font-semibold text-ink-900 leading-snug">
          {catatan}
        </p>
      </div>

      <div className="text-[11px] text-ink-600 text-center pt-0.5">
        HACCP: Suhu armada menyimpang otomatis ditolak sistem.
      </div>
    </div>
  );
}
