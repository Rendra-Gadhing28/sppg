import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { armada } from "@/db/schema";
import { armadaSchema } from "@/lib/validators";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const listArmada = await db
      .select()
      .from(armada)
      .orderBy(desc(armada.createdAt));

    return NextResponse.json({ daftarArmada: listArmada });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat armada." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = armadaSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Validasi data armada gagal.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { nomorKendaraan, jenisKendaraan, kapasitasPorsi } = parsed.data;

    const [existing] = await db
      .select({ id: armada.id })
      .from(armada)
      .where(eq(armada.nomorKendaraan, nomorKendaraan))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: `Nomor kendaraan ${nomorKendaraan} sudah terdaftar.` },
        { status: 400 }
      );
    }

    const [newArmada] = await db
      .insert(armada)
      .values({
        nomorKendaraan,
        jenisKendaraan,
        kapasitasPorsi,
        status: "tersedia",
      })
      .returning();

    return NextResponse.json(
      { message: "Armada berhasil didaftarkan.", armada: newArmada },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal mendaftarkan armada." },
      { status: 500 }
    );
  }
}
