export interface ParamPeramalanStok {
  bahanId: string;
  namaBahan: string;
  stokSaatIni: number;
  rataRataKonsumsiHarian: number; // e.g. 50 kg/hari
  leadTimeHari: number; // e.g. 2 hari waktu pengiriman supplier
  faktorPengaliSafetyStock?: number; // default 1.5
}

export interface RekomendasiReplenishment {
  bahanId: string;
  namaBahan: string;
  stokSaatIni: number;
  safetyStock: number;
  reorderPoint: number;
  perluOrderUlang: boolean;
  rekomendasiJumlahOrder: number;
  estimasiHariHabis: number;
}

export interface HistorisKonsumsi {
  aktual: number;
  prediksi: number;
}

/**
 * Hitung Dynamic Reorder Point (ROP) dan Safety Stock
 * Formula:
 * Safety Stock = Rata-rata Harian * 0.5 * Lead Time
 * ROP = (Rata-rata Harian * Lead Time) + Safety Stock
 */
export function kalkulasiSmartReplenishment(
  param: ParamPeramalanStok
): RekomendasiReplenishment {
  const {
    bahanId,
    namaBahan,
    stokSaatIni,
    rataRataKonsumsiHarian,
    leadTimeHari,
    faktorPengaliSafetyStock = 1.2,
  } = param;

  const leadTimeDemand = rataRataKonsumsiHarian * leadTimeHari;
  const safetyStock = Math.round(rataRataKonsumsiHarian * 0.5 * leadTimeHari * faktorPengaliSafetyStock * 10) / 10;
  const reorderPoint = Math.round((leadTimeDemand + safetyStock) * 10) / 10;

  const perluOrderUlang = stokSaatIni <= reorderPoint;

  // Target stok pemenuhan untuk siklus 7 hari ke depan
  const targetStokMingguan = rataRataKonsumsiHarian * 7 + safetyStock;
  const rekomendasiJumlahOrder = perluOrderUlang
    ? Math.max(0, Math.round((targetStokMingguan - stokSaatIni) * 10) / 10)
    : 0;

  const estimasiHariHabis =
    rataRataKonsumsiHarian > 0
      ? Math.max(0, Math.round((stokSaatIni / rataRataKonsumsiHarian) * 10) / 10)
      : 999;

  return {
    bahanId,
    namaBahan,
    stokSaatIni,
    safetyStock,
    reorderPoint,
    perluOrderUlang,
    rekomendasiJumlahOrder,
    estimasiHariHabis,
  };
}

/**
 * Hitung Mean Absolute Percentage Error (MAPE) untuk evaluasi akurasi prediksi AI
 * MAPE = (1/n) * sum(|Aktual - Prediksi| / Aktual) * 100
 */
export function hitungMape(data: HistorisKonsumsi[]): number {
  if (data.length === 0) return 0;

  let totalErrorRatio = 0;
  let validCount = 0;

  for (const d of data) {
    if (d.aktual > 0) {
      const errorRatio = Math.abs(d.aktual - d.prediksi) / d.aktual;
      totalErrorRatio += errorRatio;
      validCount++;
    }
  }

  if (validCount === 0) return 0;
  const mape = (totalErrorRatio / validCount) * 100;
  return Math.round(mape * 100) / 100;
}
