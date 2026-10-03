import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  time,
  integer,
  smallint,
  decimal,
  serial,
  bigserial,
  unique,
  check,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// --- ENUMS ---
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "admin",
  "ahli_gizi",
  "kepala_dapur",
  "petugas_stok",
  "driver",
  "pimpinan",
]);

export const absensiJenisEnum = pgEnum("absensi_jenis", ["masuk", "keluar"]);

export const absensiStatusEnum = pgEnum("absensi_status", [
  "tepat_waktu",
  "terlambat",
  "pulang_cepat",
]);

export const absensiMetodeEnum = pgEnum("absensi_metode", [
  "selfie_gps",
  "face_recognition",
  "qr_kiosk",
  "manual_admin",
]);

export const poStatusEnum = pgEnum("po_status", [
  "draft",
  "diajukan",
  "dikirim",
  "diterima",
  "batal",
]);

export const qcStatusEnum = pgEnum("qc_status", [
  "lolos",
  "lolos_bersyarat",
  "ditolak",
]);

export const distribusiStatusEnum = pgEnum("distribusi_status", [
  "disiapkan",
  "dalam_perjalanan",
  "selesai",
  "batal",
]);

export const kondisiMakananEnum = pgEnum("kondisi_makanan", [
  "baik_layak",
  "kurang_hangat",
  "kemasan_rusak",
]);

export const bahanKategoriEnum = pgEnum("bahan_kategori", [
  "pokok",
  "lauk_hewani",
  "lauk_nabati",
  "sayur",
  "buah",
  "bumbu",
]);

export const mutasiJenisEnum = pgEnum("mutasi_jenis", [
  "masuk",
  "keluar_produksi",
  "penyesuaian",
  "waste",
]);

// --- ENUMS FASE 3 ---
export const dapurTipeEnum = pgEnum("dapur_tipe", ["pusat", "satelit"]);

export const transferStatusEnum = pgEnum("transfer_status", [
  "diajukan",
  "dalam_perjalanan",
  "diterima",
  "batal",
]);

export const waStatusEnum = pgEnum("wa_status", [
  "queued",
  "sent",
  "delivered",
  "read",
  "failed",
]);

export const waTipeEnum = pgEnum("wa_tipe", [
  "po_supplier",
  "reminder_shift",
  "alert_stok",
  "status_kirim",
]);

export const syncStatusEnum = pgEnum("sync_status", [
  "pending",
  "synced",
  "failed",
]);

export const wasteKategoriEnum = pgEnum("waste_kategori", [
  "prep_waste",
  "cooking_loss",
  "plate_waste",
]);

export const komplainStatusEnum = pgEnum("komplain_status", [
  "baru",
  "investigasi",
  "tindakan",
  "selesai",
  "ditutup",
]);

export const komplainKategoriEnum = pgEnum("komplain_kategori", [
  "kurang_porsi",
  "makanan_dingin",
  "kemasan_rusak",
  "dugaan_basi",
  "lainnya",
]);

// --- ENUMS FASE 4 ---
export const targetJenjangEnum = pgEnum("target_jenjang", [
  "paud",
  "sd",
  "smp",
  "sma",
]);

export const aiMenuApprovalEnum = pgEnum("ai_menu_approval", [
  "draft",
  "disetujui",
  "ditolak",
]);

export const vrpRuteStatusEnum = pgEnum("vrp_rute_status", [
  "terencana",
  "berjalan",
  "selesai",
  "batal",
]);

export const iotPenempatanEnum = pgEnum("iot_penempatan", [
  "chiller_dapur",
  "freezer_dapur",
  "boks_armada",
]);

// --- 1. KONFIGURASI DAPUR ---
export const konfigurasiDapur = pgTable(
  "konfigurasi_dapur",
  {
    id: integer("id").primaryKey().default(1),
    namaDapur: varchar("nama_dapur", { length: 100 }).notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
    longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
    radiusMeter: integer("radius_meter").notNull().default(100),
  },
  (table) => [check("single_row_check", sql`${table.id} = 1`)]
);

// --- 2. USERS ---
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomorHp: varchar("nomor_hp", { length: 20 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 3. ANGGOTA ---
export const anggota = pgTable("anggota", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .unique()
    .references(() => users.id, { onDelete: "set null" }),
  nik: varchar("nik", { length: 16 }).unique().notNull(),
  namaLengkap: varchar("nama_lengkap", { length: 150 }).notNull(),
  jabatan: varchar("jabatan", { length: 100 }).notNull(),
  nomorHp: varchar("nomor_hp", { length: 20 }),
  fotoUrl: text("foto_url"),
  fotoTanganUrl: text("foto_tangan_url"),
  faceEmbedding: jsonb("face_embedding").$type<number[]>(),
  statusAktif: boolean("status_aktif").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 4. SHIFT KERJA & JADWAL ---
export const shiftKerja = pgTable("shift_kerja", {
  id: serial("id").primaryKey(),
  namaShift: varchar("nama_shift", { length: 50 }).notNull(),
  jamMasuk: time("jam_masuk").notNull(),
  jamPulang: time("jam_pulang").notNull(),
  toleransiMenit: integer("toleransi_menit").notNull().default(15),
});

export const jadwalShift = pgTable(
  "jadwal_shift",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    anggotaId: uuid("anggota_id")
      .notNull()
      .references(() => anggota.id, { onDelete: "cascade" }),
    shiftId: integer("shift_id")
      .notNull()
      .references(() => shiftKerja.id),
    hariKe: smallint("hari_ke").notNull(), // 1: Senin, 7: Minggu
  },
  (table) => [
    unique("jadwal_shift_anggota_hari_unique").on(table.anggotaId, table.hariKe),
    check("hari_ke_range", sql`${table.hariKe} BETWEEN 1 AND 7`),
  ]
);

// --- 5. ABSENSI ---
export const absensi = pgTable(
  "absensi",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    anggotaId: uuid("anggota_id")
      .notNull()
      .references(() => anggota.id, { onDelete: "cascade" }),
    tanggal: date("tanggal", { mode: "string" }).notNull().default(sql`CURRENT_DATE`),
    jenis: absensiJenisEnum("jenis").notNull(),
    waktuCatat: timestamp("waktu_catat", { withTimezone: true })
      .notNull()
      .defaultNow(),
    status: absensiStatusEnum("status").notNull(),
    metode: absensiMetodeEnum("metode").notNull().default("selfie_gps"),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    jarakKeDapurMeter: integer("jarak_ke_dapur_meter"),
    isInRadius: boolean("is_in_radius").notNull().default(false),
    fotoBuktiUrl: text("foto_bukti_url"),
    catatan: text("catatan"),
    faceConfidence: decimal("face_confidence", { precision: 5, scale: 4 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("absensi_anggota_tanggal_jenis_unique").on(
      table.anggotaId,
      table.tanggal,
      table.jenis
    ),
  ]
);

// --- 6. SEKOLAH ---
export const sekolah = pgTable(
  "sekolah",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    namaSekolah: varchar("nama_sekolah", { length: 150 }).notNull(),
    alamat: text("alamat").notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    jumlahPorsiTarget: integer("jumlah_porsi_target").notNull(),
    picNama: varchar("pic_nama", { length: 100 }).notNull(),
    picKontak: varchar("pic_kontak", { length: 20 }).notNull(),
    jamMakan: time("jam_makan").notNull(),
    catatanAlergi: text("catatan_alergi"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("target_porsi_positif", sql`${table.jumlahPorsiTarget} > 0`)]
);

// --- 7. MASTER BAHAN ---
export const bahan = pgTable(
  "bahan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kodeBahan: varchar("kode_bahan", { length: 20 }).unique().notNull(),
    namaBahan: varchar("nama_bahan", { length: 100 }).notNull(),
    kategori: bahanKategoriEnum("kategori").notNull(),
    satuanStandar: varchar("satuan_standar", { length: 20 }).notNull(),
    stokSaatIni: decimal("stok_saat_ini", { precision: 12, scale: 3 })
      .notNull()
      .default("0.000"),
    stokMinimum: decimal("stok_minimum", { precision: 12, scale: 3 })
      .notNull()
      .default("0.000"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("stok_non_negatif", sql`${table.stokSaatIni} >= 0`)]
);

// --- 8. MENU & BOM ---
export const menu = pgTable("menu", {
  id: uuid("id").primaryKey().defaultRandom(),
  namaMenu: varchar("nama_menu", { length: 150 }).notNull(),
  deskripsi: text("deskripsi"),
  totalKalori: decimal("total_kalori", { precision: 6, scale: 2 })
    .notNull()
    .default("0.00"),
  proteinGram: decimal("protein_gram", { precision: 6, scale: 2 })
    .notNull()
    .default("0.00"),
  lemakGram: decimal("lemak_gram", { precision: 6, scale: 2 })
    .notNull()
    .default("0.00"),
  karboGram: decimal("karbo_gram", { precision: 6, scale: 2 })
    .notNull()
    .default("0.00"),
  isApprovedGizi: boolean("is_approved_gizi").notNull().default(false),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const resepItem = pgTable(
  "resep_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    menuId: uuid("menu_id")
      .notNull()
      .references(() => menu.id, { onDelete: "cascade" }),
    bahanId: uuid("bahan_id")
      .notNull()
      .references(() => bahan.id),
    jumlahPerPorsi: decimal("jumlah_per_porsi", { precision: 10, scale: 4 }).notNull(),
    satuan: varchar("satuan", { length: 20 }).notNull(),
  },
  (table) => [
    unique("resep_item_menu_bahan_unique").on(table.menuId, table.bahanId),
    check("jumlah_per_porsi_positif", sql`${table.jumlahPerPorsi} > 0`),
  ]
);

export const jadwalMenu = pgTable("jadwal_menu", {
  id: uuid("id").primaryKey().defaultRandom(),
  tanggal: date("tanggal", { mode: "string" }).unique().notNull(),
  menuId: uuid("menu_id")
    .notNull()
    .references(() => menu.id),
  totalTargetPorsi: integer("total_target_porsi").notNull().default(0),
  statusProduksi: varchar("status_produksi", { length: 20 }).notNull().default("draft"),
  catatan: text("catatan"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 9. MUTASI STOK ---
export const stokMutasi = pgTable(
  "stok_mutasi",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bahanId: uuid("bahan_id")
      .notNull()
      .references(() => bahan.id),
    jenis: mutasiJenisEnum("jenis").notNull(),
    jumlah: decimal("jumlah", { precision: 12, scale: 3 }).notNull(),
    saldoSebelumnya: decimal("saldo_sebelumnya", { precision: 12, scale: 3 }).notNull(),
    saldoSetelahnya: decimal("saldo_setelahnya", { precision: 12, scale: 3 }).notNull(),
    referensiId: uuid("referensi_id"),
    keterangan: text("keterangan"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("jumlah_mutasi_positif", sql`${table.jumlah} > 0`)]
);

// --- 10. SUPPLIER (FASE 2) ---
export const supplier = pgTable("supplier", {
  id: uuid("id").primaryKey().defaultRandom(),
  kodeSupplier: varchar("kode_supplier", { length: 20 }).unique().notNull(),
  namaSupplier: varchar("nama_supplier", { length: 150 }).notNull(),
  kategoriPasokan: varchar("kategori_pasokan", { length: 100 }).notNull(),
  kontakPerson: varchar("kontak_person", { length: 100 }).notNull(),
  nomorHp: varchar("nomor_hp", { length: 20 }).notNull(),
  alamat: text("alamat").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 11. PURCHASE ORDER (PO - FASE 2) ---
export const purchaseOrder = pgTable("purchase_order", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomorPo: varchar("nomor_po", { length: 50 }).unique().notNull(),
  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => supplier.id),
  tanggalPo: date("tanggal_po", { mode: "string" })
    .notNull()
    .default(sql`CURRENT_DATE`),
  targetPengiriman: date("target_pengiriman", { mode: "string" }).notNull(),
  status: poStatusEnum("status").notNull().default("draft"),
  totalBiaya: decimal("total_biaya", { precision: 14, scale: 2 })
    .notNull()
    .default("0.00"),
  catatan: text("catatan"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const purchaseOrderItem = pgTable(
  "purchase_order_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    poId: uuid("po_id")
      .notNull()
      .references(() => purchaseOrder.id, { onDelete: "cascade" }),
    bahanId: uuid("bahan_id")
      .notNull()
      .references(() => bahan.id),
    jumlahPesan: decimal("jumlah_pesan", { precision: 12, scale: 3 }).notNull(),
    jumlahDiterima: decimal("jumlah_diterima", { precision: 12, scale: 3 })
      .notNull()
      .default("0.000"),
    hargaSatuan: decimal("harga_satuan", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    subtotal: decimal("subtotal", { precision: 14, scale: 2 })
      .notNull()
      .default("0.00"),
  },
  (table) => [
    unique("po_item_po_bahan_unique").on(table.poId, table.bahanId),
    check("po_item_jumlah_positif", sql`${table.jumlahPesan} > 0`),
  ]
);

// --- 12. QC PENERIMAAN BAHAN (FASE 2) ---
export const qcPenerimaan = pgTable("qc_penerimaan", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomorQc: varchar("nomor_qc", { length: 50 }).unique().notNull(),
  poId: uuid("po_id")
    .notNull()
    .references(() => purchaseOrder.id),
  tanggalPemeriksaan: timestamp("tanggal_pemeriksaan", { withTimezone: true })
    .notNull()
    .defaultNow(),
  petugasQcId: uuid("petugas_qc_id").references(() => users.id),
  status: qcStatusEnum("status").notNull().default("lolos"),
  catatanSuhu: varchar("catatan_suhu", { length: 50 }),
  catatanKebersihan: text("catatan_kebersihan"),
  fotoBuktiUrl: text("foto_bukti_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 13. STOK BATCH & EXPIRY FEFO (FASE 2) ---
export const stokBatch = pgTable(
  "stok_batch",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bahanId: uuid("bahan_id")
      .notNull()
      .references(() => bahan.id),
    qcId: uuid("qc_id").references(() => qcPenerimaan.id),
    nomorBatch: varchar("nomor_batch", { length: 50 }).unique().notNull(),
    tanggalMasuk: date("tanggal_masuk", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_DATE`),
    tanggalExpired: date("tanggal_expired", { mode: "string" }).notNull(),
    jumlahAwal: decimal("jumlah_awal", { precision: 12, scale: 3 }).notNull(),
    jumlahSisa: decimal("jumlah_sisa", { precision: 12, scale: 3 }).notNull(),
    statusBatch: varchar("status_batch", { length: 20 }).notNull().default("aktif"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("batch_sisa_non_negatif", sql`${table.jumlahSisa} >= 0`),
  ]
);

// --- 14. ARMADA DISTRIBUSI (FASE 2) ---
export const armada = pgTable("armada", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomorKendaraan: varchar("nomor_kendaraan", { length: 20 }).unique().notNull(),
  jenisKendaraan: varchar("jenis_kendaraan", { length: 50 }).notNull(),
  kapasitasPorsi: integer("kapasitas_porsi").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("tersedia"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 15. DISTRIBUSI PENGIRIMAN (FASE 2) ---
export const distribusiPengiriman = pgTable("distribusi_pengiriman", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomorSuratJalan: varchar("nomor_surat_jalan", { length: 50 }).unique().notNull(),
  tanggal: date("tanggal", { mode: "string" })
    .notNull()
    .default(sql`CURRENT_DATE`),
  jadwalMenuId: uuid("jadwal_menu_id").references(() => jadwalMenu.id),
  armadaId: uuid("armada_id").references(() => armada.id),
  driverId: uuid("driver_id").references(() => users.id),
  status: distribusiStatusEnum("status").notNull().default("disiapkan"),
  jamBerangkat: time("jam_berangkat"),
  jamSelesai: time("jam_selesai"),
  catatan: text("catatan"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 16. BUKTI SERAH TERIMA SEKOLAH (FASE 2) ---
export const serahTerimaSekolah = pgTable("serah_terima_sekolah", {
  id: uuid("id").primaryKey().defaultRandom(),
  pengirimanId: uuid("pengiriman_id")
    .notNull()
    .references(() => distribusiPengiriman.id, { onDelete: "cascade" }),
  sekolahId: uuid("sekolah_id")
    .notNull()
    .references(() => sekolah.id),
  porsiKirim: integer("porsi_kirim").notNull(),
  porsiDiterima: integer("porsi_diterima").notNull().default(0),
  statusSerahTerima: varchar("status_serah_terima", { length: 20 })
    .notNull()
    .default("pending"),
  waktuDiterima: timestamp("waktu_diterima", { withTimezone: true }),
  namaPenerimaSekolah: varchar("nama_penerima_sekolah", { length: 100 }),
  kontakPenerimaSekolah: varchar("kontak_penerima_sekolah", { length: 20 }),
  fotoSerahTerimaUrl: text("foto_serah_terima_url"),
  ttdDigitalUrl: text("ttd_digital_url"),
  kondisiMakanan: kondisiMakananEnum("kondisi_makanan")
    .notNull()
    .default("baik_layak"),
  catatan: text("catatan"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 17. DAPUR CABANG (FASE 3) ---
export const dapurCabang = pgTable("dapur_cabang", {
  id: uuid("id").primaryKey().defaultRandom(),
  kodeDapur: varchar("kode_dapur", { length: 20 }).unique().notNull(),
  namaDapur: varchar("nama_dapur", { length: 100 }).notNull(),
  tipeDapur: dapurTipeEnum("tipe_dapur").notNull(),
  alamat: text("alamat").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  radiusMeter: integer("radius_meter").notNull().default(100),
  kapasitasMaksPorsi: integer("kapasitas_maks_porsi").notNull().default(3000),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 18. TRANSFER STOK ANTAR CABANG (FASE 3) ---
export const transferStokCabang = pgTable("transfer_stok_cabang", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomorTransfer: varchar("nomor_transfer", { length: 50 }).unique().notNull(),
  dapurAsalId: uuid("dapur_asal_id")
    .notNull()
    .references(() => dapurCabang.id),
  dapurTujuanId: uuid("dapur_tujuan_id")
    .notNull()
    .references(() => dapurCabang.id),
  bahanId: uuid("bahan_id")
    .notNull()
    .references(() => bahan.id),
  batchId: uuid("batch_id").references(() => stokBatch.id),
  jumlah: decimal("jumlah", { precision: 12, scale: 3 }).notNull(),
  status: transferStatusEnum("status").notNull().default("diajukan"),
  catatan: text("catatan"),
  dikirimPada: timestamp("dikirim_pada", { withTimezone: true }),
  diterimaPada: timestamp("diterima_pada", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 19. WA MESSAGE LOGS (FASE 3) ---
export const waMessageLogs = pgTable("wa_message_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomorTujuan: varchar("nomor_tujuan", { length: 20 }).notNull(),
  tipePesan: waTipeEnum("tipe_pesan").notNull(),
  payloadPesan: text("payload_pesan").notNull(),
  status: waStatusEnum("status").notNull().default("queued"),
  externalMessageId: varchar("external_message_id", { length: 100 }),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 20. OFFLINE SYNC JOURNAL (FASE 3) ---
export const offlineSyncJournal = pgTable("offline_sync_journal", {
  id: uuid("id").primaryKey().defaultRandom(),
  idempotencyKey: varchar("idempotency_key", { length: 100 }).unique().notNull(),
  userId: uuid("user_id").references(() => users.id),
  entitasTarget: varchar("entitas_target", { length: 50 }).notNull(),
  clientRecordedAt: timestamp("client_recorded_at", { withTimezone: true }).notNull(),
  payloadJson: jsonb("payload_json").notNull(),
  syncStatus: syncStatusEnum("sync_status").notNull().default("synced"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 21. FOOD WASTE LOG (FASE 3) ---
export const foodWasteLog = pgTable("food_waste_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  dapurId: uuid("dapur_id").references(() => dapurCabang.id),
  tanggal: date("tanggal", { mode: "string" }).notNull().default(sql`CURRENT_DATE`),
  kategoriWaste: wasteKategoriEnum("kategori_waste").notNull(),
  bahanId: uuid("bahan_id").references(() => bahan.id),
  menuId: uuid("menu_id").references(() => menu.id),
  beratKg: decimal("berat_kg", { precision: 10, scale: 3 }).notNull(),
  estimasiKerugianRp: decimal("estimasi_kerugian_rp", { precision: 14, scale: 2 })
    .notNull()
    .default("0.00"),
  catatan: text("catatan"),
  dicatatOleh: uuid("dicatat_oleh").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 22. KOMPLAIN SEKOLAH (FASE 3) ---
export const komplainSekolah = pgTable("komplain_sekolah", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomorTiket: varchar("nomor_tiket", { length: 30 }).unique().notNull(),
  sekolahId: uuid("sekolah_id")
    .notNull()
    .references(() => sekolah.id),
  pengirimanId: uuid("pengiriman_id").references(() => distribusiPengiriman.id),
  kategoriKendala: komplainKategoriEnum("kategori_kendala").notNull(),
  deskripsi: text("deskripsi").notNull(),
  fotoBuktiUrl: text("foto_bukti_url"),
  status: komplainStatusEnum("status").notNull().default("baru"),
  catatanInvestigasi: text("catatan_investigasi"),
  tindakanPerbaikan: text("tindakan_perbaikan"),
  diselesaikanOleh: uuid("diselesaikan_oleh").references(() => users.id),
  diselesaikanPada: timestamp("diselesaikan_pada", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 23. AI MENU PRESET (FASE 4) ---
export const aiMenuPreset = pgTable("ai_menu_preset", {
  id: uuid("id").primaryKey().defaultRandom(),
  namaPaketSiklus: varchar("nama_paket_siklus", { length: 100 }).notNull(),
  targetJenjang: targetJenjangEnum("target_jenjang").notNull(),
  targetKaloriMin: decimal("target_kalori_min", { precision: 6, scale: 2 }).notNull(),
  targetKaloriMax: decimal("target_kalori_max", { precision: 6, scale: 2 }).notNull(),
  estimasiHppRataRata: decimal("estimasi_hpp_rata_rata", { precision: 12, scale: 2 }).notNull(),
  rekomendasiMenuJson: jsonb("rekomendasi_menu_json").notNull(),
  statusApproval: aiMenuApprovalEnum("status_approval").notNull().default("draft"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 24. VRP RUTE HARIAN (FASE 4) ---
export const vrpRuteHarian = pgTable("vrp_rute_harian", {
  id: uuid("id").primaryKey().defaultRandom(),
  tanggal: date("tanggal", { mode: "string" })
    .notNull()
    .default(sql`CURRENT_DATE`),
  armadaId: uuid("armada_id")
    .notNull()
    .references(() => armada.id),
  driverId: uuid("driver_id").references(() => users.id),
  urutanSekolahJson: jsonb("urutan_sekolah_json").notNull(),
  totalJarakKm: decimal("total_jarak_km", { precision: 6, scale: 2 }).notNull(),
  totalEstimasiMenit: integer("total_estimasi_menit").notNull(),
  statusRute: vrpRuteStatusEnum("status_rute").notNull().default("terencana"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 25. MASTER PERANGKAT SENSOR IOT (FASE 4) ---
export const iotSensorDevice = pgTable("iot_sensor_device", {
  id: uuid("id").primaryKey().defaultRandom(),
  kodeAlat: varchar("kode_alat", { length: 50 }).unique().notNull(),
  tipePenempatan: iotPenempatanEnum("tipe_penempatan").notNull(),
  dapurId: uuid("dapur_id").references(() => dapurCabang.id),
  armadaId: uuid("armada_id").references(() => armada.id),
  ambangSuhuMin: decimal("ambang_suhu_min", { precision: 5, scale: 2 }).notNull(),
  ambangSuhuMax: decimal("ambang_suhu_max", { precision: 5, scale: 2 }).notNull(),
  statusAktif: boolean("status_aktif").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- 26. BUKU LOG TELEMETRI SUHU IOT (FASE 4) ---
export const iotTelemetriSuhu = pgTable("iot_telemetri_suhu", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  deviceId: uuid("device_id")
    .notNull()
    .references(() => iotSensorDevice.id),
  waktuRekam: timestamp("waktu_rekam", { withTimezone: true }).notNull().defaultNow(),
  suhuCelsius: decimal("suhu_celsius", { precision: 5, scale: 2 }).notNull(),
  kelembapanPersen: decimal("kelembapan_persen", { precision: 5, scale: 2 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isAnomaliHaccp: boolean("is_anomali_haccp").notNull().default(false),
});

// --- 27. LAPORAN AUDIT RESMI BGN (FASE 4) ---
export const bgnLaporanAudit = pgTable("bgn_laporan_audit", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomorDokumen: varchar("nomor_dokumen", { length: 100 }).unique().notNull(),
  periodeMulai: date("periode_mulai", { mode: "string" }).notNull(),
  periodeSelesai: date("periode_selesai", { mode: "string" }).notNull(),
  dapurId: uuid("dapur_id")
    .notNull()
    .references(() => dapurCabang.id),
  totalPorsiTersaji: integer("total_porsi_tersaji").notNull(),
  rerataKaloriTercapai: decimal("rerata_kalori_tercapai", { precision: 6, scale: 2 }).notNull(),
  skorKepatuhanHaccp: decimal("skor_kepatuhan_haccp", { precision: 5, scale: 2 }).notNull(),
  dokumenPdfUrl: text("dokumen_pdf_url").notNull(),
  checksumSha256: varchar("checksum_sha256", { length: 64 }).notNull(),
  qrVerifikasiUrl: text("qr_verifikasi_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- RELATIONS ---
export const usersRelations = relations(users, ({ one }) => ({
  anggota: one(anggota, {
    fields: [users.id],
    references: [anggota.userId],
  }),
}));

export const anggotaRelations = relations(anggota, ({ one, many }) => ({
  user: one(users, {
    fields: [anggota.userId],
    references: [users.id],
  }),
  jadwalShift: many(jadwalShift),
  absensi: many(absensi),
}));

export const shiftKerjaRelations = relations(shiftKerja, ({ many }) => ({
  jadwal: many(jadwalShift),
}));

export const jadwalShiftRelations = relations(jadwalShift, ({ one }) => ({
  anggota: one(anggota, {
    fields: [jadwalShift.anggotaId],
    references: [anggota.id],
  }),
  shift: one(shiftKerja, {
    fields: [jadwalShift.shiftId],
    references: [shiftKerja.id],
  }),
}));

export const absensiRelations = relations(absensi, ({ one }) => ({
  anggota: one(anggota, {
    fields: [absensi.anggotaId],
    references: [anggota.id],
  }),
}));

export const menuRelations = relations(menu, ({ many, one }) => ({
  resepItems: many(resepItem),
  jadwalMenu: many(jadwalMenu),
  approver: one(users, {
    fields: [menu.approvedBy],
    references: [users.id],
  }),
  foodWasteLogs: many(foodWasteLog),
}));

export const resepItemRelations = relations(resepItem, ({ one }) => ({
  menu: one(menu, {
    fields: [resepItem.menuId],
    references: [menu.id],
  }),
  bahan: one(bahan, {
    fields: [resepItem.bahanId],
    references: [bahan.id],
  }),
}));

export const bahanRelations = relations(bahan, ({ many }) => ({
  resepItems: many(resepItem),
  mutasi: many(stokMutasi),
  batches: many(stokBatch),
  poItems: many(purchaseOrderItem),
  transferStok: many(transferStokCabang),
  foodWasteLogs: many(foodWasteLog),
}));

export const sekolahRelations = relations(sekolah, ({ many }) => ({
  serahTerima: many(serahTerimaSekolah),
  komplain: many(komplainSekolah),
}));

export const jadwalMenuRelations = relations(jadwalMenu, ({ one, many }) => ({
  menu: one(menu, {
    fields: [jadwalMenu.menuId],
    references: [menu.id],
  }),
  distribusi: many(distribusiPengiriman),
}));

export const stokMutasiRelations = relations(stokMutasi, ({ one }) => ({
  bahan: one(bahan, {
    fields: [stokMutasi.bahanId],
    references: [bahan.id],
  }),
  user: one(users, {
    fields: [stokMutasi.createdBy],
    references: [users.id],
  }),
}));

export const supplierRelations = relations(supplier, ({ many }) => ({
  purchaseOrders: many(purchaseOrder),
}));

export const purchaseOrderRelations = relations(purchaseOrder, ({ one, many }) => ({
  supplier: one(supplier, {
    fields: [purchaseOrder.supplierId],
    references: [supplier.id],
  }),
  items: many(purchaseOrderItem),
  qcList: many(qcPenerimaan),
  creator: one(users, {
    fields: [purchaseOrder.createdBy],
    references: [users.id],
  }),
}));

export const purchaseOrderItemRelations = relations(purchaseOrderItem, ({ one }) => ({
  purchaseOrder: one(purchaseOrder, {
    fields: [purchaseOrderItem.poId],
    references: [purchaseOrder.id],
  }),
  bahan: one(bahan, {
    fields: [purchaseOrderItem.bahanId],
    references: [bahan.id],
  }),
}));

export const qcPenerimaanRelations = relations(qcPenerimaan, ({ one, many }) => ({
  purchaseOrder: one(purchaseOrder, {
    fields: [qcPenerimaan.poId],
    references: [purchaseOrder.id],
  }),
  petugasQc: one(users, {
    fields: [qcPenerimaan.petugasQcId],
    references: [users.id],
  }),
  batches: many(stokBatch),
}));

export const stokBatchRelations = relations(stokBatch, ({ one, many }) => ({
  bahan: one(bahan, {
    fields: [stokBatch.bahanId],
    references: [bahan.id],
  }),
  qc: one(qcPenerimaan, {
    fields: [stokBatch.qcId],
    references: [qcPenerimaan.id],
  }),
  transfers: many(transferStokCabang),
}));

export const armadaRelations = relations(armada, ({ many }) => ({
  pengiriman: many(distribusiPengiriman),
}));

export const distribusiPengirimanRelations = relations(distribusiPengiriman, ({ one, many }) => ({
  armada: one(armada, {
    fields: [distribusiPengiriman.armadaId],
    references: [armada.id],
  }),
  driver: one(users, {
    fields: [distribusiPengiriman.driverId],
    references: [users.id],
  }),
  jadwalMenu: one(jadwalMenu, {
    fields: [distribusiPengiriman.jadwalMenuId],
    references: [jadwalMenu.id],
  }),
  serahTerimaList: many(serahTerimaSekolah),
}));

export const serahTerimaSekolahRelations = relations(serahTerimaSekolah, ({ one }) => ({
  pengiriman: one(distribusiPengiriman, {
    fields: [serahTerimaSekolah.pengirimanId],
    references: [distribusiPengiriman.id],
  }),
  sekolah: one(sekolah, {
    fields: [serahTerimaSekolah.sekolahId],
    references: [sekolah.id],
  }),
}));

// --- RELASI FASE 3 ---
export const dapurCabangRelations = relations(dapurCabang, ({ many }) => ({
  transferMasuk: many(transferStokCabang, { relationName: "transferTujuan" }),
  transferKeluar: many(transferStokCabang, { relationName: "transferAsal" }),
  foodWasteLogs: many(foodWasteLog),
}));

export const transferStokCabangRelations = relations(transferStokCabang, ({ one }) => ({
  dapurAsal: one(dapurCabang, {
    fields: [transferStokCabang.dapurAsalId],
    references: [dapurCabang.id],
    relationName: "transferAsal",
  }),
  dapurTujuan: one(dapurCabang, {
    fields: [transferStokCabang.dapurTujuanId],
    references: [dapurCabang.id],
    relationName: "transferTujuan",
  }),
  bahan: one(bahan, {
    fields: [transferStokCabang.bahanId],
    references: [bahan.id],
  }),
  batch: one(stokBatch, {
    fields: [transferStokCabang.batchId],
    references: [stokBatch.id],
  }),
  creator: one(users, {
    fields: [transferStokCabang.createdBy],
    references: [users.id],
  }),
}));

export const waMessageLogsRelations = relations(waMessageLogs, () => ({}));

export const offlineSyncJournalRelations = relations(offlineSyncJournal, ({ one }) => ({
  user: one(users, {
    fields: [offlineSyncJournal.userId],
    references: [users.id],
  }),
}));

export const foodWasteLogRelations = relations(foodWasteLog, ({ one }) => ({
  dapur: one(dapurCabang, {
    fields: [foodWasteLog.dapurId],
    references: [dapurCabang.id],
  }),
  bahan: one(bahan, {
    fields: [foodWasteLog.bahanId],
    references: [bahan.id],
  }),
  menu: one(menu, {
    fields: [foodWasteLog.menuId],
    references: [menu.id],
  }),
  pencatat: one(users, {
    fields: [foodWasteLog.dicatatOleh],
    references: [users.id],
  }),
}));

export const komplainSekolahRelations = relations(komplainSekolah, ({ one }) => ({
  sekolah: one(sekolah, {
    fields: [komplainSekolah.sekolahId],
    references: [sekolah.id],
  }),
  pengiriman: one(distribusiPengiriman, {
    fields: [komplainSekolah.pengirimanId],
    references: [distribusiPengiriman.id],
  }),
  penyelesai: one(users, {
    fields: [komplainSekolah.diselesaikanOleh],
    references: [users.id],
  }),
}));

// --- RELASI FASE 4 ---
export const aiMenuPresetRelations = relations(aiMenuPreset, ({ one }) => ({
  approver: one(users, {
    fields: [aiMenuPreset.approvedBy],
    references: [users.id],
  }),
}));

export const vrpRuteHarianRelations = relations(vrpRuteHarian, ({ one }) => ({
  armada: one(armada, {
    fields: [vrpRuteHarian.armadaId],
    references: [armada.id],
  }),
  driver: one(users, {
    fields: [vrpRuteHarian.driverId],
    references: [users.id],
  }),
}));

export const iotSensorDeviceRelations = relations(iotSensorDevice, ({ one, many }) => ({
  dapur: one(dapurCabang, {
    fields: [iotSensorDevice.dapurId],
    references: [dapurCabang.id],
  }),
  armada: one(armada, {
    fields: [iotSensorDevice.armadaId],
    references: [armada.id],
  }),
  telemetriList: many(iotTelemetriSuhu),
}));

export const iotTelemetriSuhuRelations = relations(iotTelemetriSuhu, ({ one }) => ({
  device: one(iotSensorDevice, {
    fields: [iotTelemetriSuhu.deviceId],
    references: [iotSensorDevice.id],
  }),
}));

export const bgnLaporanAuditRelations = relations(bgnLaporanAudit, ({ one }) => ({
  dapur: one(dapurCabang, {
    fields: [bgnLaporanAudit.dapurId],
    references: [dapurCabang.id],
  }),
}));
