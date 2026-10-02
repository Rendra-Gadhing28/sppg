import { db } from "../src/db";
import {
  aiMenuPreset,
  vrpRuteHarian,
  iotSensorDevice,
  iotTelemetriSuhu,
  bgnLaporanAudit,
  dapurCabang,
  armada,
} from "../src/db/schema";
import { generateMenuCycle } from "../src/lib/ai-planner";
import { optimasiRuteVrp } from "../src/lib/vrp";
import { evaluasiSuhuHaccp, hitungSkorKepatuhanHaccp } from "../src/lib/iot-haccp";
import { createHash } from "node:crypto";
import { eq, desc } from "drizzle-orm";
import assert from "node:assert/strict";

async function runDbPhase4Test() {
  console.log("▶ Menguji Alur DB Lengkap Fase 4 (PostgreSQL)...");

  // 1. Verifikasi AI Menu Preset
  const presets = await db.query.aiMenuPreset.findMany({
    orderBy: [desc(aiMenuPreset.createdAt)],
  });
  assert.ok(presets.length >= 1, "Harus ada minimal 1 preset menu AI tersimpan.");
  const p1 = presets[0];
  console.log(`✓ AI Menu Preset: '${p1.namaPaketSiklus}' untuk jenjang ${p1.targetJenjang.toUpperCase()} (HPP: Rp ${p1.estimasiHppRataRata}, Status: ${p1.statusApproval}).`);

  // Test insert new AI preset
  const autoPlan = generateMenuCycle("smp", 5, 16000, ["seafood"]);
  const [newPreset] = await db
    .insert(aiMenuPreset)
    .values({
      namaPaketSiklus: "Siklus Uji AI 5 Hari SMP",
      targetJenjang: "smp",
      targetKaloriMin: "700.00",
      targetKaloriMax: "850.00",
      estimasiHppRataRata: String(autoPlan.rataRataHpp),
      rekomendasiMenuJson: {
        hari1: autoPlan.siklus[0].menu.namaMenu,
        hari2: autoPlan.siklus[1].menu.namaMenu,
      },
      statusApproval: "draft",
    })
    .returning();

  assert.ok(newPreset.id, "Harus berhasil insert preset baru");
  // Update approval
  const [approved] = await db
    .update(aiMenuPreset)
    .set({ statusApproval: "disetujui" })
    .where(eq(aiMenuPreset.id, newPreset.id))
    .returning();
  assert.equal(approved.statusApproval, "disetujui");
  console.log("✓ Insert & update approval AI Menu Preset berhasil.");

  // 2. Verifikasi VRP Rute Harian
  const ruteList = await db.query.vrpRuteHarian.findMany({
    with: {
      armada: true,
    },
  });
  assert.ok(ruteList.length >= 1, "Harus ada minimal 1 rute VRP tersimpan.");
  const r1 = ruteList[0];
  console.log(`✓ VRP Rute Harian: Armada ${r1.armada?.nomorKendaraan || "Kendaraan"} menempuh ${r1.totalJarakKm} km (${r1.totalEstimasiMenit} menit, Status: ${r1.statusRute}).`);

  // 3. Verifikasi IoT Sensor Device & Telemetri Suhu
  const devices = await db.query.iotSensorDevice.findMany({
    with: {
      telemetriList: true,
      dapur: true,
      armada: true,
    },
  });
  assert.ok(devices.length >= 3, "Harus ada minimal 3 unit sensor IoT (chiller, freezer, boks armada).");
  console.log(`✓ Terdaftar ${devices.length} sensor IoT cold-chain aktif.`);

  // Test telemetri ingest & HACCP compliance check
  const chiller = devices.find((d) => d.tipePenempatan === "chiller_dapur");
  assert.ok(chiller, "Harus ada sensor chiller");

  const evalSuhu = evaluasiSuhuHaccp(chiller.tipePenempatan, 3.1);
  const [telemetriBaru] = await db
    .insert(iotTelemetriSuhu)
    .values({
      deviceId: chiller.id,
      suhuCelsius: "3.10",
      kelembapanPersen: "72.00",
      isAnomaliHaccp: evalSuhu.isAnomaliHaccp,
    })
    .returning();

  assert.equal(telemetriBaru.isAnomaliHaccp, false);
  console.log(`✓ Telemetri Sensor ${chiller.kodeAlat} berhasil dicatat: 3.10°C (HACCP Sanitasi: Lolos).`);

  // 4. Verifikasi Laporan Audit BGN RI (SHA-256 + QR)
  const auditLogs = await db.query.bgnLaporanAudit.findMany({
    with: {
      dapur: true,
    },
  });
  assert.ok(auditLogs.length >= 1, "Harus ada minimal 1 laporan audit resmi BGN.");
  const bgn1 = auditLogs[0];
  assert.equal(bgn1.checksumSha256.length, 64, "Checksum harus berupa hex SHA-256 64 karakter.");
  assert.ok(bgn1.qrVerifikasiUrl.startsWith("https://bgn.go.id/verify/"), "QR link harus valid.");
  console.log(`✓ Dokumen Audit Resmi BGN: ${bgn1.nomorDokumen} (Skor HACCP: ${bgn1.skorKepatuhanHaccp}%, Checksum: ${bgn1.checksumSha256.substring(0, 16)}...).`);

  console.log("🎉 SELURUH PENGUJIAN INTEGRASI DATABASE FASE 4 (POSTGRESQL) SUKSES 100%!");
}

runDbPhase4Test()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Gagal test DB Fase 4:", err);
    process.exit(1);
  });
