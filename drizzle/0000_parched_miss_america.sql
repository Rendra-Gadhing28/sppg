CREATE TYPE "public"."absensi_jenis" AS ENUM('masuk', 'keluar');--> statement-breakpoint
CREATE TYPE "public"."absensi_metode" AS ENUM('selfie_gps', 'qr_kiosk', 'manual_admin');--> statement-breakpoint
CREATE TYPE "public"."absensi_status" AS ENUM('tepat_waktu', 'terlambat', 'pulang_cepat');--> statement-breakpoint
CREATE TYPE "public"."bahan_kategori" AS ENUM('pokok', 'lauk_hewani', 'lauk_nabati', 'sayur', 'buah', 'bumbu');--> statement-breakpoint
CREATE TYPE "public"."mutasi_jenis" AS ENUM('masuk', 'keluar_produksi', 'penyesuaian', 'waste');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'admin', 'ahli_gizi', 'kepala_dapur', 'petugas_stok', 'driver', 'pimpinan');--> statement-breakpoint
CREATE TABLE "absensi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anggota_id" uuid NOT NULL,
	"tanggal" date DEFAULT CURRENT_DATE NOT NULL,
	"jenis" "absensi_jenis" NOT NULL,
	"waktu_catat" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "absensi_status" NOT NULL,
	"metode" "absensi_metode" DEFAULT 'selfie_gps' NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"jarak_ke_dapur_meter" integer,
	"is_in_radius" boolean DEFAULT false NOT NULL,
	"foto_bukti_url" text,
	"catatan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "absensi_anggota_tanggal_jenis_unique" UNIQUE("anggota_id","tanggal","jenis")
);
--> statement-breakpoint
CREATE TABLE "anggota" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"nik" varchar(16) NOT NULL,
	"nama_lengkap" varchar(150) NOT NULL,
	"jabatan" varchar(100) NOT NULL,
	"foto_url" text,
	"status_aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anggota_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "anggota_nik_unique" UNIQUE("nik")
);
--> statement-breakpoint
CREATE TABLE "bahan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kode_bahan" varchar(20) NOT NULL,
	"nama_bahan" varchar(100) NOT NULL,
	"kategori" "bahan_kategori" NOT NULL,
	"satuan_standar" varchar(20) NOT NULL,
	"stok_saat_ini" numeric(12, 3) DEFAULT '0.000' NOT NULL,
	"stok_minimum" numeric(12, 3) DEFAULT '0.000' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bahan_kode_bahan_unique" UNIQUE("kode_bahan"),
	CONSTRAINT "stok_non_negatif" CHECK ("bahan"."stok_saat_ini" >= 0)
);
--> statement-breakpoint
CREATE TABLE "jadwal_menu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tanggal" date NOT NULL,
	"menu_id" uuid NOT NULL,
	"total_target_porsi" integer DEFAULT 0 NOT NULL,
	"status_produksi" varchar(20) DEFAULT 'draft' NOT NULL,
	"catatan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jadwal_menu_tanggal_unique" UNIQUE("tanggal")
);
--> statement-breakpoint
CREATE TABLE "jadwal_shift" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anggota_id" uuid NOT NULL,
	"shift_id" integer NOT NULL,
	"hari_ke" smallint NOT NULL,
	CONSTRAINT "jadwal_shift_anggota_hari_unique" UNIQUE("anggota_id","hari_ke"),
	CONSTRAINT "hari_ke_range" CHECK ("jadwal_shift"."hari_ke" BETWEEN 1 AND 7)
);
--> statement-breakpoint
CREATE TABLE "konfigurasi_dapur" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"nama_dapur" varchar(100) NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"radius_meter" integer DEFAULT 100 NOT NULL,
	CONSTRAINT "single_row_check" CHECK ("konfigurasi_dapur"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "menu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama_menu" varchar(150) NOT NULL,
	"deskripsi" text,
	"total_kalori" numeric(6, 2) DEFAULT '0.00' NOT NULL,
	"protein_gram" numeric(6, 2) DEFAULT '0.00' NOT NULL,
	"lemak_gram" numeric(6, 2) DEFAULT '0.00' NOT NULL,
	"karbo_gram" numeric(6, 2) DEFAULT '0.00' NOT NULL,
	"is_approved_gizi" boolean DEFAULT false NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resep_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_id" uuid NOT NULL,
	"bahan_id" uuid NOT NULL,
	"jumlah_per_porsi" numeric(10, 4) NOT NULL,
	"satuan" varchar(20) NOT NULL,
	CONSTRAINT "resep_item_menu_bahan_unique" UNIQUE("menu_id","bahan_id"),
	CONSTRAINT "jumlah_per_porsi_positif" CHECK ("resep_item"."jumlah_per_porsi" > 0)
);
--> statement-breakpoint
CREATE TABLE "sekolah" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama_sekolah" varchar(150) NOT NULL,
	"alamat" text NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"jumlah_porsi_target" integer NOT NULL,
	"pic_nama" varchar(100) NOT NULL,
	"pic_kontak" varchar(20) NOT NULL,
	"jam_makan" time NOT NULL,
	"catatan_alergi" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "target_porsi_positif" CHECK ("sekolah"."jumlah_porsi_target" > 0)
);
--> statement-breakpoint
CREATE TABLE "shift_kerja" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_shift" varchar(50) NOT NULL,
	"jam_masuk" time NOT NULL,
	"jam_pulang" time NOT NULL,
	"toleransi_menit" integer DEFAULT 15 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stok_mutasi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bahan_id" uuid NOT NULL,
	"jenis" "mutasi_jenis" NOT NULL,
	"jumlah" numeric(12, 3) NOT NULL,
	"saldo_sebelumnya" numeric(12, 3) NOT NULL,
	"saldo_setelahnya" numeric(12, 3) NOT NULL,
	"referensi_id" uuid,
	"keterangan" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jumlah_mutasi_positif" CHECK ("stok_mutasi"."jumlah" > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nomor_hp" varchar(20) NOT NULL,
	"email" varchar(100),
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_nomor_hp_unique" UNIQUE("nomor_hp"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_anggota_id_anggota_id_fk" FOREIGN KEY ("anggota_id") REFERENCES "public"."anggota"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anggota" ADD CONSTRAINT "anggota_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jadwal_menu" ADD CONSTRAINT "jadwal_menu_menu_id_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jadwal_shift" ADD CONSTRAINT "jadwal_shift_anggota_id_anggota_id_fk" FOREIGN KEY ("anggota_id") REFERENCES "public"."anggota"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jadwal_shift" ADD CONSTRAINT "jadwal_shift_shift_id_shift_kerja_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shift_kerja"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu" ADD CONSTRAINT "menu_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resep_item" ADD CONSTRAINT "resep_item_menu_id_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resep_item" ADD CONSTRAINT "resep_item_bahan_id_bahan_id_fk" FOREIGN KEY ("bahan_id") REFERENCES "public"."bahan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stok_mutasi" ADD CONSTRAINT "stok_mutasi_bahan_id_bahan_id_fk" FOREIGN KEY ("bahan_id") REFERENCES "public"."bahan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stok_mutasi" ADD CONSTRAINT "stok_mutasi_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;