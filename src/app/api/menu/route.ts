import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { menu, resepItem, bahan } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const daftarMenu = await db
      .select()
      .from(menu)
      .orderBy(desc(menu.createdAt));

    const resepItems = await db
      .select({
        id: resepItem.id,
        menuId: resepItem.menuId,
        bahanId: resepItem.bahanId,
        namaBahan: bahan.namaBahan,
        jumlahPerPorsi: resepItem.jumlahPerPorsi,
        satuan: resepItem.satuan,
      })
      .from(resepItem)
      .innerJoin(bahan, eq(resepItem.bahanId, bahan.id));

    const menuLengkap = daftarMenu.map((m) => ({
      ...m,
      resep: resepItems.filter((r) => r.menuId === m.id),
    }));

    return NextResponse.json({ daftarMenu: menuLengkap });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat daftar menu." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      namaMenu,
      deskripsi,
      totalKalori,
      proteinGram,
      lemakGram,
      karboGram,
      isApprovedGizi,
      resep, // array of { bahanId, jumlahPerPorsi, satuan }
    } = body;

    if (!namaMenu) {
      return NextResponse.json(
        { error: "Nama menu wajib diisi." },
        { status: 400 }
      );
    }

    // Insert menu & resep dalam transaksi
    const hasil = await db.transaction(async (tx) => {
      const [newMenu] = await tx
        .insert(menu)
        .values({
          namaMenu,
          deskripsi: deskripsi || null,
          totalKalori: String(totalKalori || 0),
          proteinGram: String(proteinGram || 0),
          lemakGram: String(lemakGram || 0),
          karboGram: String(karboGram || 0),
          isApprovedGizi: isApprovedGizi ?? true,
        })
        .returning();

      if (Array.isArray(resep) && resep.length > 0) {
        for (const item of resep) {
          if (item.bahanId && item.jumlahPerPorsi > 0) {
            await tx.insert(resepItem).values({
              menuId: newMenu.id,
              bahanId: item.bahanId,
              jumlahPerPorsi: String(item.jumlahPerPorsi),
              satuan: item.satuan || "kg",
            });
          }
        }
      }

      return newMenu;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Menu & resep (BOM) berhasil ditambahkan.",
        data: hasil,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal menyimpan menu baru." },
      { status: 500 }
    );
  }
}
