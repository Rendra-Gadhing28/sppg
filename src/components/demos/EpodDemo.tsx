"use client";

import React, { useState, useRef, useEffect } from "react";
import { ClayButton } from "../ui/ClayButton";
import { Camera, Eraser, SealCheck } from "@phosphor-icons/react";

export function EpodDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [kondisi, setKondisi] = useState<"baik" | "kurang_hangat" | "rusak">("baik");
  const [porsiDiterima, setPorsiDiterima] = useState(300);
  const [hasPhoto, setHasPhoto] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const porsiKirim = 300;
  const selisihPorsi = porsiKirim - porsiDiterima;

  // Setup canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#10281D";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setIsCompleted(false);
  };

  const triggerCamera = () => {
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
      setHasPhoto(true);
    }, 200);
  };

  const handleComplete = () => {
    setIsCompleted(true);
  };

  const handleReset = () => {
    clearSignature();
    setPorsiDiterima(300);
    setKondisi("baik");
    setIsCompleted(false);
  };

  return (
    <div className="flex flex-col gap-2.5 w-full relative text-left">
      {/* Flash overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 rounded-[20px]" />
      )}

      {/* Stepper Card */}
      <div className="flex items-center justify-between bg-padi-50 px-3 py-2 rounded-xl clay-sm">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-ink-900">Porsi:</span>
          <span className="text-ink-600 font-medium">Kirim {porsiKirim}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPorsiDiterima((p) => Math.max(250, p - 5))}
            className="w-7 h-7 rounded-full clay-sm font-bold text-xs flex items-center justify-center hover:bg-padi-200 cursor-pointer active:scale-95"
            aria-label="Kurangi porsi diterima"
          >
            -
          </button>
          <span className="font-display font-black text-sm text-ink-900 tabular-nums min-w-[28px] text-center">
            {porsiDiterima}
          </span>
          <button
            type="button"
            onClick={() => setPorsiDiterima((p) => Math.min(300, p + 5))}
            className="w-7 h-7 rounded-full clay-sm font-bold text-xs flex items-center justify-center hover:bg-padi-200 cursor-pointer active:scale-95"
            aria-label="Tambah porsi diterima"
          >
            +
          </button>
        </div>
      </div>

      {/* Condition 3-way Segmented Bar */}
      <div role="group" aria-label="Kondisi makanan diterima" className="grid grid-cols-3 gap-1.5">
        {[
          { id: "baik", label: "Baik", tone: "bg-daun-400" },
          { id: "kurang_hangat", label: "Kurang Hangat", tone: "bg-telur-400" },
          { id: "rusak", label: "Rusak", tone: "bg-cabai-400" },
        ].map((k) => (
          <button
            key={k.id}
            type="button"
            aria-pressed={kondisi === k.id}
            onClick={() => setKondisi(k.id as "baik" | "kurang_hangat" | "rusak")}
            className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center text-center ${
              kondisi === k.id
                ? `${k.tone} text-ink-900 clay-sm shadow-xs`
                : "bg-padi-50/70 text-ink-600 hover:text-ink-900 hover:bg-padi-50"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {selisihPorsi > 0 && (
        <div className="text-[11px] font-bold text-cabai-700 bg-cabai-100 px-2 py-1 rounded-lg">
          Selisih {selisihPorsi} porsi masuk berita acara digital.
        </div>
      )}

      {/* Signature Canvas Box */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs font-bold text-ink-900 px-0.5">
          <span>Tanda Tangan PIC:</span>
          <button
            type="button"
            onClick={clearSignature}
            className="flex items-center gap-1 text-[11px] text-ink-600 hover:text-ink-900 underline cursor-pointer"
          >
            <Eraser size={13} /> Hapus
          </button>
        </div>
        <div className="relative w-full h-[72px] rounded-[16px] bg-white clay-inset border border-ink-900/10 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={400}
            height={72}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            onPointerCancel={stopDrawing}
            className="w-full h-full touch-none cursor-crosshair"
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[11px] font-semibold text-ink-600/40">
              Goreskan tanda tangan di sini
            </div>
          )}

          {/* Stamp "SELESAI" if completed */}
          {isCompleted && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 pointer-events-none">
              <div className="px-3 py-1 border-2 border-daun-700 text-daun-700 font-display font-black text-sm rounded-lg -rotate-3 shadow-xs animate-in zoom-in-75">
                SELESAI DITERIMA ✓
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <button
          type="button"
          onClick={triggerCamera}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full clay-sm text-xs font-bold text-ink-900 hover:bg-padi-200 cursor-pointer"
        >
          <Camera size={15} weight="bold" />
          <span>Foto Boks ({hasPhoto ? "✓ Ada" : "Ambil"})</span>
        </button>

        {isCompleted ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-daun-700">Tersimpan ✓</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-ink-600 hover:text-ink-900 underline font-semibold cursor-pointer text-[11px]"
            >
              Reset
            </button>
          </div>
        ) : (
          <ClayButton
            size="sm"
            variant="primary"
            tone="daun"
            disabled={!hasSignature}
            onClick={handleComplete}
            className="text-xs px-3"
          >
            <SealCheck size={15} weight="bold" className="mr-1" />
            Selesaikan
          </ClayButton>
        )}
      </div>
    </div>
  );
}
