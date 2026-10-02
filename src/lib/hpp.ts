// Overhead operasional per porsi: gas, listrik, kemasan
const OVERHEAD_PER_PORSI_RP = 2500;
const OVER_BUDGET_THRESHOLD = 0.05; // 5%

export interface BomItem {
  bahanId: string;
  jumlahPerPorsi: number;
  hargaBeliSatuan: number; // Rp per satuan
}

export interface HasilHppTeoritis {
  biayaBahanPerPorsi: number;
  overheadPerPorsi: number;
  totalHppPerPorsi: number;
  rincianBahan: Array<{
    bahanId: string;
    biaya: number;
  }>;
}

/**
 * Kalkulasi HPP teoritis per porsi dari BOM + overhead operasional.
 */
export function kalkulasiHppTeoritis(
  bom: BomItem[],
  overheadPerPorsi: number = OVERHEAD_PER_PORSI_RP
): HasilHppTeoritis {
  const rincianBahan = bom.map((item) => ({
    bahanId: item.bahanId,
    biaya: Number((item.jumlahPerPorsi * item.hargaBeliSatuan).toFixed(2)),
  }));

  const biayaBahanPerPorsi = Number(
    rincianBahan.reduce((sum, item) => sum + item.biaya, 0).toFixed(2)
  );

  return {
    biayaBahanPerPorsi,
    overheadPerPorsi,
    totalHppPerPorsi: Number((biayaBahanPerPorsi + overheadPerPorsi).toFixed(2)),
    rincianBahan,
  };
}

export interface HasilVariansHpp {
  hppEstimasi: number;
  hppRiil: number;
  selisih: number;
  persentaseDeviasi: number;
  isOverBudget: boolean;
}

/**
 * Perbandingan HPP estimasi vs HPP riil belanja dengan persentase deviasi.
 * isOverBudget = true jika deviasi > 5%.
 */
export function kalkulasiVariansHpp(
  hppEstimasi: number,
  hppRiil: number
): HasilVariansHpp {
  const selisih = Number((hppRiil - hppEstimasi).toFixed(2));
  const persentaseDeviasi =
    hppEstimasi === 0
      ? 0
      : Number(((selisih / hppEstimasi) * 100).toFixed(2));

  return {
    hppEstimasi,
    hppRiil,
    selisih,
    persentaseDeviasi,
    isOverBudget: persentaseDeviasi > OVER_BUDGET_THRESHOLD * 100,
  };
}

export interface FoodWasteItem {
  beratKg: number;
  estimasiKerugianRp: number;
}

export interface HasilFoodWasteCost {
  totalBeratKg: number;
  totalKerugianRp: number;
  jumlahItem: number;
}

/**
 * Hitung total berat sampah makanan (kg) dan kerugian nominal (Rp).
 */
export function kalkulasiFoodWasteCost(items: FoodWasteItem[]): HasilFoodWasteCost {
  const totalBeratKg = Number(
    items.reduce((sum, i) => sum + i.beratKg, 0).toFixed(3)
  );
  const totalKerugianRp = Number(
    items.reduce((sum, i) => sum + i.estimasiKerugianRp, 0).toFixed(2)
  );

  return {
    totalBeratKg,
    totalKerugianRp,
    jumlahItem: items.length,
  };
}
