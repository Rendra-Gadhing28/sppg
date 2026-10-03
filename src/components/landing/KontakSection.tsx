"use client";

import React, { useState } from "react";
import { SITE_CONFIG } from "@/content/site";
import { ClayInput, ClayTextarea } from "../ui/ClayInput";
import { ClayButton } from "../ui/ClayButton";
import { ClayChip } from "../ui/ClayChip";
import { Toast } from "../ui/Toast";
import { CalendarCheck, ChatsTeardrop, CheckCircle } from "@phosphor-icons/react";

const PORSI_OPTIONS = [
  { value: "500-1500", range: "500 – 1.500", label: "porsi/hari", badge: "Dapur Rintisan" },
  { value: "1500-3000", range: "1.500 – 3.000", label: "porsi/hari", badge: "Standar Cabang" },
  { value: "3000-6000", range: "3.000 – 6.000", label: "porsi/hari", badge: "Dapur Pusat" },
  { value: "6000-10000", range: "6.000 – 10.000+", label: "porsi/hari", badge: "Klaster Regional" },
];

export function KontakSection() {
  const [formData, setFormData] = useState({
    nama: "",
    instansi: "",
    porsi: "1500-3000",
    whatsapp: "",
    pesan: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.instansi || !formData.whatsapp) {
      alert("Mohon lengkapi Nama, Instansi, dan Nomor WhatsApp.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setToastMessage(
        `Terima kasih ${formData.nama}! Permintaan demo untuk ${formData.instansi} telah kami terima. Tim operasional SPPG akan menghubungi Anda via WhatsApp.`
      );
      setFormData({
        nama: "",
        instansi: "",
        porsi: "1500-3000",
        whatsapp: "",
        pesan: "",
      });
    }, 1200);
  };

  const handleDirectWa = () => {
    const text = encodeURIComponent(
      `Halo Tim SPPG, saya tertarik menjadwalkan demo operasional sistem informasi dapur umum MBG.`
    );
    window.open(`https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${text}`, "_blank");
  };

  return (
    <section
      id="kontak"
      className="py-20 sm:py-28 lg:py-36 bg-padi-200/50 border-b border-ink-900/10 relative"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Info Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 mb-3">
              <ClayChip tone="daun">Hubungi Tim Kami</ClayChip>
            </div>
            <h2 className="font-display font-extrabold text-ink-900 text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
              Jadwalkan demo langsung untuk dapur umum Anda.
            </h2>
            <p className="mt-4 text-ink-600 font-sans font-medium text-base sm:text-lg leading-relaxed text-pretty">
              Diskusikan kesiapan dapur, konfigurasi presensi geofence, atau integrasi sensor IoT langsung bersama tim konsultan sistem SPPG.
            </p>

            <div className="mt-8 space-y-3.5 w-full">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} weight="fill" className="text-daun-700 mt-1 shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-ink-900">
                  Konsultasi tata letak alur masak dan pos pemeriksaan QC
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} weight="fill" className="text-daun-700 mt-1 shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-ink-900">
                  Panduan simulasi perhitungan bahan BOM per 10.000 porsi
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} weight="fill" className="text-daun-700 mt-1 shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-ink-900">
                  Akses portal pengujian live langsung di perangkat kurir & dapur
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <div className="mt-10 p-5 rounded-[26px] clay bg-padi-50 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="font-display font-bold text-sm text-ink-900 block">
                  Respons Cepat via Pesan
                </span>
                <span className="text-xs text-ink-600">
                  Admin bertugas siap menjawab pertanyaan
                </span>
              </div>
              <ClayButton
                type="button"
                size="md"
                variant="primary"
                tone="daun"
                onClick={handleDirectWa}
                className="shrink-0"
              >
                <ChatsTeardrop size={18} weight="bold" className="mr-1.5" />
                Chat WhatsApp
              </ClayButton>
            </div>
          </div>

          {/* Right Form Column (7 cols) */}
          <div className="lg:col-span-7 bg-padi-50 p-6 sm:p-8 lg:p-10 rounded-[36px] clay">
            <h3 className="font-display font-bold text-2xl text-ink-900 mb-6">
              Formulir Permintaan Demo
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <ClayInput
                label="Nama Lengkap Penanggung Jawab *"
                placeholder="Contoh: Budi Santoso, S.Gz"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ClayInput
                  label="Instansi / Yayasan Pengelola *"
                  placeholder="Contoh: Yayasan Dapur Berkah Mandiri"
                  value={formData.instansi}
                  onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                  required
                />
                <ClayInput
                  label="Nomor WhatsApp Aktif *"
                  placeholder="Contoh: 081234567890"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  required
                />
              </div>

              {/* Kapasitas Porsi — pill grid 2×2, aksibel */}
              <div className="flex flex-col gap-1.5 w-full text-left">
                <span className="font-display font-bold text-sm text-ink-900 tracking-wide">
                  Estimasi Kapasitas Porsi Masak Harian
                </span>
                <div
                  role="radiogroup"
                  aria-label="Estimasi kapasitas porsi masak harian"
                  className="grid grid-cols-2 gap-2.5"
                >
                  {PORSI_OPTIONS.map((opt) => {
                    const selected = formData.porsi === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setFormData({ ...formData, porsi: opt.value })}
                        className={`min-h-[72px] flex flex-col items-start justify-center gap-0.5 px-4 py-3 rounded-[20px] text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun-700 ${
                          selected
                            ? "clay bg-daun-700 text-padi-50 ring-2 ring-daun-700 scale-[1.02]"
                            : "clay-inset text-ink-900 hover:scale-[1.01]"
                        }`}
                      >
                        <span className={`font-display font-extrabold text-base leading-tight ${selected ? "text-padi-50" : "text-ink-900"}`}>
                          {opt.range}
                        </span>
                        <span className={`font-sans text-xs ${selected ? "text-padi-200" : "text-ink-600"}`}>
                          {opt.label}
                        </span>
                        <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                          selected
                            ? "bg-padi-50/20 text-padi-50"
                            : "bg-daun-700/10 text-daun-700"
                        }`}>
                          {opt.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <ClayTextarea
                label="Catatan atau Kebutuhan Khusus Operasional"
                placeholder="Jelaskan kebutuhan dapur Anda, jumlah armada pengantaran, atau integrasi BGN yang diharapkan..."
                value={formData.pesan}
                onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                rows={3}
              />

              <div className="pt-2">
                <ClayButton
                  type="submit"
                  size="lg"
                  variant="primary"
                  tone="daun"
                  loading={isSubmitting}
                  className="w-full text-base"
                >
                  <CalendarCheck size={20} weight="bold" className="mr-2" />
                  Kirim Permintaan Demo
                </ClayButton>
                <p className="text-[11px] text-ink-600 text-center mt-2.5">
                  Data Anda aman dan hanya digunakan untuk keperluan koordinasi demo operasional SPPG.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </section>
  );
}
