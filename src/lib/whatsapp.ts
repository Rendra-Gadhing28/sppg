const PHONE_REGEX = /^(?:\+62|62|0)[0-9]{8,13}$/;

/**
 * Normalisasi nomor HP ke format internasional +62.
 */
function normalizePhone(nomor: string): string {
  const cleaned = nomor.replace(/\s|-/g, "");
  if (cleaned.startsWith("0")) return "+62" + cleaned.slice(1);
  if (cleaned.startsWith("62")) return "+" + cleaned;
  return cleaned;
}

function validatePhone(nomor: string): boolean {
  return PHONE_REGEX.test(nomor.replace(/\s|-/g, ""));
}

// --- Template Generators ---

export function formatPoNotification(params: {
  nomorPo: string;
  namaSupplier: string;
  targetPengiriman: string;
  totalBiaya: number;
  items: Array<{ namaBahan: string; jumlahPesan: number; satuan: string }>;
}): string {
  const itemLines = params.items
    .map((i) => `  - ${i.namaBahan}: ${i.jumlahPesan} ${i.satuan}`)
    .join("\n");
  return (
    `🛒 *PURCHASE ORDER BARU*\n` +
    `No. PO: ${params.nomorPo}\n` +
    `Supplier: ${params.namaSupplier}\n` +
    `Target Kirim: ${params.targetPengiriman}\n` +
    `Total: Rp ${params.totalBiaya.toLocaleString("id-ID")}\n\n` +
    `*Detail Bahan:*\n${itemLines}\n\n` +
    `_Pesan ini otomatis dari Sistem SPPG Dapur MBG_`
  );
}

export function formatShiftReminder(params: {
  namaAnggota: string;
  namaShift: string;
  jamMasuk: string;
  tanggal: string;
}): string {
  return (
    `⏰ *REMINDER SHIFT KERJA*\n` +
    `Halo ${params.namaAnggota},\n` +
    `Shift *${params.namaShift}* besok (${params.tanggal})\n` +
    `Jam masuk: ${params.jamMasuk}\n\n` +
    `Harap hadir tepat waktu. Terima kasih! 🙏\n` +
    `_Sistem SPPG Dapur MBG_`
  );
}

export function formatStokAlert(params: {
  namaBahan: string;
  stokSaatIni: number;
  stokMinimum: number;
  satuan: string;
}): string {
  return (
    `⚠️ *ALERT STOK MENIPIS*\n` +
    `Bahan: *${params.namaBahan}*\n` +
    `Stok saat ini: ${params.stokSaatIni} ${params.satuan}\n` +
    `Stok minimum: ${params.stokMinimum} ${params.satuan}\n\n` +
    `Segera lakukan pemesanan ke supplier!\n` +
    `_Sistem SPPG Dapur MBG_`
  );
}

export function formatDistribusiNotification(params: {
  nomorSuratJalan: string;
  namaSekolah: string;
  porsiKirim: number;
  status: string;
  catatan?: string;
}): string {
  return (
    `🚚 *STATUS PENGIRIMAN MBG*\n` +
    `No. SJ: ${params.nomorSuratJalan}\n` +
    `Sekolah: ${params.namaSekolah}\n` +
    `Porsi: ${params.porsiKirim}\n` +
    `Status: *${params.status.toUpperCase()}*\n` +
    (params.catatan ? `Catatan: ${params.catatan}\n` : "") +
    `_Sistem SPPG Dapur MBG_`
  );
}

export interface WaQueuePayload {
  id: string;
  nomorTujuan: string;
  nomorTujuanNormalized: string;
  tipePesan: "po_supplier" | "reminder_shift" | "alert_stok" | "status_kirim";
  payloadPesan: string;
  status: "queued";
  createdAt: string;
}

/**
 * Mock/service pengiriman WA: validasi nomor, kembalikan payload log antrean.
 * ponytail: integrasi WA API nyata (Whatsapp Cloud API / third-party) saat production.
 */
export async function kirimPesanWaQueue(params: {
  nomorTujuan: string;
  tipePesan: "po_supplier" | "reminder_shift" | "alert_stok" | "status_kirim";
  payloadPesan: string;
}): Promise<{ success: boolean; payload?: WaQueuePayload; error?: string }> {
  if (!validatePhone(params.nomorTujuan)) {
    return { success: false, error: "Nomor tujuan tidak valid." };
  }

  const payload: WaQueuePayload = {
    id: crypto.randomUUID(),
    nomorTujuan: params.nomorTujuan,
    nomorTujuanNormalized: normalizePhone(params.nomorTujuan),
    tipePesan: params.tipePesan,
    payloadPesan: params.payloadPesan,
    status: "queued",
    createdAt: new Date().toISOString(),
  };

  return { success: true, payload };
}
