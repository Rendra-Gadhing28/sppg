import { db } from "../src/db";
import {
  dapurCabang,
  transferStokCabang,
  foodWasteLog,
  komplainSekolah,
  waMessageLogs,
  offlineSyncJournal,
  users,
} from "../src/db/schema";
import { kalkulasiFoodWasteCost } from "../src/lib/hpp";
import { filterValidMutasi } from "../src/lib/offline-sync";
import { eq, desc } from "drizzle-orm";
import assert from "node:assert/strict";

async function runDbPhase3Test() {
  console.log("▶ Menguji Alur DB Lengkap Fase 3 (PostgreSQL)...");

  // 1. Verifikasi Multi-Dapur Cabang
  const listCabang = await db.select().from(dapurCabang);
  assert.ok(listCabang.length >= 3, "Harus ada minimal 3 unit dapur cabang");
  const pusat = listCabang.find((c) => c.tipeDapur === "pusat");
  const satelit = listCabang.filter((c) => c.tipeDapur === "satelit");
  assert.ok(pusat, "Harus ada Dapur Pusat (Central Kitchen)");
  assert.ok(satelit.length >= 2, "Harus ada minimal 2 Dapur Satelit");
  console.log(`✓ Jaringan Dapur terdata: 1 Central Kitchen (${pusat.namaDapur}) & ${satelit.length} Satelit.`);

  // 2. Verifikasi Transfer Stok Antar-Cabang
  const listTransfer = await db.query.transferStokCabang.findMany({
    with: {
      dapurAsal: true,
      dapurTujuan: true,
      bahan: true,
    },
  });
  assert.ok(listTransfer.length >= 1, "Harus ada minimal 1 transfer stok antar-cabang");
  const firstTransfer = listTransfer[0];
  console.log(
    `✓ Mutasi ${firstTransfer.nomorTransfer}: ${firstTransfer.dapurAsal.namaDapur} ➔ ${firstTransfer.dapurTujuan.namaDapur} (${firstTransfer.jumlah} ${firstTransfer.bahan.satuanStandar} ${firstTransfer.bahan.namaBahan}), Status: ${firstTransfer.status}.`
  );

  // 3. Verifikasi Food Waste Log
  const listWaste = await db.query.foodWasteLog.findMany({
    with: {
      bahan: true,
      dapur: true,
    },
  });
  assert.ok(listWaste.length >= 1, "Harus ada minimal 1 pencatatan food waste");
  const wasteSummary = kalkulasiFoodWasteCost(
    listWaste.map((w) => ({
      beratKg: Number(w.beratKg),
      estimasiKerugianRp: Number(w.estimasiKerugianRp),
    }))
  );
  assert.ok(wasteSummary.totalBeratKg > 0, "Total berat waste harus > 0");
  console.log(
    `✓ Food Waste Ledger: ${listWaste.length} catatan limbah, Total: ${wasteSummary.totalBeratKg.toFixed(2)} kg (Estimasi Kerugian: Rp ${wasteSummary.totalKerugianRp.toLocaleString("id-ID")}).`
  );

  // 4. Verifikasi Komplain Sekolah
  const listKomplain = await db.query.komplainSekolah.findMany({
    with: {
      sekolah: true,
    },
  });
  assert.ok(listKomplain.length >= 1, "Harus ada minimal 1 tiket komplain");
  const firstKomplain = listKomplain[0];
  console.log(
    `✓ Tiket Aduan Sekolah ${firstKomplain.nomorTiket}: ${firstKomplain.sekolah.namaSekolah} (${firstKomplain.kategoriKendala}), Status: ${firstKomplain.status}.`
  );

  // 5. Verifikasi WhatsApp Message Logs
  const listWa = await db.query.waMessageLogs.findMany({
    orderBy: [desc(waMessageLogs.createdAt)],
  });
  assert.ok(listWa.length >= 1, "Harus ada minimal 1 log pesan WhatsApp");
  console.log(
    `✓ Audit Log WhatsApp: ${listWa.length} pesan tercatat, Terakhir dikirim ke ${listWa[0].nomorTujuan} (${listWa[0].tipePesan}).`
  );

  // 6. Verifikasi Offline-Sync Journal & Idempotency
  const testUser = (await db.select().from(users).limit(1))[0];
  assert.ok(testUser, "Harus ada user untuk offline sync");

  const testKey = `absensi_${testUser.id}_${Date.now()}`;
  const nowStr = new Date().toISOString();

  // Insert mutasi offline
  const [syncItem] = await db
    .insert(offlineSyncJournal)
    .values({
      idempotencyKey: testKey,
      userId: testUser.id,
      entitasTarget: "absensi",
      clientRecordedAt: new Date(),
      payloadJson: {
        anggotaId: "a0000000-0000-4000-a000-000000000001",
        jenis: "masuk",
        waktuCatat: nowStr,
      },
      syncStatus: "synced",
    })
    .returning();

  assert.equal(syncItem.idempotencyKey, testKey);

  // Uji filter deduplikasi
  const existingSet = new Set([testKey]);
  const dummyBatch = [
    {
      idempotencyKey: testKey, // duplikat
      userId: testUser.id,
      entitasTarget: "absensi",
      clientRecordedAt: nowStr,
      payloadJson: {
        anggotaId: "a0000000-0000-4000-a000-000000000001",
        jenis: "masuk",
        waktuCatat: nowStr,
      },
    },
    {
      idempotencyKey: `serah_terima_${testUser.id}_${Date.now()}`, // baru
      userId: testUser.id,
      entitasTarget: "serah_terima_sekolah",
      clientRecordedAt: nowStr,
      payloadJson: {
        pengirimanId: "p0000000-0000-4000-a000-000000000001",
        sekolahId: "s0000000-0000-4000-a000-000000000001",
        porsiDiterima: 450,
      },
    },
  ];

  const filterRes = filterValidMutasi(dummyBatch, existingSet);
  assert.equal(filterRes.toProcess.length, 1);
  assert.equal(filterRes.skipped.length, 1);
  assert.ok(filterRes.skipped[0].reason.includes("Duplikat"));
  console.log("✓ Logika Deduplikasi Offline Sync lolos (1 baru diproses, 1 duplikat diabaikan).");

  // Bersihkan record test
  await db.delete(offlineSyncJournal).where(eq(offlineSyncJournal.id, syncItem.id));

  console.log("🎉 SELURUH PENGUJIAN INTEGRASI DATABASE FASE 3 SUKSES 100%!");
  process.exit(0);
}

runDbPhase3Test().catch((err) => {
  console.error("❌ Gagal test DB Phase 3:", err);
  process.exit(1);
});
