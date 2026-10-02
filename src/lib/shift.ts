export type AbsensiStatus = "tepat_waktu" | "terlambat" | "pulang_cepat";

/**
 * Tentukan status presensi masuk berdasarkan jam masuk shift & toleransi menit.
 */
export function evaluasiStatusMasuk(
  waktuCatat: Date,
  jamMasukStr: string, // format "HH:MM" atau "HH:MM:SS"
  toleransiMenit: number
): AbsensiStatus {
  const [jamTarget, menitTarget] = jamMasukStr.split(":").map(Number);
  const batasMenitTotal = jamTarget * 60 + menitTarget + toleransiMenit;
  const aktualMenitTotal = waktuCatat.getHours() * 60 + waktuCatat.getMinutes();

  return aktualMenitTotal <= batasMenitTotal ? "tepat_waktu" : "terlambat";
}

/**
 * Tentukan status presensi keluar.
 */
export function evaluasiStatusKeluar(
  waktuCatat: Date,
  jamPulangStr: string
): AbsensiStatus {
  const [jamTarget, menitTarget] = jamPulangStr.split(":").map(Number);
  const targetMenitTotal = jamTarget * 60 + menitTarget;
  const aktualMenitTotal = waktuCatat.getHours() * 60 + waktuCatat.getMinutes();

  return aktualMenitTotal >= targetMenitTotal ? "tepat_waktu" : "pulang_cepat";
}
