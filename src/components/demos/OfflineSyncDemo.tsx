"use client";

import React, { useState } from "react";
import { ClaySwitch } from "../ui/ClaySwitch";
import { ClayButton } from "../ui/ClayButton";
import { ClayChip } from "../ui/ClayChip";
import { CloudCheck, CloudSlash, Database, ArrowsClockwise, Check } from "@phosphor-icons/react";

interface PendingTx {
  id: string;
  name: string;
  time: string;
}

export function OfflineSyncDemo() {
  const [isOnline, setIsOnline] = useState(false);
  const [pendingTxs, setPendingTxs] = useState<PendingTx[]>([
    { id: "TX-01", name: "e-POD SDN 01 Gondang", time: "10:12" },
    { id: "TX-02", name: "e-POD SMPN 03 Merdeka", time: "10:28" },
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);

  const handleToggleOnline = (checked: boolean) => {
    setIsOnline(checked);
    if (checked && pendingTxs.length > 0) {
      setIsSyncing(true);
      setTimeout(() => {
        setSyncedCount((prev) => prev + pendingTxs.length);
        setPendingTxs([]);
        setIsSyncing(false);
      }, 1200);
    }
  };

  const handleSimpan = () => {
    const newTx: PendingTx = {
      id: `TX-0${pendingTxs.length + syncedCount + 1}`,
      name: `e-POD Titik Sekolah #${pendingTxs.length + syncedCount + 1}`,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    if (!isOnline) {
      setPendingTxs((prev) => [...prev, newTx]);
    } else {
      setIsSyncing(true);
      setTimeout(() => {
        setSyncedCount((prev) => prev + 1);
        setIsSyncing(false);
      }, 400);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Top Status Bar & Network Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-[16px] bg-padi-50/80 clay-sm">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <ClayChip tone="daun" icon={<CloudCheck size={16} weight="fill" />}>
              Sinyal Online (Terhubung)
            </ClayChip>
          ) : (
            <ClayChip tone="telur" icon={<CloudSlash size={16} weight="fill" />}>
              Mode Offline (Nir-Sinyal)
            </ClayChip>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ink-900">Sinyal Seluler:</span>
          <ClaySwitch checked={isOnline} onCheckedChange={handleToggleOnline} tone="daun" />
        </div>
      </div>

      {/* IndexedDB vs Cloud Visualizer */}
      <div className="grid grid-cols-2 gap-3 items-stretch">
        {/* Local Storage Box (IndexedDB) */}
        <div className="p-3 rounded-[18px] clay-inset flex flex-col justify-between bg-padi-50/40">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink-900 mb-2">
              <Database size={16} className="text-terung-700" />
              <span>Antrean Lokal (IndexedDB)</span>
            </div>
            <div className="flex flex-col gap-1.5 min-h-[90px]">
              {pendingTxs.length === 0 ? (
                <div className="text-[11px] text-ink-600/70 py-4 text-center">
                  Antrean kosong (semua tersinkron)
                </div>
              ) : (
                pendingTxs.slice(0, 3).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-1.5 px-2.5 rounded-lg bg-telur-100/80 text-[11px] font-semibold text-ink-900 flex justify-between items-center shadow-xs"
                  >
                    <span className="truncate">{tx.name}</span>
                    <span className="text-[10px] text-ink-600">{tx.time}</span>
                  </div>
                ))
              )}
              {pendingTxs.length > 3 && (
                <div className="text-[10px] text-center font-bold text-ink-600">
                  +{pendingTxs.length - 3} transaksi lainnya
                </div>
              )}
            </div>
          </div>
          <div className="text-[10px] font-bold text-ink-600 mt-2">
            Status: {pendingTxs.length} tertunda di ponsel
          </div>
        </div>

        {/* Server Cloud Target */}
        <div className="p-3 rounded-[18px] clay-inset flex flex-col justify-between bg-daun-100/30">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink-900 mb-2">
              <CloudCheck size={16} className="text-daun-700" />
              <span>Server Sentral SPPG</span>
            </div>
            <div className="flex flex-col items-center justify-center min-h-[90px] text-center">
              {isSyncing ? (
                <div className="flex flex-col items-center gap-1 text-daun-700 animate-pulse">
                  <ArrowsClockwise size={24} className="animate-spin" />
                  <span className="text-xs font-bold">Sinkronisasi batch...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="font-display font-black text-2xl text-daun-700 tabular-nums">
                    {syncedCount}
                  </span>
                  <span className="text-[11px] font-bold text-ink-600">
                    Transaksi berhasil masuk
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-[10px] font-semibold text-daun-700 mt-2 flex items-center gap-1">
            <Check size={12} weight="bold" />
            <span>Kunci idempotensi aktif</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <span className="text-[11px] text-ink-600 max-w-[20rem]">
          Driver tetap bisa input data di pelosok. Begitu ada sinyal, data otomatis terunggah tanpa duplikasi.
        </span>
        <ClayButton
          size="sm"
          variant="primary"
          tone={isOnline ? "daun" : "telur"}
          onClick={handleSimpan}
        >
          {isOnline ? "Simpan & kirim online" : "Simpan di ponsel (offline)"}
        </ClayButton>
      </div>
    </div>
  );
}
