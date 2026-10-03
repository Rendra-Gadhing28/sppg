"use client";

import React, { useState } from "react";
import { ClayCard } from "../ui/ClayCard";
import { ClayChip } from "../ui/ClayChip";
import { IconBubble } from "../ui/IconBubble";
import {
  Sparkle,
  NavigationArrow,
  ThermometerHot,
  Certificate,
  CheckCircle,
} from "@phosphor-icons/react";

interface SmartModule {
  id: string;
  judul: string;
  tagline: string;
  deskripsi: string;
  tone: "terung" | "es" | "daun" | "wortel";
  icon: React.ReactNode;
  highlights: string[];
}

const MODULES: SmartModule[] = [
  {
    id: "ai-menu",
    judul: "AI Menu Planner & AKG",
    tagline: "Linear programming dengan veto ahli gizi",
    deskripsi:
      "Algoritma memformulasikan siklus menu harian yang memenuhi angka kecukupan gizi (AKG) per jenjang sekolah dan memaksimalkan bahan lokal musiman, seraya menekan HPP seminimal mungkin.",
    tone: "terung",
    icon: <Sparkle size={26} weight="fill" />,
    highlights: [
      "Human-in-the-loop: Ahli Gizi memegang hak veto penuh",
      "Variasi 5 unsur pangan tanpa lauk berulang 5 hari kerja",
      "Peringatan dini deteksi potensi alergen pangan anak",
    ],
  },
  {
    id: "vrp",
    judul: "VRP Multi-Drop Armada",
    tagline: "Optimasi rute armada pengantar makanan",
    deskripsi:
      "Vehicle Routing Problem (VRP) memetakan rute distribusi terbaik untuk melayani 50+ sekolah dengan batas waktu tempuh maksimal 90 menit agar makanan tiba sebelum pukul 11.00 WIB.",
    tone: "es",
    icon: <NavigationArrow size={26} weight="fill" />,
    highlights: [
      "Target penghematan konsumsi BBM armada ≥ 15%",
      "Kalkulasi batas kapasitas boks termal kendaraan",
      "Pemberitahuan ETA otomatis ke WhatsApp PIC sekolah",
    ],
  },
  {
    id: "iot-haccp",
    judul: "IoT Cold-Chain & HACCP",
    tagline: "Telemetri sensor suhu kontinu",
    deskripsi:
      "Sensor suhu terintegrasi memantau chiller (0–4 °C), freezer (maks -18 °C), dan boks termal makanan matang (harus selalu di atas 60 °C). Alarm berbunyi otomatis bila suhu drop mendekati 55 °C.",
    tone: "daun",
    icon: <ThermometerHot size={26} weight="fill" />,
    highlights: [
      "Penyimpanan suhu aman 60 °C tercapai ≥ 99,5% durasi",
      "Ingestion sensor IoT hingga 1.000 pesan telemetri per menit",
      "Alarm pintu chiller terbuka lebih dari 10 menit",
    ],
  },
  {
    id: "bgn-portal",
    judul: "Portal Pengawasan BGN",
    tagline: "Transparansi audit independen nasional",
    deskripsi:
      "Portal read-only khusus pengawas BGN, Dinas Kesehatan, dan Dinas Pendidikan untuk memverifikasi kepatuhan kalori, sertifikat higienitas, dan log distribusi secara real-time.",
    tone: "wortel",
    icon: <Certificate size={26} weight="fill" />,
    highlights: [
      "Verifikasi berkas audit via pemindai QR & hash SHA-256",
      "Laporan audit siap terbit kurang dari 30 menit pasca tutup buku",
      "Akses kepatuhan terisolasi aman tanpa izin ubah data",
    ],
  },
];

export function CerdasSection() {
  const [activeTab, setActiveTab] = useState("ai-menu");
  const activeModule = MODULES.find((m) => m.id === activeTab) || MODULES[0];

  return (
    <section
      id="cerdas"
      className="py-20 sm:py-28 lg:py-36 bg-padi-200/40 border-b border-ink-900/10 relative"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="max-w-[42rem] mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <ClayChip tone="terung">Fase 4: Spesifikasi Lengkap</ClayChip>
          </div>
          <h2 className="font-display font-extrabold text-ink-900 text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
            Kecerdasan buatan dan sensor IoT menjaga mutu pangan.
          </h2>
          <p className="mt-4 text-ink-600 font-sans font-medium text-base sm:text-lg leading-relaxed text-pretty">
            Teknologi mutakhir tidak menggantikan manusia, melainkan memperkuat akurasi keputusan ahli gizi dan menjaga keselamatan anak.
          </p>
        </div>

        {/* 4 Interactive Feature Cards Slab */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {MODULES.map((mod) => {
            const isSelected = mod.id === activeTab;
            return (
              <div
                key={mod.id}
                onClick={() => setActiveTab(mod.id)}
                className={`p-5 rounded-[26px] clay transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-padi-50 ring-2 ring-daun-700 -translate-y-1 shadow-md"
                    : "bg-padi-50/60 hover:bg-padi-50 hover:-translate-y-0.5"
                }`}
              >
                <div>
                  <IconBubble tone={mod.tone} size="md" className="mb-4">
                    {mod.icon}
                  </IconBubble>
                  <h3 className="font-display font-bold text-lg text-ink-900">
                    {mod.judul}
                  </h3>
                  <p className="text-xs text-ink-600 mt-1">{mod.tagline}</p>
                </div>

                <div className="mt-6 pt-3 border-t border-ink-900/10 flex items-center justify-between text-xs font-bold text-daun-700">
                  <span>{isSelected ? "Sedang aktif" : "Pelajari modul"}</span>
                  <span>{isSelected ? "●" : "→"}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Showcase Panel */}
        <ClayCard tone="padi" className="p-6 sm:p-8 lg:p-10 bg-padi-50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 flex flex-col items-start text-left">
              <div className="flex items-center gap-3 mb-2">
                <IconBubble tone={activeModule.tone} size="md">
                  {activeModule.icon}
                </IconBubble>
                <div>
                  <h4 className="font-display font-black text-2xl sm:text-3xl text-ink-900">
                    {activeModule.judul}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-daun-700">
                    {activeModule.tagline}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-ink-900 font-sans text-base sm:text-lg leading-relaxed">
                {activeModule.deskripsi}
              </p>

              {/* Highlights */}
              <div className="mt-6 flex flex-col gap-2.5 w-full">
                {activeModule.highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-ink-900"
                  >
                    <CheckCircle
                      size={20}
                      weight="fill"
                      className="text-daun-700 shrink-0"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Stat Box */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="w-full rounded-[24px] clay-inset p-6 bg-padi-100/70 text-center flex flex-col items-center">
                <span className="text-xs font-bold text-ink-600 uppercase tracking-wider">
                  Target Standar Desain
                </span>
                <span className="font-display font-black text-3xl sm:text-4xl text-ink-900 tabular-nums my-2">
                  {activeTab === "ai-menu"
                    ? "100%"
                    : activeTab === "vrp"
                    ? "≥ 15%"
                    : activeTab === "iot-haccp"
                    ? "≥ 99,5%"
                    : "< 30 mnt"}
                </span>
                <span className="text-xs font-semibold text-ink-900 max-w-[200px]">
                  {activeTab === "ai-menu"
                    ? "Siklus menu harian patuh AKG per jenjang"
                    : activeTab === "vrp"
                    ? "Efisiensi jarak tempuh armada distribusi"
                    : activeTab === "iot-haccp"
                    ? "Suhu boks termal terjaga di atas 60 °C"
                    : "Laporan audit siap diverifikasi BGN"}
                </span>
              </div>
            </div>
          </div>
        </ClayCard>
      </div>
    </section>
  );
}
