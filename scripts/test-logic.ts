import assert from "node:assert/strict";
import { hitungJarakMeter, cekDalamRadius } from "../src/lib/geo";
import { kalkulasiKebutuhanBOM } from "../src/lib/bom";
import { evaluasiStatusMasuk, evaluasiStatusKeluar } from "../src/lib/shift";

// 1. Test Geofence
const dapurLat = -6.200000;
const dapurLon = 106.816666;
const jarakDekat = hitungJarakMeter(dapurLat, dapurLon, -6.200100, 106.816666);
assert.ok(jarakDekat < 20, `Jarak harus < 20m, didapat ${jarakDekat}m`);

const resRadius = cekDalamRadius(dapurLat, dapurLon, dapurLat, dapurLon, 100);
assert.equal(resRadius.isInRadius, true);

// 2. Test Shift Logic
const waktuAbsen = new Date();
waktuAbsen.setHours(5, 10, 0, 0); // 05:10
assert.equal(evaluasiStatusMasuk(waktuAbsen, "05:00", 15), "tepat_waktu");

waktuAbsen.setHours(5, 20, 0, 0); // 05:20 (lewat toleransi 15m)
assert.equal(evaluasiStatusMasuk(waktuAbsen, "05:00", 15), "terlambat");

waktuAbsen.setHours(13, 0, 0, 0); // 13:00 pulang
assert.equal(evaluasiStatusKeluar(waktuAbsen, "13:00"), "tepat_waktu");

waktuAbsen.setHours(12, 45, 0, 0); // 12:45 pulang
assert.equal(evaluasiStatusKeluar(waktuAbsen, "13:00"), "pulang_cepat");

// 3. Test BOM Calculation
const mockItems = [
  {
    bahanId: "b1",
    namaBahan: "Beras",
    satuanStandar: "kg",
    jumlahPerPorsi: 0.1, // 100 gram = 0.1 kg
    stokSaatIni: 200,
  },
  {
    bahanId: "b2",
    namaBahan: "Ayam",
    satuanStandar: "kg",
    jumlahPerPorsi: 0.08,
    stokSaatIni: 150,
  },
];
const hasil = kalkulasiKebutuhanBOM(mockItems, 2000);
assert.equal(hasil[0].totalKebutuhan, 200); // 0.1 * 2000 = 200
assert.equal(hasil[0].isDefisit, false);
assert.equal(hasil[1].totalKebutuhan, 160); // 0.08 * 2000 = 160
assert.equal(hasil[1].isDefisit, true); // stok 150 < 160
assert.equal(hasil[1].defisit, 10);

console.log("✓ Semua runnable check (Geofence, Shift, BOM) lolos 100%.");
