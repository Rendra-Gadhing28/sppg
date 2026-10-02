import assert from "node:assert/strict";
import { generateMenuCycle, STANDAR_AKG } from "../src/lib/ai-planner";
import { optimasiRuteVrp, hitungJarakKm } from "../src/lib/vrp";
import { evaluasiSuhuHaccp, hitungSkorKepatuhanHaccp } from "../src/lib/iot-haccp";
import { kalkulasiSmartReplenishment, hitungMape } from "../src/lib/forecasting";
import {
  aiMenuPresetSchema,
  aiMenuGenerateSchema,
  vrpRuteSchema,
  iotSensorDeviceSchema,
  iotTelemetriSchema,
  bgnAuditSchema,
} from "../src/lib/validators";

async function runTests() {
  console.log("▶ Menguji Unit Logic Fase 4...");

  // 1. Test AI Nutrition Menu Planner
  const planSD = generateMenuCycle("sd", 5, 15000, ["seafood"]);
  assert.equal(planSD.totalHari, 5);
  assert.equal(planSD.jenjang, "sd");
  assert.ok(planSD.rataRataKalori >= STANDAR_AKG.sd.kaloriMin);
  assert.ok(planSD.rataRataKalori <= STANDAR_AKG.sd.kaloriMax);
  assert.ok(planSD.rataRataHpp <= 15000);
  assert.equal(planSD.isMemenuhiSyarat, true);

  // Pastikan seafood tidak ada dalam siklus karena dipantang
  const adaSeafood = planSD.siklus.some((s) => s.menu.alergen.includes("seafood"));
  assert.equal(adaSeafood, false, "Tidak boleh ada menu ber-alergen seafood!");
  console.log("✓ Logic AI Menu Planner lolos 100%.");

  // 2. Test VRP Dynamic Routing
  const depot = { latitude: -6.2, longitude: 106.81 };
  const sekolahList = [
    {
      id: "s-1",
      namaSekolah: "SDN 01 Merdeka",
      latitude: -6.21,
      longitude: 106.82,
      jumlahPorsi: 450,
      jamMakan: "10:30",
    },
    {
      id: "s-2",
      namaSekolah: "SMPN 03 Jakarta",
      latitude: -6.23,
      longitude: 106.84,
      jumlahPorsi: 600,
      jamMakan: "11:00",
    },
  ];

  const vrp = optimasiRuteVrp(depot, sekolahList, "armada-1", 1500, "08:30");
  assert.equal(vrp.totalPorsiDiangkut, 1050);
  assert.equal(vrp.urutanStops.length, 2);
  assert.ok(vrp.totalJarakKm > 0);
  assert.ok(vrp.totalEstimasiMenit <= 90);
  assert.equal(vrp.isBatasHangatAman, true);
  console.log("✓ Logic VRP Dynamic Routing lolos 100%.");

  // 3. Test IoT Cold-Chain & HACCP
  const evalChillerAman = evaluasiSuhuHaccp("chiller_dapur", 3.2);
  assert.equal(evalChillerAman.status, "aman");
  assert.equal(evalChillerAman.isAnomaliHaccp, false);

  const evalChillerKritis = evaluasiSuhuHaccp("chiller_dapur", 7.8);
  assert.equal(evalChillerKritis.status, "anomali_kritis");
  assert.equal(evalChillerKritis.isAnomaliHaccp, true);

  const evalBoksPanas = evaluasiSuhuHaccp("boks_armada", 62.5);
  assert.equal(evalBoksPanas.status, "aman");

  const evalBoksDingin = evaluasiSuhuHaccp("boks_armada", 52.0);
  assert.equal(evalBoksDingin.status, "anomali_kritis");

  const skor = hitungSkorKepatuhanHaccp([
    { suhuCelsius: 3.0, isAnomaliHaccp: false },
    { suhuCelsius: 3.5, isAnomaliHaccp: false },
    { suhuCelsius: 4.0, isAnomaliHaccp: false },
    { suhuCelsius: 7.0, isAnomaliHaccp: true }, // 1 anomali dari 4 = 75%
  ]);
  assert.equal(skor.persentaseKepatuhan, 75);
  assert.equal(skor.gradeKepatuhan, "C_PERLU_PERBAIKAN");
  console.log("✓ Logic IoT Cold-Chain & HACCP lolos 100%.");

  // 4. Test Forecasting & Smart Replenishment
  const rep = kalkulasiSmartReplenishment({
    bahanId: "b-beras",
    namaBahan: "Beras Premium",
    stokSaatIni: 80,
    rataRataKonsumsiHarian: 40,
    leadTimeHari: 2,
  });
  // Lead demand = 80, Safety stock = 40 * 0.5 * 2 * 1.2 = 48. ROP = 128.
  // Stok saat ini 80 <= 128 -> perluOrderUlang = true
  assert.equal(rep.perluOrderUlang, true);
  assert.ok(rep.rekomendasiJumlahOrder > 0);

  const mape = hitungMape([
    { aktual: 100, prediksi: 95 }, // err 5%
    { aktual: 200, prediksi: 210 }, // err 5%
  ]);
  assert.equal(mape, 5.0);
  console.log("✓ Logic Smart Replenishment & MAPE lolos 100%.");

  // 5. Test Validator Fase 4
  console.log("▶ Menguji Validator Fase 4...");

  const validGen = aiMenuGenerateSchema.safeParse({
    targetJenjang: "sd",
    hariSiklus: 10,
    maxHppPerPorsi: 14000,
    pantangAlergen: ["kacang"],
  });
  assert.ok(validGen.success);

  const validVrp = vrpRuteSchema.safeParse({
    armadaId: "a0000000-0000-4000-a000-000000000001",
    totalJarakKm: 14.5,
    totalEstimasiMenit: 45,
    urutanSekolahJson: [
      {
        sekolahId: "b0000000-0000-4000-a000-000000000001",
        namaSekolah: "SDN 01",
        urutan: 1,
        porsi: 450,
        estJamTiba: "09:30",
      },
    ],
  });
  assert.ok(validVrp.success);

  const validIotDevice = iotSensorDeviceSchema.safeParse({
    kodeAlat: "IOT-CHILLER-01",
    tipePenempatan: "chiller_dapur",
    ambangSuhuMin: 0,
    ambangSuhuMax: 4,
  });
  assert.ok(validIotDevice.success);

  const validTelemetri = iotTelemetriSchema.safeParse({
    deviceId: "c0000000-0000-4000-a000-000000000001",
    suhuCelsius: 3.4,
    kelembapanPersen: 78.5,
  });
  assert.ok(validTelemetri.success);

  console.log("✓ Semua validator Fase 4 lolos 100%.");
  console.log("🎉 SELURUH RUNNABLE CHECK FASE 4 SUKSES 100%!");
}

runTests().catch((err) => {
  console.error("❌ Gagal test Fase 4:", err);
  process.exit(1);
});
