"use client";

import React, { useEffect } from "react";
import { CheckCircle, XCircle } from "@phosphor-icons/react";

export interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "success",
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const tone = type === "success" ? "daun" : "cabai";

  return (
    <div
      role="status"
      data-tone={tone}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] clay p-4 px-6 rounded-full flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200 select-none text-ink-900"
    >
      {type === "success" ? (
        <CheckCircle size={24} weight="fill" className="text-daun-700" />
      ) : (
        <XCircle size={24} weight="fill" className="text-cabai-400" />
      )}
      <span className="font-display font-bold text-sm sm:text-base">
        {message}
      </span>
      <button
        onClick={onClose}
        className="ml-2 text-ink-600 hover:text-ink-900 font-bold text-sm cursor-pointer"
        aria-label="Tutup notifikasi"
      >
        ✕
      </button>
    </div>
  );
}
