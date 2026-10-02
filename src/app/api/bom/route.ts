import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jadwalMenu, menu, resepItem, bahan, sekolah } from "@/db/schema";
import { kalkulasiKebutuhanBOM } from "@/lib/bom";
import { eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tanggalStr =
      searchParams.get("tanggal") || new Date().toISOString().split("T")[0];

    // 1. Ambil total porsi target dari seluruh sekolah aktif
    const [porsiAgg] = await db
      .select({
        totalPorsi: sql<number>`COALESCE(SUM(${sekolah.jumlahPorsiTarget}), 0)::int`,
      })
      .from(sekolah)
      .where(eq(sekolah.isActive, true));

    const totalPorsiSekolah = porsiAgg?.totalPorsi || 0;

    // 2. Ambil jadwal menu pada tanggal yang dipilih
    const [jadwal] = await db
      .select({
        jadwalId: jadwalMenu.id,
        tanggal: jadwalMenu.tanggal,
        menuId: jadwalMenu.menuId,
        menuNama: menu.namaMenu,
        statusProduksi: jadwalMenu.statusProduksi,
      })
      .from(jadwalMenu)
      .innerJoin(menu, eq(jadwalMenu.menuId, menu.id))
      .where(eq(jadwalMenu.tanggal, tanggalStr))
      .limit(1);

    if (!jadwal) {
      return NextResponse.json({
        tanggal: tanggalStr,
        jadwal: null,
        totalPorsi: totalPorsiSekolah,
        kebutuhanBahan: [],
        message: "Belum ada menu yang dijadwalkan pada tanggal ini.",
      });
    }

    // 3. Ambil resep item beserta saldo stok bahan saat ini
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

    const kebutuhanBahan = kalkulasiKebutuhanBOM(
      itemsResep.map((item) => ({
        bahanId: item.bahanId,
        namaBahan: item.namaBahan,
        satuanStandar: item.satuanStandar,
        jumlahPerPorsi: Number(item.jumlahPerPorsi),
        stokSaatIni: Number(item.stokSaatIni),
      })),
      totalPorsiSekolah
    );

    return NextResponse.json({
      tanggal: tanggalStr,
      jadwal,
      totalPorsi: totalPorsiSekolah,
      kebutuhanBahan,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal mengkalkulasi BOM." },
      { status: 500 }
    );
  }
}
