export interface ResepItemKalkulasi {
  bahanId: string;
  namaBahan: string;
  satuanStandar: string;
  jumlahPerPorsi: number; // misal kg atau gram
  stokSaatIni: number;
}

export interface HasilBOMItem {
  bahanId: string;
  namaBahan: string;
  satuan: string;
  totalKebutuhan: number;
  stokSaatIni: number;
  defisit: number;
  isDefisit: boolean;
}

/**
 * Kalkulasi kebutuhan bahan total = jumlahPerPorsi * totalTargetPorsi.
 */
export function kalkulasiKebutuhanBOM(
  items: ResepItemKalkulasi[],
  totalTargetPorsi: number
): HasilBOMItem[] {
  return items.map((item) => {
    const totalKebutuhan = Number(
      (item.jumlahPerPorsi * totalTargetPorsi).toFixed(3)
    );
    const defisit = Number(
      Math.max(0, totalKebutuhan - item.stokSaatIni).toFixed(3)
    );

    return {
      bahanId: item.bahanId,
      namaBahan: item.namaBahan,
      satuan: item.satuanStandar,
      totalKebutuhan,
      stokSaatIni: item.stokSaatIni,
      defisit,
      isDefisit: defisit > 0,
    };
  });
}
