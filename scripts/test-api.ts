import { db } from "../src/db";
import { jadwalMenu, menu, resepItem, bahan, sekolah } from "../src/db/schema";
import { kalkulasiKebutuhanBOM } from "../src/lib/bom";
import { eq, sql } from "drizzle-orm";
import assert from "node:assert/strict";

async function run() {
  const [porsiAgg] = await db
    .select({
      totalPorsi: sql<number>`COALESCE(SUM(${sekolah.jumlahPorsiTarget}), 0)::int`,
    })
    .from(sekolah)
    .where(eq(sekolah.isActive, true));

  assert.equal(porsiAgg?.totalPorsi, 2450);

  const todayStr = new Date().toISOString().split("T")[0];
  const [jadwal] = await db
    .select({
      jadwalId: jadwalMenu.id,
      menuId: jadwalMenu.menuId,
      namaMenu: menu.namaMenu,
    })
    .from(jadwalMenu)
    .innerJoin(menu, eq(jadwalMenu.menuId, menu.id))
    .where(eq(jadwalMenu.tanggal, todayStr))
    .limit(1);

  assert.ok(jadwal, "Jadwal hari ini harus ada");

  const itemsResep = await db
    .select({
      bahanId: bahan.id,
      namaBahan: bahan.namaBahan,
      satuanStandar: bahan.satuanStandar,
      jumlahPerPorsi: resepItem.jumlahPerPorsi,
      stokSaatIni: bahan.stokSaatIni,
    })
    .from(resepItem)
    .innerJoin(bahan, eq(resepItem.bahanId, bahan.id))
    .where(eq(resepItem.menuId, jadwal.menuId));

  assert.equal(itemsResep.length, 3);

  const hasilBOM = kalkulasiKebutuhanBOM(
    itemsResep.map((item) => ({
      bahanId: item.bahanId,
      namaBahan: item.namaBahan,
      satuanStandar: item.satuanStandar,
      jumlahPerPorsi: Number(item.jumlahPerPorsi),
      stokSaatIni: Number(item.stokSaatIni),
    })),
    porsiAgg.totalPorsi
  );

  console.log("Hasil Kalkulasi BOM DB Real:", JSON.stringify(hasilBOM, null, 2));
  assert.equal(hasilBOM.find(b => b.namaBahan === "Wortel Segar")?.isDefisit, true);

  console.log("✓ Verifikasi integrasi database PostgreSQL sukses 100%.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Gagal test integrasi:", err);
  process.exit(1);
});
