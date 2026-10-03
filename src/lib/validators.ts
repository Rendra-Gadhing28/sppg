import { z } from "zod";

/**
 * Sanitasi string: bersihkan karakter tag HTML / potensi XSS dan trim whitespace.
 */
export function sanitizeString(val: string): string {
  if (typeof val !== "string") return "";
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/[&<>"'/]/g, (match) => {
      const escapeMap: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };
      return escapeMap[match] || match;
    })
    .trim();
}

/**
 * Skema Validasi & Sanitasi Data Sekolah
 */
export const sekolahSchema = z.object({
  namaSekolah: z
    .string()
    .min(3, "Nama sekolah minimal 3 karakter.")
    .max(150, "Nama sekolah maksimal 150 karakter.")
    .transform(sanitizeString),
  alamat: z
    .string()
    .min(5, "Alamat minimal 5 karakter.")
    .max(500, "Alamat maksimal 500 karakter.")
    .transform(sanitizeString),
  jumlahPorsiTarget: z
    .coerce
    .number()
    .int("Jumlah porsi harus bilangan bulat.")
    .positive("Jumlah porsi harus lebih dari 0.")
    .max(50000, "Batas maksimal 50.000 porsi per sekolah."),
  picNama: z
    .string()
    .min(2, "Nama PIC minimal 2 karakter.")
    .max(100, "Nama PIC maksimal 100 karakter.")
    .transform(sanitizeString),
  picKontak: z
    .string()
    .regex(/^(?:\+62|62|0)[0-9]{8,13}$/, "Nomor kontak PIC harus format nomor telepon valid (contoh: 081234567890).")
    .transform((val) => val.trim()),
  jamMakan: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Format jam makan harus HH:MM (contoh: 09:30).")
    .transform((val) => (val.length === 5 ? `${val}:00` : val)),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  catatanAlergi: z
    .string()
    .max(500, "Catatan alergi maksimal 500 karakter.")
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : null)),
});

/**
 * Skema Validasi & Sanitasi Data Anggota Dapur
 */
export const anggotaSchema = z.object({
  nik: z
    .string()
    .regex(/^\d{16}$/, "NIK wajib berupa 16 digit angka sesuai KTP.")
    .transform((val) => val.trim()),
  namaLengkap: z
    .string()
    .min(3, "Nama lengkap minimal 3 karakter.")
    .max(150, "Nama lengkap maksimal 150 karakter.")
    .transform(sanitizeString),
  jabatan: z
    .string()
    .min(2, "Jabatan minimal 2 karakter.")
    .max(100, "Jabatan maksimal 100 karakter.")
    .transform(sanitizeString),
  nomorHp: z
    .string()
    .max(20, "Nomor HP maksimal 20 digit.")
    .optional()
    .nullable(),
  fotoUrl: z.string().optional().nullable(),
  fotoTanganUrl: z.string().optional().nullable(),
  faceEmbedding: z.array(z.number()).length(128, "Embedding wajah harus berupa 128 koordinat float.").optional().nullable(),
  shiftId: z.coerce.number().int().positive().optional().nullable(),
});

/**
 * Skema Validasi Supplier (Fase 2)
 */
export const supplierSchema = z.object({
  kodeSupplier: z
    .string()
    .min(2, "Kode supplier minimal 2 karakter.")
    .max(20, "Kode supplier maksimal 20 karakter.")
    .transform(sanitizeString),
  namaSupplier: z
    .string()
    .min(3, "Nama supplier minimal 3 karakter.")
    .max(150, "Nama supplier maksimal 150 karakter.")
    .transform(sanitizeString),
  kategoriPasokan: z
    .string()
    .min(2, "Kategori pasokan minimal 2 karakter.")
    .max(100, "Kategori pasokan maksimal 100 karakter.")
    .transform(sanitizeString),
  kontakPerson: z
    .string()
    .min(2, "Kontak person minimal 2 karakter.")
    .max(100, "Kontak person maksimal 100 karakter.")
    .transform(sanitizeString),
  nomorHp: z
    .string()
    .regex(/^(?:\+62|62|0)[0-9]{8,13}$/, "Nomor HP harus format nomor telepon valid.")
    .transform((val) => val.trim()),
  alamat: z
    .string()
    .min(5, "Alamat minimal 5 karakter.")
    .max(500, "Alamat maksimal 500 karakter.")
    .transform(sanitizeString),
});

/**
 * Skema Validasi PO & Item PO (Fase 2)
 */
export const purchaseOrderItemSchema = z.object({
  bahanId: z.string().uuid("ID bahan harus format UUID."),
  jumlahPesan: z.coerce.number().positive("Jumlah pesan harus lebih dari 0."),
  hargaSatuan: z.coerce.number().min(0, "Harga satuan tidak boleh negatif."),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string().uuid("ID supplier harus format UUID."),
  targetPengiriman: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Target pengiriman harus format YYYY-MM-DD."),
  catatan: z.string().max(500).optional().nullable().transform((val) => (val ? sanitizeString(val) : null)),
  items: z.array(purchaseOrderItemSchema).min(1, "Minimal 1 item bahan dalam PO."),
});

/**
 * Skema Validasi QC Penerimaan & Batch Expiry (Fase 2)
 */
export const qcItemBatchSchema = z.object({
  bahanId: z.string().uuid("ID bahan harus format UUID."),
  jumlahDiterima: z.coerce.number().positive("Jumlah diterima harus lebih dari 0."),
  nomorBatch: z.string().min(3, "Nomor batch minimal 3 karakter.").transform(sanitizeString),
  tanggalExpired: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal kedaluwarsa harus format YYYY-MM-DD."),
});

export const qcPenerimaanSchema = z.object({
  poId: z.string().uuid("ID PO harus format UUID."),
  status: z.enum(["lolos", "lolos_bersyarat", "ditolak"]),
  catatanSuhu: z.string().max(50).optional().nullable().transform((val) => (val ? sanitizeString(val) : null)),
  catatanKebersihan: z.string().max(500).optional().nullable().transform((val) => (val ? sanitizeString(val) : null)),
  fotoBuktiUrl: z.string().optional().nullable(),
  items: z.array(qcItemBatchSchema).min(1, "Minimal 1 item bahan yang diperiksa."),
});

/**
 * Skema Validasi Distribusi Armada & Serah Terima (Fase 2)
 */
export const armadaSchema = z.object({
  nomorKendaraan: z.string().min(3).max(20).transform(sanitizeString),
  jenisKendaraan: z.string().min(3).max(50).transform(sanitizeString),
  kapasitasPorsi: z.coerce.number().int().positive(),
});

export const distribusiPengirimanSchema = z.object({
  jadwalMenuId: z.string().uuid("ID jadwal menu harus format UUID."),
  armadaId: z.string().uuid("ID armada harus format UUID."),
  driverId: z.string().uuid("ID driver harus format UUID.").optional().nullable(),
  catatan: z.string().max(500).optional().nullable().transform((val) => (val ? sanitizeString(val) : null)),
  alokasiSekolah: z.array(
    z.object({
      sekolahId: z.string().uuid(),
      porsiKirim: z.coerce.number().int().positive(),
    })
  ).min(1, "Minimal 1 sekolah tujuan pengiriman."),
});

export const serahTerimaSekolahSchema = z.object({
  serahTerimaId: z.string().uuid("ID serah terima harus format UUID."),
  porsiDiterima: z.coerce.number().int().positive("Porsi diterima harus lebih dari 0."),
  namaPenerimaSekolah: z.string().min(2, "Nama penerima minimal 2 karakter.").transform(sanitizeString),
  kontakPenerimaSekolah: z.string().regex(/^(?:\+62|62|0)[0-9]{8,13}$/, "Nomor kontak penerima valid.").transform((val) => val.trim()),
  fotoSerahTerimaUrl: z.string().optional().nullable(),
  ttdDigitalUrl: z.string().optional().nullable(),
  kondisiMakanan: z.enum(["baik_layak", "kurang_hangat", "kemasan_rusak"]),
  catatan: z.string().max(500).optional().nullable().transform((val) => (val ? sanitizeString(val) : null)),
});

// --- FASE 3 VALIDATORS ---

export const dapurCabangSchema = z.object({
  kodeDapur: z
    .string()
    .min(2, "Kode dapur minimal 2 karakter.")
    .max(20, "Kode dapur maksimal 20 karakter.")
    .transform(sanitizeString),
  namaDapur: z
    .string()
    .min(3, "Nama dapur minimal 3 karakter.")
    .max(100, "Nama dapur maksimal 100 karakter.")
    .transform(sanitizeString),
  tipeDapur: z.enum(["pusat", "satelit"]),
  alamat: z
    .string()
    .min(5, "Alamat minimal 5 karakter.")
    .max(500, "Alamat maksimal 500 karakter.")
    .transform(sanitizeString),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  radiusMeter: z.coerce.number().int().positive().optional().default(100),
  kapasitasMaksPorsi: z.coerce.number().int().positive().optional().default(3000),
});

export const transferStokSchema = z.object({
  dapurAsalId: z.string().uuid("ID dapur asal harus format UUID."),
  dapurTujuanId: z.string().uuid("ID dapur tujuan harus format UUID."),
  bahanId: z.string().uuid("ID bahan harus format UUID."),
  batchId: z.string().uuid("ID batch harus format UUID.").optional().nullable(),
  jumlah: z.coerce.number().positive("Jumlah transfer harus lebih dari 0."),
  catatan: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : null)),
});

export const waMessageSchema = z.object({
  nomorTujuan: z
    .string()
    .regex(/^(?:\+62|62|0)[0-9]{8,13}$/, "Nomor tujuan harus format nomor telepon valid."),
  tipePesan: z.enum(["po_supplier", "reminder_shift", "alert_stok", "status_kirim"]),
  payloadPesan: z
    .string()
    .min(1, "Payload pesan tidak boleh kosong.")
    .max(4096, "Pesan maksimal 4096 karakter."),
});

const offlineMutasiItemSchema = z.object({
  idempotencyKey: z.string().min(1).max(100),
  userId: z.string().uuid("userId harus format UUID."),
  entitasTarget: z.string().min(1, "entitasTarget wajib diisi."),
  clientRecordedAt: z.string().datetime("clientRecordedAt harus format ISO 8601."),
  payloadJson: z.record(z.string(), z.unknown()),
});

export const offlineSyncBatchSchema = z.object({
  mutasi: z
    .array(offlineMutasiItemSchema)
    .min(1, "Minimal 1 mutasi dalam batch.")
    .max(100, "Maksimal 100 mutasi per batch."),
});

export const foodWasteSchema = z.object({
  dapurId: z.string().uuid("ID dapur harus format UUID.").optional().nullable(),
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal harus format YYYY-MM-DD.")
    .optional(),
  kategoriWaste: z.enum(["prep_waste", "cooking_loss", "plate_waste"]),
  bahanId: z.string().uuid("ID bahan harus format UUID.").optional().nullable(),
  menuId: z.string().uuid("ID menu harus format UUID.").optional().nullable(),
  beratKg: z.coerce.number().positive("Berat (kg) harus lebih dari 0."),
  estimasiKerugianRp: z.coerce.number().min(0, "Estimasi kerugian tidak boleh negatif.").optional().default(0),
  catatan: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : null)),
});

export const komplainSekolahSchema = z.object({
  sekolahId: z.string().uuid("ID sekolah harus format UUID."),
  pengirimanId: z.string().uuid("ID pengiriman harus format UUID.").optional().nullable(),
  kategoriKendala: z.enum([
    "kurang_porsi",
    "makanan_dingin",
    "kemasan_rusak",
    "dugaan_basi",
    "lainnya",
  ]),
  deskripsi: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter.")
    .max(2000, "Deskripsi maksimal 2000 karakter.")
    .transform(sanitizeString),
  fotoBuktiUrl: z.string().optional().nullable(),
});

export const komplainUpdateSchema = z.object({
  id: z.string().uuid("ID tiket harus format UUID."),
  status: z.enum(["investigasi", "tindakan", "selesai", "ditutup"]),
  catatanInvestigasi: z
    .string()
    .max(2000)
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : null)),
  tindakanPerbaikan: z
    .string()
    .max(2000)
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : null)),
});

// --- VALIDATOR FASE 4 ---
export const aiMenuPresetSchema = z.object({
  namaPaketSiklus: z.string().min(3).max(100).transform(sanitizeString),
  targetJenjang: z.enum(["paud", "sd", "smp", "sma"]),
  targetKaloriMin: z.coerce.number().positive(),
  targetKaloriMax: z.coerce.number().positive(),
  estimasiHppRataRata: z.coerce.number().positive(),
  rekomendasiMenuJson: z.record(z.string(), z.unknown()),
  statusApproval: z.enum(["draft", "disetujui", "ditolak"]).optional().default("draft"),
});

export const aiMenuGenerateSchema = z.object({
  targetJenjang: z.enum(["paud", "sd", "smp", "sma"]),
  hariSiklus: z.coerce.number().int().min(5).max(30).default(5),
  maxHppPerPorsi: z.coerce.number().positive().default(15000),
  pantangAlergen: z.array(z.string()).optional().default([]),
});

export const vrpRuteSchema = z.object({
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD.")
    .optional(),
  armadaId: z.string().uuid("ID armada harus format UUID."),
  driverId: z.string().uuid("ID driver harus format UUID.").optional().nullable(),
  urutanSekolahJson: z.array(
    z.object({
      sekolahId: z.string().uuid(),
      namaSekolah: z.string(),
      urutan: z.number().int().positive(),
      porsi: z.number().int().positive(),
      estJamTiba: z.string(),
    })
  ),
  totalJarakKm: z.coerce.number().min(0),
  totalEstimasiMenit: z.coerce.number().int().min(0),
  statusRute: z.enum(["terencana", "berjalan", "selesai", "batal"]).optional().default("terencana"),
});

export const iotSensorDeviceSchema = z.object({
  kodeAlat: z.string().min(3).max(50).transform(sanitizeString),
  tipePenempatan: z.enum(["chiller_dapur", "freezer_dapur", "boks_armada"]),
  dapurId: z.string().uuid().optional().nullable(),
  armadaId: z.string().uuid().optional().nullable(),
  ambangSuhuMin: z.coerce.number(),
  ambangSuhuMax: z.coerce.number(),
  statusAktif: z.boolean().optional().default(true),
});

export const iotTelemetriSchema = z.object({
  deviceId: z.string().uuid("ID device harus format UUID."),
  suhuCelsius: z.coerce.number(),
  kelembapanPersen: z.coerce.number().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
});

export const bgnAuditSchema = z.object({
  periodeMulai: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodeSelesai: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dapurId: z.string().uuid("ID dapur harus format UUID."),
});
