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
  supplier,
  purchaseOrder,
  purchaseOrderItem,
  qcPenerimaan,
  stokBatch,
  armada,
  distribusiPengiriman,
  serahTerimaSekolah,
  dapurCabang,
  transferStokCabang,
  waMessageLogs,
  foodWasteLog,
  komplainSekolah,
  aiMenuPreset,
  vrpRuteHarian,
  iotSensorDevice,
  iotTelemetriSuhu,
  bgnLaporanAudit,
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

  const [driverUser] = await db
    .insert(users)
    .values({
      nomorHp: "081200000003",
      email: "driver@sppg.id",
      passwordHash: passwordDefault,
      role: "driver",
    })
    .onConflictDoNothing()
    .returning();

  // 4. Anggota Pekerja Dapur & Driver
  const [pekerja1] = await db
    .insert(anggota)
    .values({
      userId: adminUser?.id,
      nik: "3201000000000001",
      namaLengkap: "Budi Santoso",
      jabatan: "Juru Masak Utama",
      statusAktif: true,
    })
    .onConflictDoNothing()
    .returning();

  const [driverAnggota] = await db
    .insert(anggota)
    .values({
      userId: driverUser?.id,
      nik: "3201000000000002",
      namaLengkap: "Doni Prasetyo",
      jabatan: "Driver Armada MBG",
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

  // Fallback lookups in case items already exist
  const activeAdmin =
    adminUser || (await db.select().from(users).where(sql`role = 'admin'`).limit(1))[0];
  const activeDriverUser =
    driverUser || (await db.select().from(users).where(sql`role = 'driver'`).limit(1))[0];
  const activeBeras =
    beras || (await db.select().from(bahan).where(sql`kode_bahan = 'BHN-001'`).limit(1))[0];
  const activeAyam =
    ayam || (await db.select().from(bahan).where(sql`kode_bahan = 'BHN-002'`).limit(1))[0];
  const activeWortel =
    wortel || (await db.select().from(bahan).where(sql`kode_bahan = 'BHN-003'`).limit(1))[0];
  const activeMenu =
    menuAyam || (await db.select().from(menu).limit(1))[0];

  if (activeMenu && activeBeras && activeAyam && activeWortel) {
    // Takaran BOM per 1 porsi
    await db
      .insert(resepItem)
      .values([
        {
          menuId: activeMenu.id,
          bahanId: activeBeras.id,
          jumlahPerPorsi: "0.1000", // 100 gram = 0.1 kg
          satuan: "kg",
        },
        {
          menuId: activeMenu.id,
          bahanId: activeAyam.id,
          jumlahPerPorsi: "0.0800", // 80 gram = 0.08 kg
          satuan: "kg",
        },
        {
          menuId: activeMenu.id,
          bahanId: activeWortel.id,
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
        menuId: activeMenu.id,
        totalTargetPorsi: 2450,
        statusProduksi: "siap_masak",
      })
      .onConflictDoNothing();
  }

  // --- 8. SUPPLIER (FASE 2) ---
  const [sup1] = await db
    .insert(supplier)
    .values({
      kodeSupplier: "SUP-001",
      namaSupplier: "CV Tani Makmur Sentosa",
      kategoriPasokan: "Sayuran & Bumbu Dapur",
      kontakPerson: "H. Ridwan",
      nomorHp: "081211223344",
      alamat: "Kawasan Pasar Induk Kramat Jati Blok A-5",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [sup2] = await db
    .insert(supplier)
    .values({
      kodeSupplier: "SUP-002",
      namaSupplier: "PT Unggas Mandiri Bersaudara",
      kategoriPasokan: "Daging Ayam Fillet & Telur",
      kontakPerson: "Ibu Linda",
      nomorHp: "081255667788",
      alamat: "Sentra Peternakan Unggas Mandiri No. 12",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const activeSup1 =
    sup1 || (await db.select().from(supplier).where(sql`kode_supplier = 'SUP-001'`).limit(1))[0];
  const activeSup2 =
    sup2 || (await db.select().from(supplier).where(sql`kode_supplier = 'SUP-002'`).limit(1))[0];

  // --- 9. PURCHASE ORDER & QC (FASE 2) ---
  if (activeSup2 && activeAyam && activeAdmin) {
    const [po1] = await db
      .insert(purchaseOrder)
      .values({
        nomorPo: "PO-MBG-20261001-1001",
        supplierId: activeSup2.id,
        tanggalPo: "2026-10-01",
        targetPengiriman: "2026-10-02",
        status: "diterima",
        totalBiaya: "5250000.00",
        catatan: "Pengadaan rutin protein hewani ayam fillet higienis",
        createdBy: activeAdmin.id,
      })
      .onConflictDoNothing()
      .returning();

    const activePo1 =
      po1 ||
      (await db.select().from(purchaseOrder).where(sql`nomor_po = 'PO-MBG-20261001-1001'`).limit(1))[0];

    if (activePo1) {
      await db
        .insert(purchaseOrderItem)
        .values({
          poId: activePo1.id,
          bahanId: activeAyam.id,
          jumlahPesan: "100.000",
          jumlahDiterima: "100.000",
          hargaSatuan: "52500.00",
          subtotal: "5250000.00",
        })
        .onConflictDoNothing();

      // QC Penerimaan
      const [qc1] = await db
        .insert(qcPenerimaan)
        .values({
          nomorQc: "QC-20261001-001",
          poId: activePo1.id,
          petugasQcId: activeAdmin.id,
          status: "lolos",
          catatanSuhu: "3.5°C (Chiller Daging Sesuai)",
          catatanKebersihan: "Kemasan vakum utuh, segel higienis, lolos uji organoleptik.",
        })
        .onConflictDoNothing()
        .returning();

      const activeQc1 =
        qc1 ||
        (await db.select().from(qcPenerimaan).where(sql`nomor_qc = 'QC-20261001-001'`).limit(1))[0];

      // Batch Expiry (FEFO)
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 5);
      const expStr = expDate.toISOString().split("T")[0];

      if (activeQc1) {
        await db
          .insert(stokBatch)
          .values({
            bahanId: activeAyam.id,
            qcId: activeQc1.id,
            nomorBatch: "BATCH-AYM-20261001-01",
            tanggalMasuk: "2026-10-01",
            tanggalExpired: expStr,
            jumlahAwal: "100.000",
            jumlahSisa: "100.000",
            statusBatch: "aktif",
          })
          .onConflictDoNothing();
      }
    }
  }

  if (activeSup1 && activeWortel) {
    // Batch Wortel Segera Kedaluwarsa (2 hari lagi) untuk pengujian alert FEFO
    const nearExp = new Date();
    nearExp.setDate(nearExp.getDate() + 2);
    const nearExpStr = nearExp.toISOString().split("T")[0];

    await db
      .insert(stokBatch)
      .values({
        bahanId: activeWortel.id,
        nomorBatch: "BATCH-WTL-20260928-01",
        tanggalMasuk: "2026-09-28",
        tanggalExpired: nearExpStr,
        jumlahAwal: "30.000",
        jumlahSisa: "20.000",
        statusBatch: "aktif",
      })
      .onConflictDoNothing();
  }

  // --- 10. ARMADA DISTRIBUSI (FASE 2) ---
  const [mobilTermal] = await db
    .insert(armada)
    .values({
      nomorKendaraan: "B 9142 SPG",
      jenisKendaraan: "Mobil Box Termal MBG",
      kapasitasPorsi: 2000,
      status: "beroperasi",
    })
    .onConflictDoNothing()
    .returning();

  await db
    .insert(armada)
    .values({
      nomorKendaraan: "B 9871 SPG",
      jenisKendaraan: "Motor Roda Tiga Termal",
      kapasitasPorsi: 600,
      status: "tersedia",
    })
    .onConflictDoNothing();

  // --- 11. DISTRIBUSI PENGIRIMAN & SERAH TERIMA (FASE 2) ---
  const todayStr = new Date().toISOString().split("T")[0];
  const [activeJadwal] = await db
    .select()
    .from(jadwalMenu)
    .where(sql`tanggal = ${todayStr}`)
    .limit(1);

  const [activeArmada] = mobilTermal
    ? [mobilTermal]
    : await db.select().from(armada).limit(1);

  if (activeJadwal && activeArmada) {
    const [pengiriman] = await db
      .insert(distribusiPengiriman)
      .values({
        nomorSuratJalan: "SJ-MBG-20261002-001",
        tanggal: todayStr,
        jadwalMenuId: activeJadwal.id,
        armadaId: activeArmada.id,
        driverId: activeDriverUser?.id,
        status: "dalam_perjalanan",
        jamBerangkat: "08:45:00",
        catatan: "Rute Pengiriman MBG Wilayah 1 (3 Sekolah)",
      })
      .onConflictDoNothing()
      .returning();

    const activePengiriman =
      pengiriman ||
      (await db
        .select()
        .from(distribusiPengiriman)
        .where(sql`nomor_surat_jalan = 'SJ-MBG-20261002-001'`)
        .limit(1))[0];

    if (activePengiriman) {
      const sekolahList = await db.select().from(sekolah).where(sql`is_active = true`);
      for (const s of sekolahList) {
        const isSdn01 = s.namaSekolah.includes("SDN 01");
        await db
          .insert(serahTerimaSekolah)
          .values({
            pengirimanId: activePengiriman.id,
            sekolahId: s.id,
            porsiKirim: s.jumlahPorsiTarget,
            porsiDiterima: isSdn01 ? s.jumlahPorsiTarget : 0,
            statusSerahTerima: isSdn01 ? "diterima" : "pending",
            waktuDiterima: isSdn01 ? new Date() : null,
            namaPenerimaSekolah: isSdn01 ? s.picNama : null,
            kontakPenerimaSekolah: isSdn01 ? s.picKontak : null,
            kondisiMakanan: "baik_layak",
            catatan: isSdn01 ? "Diterima dalam kondisi hangat & higienis." : null,
          })
          .onConflictDoNothing();
      }
    }
  }

  // --- 12. MULTI-DAPUR CABANG & TRANSFER STOK (FASE 3) ---
  const [dapurPusat] = await db
    .insert(dapurCabang)
    .values({
      kodeDapur: "CK-01",
      namaDapur: "Central Kitchen Jakarta Pusat",
      tipeDapur: "pusat",
      alamat: "Kawasan Industri Pulo Gadung Blok A-9, Jakarta",
      latitude: "-6.20000000",
      longitude: "106.81666600",
      radiusMeter: 150,
      kapasitasMaksPorsi: 6000,
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [dapurSatelit1] = await db
    .insert(dapurCabang)
    .values({
      kodeDapur: "SK-01",
      namaDapur: "Dapur Satelit SPPG Tebet",
      tipeDapur: "satelit",
      alamat: "Jl. Tebet Barat Raya No. 45, Jakarta Selatan",
      latitude: "-6.23000000",
      longitude: "106.85000000",
      radiusMeter: 100,
      kapasitasMaksPorsi: 2500,
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [dapurSatelit2] = await db
    .insert(dapurCabang)
    .values({
      kodeDapur: "SK-02",
      namaDapur: "Dapur Satelit SPPG Cilandak",
      tipeDapur: "satelit",
      alamat: "Jl. TB Simatupang No. 88, Cilandak, Jakarta Selatan",
      latitude: "-6.29000000",
      longitude: "106.80000000",
      radiusMeter: 100,
      kapasitasMaksPorsi: 2000,
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const activePusat =
    dapurPusat || (await db.select().from(dapurCabang).where(sql`kode_dapur = 'CK-01'`).limit(1))[0];
  const activeSatelit1 =
    dapurSatelit1 || (await db.select().from(dapurCabang).where(sql`kode_dapur = 'SK-01'`).limit(1))[0];
  const activeSatelit2 =
    dapurSatelit2 || (await db.select().from(dapurCabang).where(sql`kode_dapur = 'SK-02'`).limit(1))[0];

  if (activePusat && activeSatelit1 && activeBeras) {
    await db
      .insert(transferStokCabang)
      .values({
        nomorTransfer: "TRF-20261002-001",
        dapurAsalId: activePusat.id,
        dapurTujuanId: activeSatelit1.id,
        bahanId: activeBeras.id,
        jumlah: "50.000",
        status: "diterima",
        catatan: "Transfer alokasi cadangan stok operasional Satelit Tebet",
        dikirimPada: new Date(),
        diterimaPada: new Date(),
        createdBy: activeAdmin?.id,
      })
      .onConflictDoNothing();
  }

  if (activePusat && activeSatelit2 && activeWortel) {
    await db
      .insert(transferStokCabang)
      .values({
        nomorTransfer: "TRF-20261002-002",
        dapurAsalId: activePusat.id,
        dapurTujuanId: activeSatelit2.id,
        bahanId: activeWortel.id,
        jumlah: "15.000",
        status: "dalam_perjalanan",
        catatan: "Pengiriman sore untuk persiapan menu sayur esok hari",
        dikirimPada: new Date(),
        createdBy: activeAdmin?.id,
      })
      .onConflictDoNothing();
  }

  // --- 13. FOOD WASTE LOG (FASE 3) ---
  if (activePusat && activeWortel) {
    await db
      .insert(foodWasteLog)
      .values({
        dapurId: activePusat.id,
        tanggal: todayStr,
        kategoriWaste: "prep_waste",
        bahanId: activeWortel.id,
        beratKg: "3.200",
        estimasiKerugianRp: "38400.00",
        catatan: "Trimming kulit dan bonggol wortel persiapan masak pagi",
        dicatatOleh: activeAdmin?.id,
      })
      .onConflictDoNothing();
  }

  if (activePusat && activeBeras && activeMenu) {
    await db
      .insert(foodWasteLog)
      .values({
        dapurId: activePusat.id,
        tanggal: todayStr,
        kategoriWaste: "cooking_loss",
        bahanId: activeBeras.id,
        menuId: activeMenu.id,
        beratKg: "1.500",
        estimasiKerugianRp: "21000.00",
        catatan: "Kerak nasi dasar wadah kukus besar",
        dicatatOleh: activeAdmin?.id,
      })
      .onConflictDoNothing();
  }

  // --- 14. KOMPLAIN SEKOLAH (FASE 3) ---
  const sdn01 = (await db.select().from(sekolah).where(sql`nama_sekolah ILIKE '%SDN 01%'`).limit(1))[0];
  if (sdn01) {
    await db
      .insert(komplainSekolah)
      .values({
        nomorTiket: "TIK-20261002-1042",
        sekolahId: sdn01.id,
        kategoriKendala: "kemasan_rusak",
        deskripsi: "Terdapat 5 kotak makanan dengan penutup wadah retak halus saat diterima.",
        status: "investigasi",
        catatanInvestigasi: "Driver segera konfirmasi ke gudang logistik; diduga tekanan saat penataan boks di rak mobil.",
        tindakanPerbaikan: "Telah diganti langsung dengan 5 wadah cadangan higienis di lokasi.",
      })
      .onConflictDoNothing();
  }

  // --- 15. WHATSAPP MESSAGE LOGS (FASE 3) ---
  await db
    .insert(waMessageLogs)
    .values([
      {
        nomorTujuan: "6281211223344",
        tipePesan: "po_supplier",
        payloadPesan: "Yth. CV Tani Makmur Sentosa, Pesanan PO-20261002-0001 telah diterbitkan untuk pengiriman esok hari. Harap konfirmasi.",
        status: "sent",
        externalMessageId: "WAM-TEST-9001",
        sentAt: new Date(),
      },
      {
        nomorTujuan: "6281234567890",
        tipePesan: "alert_stok",
        payloadPesan: "[ALERT SPPG] Stok Beras Premium tersisa 180 kg (di bawah batas minimum 200 kg). Harap segera ajukan PO.",
        status: "delivered",
        externalMessageId: "WAM-TEST-9002",
        sentAt: new Date(),
      },
      {
        nomorTujuan: "6281299887766",
        tipePesan: "status_kirim",
        payloadPesan: "Makanan bergizi untuk SDN 01 Merdeka sedang dalam perjalanan bersama Driver Joko (Plat: B 9142 SPG). Estimasi tiba: 09:30 WIB.",
        status: "delivered",
        externalMessageId: "WAM-TEST-9003",
        sentAt: new Date(),
      },
    ])
    .onConflictDoNothing();

  // --- 16. AI MENU PRESET (FASE 4) ---
  await db
    .insert(aiMenuPreset)
    .values({
      namaPaketSiklus: "Siklus 5 Hari Menu SD Standar AKG BGN",
      targetJenjang: "sd",
      targetKaloriMin: "500.00",
      targetKaloriMax: "650.00",
      estimasiHppRataRata: "12800.00",
      rekomendasiMenuJson: {
        hari1: "Nasi Ayam Semur Kecap + Tumis Buncis Jagung + Semangka",
        hari2: "Nasi Fillet Ikan Dori Tepung + Sayur Sup Wortel + Pisang",
        hari3: "Nasi Sapi Teriyaki Lada Manis + Capcay Sayur Segar + Jeruk",
        hari4: "Nasi Telur Balado Pedas Manis + Tahu Orek + Sayur Lodeh",
        hari5: "Nasi Ayam Bakar Madu + Tempe Mendoan + Sayur Bening Bayam",
      },
      statusApproval: "disetujui",
      approvedBy: activeAdmin?.id,
      approvedAt: new Date(),
    })
    .onConflictDoNothing();

  // --- 17. VRP RUTE HARIAN (FASE 4) ---
  if (activeArmada) {
    await db
      .insert(vrpRuteHarian)
      .values({
        tanggal: todayStr,
        armadaId: activeArmada.id,
        driverId: activeDriverUser?.id,
        urutanSekolahJson: [
          { urutan: 1, namaSekolah: "SDN 01 Pagi", porsi: 450, estJamTiba: "09:30" },
          { urutan: 2, namaSekolah: "SMPN 03", porsi: 800, estJamTiba: "10:15" },
          { urutan: 3, namaSekolah: "SDN 04 Ceria", porsi: 1200, estJamTiba: "11:00" },
        ],
        totalJarakKm: "18.50",
        totalEstimasiMenit: 62,
        statusRute: "terencana",
      })
      .onConflictDoNothing();
  }

  // --- 18. IOT SENSOR DEVICE & TELEMETRI HACCP (FASE 4) ---
  const [chillerDevice] = await db
    .insert(iotSensorDevice)
    .values({
      kodeAlat: "IOT-CHL-01",
      tipePenempatan: "chiller_dapur",
      dapurId: activePusat?.id,
      ambangSuhuMin: "0.00",
      ambangSuhuMax: "4.00",
      statusAktif: true,
    })
    .onConflictDoNothing()
    .returning();

  const [freezerDevice] = await db
    .insert(iotSensorDevice)
    .values({
      kodeAlat: "IOT-FRZ-01",
      tipePenempatan: "freezer_dapur",
      dapurId: activePusat?.id,
      ambangSuhuMin: "-25.00",
      ambangSuhuMax: "-18.00",
      statusAktif: true,
    })
    .onConflictDoNothing()
    .returning();

  const [boksDevice] = await db
    .insert(iotSensorDevice)
    .values({
      kodeAlat: "IOT-BOKS-01",
      tipePenempatan: "boks_armada",
      armadaId: activeArmada?.id,
      ambangSuhuMin: "60.00",
      ambangSuhuMax: "85.00",
      statusAktif: true,
    })
    .onConflictDoNothing()
    .returning();

  const activeChiller = chillerDevice || (await db.select().from(iotSensorDevice).where(sql`kode_alat = 'IOT-CHL-01'`).limit(1))[0];
  const activeFreezer = freezerDevice || (await db.select().from(iotSensorDevice).where(sql`kode_alat = 'IOT-FRZ-01'`).limit(1))[0];
  const activeBoks = boksDevice || (await db.select().from(iotSensorDevice).where(sql`kode_alat = 'IOT-BOKS-01'`).limit(1))[0];

  if (activeChiller) {
    await db.insert(iotTelemetriSuhu).values({
      deviceId: activeChiller.id,
      suhuCelsius: "3.20",
      kelembapanPersen: "75.00",
      isAnomaliHaccp: false,
    });
  }

  if (activeFreezer) {
    await db.insert(iotTelemetriSuhu).values({
      deviceId: activeFreezer.id,
      suhuCelsius: "-19.50",
      kelembapanPersen: "60.00",
      isAnomaliHaccp: false,
    });
  }

  if (activeBoks) {
    await db.insert(iotTelemetriSuhu).values({
      deviceId: activeBoks.id,
      suhuCelsius: "64.20",
      latitude: "-6.21000000",
      longitude: "106.82000000",
      isAnomaliHaccp: false,
    });
  }

  // --- 19. BGN AUDIT REPORT (FASE 4) ---
  if (activePusat) {
    await db
      .insert(bgnLaporanAudit)
      .values({
        nomorDokumen: "BGN-AUDIT-202610-001",
        periodeMulai: "2026-10-01",
        periodeSelesai: "2026-10-31",
        dapurId: activePusat.id,
        totalPorsiTersaji: 73500,
        rerataKaloriTercapai: "585.50",
        skorKepatuhanHaccp: "98.50",
        dokumenPdfUrl: "https://storage.sppg.id/bgn-reports/BGN-AUDIT-202610-001.pdf",
        checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        qrVerifikasiUrl: "https://bgn.go.id/verify/e3b0c44298fc1c14",
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
