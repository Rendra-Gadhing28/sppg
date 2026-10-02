import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { serahTerimaSekolah, distribusiPengiriman, armada } from "@/db/schema";
import { serahTerimaSekolahSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = serahTerimaSekolahSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg =
        parsed.error.issues[0]?.message || "Validasi data serah terima sekolah gagal.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const {
      serahTerimaId,
      porsiDiterima,
      namaPenerimaSekolah,
      kontakPenerimaSekolah,
      fotoSerahTerimaUrl,
      ttdDigitalUrl,
      kondisiMakanan,
      catatan,
    } = parsed.data;

    const [targetST] = await db
      .select()
      .from(serahTerimaSekolah)
      .where(eq(serahTerimaSekolah.id, serahTerimaId))
      .limit(1);

    if (!targetST) {
      return NextResponse.json(
        { error: "Data serah terima sekolah tidak ditemukan." },
        { status: 404 }
      );
    }

    const result = await db.transaction(async (tx) => {
      // 1. Update data serah terima sekolah
      const [updatedST] = await tx
        .update(serahTerimaSekolah)
        .set({
          porsiDiterima,
          namaPenerimaSekolah,
          kontakPenerimaSekolah,
          fotoSerahTerimaUrl,
          ttdDigitalUrl,
          kondisiMakanan,
          statusSerahTerima: "diterima",
          waktuDiterima: new Date(),
          catatan,
        })
        .where(eq(serahTerimaSekolah.id, serahTerimaId))
        .returning();

      // 2. Cek apakah semua sekolah dalam rute pengiriman ini sudah selesai
      const allST = await tx
        .select()
        .from(serahTerimaSekolah)
        .where(eq(serahTerimaSekolah.pengirimanId, targetST.pengirimanId));

      const isSemuaDiterima = allST.every(
        (item) => item.id === serahTerimaId || item.statusSerahTerima === "diterima"
      );

      if (isSemuaDiterima) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

        const [dist] = await tx
          .update(distribusiPengiriman)
          .set({
            status: "selesai",
            jamSelesai: timeStr,
          })
          .where(eq(distribusiPengiriman.id, targetST.pengirimanId))
          .returning();

        if (dist?.armadaId) {
          await tx
            .update(armada)
            .set({ status: "tersedia" })
            .where(eq(armada.id, dist.armadaId));
        }
      }

      return updatedST;
    });

    return NextResponse.json({
      message: "Bukti serah terima makanan bergizi berhasil dicatat.",
      serahTerima: result,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal mencatat serah terima makanan." },
      { status: 500 }
    );
  }
}
