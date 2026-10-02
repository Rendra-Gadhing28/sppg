import { db } from "../src/db";
import {
  supplier,
  purchaseOrder,
  purchaseOrderItem,
  qcPenerimaan,
  stokBatch,
  bahan,
  distribusiPengiriman,
  serahTerimaSekolah,
} from "../src/db/schema";
import { alokasikanBatchFEFO, evaluasiStatusExpiry } from "../src/lib/fefo";
import { eq, asc, desc, sql } from "drizzle-orm";
import assert from "node:assert/strict";

async function runDbPhase2Test() {
  console.log("▶ Menguji Alur DB Lengkap Fase 2...");

  // 1. Verifikasi Supplier
  const listSup = await db.select().from(supplier);
  assert.ok(listSup.length >= 2, "Harus ada minimal 2 supplier terdaftar");
  console.log(`✓ Master Supplier terdata: ${listSup.length} supplier.`);

  // 2. Verifikasi Purchase Order
  const listPO = await db.query.purchaseOrder.findMany({
    with: {
      supplier: true,
      items: { with: { bahan: true } },
      qcList: true,
    },
  });
  assert.ok(listPO.length >= 1, "Harus ada minimal 1 PO");
  console.log(`✓ Purchase Order terdata: ${listPO.length} PO dengan status ${listPO[0].status}.`);

  // 3. Verifikasi Batch & FEFO
  const batches = await db.query.stokBatch.findMany({
    where: eq(stokBatch.statusBatch, "aktif"),
    orderBy: [asc(stokBatch.tanggalExpired)],
    with: { bahan: true },
  });
  assert.ok(batches.length >= 2, "Harus ada minimal 2 batch aktif");

  const earliestBatch = batches[0];
  const evalExpiry = evaluasiStatusExpiry(earliestBatch.tanggalExpired);
  console.log(
    `✓ Batch FEFO Terdekat: ${earliestBatch.nomorBatch} (${earliestBatch.bahan.namaBahan}), Exp: ${earliestBatch.tanggalExpired}, Status: ${evalExpiry.status}`
  );

  // 4. Verifikasi Distribusi Pengiriman & Serah Terima Sekolah
  const distList = await db.query.distribusiPengiriman.findMany({
    with: {
      armada: true,
      serahTerimaList: { with: { sekolah: true } },
    },
  });
  assert.ok(distList.length >= 1, "Harus ada minimal 1 surat jalan pengiriman");
  const firstDist = distList[0];
  assert.ok(firstDist.serahTerimaList.length >= 1, "Harus ada serah terima sekolah");

  const stSelesai = firstDist.serahTerimaList.filter((s) => s.statusSerahTerima === "diterima");
  console.log(
    `✓ Surat Jalan ${firstDist.nomorSuratJalan}: ${stSelesai.length}/${firstDist.serahTerimaList.length} sekolah telah serah terima.`
  );

  console.log("✓ Seluruh verifikasi database PostgreSQL Fase 2 sukses 100%.");
  process.exit(0);
}

runDbPhase2Test().catch((err) => {
  console.error("Gagal test DB Phase 2:", err);
  process.exit(1);
});
