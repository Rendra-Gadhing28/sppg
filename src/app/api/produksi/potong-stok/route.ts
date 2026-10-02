import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jadwalMenu, menu, resepItem, bahan, stokMutasi, sekolah, stokBatch } from "@/db/schema";
import { alokasikanBatchFEFO } from "@/lib/fefo";
import { eq, sql, asc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Ambil jadwal menu hari ini
    const [jadwal] = await db
      .select()
      .from(jadwalMenu)
      .where(eq(jadwalMenu.tanggal, todayStr))
      .limit(1);

    if (!jadwal) {
      return NextResponse.json(
        { error: "Tidak ada jadwal menu hari ini untuk diproduksi." },
        { status: 404 }
      );
    }

    if (jadwal.statusProduksi === "selesai") {
      return NextResponse.json(
        { error: "Produksi hari ini sudah selesai dan stok telah dipotong sebelumnya." },
        { status: 400 }
      );
    }

    // 2. Hitung total target porsi sekolah
    const [porsiAgg] = await db
      .select({
        totalPorsi: sql<number>`COALESCE(SUM(${sekolah.jumlahPorsiTarget}), 0)::int`,
      })
      .from(sekolah)
      .where(eq(sekolah.isActive, true));

    const totalPorsi = porsiAgg?.totalPorsi || jadwal.totalTargetPorsi || 0;

    // 3. Ambil daftar resep bahan
    const itemsResep = await db
      .select({
        bahanId: bahan.id,
        namaBahan: bahan.namaBahan,
        jumlahPerPorsi: resepItem.jumlahPerPorsi,
        stokSaatIni: bahan.stokSaatIni,
      })
      .from(resepItem)
      .innerJoin(bahan, eq(resepItem.bahanId, bahan.id))
      .where(eq(resepItem.menuId, jadwal.menuId));

    if (itemsResep.length === 0) {
      return NextResponse.json(
        { error: "Menu belum memiliki item resep bahan (BOM)." },
        { status: 400 }
      );
    }

    // 4. Eksekusi pemotongan stok dalam DB Transaction
    const hasilMutasi = await db.transaction(async (tx) => {
      const records = [];

      for (const item of itemsResep) {
        const jumlahKeluar = Number(
          (Number(item.jumlahPerPorsi) * totalPorsi).toFixed(3)
        );
        const saldoAwal = Number(item.stokSaatIni);
        const saldoAkhir = Math.max(0, Number((saldoAwal - jumlahKeluar).toFixed(3)));

        // Update saldo bahan
        await tx
          .update(bahan)
          .set({
            stokSaatIni: String(saldoAkhir),
          })
          .where(eq(bahan.id, item.bahanId));

        // Pemotongan Batch dengan aturan FEFO (First Expired, First Out)
        const activeBatches = await tx
          .select({
            id: stokBatch.id,
            bahanId: stokBatch.bahanId,
            nomorBatch: stokBatch.nomorBatch,
            tanggalExpired: stokBatch.tanggalExpired,
            jumlahSisa: sql<number>`${stokBatch.jumlahSisa}::float`,
          })
          .from(stokBatch)
          .where(
            sql`${stokBatch.bahanId} = ${item.bahanId} AND ${stokBatch.statusBatch} = 'aktif'`
          )
          .orderBy(asc(stokBatch.tanggalExpired));

        if (activeBatches.length > 0) {
          const alokasiFEFO = alokasikanBatchFEFO(activeBatches, jumlahKeluar);
          for (const alok of alokasiFEFO.alokasi) {
            await tx
              .update(stokBatch)
              .set({
                jumlahSisa: String(alok.sisaSetelahnya),
                statusBatch: alok.statusBatchBaru,
              })
              .where(eq(stokBatch.id, alok.batchId));
          }
        }

        // Catat di ledger mutasi stok
        const [mutasi] = await tx
          .insert(stokMutasi)
          .values({
            bahanId: item.bahanId,
            jenis: "keluar_produksi",
            jumlah: String(jumlahKeluar),
            saldoSebelumnya: String(saldoAwal),
            saldoSetelahnya: String(saldoAkhir),
            referensiId: jadwal.id,
            keterangan: `Produksi ${totalPorsi} porsi menu hari ini (${todayStr})`,
          })
          .returning();

        records.push(mutasi);
      }

      // Update status jadwal menu
      await tx
        .update(jadwalMenu)
        .set({
          statusProduksi: "selesai",
        })
        .where(eq(jadwalMenu.id, jadwal.id));

      return records;
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil memotong ${hasilMutasi.length} bahan untuk ${totalPorsi} porsi produksi.`,
      mutasi: hasilMutasi,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memproses pemotongan stok produksi." },
      { status: 500 }
    );
  }
}
