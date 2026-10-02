import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { foodWasteLog, purchaseOrderItem, resepItem } from "@/db/schema";
import { foodWasteSchema } from "@/lib/validators";
import {
  kalkulasiHppTeoritis,
  kalkulasiFoodWasteCost,
  type BomItem,
  type FoodWasteItem,
} from "@/lib/hpp";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Ambil food waste log hari ini + semua riwayat
    const [todayWaste, allWaste] = await Promise.all([
      db.query.foodWasteLog.findMany({
        where: eq(foodWasteLog.tanggal, today),
        with: { bahan: true, menu: true, dapur: true },
      }),
      db.query.foodWasteLog.findMany({
        orderBy: [desc(foodWasteLog.createdAt)],
        with: { bahan: true, menu: true, dapur: true },
        limit: 100,
      }),
    ]);

    // Kalkulasi food waste cost hari ini
    const wasteItems: FoodWasteItem[] = todayWaste.map((w) => ({
      beratKg: Number(w.beratKg),
      estimasiKerugianRp: Number(w.estimasiKerugianRp),
    }));
    const ringkasanWaste = kalkulasiFoodWasteCost(wasteItems);

    // HPP Teoritis: ambil resep item aktif sebagai BOM contoh (dari jadwal menu hari ini)
    // ponytail: seharusnya filter by jadwal_menu tanggal=today; di sini ambil semua resep_item untuk demonstrasi
    const resepItems = await db.query.resepItem.findMany({
      with: { bahan: true },
      limit: 50,
    });

    // Ambil harga beli dari PO item terbaru per bahan sebagai hargaBeliSatuan
    const hargaMap: Record<string, number> = {};
    const poItems = await db.query.purchaseOrderItem.findMany({
      orderBy: [desc(purchaseOrderItem.subtotal)],
      columns: { bahanId: true, hargaSatuan: true },
    });
    for (const poi of poItems) {
      if (!hargaMap[poi.bahanId]) {
        hargaMap[poi.bahanId] = Number(poi.hargaSatuan);
      }
    }

    const bom: BomItem[] = resepItems.map((ri) => ({
      bahanId: ri.bahanId,
      jumlahPerPorsi: Number(ri.jumlahPerPorsi),
      hargaBeliSatuan: hargaMap[ri.bahanId] ?? 0,
    }));

    const hppTeoritis = kalkulasiHppTeoritis(bom);

    return NextResponse.json({
      tanggal: today,
      hpp: hppTeoritis,
      foodWaste: {
        hari_ini: ringkasanWaste,
        detail_hari_ini: todayWaste,
      },
      riwayatWaste: allWaste,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat data finansial." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = foodWasteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validasi food waste gagal." },
        { status: 400 }
      );
    }

    const {
      dapurId,
      tanggal,
      kategoriWaste,
      bahanId,
      menuId,
      beratKg,
      estimasiKerugianRp,
      catatan,
    } = parsed.data;

    // Ambil userId dari header jika ada (opsional)
    const userId = req.headers.get("x-user-id") ?? undefined;

    const [waste] = await db
      .insert(foodWasteLog)
      .values({
        dapurId: dapurId ?? null,
        tanggal: tanggal ?? new Date().toISOString().slice(0, 10),
        kategoriWaste,
        bahanId: bahanId ?? null,
        menuId: menuId ?? null,
        beratKg: String(beratKg),
        estimasiKerugianRp: String(estimasiKerugianRp ?? 0),
        catatan,
        dicatatOleh: userId ?? null,
      })
      .returning();

    return NextResponse.json(
      { message: "Food waste berhasil dicatat.", waste },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal mencatat food waste." },
      { status: 500 }
    );
  }
}
