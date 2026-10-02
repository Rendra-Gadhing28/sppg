import { client, db } from "./index";
import {
  konfigurasiDapur,
  shiftKerja,
  users,
  anggota,
  jadwalShift,
  sekolah,
  bahan,
  menu,
  resepItem,
  jadwalMenu,
} from "./schema";
import { scryptSync, randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function seed() {
  console.log("🌱 Menjalankan seeder database SPPG...");

  // 1. Konfigurasi Dapur (Single Dapur id=1)
  await db
    .insert(konfigurasiDapur)
    .values({
      id: 1,
      namaDapur: "Dapur Sentral SPPG Mandiri Jaya",
      latitude: "-6.20000000",
      longitude: "106.81666600",
      radiusMeter: 100,
    })
    .onConflictDoUpdate({
      target: konfigurasiDapur.id,
      set: {
        namaDapur: "Dapur Sentral SPPG Mandiri Jaya",
        latitude: "-6.20000000",
        longitude: "106.81666600",
        radiusMeter: 100,
      },
    });

  // 2. Shift Kerja
  const [shiftPagi] = await db
    .insert(shiftKerja)
    .values({
      namaShift: "Shift Pagi Dapur",
      jamMasuk: "05:00:00",
      jamPulang: "13:00:00",
      toleransiMenit: 15,
    })
    .onConflictDoNothing()
    .returning();

  // 3. Users Awal
  const passwordDefault = hashPassword("password123");

  const [adminUser] = await db
    .insert(users)
    .values({
      nomorHp: "081200000001",
      email: "admin@sppg.id",
      passwordHash: passwordDefault,
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  const [ahliGiziUser] = await db
    .insert(users)
    .values({
      nomorHp: "081200000002",
      email: "gizi@sppg.id",
      passwordHash: passwordDefault,
      role: "ahli_gizi",
    })
    .onConflictDoNothing()
    .returning();

  // 4. Anggota Pekerja Dapur
  const [pekerja1] = await db
    .insert(anggota)
    .values({
      nik: "3201000000000001",
      namaLengkap: "Budi Santoso",
      jabatan: "Juru Masak Utama",
      statusAktif: true,
    })
    .onConflictDoNothing()
    .returning();

  if (pekerja1 && shiftPagi) {
    // Jadwalkan shift Senin - Jumat (1 - 5)
    for (let hari = 1; hari <= 5; hari++) {
      await db
        .insert(jadwalShift)
        .values({
          anggotaId: pekerja1.id,
          shiftId: shiftPagi.id,
          hariKe: hari,
        })
        .onConflictDoNothing();
    }
  }

  // 5. Sekolah Penerima
  await db
    .insert(sekolah)
    .values([
      {
        namaSekolah: "SDN 01 Pagi",
        alamat: "Jl. Merdeka No. 10",
        latitude: "-6.20500000",
        longitude: "106.82000000",
        jumlahPorsiTarget: 450,
        picNama: "Bpk. Joko",
        picKontak: "081299990001",
        jamMakan: "09:30:00",
        isActive: true,
      },
      {
        namaSekolah: "SMPN 03",
        alamat: "Jl. Pendidikan No. 5",
        latitude: "-6.21000000",
        longitude: "106.82500000",
        jumlahPorsiTarget: 800,
        picNama: "Ibu Siti",
        picKontak: "081299990002",
        jamMakan: "11:30:00",
        isActive: true,
      },
      {
        namaSekolah: "SDN 04 Ceria",
        alamat: "Jl. Melati No. 8",
        latitude: "-6.21500000",
        longitude: "106.83000000",
        jumlahPorsiTarget: 1200,
        picNama: "Bpk. Dian",
        picKontak: "081299990003",
        jamMakan: "10:00:00",
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 6. Master Bahan
  const [beras] = await db
    .insert(bahan)
    .values({
      kodeBahan: "BHN-001",
      namaBahan: "Beras Premium",
      kategori: "pokok",
      satuanStandar: "kg",
      stokSaatIni: "500.000",
      stokMinimum: "100.000",
    })
    .onConflictDoNothing()
    .returning();

  const [ayam] = await db
    .insert(bahan)
    .values({
      kodeBahan: "BHN-002",
      namaBahan: "Daging Ayam Fillet",
      kategori: "lauk_hewani",
      satuanStandar: "kg",
      stokSaatIni: "210.000",
      stokMinimum: "50.000",
    })
    .onConflictDoNothing()
    .returning();

  const [wortel] = await db
    .insert(bahan)
    .values({
      kodeBahan: "BHN-003",
      namaBahan: "Wortel Segar",
      kategori: "sayur",
      satuanStandar: "kg",
      stokSaatIni: "50.000", // Defisit jika butuh 73.5 kg
      stokMinimum: "75.000",
    })
    .onConflictDoNothing()
    .returning();

  // 7. Menu & Resep (BOM)
  const [menuAyam] = await db
    .insert(menu)
    .values({
      namaMenu: "Paket A — Nasi Ayam Semur & Tumis Sayur",
      deskripsi: "Nasi putih, semur ayam fillet, tumis wortel buncis",
      totalKalori: "540.00",
      proteinGram: "28.50",
      lemakGram: "14.20",
      karboGram: "72.00",
      isApprovedGizi: true,
      approvedBy: ahliGiziUser?.id || adminUser?.id,
      approvedAt: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  if (menuAyam && beras && ayam && wortel) {
    // Takaran BOM per 1 porsi
    await db
      .insert(resepItem)
      .values([
        {
          menuId: menuAyam.id,
          bahanId: beras.id,
          jumlahPerPorsi: "0.1000", // 100 gram = 0.1 kg
          satuan: "kg",
        },
        {
          menuId: menuAyam.id,
          bahanId: ayam.id,
          jumlahPerPorsi: "0.0800", // 80 gram = 0.08 kg
          satuan: "kg",
        },
        {
          menuId: menuAyam.id,
          bahanId: wortel.id,
          jumlahPerPorsi: "0.0300", // 30 gram = 0.03 kg
          satuan: "kg",
        },
      ])
      .onConflictDoNothing();

    // Jadwal menu hari ini
    const todayStr = new Date().toISOString().split("T")[0];
    await db
      .insert(jadwalMenu)
      .values({
        tanggal: todayStr,
        menuId: menuAyam.id,
        totalTargetPorsi: 2450,
        statusProduksi: "siap_masak",
      })
      .onConflictDoNothing();
  }

  console.log("✅ Seeder selesai berhasil.");
  await client.end();
}

seed().catch((err) => {
  console.error("❌ Gagal seed:", err);
  process.exit(1);
});
