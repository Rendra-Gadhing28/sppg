export interface BatchItemInput {
  id: string;
  bahanId: string;
  nomorBatch: string;
  tanggalExpired: string; // "YYYY-MM-DD"
  jumlahSisa: number;
}

export interface AlokasiBatchResult {
  alokasi: Array<{
    batchId: string;
    nomorBatch: string;
    jumlahDipotong: number;
    sisaSetelahnya: number;
    statusBatchBaru: "aktif" | "habis";
  }>;
  totalTerpotong: number;
  sisaKekurangan: number; // defisit jika batch tidak mencukupi
}

/**
 * Alokasi pemotongan stok batch menggunakan prinsip FEFO (First Expired, First Out)
 */
export function alokasikanBatchFEFO(
  batches: BatchItemInput[],
  jumlahDibutuhkan: number
): AlokasiBatchResult {
  if (jumlahDibutuhkan <= 0) {
    return { alokasi: [], totalTerpotong: 0, sisaKekurangan: 0 };
  }

  // Urutkan batch dari tanggal expired paling dekat
  const sorted = [...batches].sort(
    (a, b) => new Date(a.tanggalExpired).getTime() - new Date(b.tanggalExpired).getTime()
  );

  let sisaKebutuhan = jumlahDibutuhkan;
  let totalTerpotong = 0;
  const alokasi: AlokasiBatchResult["alokasi"] = [];

  for (const batch of sorted) {
    if (sisaKebutuhan <= 0) break;
    if (batch.jumlahSisa <= 0) continue;

    const ambil = Math.min(batch.jumlahSisa, sisaKebutuhan);
    const ambilBulat = Number(ambil.toFixed(3));
    const sisa = Number((batch.jumlahSisa - ambilBulat).toFixed(3));

    alokasi.push({
      batchId: batch.id,
      nomorBatch: batch.nomorBatch,
      jumlahDipotong: ambilBulat,
      sisaSetelahnya: sisa,
      statusBatchBaru: sisa <= 0 ? "habis" : "aktif",
    });

    sisaKebutuhan = Number((sisaKebutuhan - ambilBulat).toFixed(3));
    totalTerpotong = Number((totalTerpotong + ambilBulat).toFixed(3));
  }

  return {
    alokasi,
    totalTerpotong,
    sisaKekurangan: Math.max(0, sisaKebutuhan),
  };
}

/**
 * Evaluasi status batch berdasarkan sisa hari menuju kedaluwarsa
 */
export function evaluasiStatusExpiry(
  tanggalExpired: string | Date,
  refDate: Date = new Date()
): { status: "aman" | "segera_kedaluwarsa" | "kedaluwarsa"; sisaHari: number } {
  const tglExp = new Date(tanggalExpired);
  tglExp.setHours(0, 0, 0, 0);

  const tglRef = new Date(refDate);
  tglRef.setHours(0, 0, 0, 0);

  const diffTime = tglExp.getTime() - tglRef.getTime();
  const sisaHari = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (sisaHari < 0) {
    return { status: "kedaluwarsa", sisaHari };
  }
  if (sisaHari <= 3) {
    return { status: "segera_kedaluwarsa", sisaHari };
  }
  return { status: "aman", sisaHari };
}
