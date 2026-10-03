"use client";

import React from "react";
import { DemoShell } from "../demos/DemoShell";
import { GeofenceDemo } from "../demos/GeofenceDemo";
import { BomCalculator } from "../demos/BomCalculator";
import { FefoDemo } from "../demos/FefoDemo";
import { QcDemo } from "../demos/QcDemo";
import { EpodDemo } from "../demos/EpodDemo";
import { OfflineSyncDemo } from "../demos/OfflineSyncDemo";
import { NotifDemo } from "../demos/NotifDemo";
import { HppWasteDemo } from "../demos/HppWasteDemo";
import { MultiKitchenDemo } from "../demos/MultiKitchenDemo";
import {
  MapPin,
  Calculator,
  Archive,
  ShieldCheck,
  Signature,
  ArrowsClockwise,
  ChatsTeardrop,
  ChartPieSlice,
  Buildings,
} from "@phosphor-icons/react";

export function FiturSection() {
  return (
    <section
      id="fitur"
      className="py-20 sm:py-28 lg:py-36 border-b border-ink-900/10 relative"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="max-w-[42rem] mb-12 sm:mb-16">
          <h2 className="font-display font-extrabold text-ink-900 text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
            Modul yang saling terhubung, bukan aplikasi terpisah.
          </h2>
          <p className="mt-4 text-ink-600 font-sans font-medium text-base sm:text-lg leading-relaxed text-pretty">
            Coba sendiri: geser, ketuk, dan seret. Semua angka di demo ini adalah contoh ilustrasi operasional dapur MBG.
          </p>
        </div>

        {/* 12-Column Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Row A: Geofence (5 cols) + BOM (7 cols) */}
          <div className="lg:col-span-5 h-full">
            <DemoShell
              title="Presensi Geofence"
              benefit="Hadir di dapur, bukan di rumah. Selfie dan GPS divalidasi terhadap radius dapur 100 meter."
              fase="Fase 1"
              tone="daun"
              icon={<MapPin size={24} weight="fill" />}
            >
              <GeofenceDemo />
            </DemoShell>
          </div>

          <div className="lg:col-span-7 h-full">
            <DemoShell
              title="Kalkulator BOM & Resep"
              benefit="Geser jumlah porsi, lihat kebutuhan bahan gramasi per porsi dan defisit stok seketika."
              fase="Fase 1"
              tone="wortel"
              icon={<Calculator size={24} weight="fill" />}
            >
              <BomCalculator />
            </DemoShell>
          </div>

          {/* Row B: FEFO (4 cols) + QC (4 cols) + ePOD (4 cols) */}
          <div className="lg:col-span-4 h-full">
            <DemoShell
              title="Stok Batch FEFO"
              benefit="Yang lebih dulu kedaluwarsa, lebih dulu dipakai, otomatis berurutan antar batch."
              fase="Fase 2"
              tone="telur"
              icon={<Archive size={24} weight="fill" />}
            >
              <FefoDemo />
            </DemoShell>
          </div>

          <div className="lg:col-span-4 h-full">
            <DemoShell
              title="QC Bahan Datang"
              benefit="Suhu, kemasan, dan organoleptik diperiksa sebelum bahan masuk menjadi saldo gudang."
              fase="Fase 2"
              tone="es"
              icon={<ShieldCheck size={24} weight="fill" />}
            >
              <QcDemo />
            </DemoShell>
          </div>

          <div className="lg:col-span-4 h-full">
            <DemoShell
              title="e-POD & Tanda Tangan"
              benefit="Serah terima sah: verifikasi porsi, kondisi makanan, foto boks, dan tanda tangan PIC."
              fase="Fase 2"
              tone="daun"
              icon={<Signature size={24} weight="fill" />}
            >
              <EpodDemo />
            </DemoShell>
          </div>

          {/* Row C: Offline Sync (7 cols) + WhatsApp Notif (5 cols) */}
          <div className="lg:col-span-7 h-full">
            <DemoShell
              title="PWA Offline Sync"
              benefit="Tanpa sinyal pun data tetap tercatat di IndexedDB dan terkirim otomatis saat online kembali."
              fase="Fase 3"
              tone="terung"
              icon={<ArrowsClockwise size={24} weight="fill" />}
            >
              <OfflineSyncDemo />
            </DemoShell>
          </div>

          <div className="lg:col-span-5 h-full">
            <DemoShell
              title="Notifikasi Gateway"
              benefit="PO ke supplier, pengingat shift jam 05.00, peringatan stok, dan ETA ke sekolah lewat pesan terarah."
              fase="Fase 3"
              tone="daun"
              icon={<ChatsTeardrop size={24} weight="fill" />}
            >
              <NotifDemo />
            </DemoShell>
          </div>

          {/* Row D: HPP & Waste (7 cols) + Multi-Dapur (5 cols) */}
          <div className="lg:col-span-7 h-full">
            <DemoShell
              title="HPP & Food Waste"
              benefit="HPP estimasi vs aktual, serta pelacakan limbah makanan dalam tiga kategori baku."
              fase="Fase 3"
              tone="wortel"
              icon={<ChartPieSlice size={24} weight="fill" />}
            >
              <HppWasteDemo />
            </DemoShell>
          </div>

          <div className="lg:col-span-5 h-full">
            <DemoShell
              title="Multi-Dapur Cabang"
              benefit="Dapur pusat dan dapur satelit, pengajuan transfer stok, dan data terisolasi per cabang."
              fase="Fase 3"
              tone="es"
              icon={<Buildings size={24} weight="fill" />}
            >
              <MultiKitchenDemo />
            </DemoShell>
          </div>
        </div>
      </div>
    </section>
  );
}
