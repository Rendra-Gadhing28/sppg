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
  unique,
  check,
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
  "qr_kiosk",
  "manual_admin",
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
  fotoUrl: text("foto_url"),
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
}));

export const jadwalMenuRelations = relations(jadwalMenu, ({ one }) => ({
  menu: one(menu, {
    fields: [jadwalMenu.menuId],
    references: [menu.id],
  }),
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
