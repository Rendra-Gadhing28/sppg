"use client";

import React, { useState, useEffect } from "react";
import { Checks, ChatsCircle, Check } from "@phosphor-icons/react";
import { ClayChip } from "../ui/ClayChip";

interface MessageItem {
  id: number;
  penerima: string;
  penerimaChip: "es" | "daun" | "wortel" | "telur";
  teks: string;
  waktu: string;
  status: "queued" | "sent" | "delivered" | "read";
}

const MESSAGES: MessageItem[] = [
  {
    id: 1,
    penerima: "Supplier Beras",
    penerimaChip: "wortel",
    teks: "Dokumen PO-20261003-0007 telah dikirim. Mohon konfirmasi jadwal kirim ke Dapur Sentral sebelum 16.00 WIB.",
    waktu: "07.15",
    status: "read",
  },
  {
    id: 2,
    penerima: "Pekerja Shift Pagi",
    penerimaChip: "daun",
    teks: "Pengingat Shift: Jadwal Anda besok pukul 05.00 WIB. Presensi geofence aktif 15 menit sebelum shift.",
    waktu: "19.30",
    status: "read",
  },
  {
    id: 3,
    penerima: "Kepala Dapur",
    penerimaChip: "telur",
    teks: "Peringatan Stok: BATCH-AYM-20261001-001 mendekati batas simpan 48 jam. Segera gunakan untuk menu besok pagi.",
    waktu: "08.05",
    status: "read",
  },
  {
    id: 4,
    penerima: "PIC SDN 01 Gondang",
    penerimaChip: "es",
    teks: "Makanan dalam perjalanan. Driver Budi, armada B 1234 XY, estimasi ketibaan (ETA) pukul 10.45 WIB. Mohon siapkan penerimaan.",
    waktu: "10.15",
    status: "delivered",
  },
];

export function NotifDemo({ isVisible }: { isVisible?: boolean }) {
  const [activeIdx, setActiveIdx] = useState(3); // default highlight ETA message

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div className="flex items-center justify-between text-xs font-bold text-ink-900 pb-1">
        <span>Arus Notifikasi Pesan Terarah:</span>
        <span className="text-[11px] text-ink-600">Otomatis via Gateway</span>
      </div>

      <div className="flex flex-col gap-2">
        {MESSAGES.map((msg, index) => {
          const isActive = index === activeIdx;

          return (
            <div
              key={msg.id}
              onClick={() => setActiveIdx(index)}
              className={`p-2.5 sm:p-3 rounded-[16px] transition-all duration-200 cursor-pointer flex flex-col gap-1 ${
                isActive
                  ? "clay-sm bg-padi-50 border-2 border-daun-400"
                  : "bg-padi-50/50 hover:bg-padi-50 border border-ink-900/5 opacity-80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ChatsCircle size={15} weight="fill" className="text-daun-700" />
                  <ClayChip tone={msg.penerimaChip} className="h-6 text-[11px] px-2">
                    {msg.penerima}
                  </ClayChip>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-ink-600 font-medium">
                  <span>{msg.waktu}</span>
                  {msg.status === "read" ? (
                    <Checks size={16} weight="bold" className="text-es-700" />
                  ) : msg.status === "delivered" ? (
                    <Checks size={16} weight="bold" className="text-ink-600" />
                  ) : (
                    <Check size={14} weight="bold" className="text-ink-600" />
                  )}
                </div>
              </div>
              <p className="text-xs text-ink-900 font-medium leading-relaxed mt-0.5">
                {msg.teks}
              </p>
            </div>
          );
        })}
      </div>

      <div className="pt-1 flex items-center justify-between text-[11px] text-ink-600">
        <span>Pengiriman SLA &lt; 60 detik langsung ke nomor terverifikasi PIC.</span>
      </div>
    </div>
  );
}
