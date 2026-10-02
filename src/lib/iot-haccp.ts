export type TipePenempatanSensor = "chiller_dapur" | "freezer_dapur" | "boks_armada";

export interface EvaluasiHaccpResult {
  tipe: TipePenempatanSensor;
  suhu: number;
  status: "aman" | "peringatan" | "anomali_kritis";
  isAnomaliHaccp: boolean;
  keterangan: string;
}

export interface TelemetriRecord {
  suhuCelsius: number;
  isAnomaliHaccp: boolean;
}

export interface SkorKepatuhanResult {
  totalData: number;
  totalLolos: number;
  totalAnomali: number;
  persentaseKepatuhan: number;
  gradeKepatuhan: "A_SANGAT_BAIK" | "B_BAIK" | "C_PERLU_PERBAIKAN" | "D_KRITIS";
}

/**
 * Evaluasi kepatuhan suhu terhadap standar sanitasi HACCP
 */
export function evaluasiSuhuHaccp(
  tipe: TipePenempatanSensor,
  suhu: number
): EvaluasiHaccpResult {
  switch (tipe) {
    case "chiller_dapur":
      if (suhu >= 0 && suhu <= 4.0) {
        return {
          tipe,
          suhu,
          status: "aman",
          isAnomaliHaccp: false,
          keterangan: "Suhu chiller optimal (0°C - 4°C). Pertumbuhan mikroba terhambat.",
        };
      }
      if (suhu > 4.0 && suhu <= 6.0) {
        return {
          tipe,
          suhu,
          status: "peringatan",
          isAnomaliHaccp: false,
          keterangan: "Suhu chiller mendekati batas toleransi (4.1°C - 6°C). Cek ventilasi.",
        };
      }
      return {
        tipe,
        suhu,
        status: "anomali_kritis",
        isAnomaliHaccp: true,
        keterangan: "BAHAYA: Suhu chiller > 6°C atau beku < 0°C. Risiko pembusukan bahan!",
      };

    case "freezer_dapur":
      if (suhu <= -18.0) {
        return {
          tipe,
          suhu,
          status: "aman",
          isAnomaliHaccp: false,
          keterangan: "Suhu beku optimal (<= -18°C). Daging/ikan beku steril.",
        };
      }
      if (suhu > -18.0 && suhu <= -10.0) {
        return {
          tipe,
          suhu,
          status: "peringatan",
          isAnomaliHaccp: false,
          keterangan: "Suhu freezer meningkat (-17.9°C s/d -10°C). Cek kerapatan pintu.",
        };
      }
      return {
        tipe,
        suhu,
        status: "anomali_kritis",
        isAnomaliHaccp: true,
        keterangan: "BAHAYA: Suhu freezer > -10°C. Bahan rentan mengalami thawing parasit!",
      };

    case "boks_armada":
      if (suhu >= 60.0) {
        return {
          tipe,
          suhu,
          status: "aman",
          isAnomaliHaccp: false,
          keterangan: "Suhu hidangan panas terjaga aman (>= 60°C). Di luar Danger Zone.",
        };
      }
      if (suhu >= 55.0 && suhu < 60.0) {
        return {
          tipe,
          suhu,
          status: "peringatan",
          isAnomaliHaccp: false,
          keterangan: "Suhu hidangan mulai menurun (55°C - 59.9°C). Segera distribusikan.",
        };
      }
      return {
        tipe,
        suhu,
        status: "anomali_kritis",
        isAnomaliHaccp: true,
        keterangan: "BAHAYA: Suhu hidangan < 55°C memasuki Danger Zone bakteri patogen!",
      };
  }
}

/**
 * Menghitung skor kepatuhan HACCP dari kumpulan data pembacaan telemetri
 */
export function hitungSkorKepatuhanHaccp(
  records: TelemetriRecord[]
): SkorKepatuhanResult {
  if (records.length === 0) {
    return {
      totalData: 0,
      totalLolos: 0,
      totalAnomali: 0,
      persentaseKepatuhan: 100,
      gradeKepatuhan: "A_SANGAT_BAIK",
    };
  }

  const totalAnomali = records.filter((r) => r.isAnomaliHaccp).length;
  const totalLolos = records.length - totalAnomali;
  const persentase = Math.round((totalLolos / records.length) * 1000) / 10;

  let gradeKepatuhan: SkorKepatuhanResult["gradeKepatuhan"] = "A_SANGAT_BAIK";
  if (persentase >= 95) {
    gradeKepatuhan = "A_SANGAT_BAIK";
  } else if (persentase >= 85) {
    gradeKepatuhan = "B_BAIK";
  } else if (persentase >= 70) {
    gradeKepatuhan = "C_PERLU_PERBAIKAN";
  } else {
    gradeKepatuhan = "D_KRITIS";
  }

  return {
    totalData: records.length,
    totalLolos,
    totalAnomali,
    persentaseKepatuhan: persentase,
    gradeKepatuhan,
  };
}
