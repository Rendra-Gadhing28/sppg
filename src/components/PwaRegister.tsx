"use client";

import { useEffect, useState } from "react";
import { WifiOff, CheckCircle2 } from "lucide-react";

export function PwaRegister() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showSyncSuccess, setShowSyncSuccess] = useState<boolean>(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowSyncSuccess(true);
      const timer = setTimeout(() => setShowSyncSuccess(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowSyncSuccess(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showSyncSuccess) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300">
      {!isOnline ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-900/20 border border-amber-500 animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span>Mode Offline: Presensi & serah terima disimpan lokal.</span>
        </div>
      ) : showSyncSuccess ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-900/20 border border-emerald-500">
          <CheckCircle2 className="w-4 h-4" />
          <span>Kembali online: Data tersinkronisasi.</span>
        </div>
      ) : null}
    </div>
  );
}
