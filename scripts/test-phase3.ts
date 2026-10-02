import assert from "node:assert/strict";
import { kalkulasiHppTeoritis, kalkulasiVariansHpp, kalkulasiFoodWasteCost } from "../src/lib/hpp";
import {
  formatPoNotification,
  formatShiftReminder,
  formatStokAlert,
  formatDistribusiNotification,
  kirimPesanWaQueue,
} from "../src/lib/whatsapp";
import {
  validateIdempotencyKey,
  parseOfflinePayload,
  filterValidMutasi,
} from "../src/lib/offline-sync";
import {
  dapurCabangSchema,
  transferStokSchema,
  waMessageSchema,
  offlineSyncBatchSchema,
  foodWasteSchema,
  komplainSekolahSchema,
  komplainUpdateSchema,
} from "../src/lib/validators";

async function runTests() {
  console.log("▶ Menguji Unit Logic Fase 3...");

  // 1. Test HPP Kalkulasi
  const bomItems = [
    { bahanId: "b-beras", jumlahPerPorsi: 0.1, hargaBeliSatuan: 14000 }, // 1.400
    { bahanId: "b-ayam", jumlahPerPorsi: 0.08, hargaBeliSatuan: 40000 },  // 3.200
    { bahanId: "b-sayur", jumlahPerPorsi: 0.05, hargaBeliSatuan: 12000 }, // 600
  ];
  // Total bahan per porsi = 1.400 + 3.200 + 600 = 5.200
  // Overhead default = 2.500 -> Total HPP = 7.700
  const hpp = kalkulasiHppTeoritis(bomItems);
  assert.equal(hpp.biayaBahanPerPorsi, 5200);
  assert.equal(hpp.overheadPerPorsi, 2500);
  assert.equal(hpp.totalHppPerPorsi, 7700);

  // Test Varians HPP
  const varians1 = kalkulasiVariansHpp(7700, 7900); // Naik 200 (2.6%) -> aman
  assert.equal(varians1.isOverBudget, false);
  assert.equal(varians1.persentaseDeviasi, 2.6);

  const varians2 = kalkulasiVariansHpp(7700, 8500); // Naik 800 (10.39%) -> overbudget (>5%)
  assert.equal(varians2.isOverBudget, true);
  assert.equal(varians2.persentaseDeviasi, 10.39);

  // Test Food Waste Cost
  const wasteItems = [
    { beratKg: 5, estimasiKerugianRp: 70000 },
    { beratKg: 2.5, estimasiKerugianRp: 100000 },
  ];
  const wasteCalc = kalkulasiFoodWasteCost(wasteItems);
  assert.equal(wasteCalc.totalBeratKg, 7.5);
  assert.equal(wasteCalc.totalKerugianRp, 170000);
  console.log("✓ Logic HPP & Food Waste lolos 100%.");

  // 2. Test WhatsApp Notification Templates & Queue
  const poMsg = formatPoNotification({
    nomorPo: "PO-20261002-0001",
    namaSupplier: "PT Sayur Segar",
    targetPengiriman: "2026-10-03",
    totalBiaya: 500000,
    items: [
      { namaBahan: "Beras Premium", jumlahPesan: 50, satuan: "kg" },
      { namaBahan: "Wortel Segar", jumlahPesan: 20, satuan: "kg" },
    ],
  });
  assert.ok(poMsg.includes("PO-20261002-0001"));
  assert.ok(poMsg.includes("PT Sayur Segar"));

  const shiftMsg = formatShiftReminder({
    namaAnggota: "Budi Santoso",
    namaShift: "Pagi",
    jamMasuk: "05:00",
    tanggal: "2026-10-03",
  });
  assert.ok(shiftMsg.includes("Budi Santoso"));
  assert.ok(shiftMsg.includes("05:00"));

  const stokAlertMsg = formatStokAlert({
    namaBahan: "Beras Premium",
    stokSaatIni: 15,
    stokMinimum: 50,
    satuan: "kg",
  });
  assert.ok(stokAlertMsg.includes("Beras Premium"));
  assert.ok(stokAlertMsg.includes("15 kg"));

  const distMsg = formatDistribusiNotification({
    nomorSuratJalan: "SJ-20261002-0001",
    namaSekolah: "SDN 01 Merdeka",
    porsiKirim: 450,
    status: "dalam_perjalanan",
    catatan: "Driver Joko berangkat",
  });
  assert.ok(distMsg.includes("SDN 01 Merdeka"));
  assert.ok(distMsg.includes("450"));

  const waQueueRes = await kirimPesanWaQueue({
    nomorTujuan: "081234567890",
    tipePesan: "po_supplier",
    payloadPesan: poMsg,
  });
  assert.equal(waQueueRes.success, true);
  assert.equal(waQueueRes.payload?.status, "queued");
  assert.equal(waQueueRes.payload?.nomorTujuanNormalized, "+6281234567890");
  console.log("✓ Logic WhatsApp Gateway lolos 100%.");

  // 3. Test Offline Sync Engine
  assert.equal(validateIdempotencyKey("absensi_uuid-12345_timestamp").valid, true);
  assert.equal(validateIdempotencyKey("ab").valid, false); // invalid pattern

  const validAbsensiPayload = parseOfflinePayload("absensi", {
    anggotaId: "a0000000-0000-4000-a000-000000000001",
    jenis: "masuk",
    waktuCatat: new Date().toISOString(),
    latitude: -6.2,
    longitude: 106.8,
    fotoBuktiUrl: "data:image/png;base64,abc",
  });
  assert.equal(validAbsensiPayload.valid, true);

  const invalidPayload = parseOfflinePayload("absensi", { jenis: "tidur" });
  assert.equal(invalidPayload.valid, false);

  const existingKeys = new Set(["absensi_key-sudah-ada_1"]);
  const incomingBatch = [
    {
      idempotencyKey: "absensi_key-sudah-ada_1",
      userId: "u1",
      entitasTarget: "absensi",
      clientRecordedAt: new Date().toISOString(),
      payloadJson: {
        anggotaId: "a0000000-0000-4000-a000-000000000001",
        jenis: "masuk",
        waktuCatat: new Date().toISOString(),
      },
    },
    {
      idempotencyKey: "absensi_key-baru-1_1",
      userId: "u1",
      entitasTarget: "absensi",
      clientRecordedAt: new Date().toISOString(),
      payloadJson: {
        anggotaId: "a0000000-0000-4000-a000-000000000001",
        jenis: "masuk",
        waktuCatat: new Date().toISOString(),
      },
    },
    {
      idempotencyKey: "absensi_key-baru-1_1", // duplikat di batch yang sama
      userId: "u1",
      entitasTarget: "absensi",
      clientRecordedAt: new Date().toISOString(),
      payloadJson: {
        anggotaId: "a0000000-0000-4000-a000-000000000001",
        jenis: "masuk",
        waktuCatat: new Date().toISOString(),
      },
    },
  ];
  const filterRes = filterValidMutasi(incomingBatch, existingKeys);
  assert.equal(filterRes.toProcess.length, 1);
  assert.equal(filterRes.toProcess[0].idempotencyKey, "absensi_key-baru-1_1");
  assert.equal(filterRes.skipped.length, 2);
  console.log("✓ Logic Offline-First Sync lolos 100%.");

  // 4. Test Validators Fase 3
  console.log("▶ Menguji Validator Fase 3...");

  // 4a. Dapur Cabang Schema
  const cabangValid = dapurCabangSchema.safeParse({
    kodeDapur: "DPR-ST-01",
    namaDapur: "Dapur Satelit Johar Baru",
    tipeDapur: "satelit",
    alamat: "Jl. Percetakan Negara No. 45",
    latitude: -6.185,
    longitude: 106.855,
    radiusMeter: 120,
    kapasitasMaksPorsi: 2500,
  });
  assert.ok(cabangValid.success);

  // 4b. Transfer Stok Schema
  const transferValid = transferStokSchema.safeParse({
    dapurAsalId: "a0000000-0000-4000-a000-000000000001",
    dapurTujuanId: "a0000000-0000-4000-a000-000000000002",
    bahanId: "b0000000-0000-4000-a000-000000000003",
    jumlah: 50,
    catatan: "Transfer darurat beras untuk menu esok hari",
  });
  assert.ok(transferValid.success);

  // 4c. WA Message Schema
  const waValid = waMessageSchema.safeParse({
    nomorTujuan: "081298765432",
    tipePesan: "alert_stok",
    payloadPesan: "Stok telur menipis di bawah minimum",
  });
  assert.ok(waValid.success);

  // 4d. Offline Sync Batch Schema
  const offlineValid = offlineSyncBatchSchema.safeParse({
    mutasi: [
      {
        idempotencyKey: "absensi_uuid-12345_timestamp",
        userId: "a0000000-0000-4000-a000-000000000001",
        entitasTarget: "absensi",
        clientRecordedAt: new Date().toISOString(),
        payloadJson: { test: "data" },
      },
    ],
  });
  assert.ok(offlineValid.success);

  // 4e. Food Waste Schema
  const wasteValid = foodWasteSchema.safeParse({
    kategoriWaste: "prep_waste",
    beratKg: 4.25,
    estimasiKerugianRp: 55000,
    catatan: "Kulit kentang dan wortel sisa persiapan",
  });
  assert.ok(wasteValid.success);

  // 4f. Komplain Sekolah Schema
  const komplainValid = komplainSekolahSchema.safeParse({
    sekolahId: "c0000000-0000-4000-a000-000000000001",
    kategoriKendala: "kurang_porsi",
    deskripsi: "Porsi yang tiba 420 porsi dari target 450 porsi.",
  });
  assert.ok(komplainValid.success);

  // 4g. Komplain Update Schema
  const updateValid = komplainUpdateSchema.safeParse({
    id: "d0000000-0000-4000-a000-000000000001",
    status: "tindakan",
    catatanInvestigasi: "Telah dicek ke driver, terdapat 1 boks tertinggal di dapur.",
    tindakanPerbaikan: "Dikirim susulan 30 porsi menggunakan motor kurir cadangan.",
  });
  assert.ok(updateValid.success);

  console.log("✓ Semua validator Fase 3 lolos 100%.");
  console.log("🎉 SELURUH RUNNABLE CHECK FASE 3 SUKSES 100%!");
}

runTests().catch((err) => {
  console.error("Gagal uji Fase 3:", err);
  process.exit(1);
});
