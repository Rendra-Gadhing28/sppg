import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sekolah } from "@/db/schema";
import { sekolahSchema } from "@/lib/validators";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(sekolah).orderBy(desc(sekolah.createdAt));
    return NextResponse.json({ daftarSekolah: list });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat data sekolah." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // Validasi & Sanitasi Zod
    const parsed = sekolahSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parsed.data;

    const [newSekolah] = await db
      .insert(sekolah)
      .values({
        namaSekolah: data.namaSekolah,
        alamat: data.alamat,
        jumlahPorsiTarget: data.jumlahPorsiTarget,
        picNama: data.picNama,
        picKontak: data.picKontak,
        jamMakan: data.jamMakan,
        latitude: data.latitude ? String(data.latitude) : null,
        longitude: data.longitude ? String(data.longitude) : null,
        catatanAlergi: data.catatanAlergi,
        isActive: true,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: `Sekolah ${data.namaSekolah} berhasil didaftarkan.`,
        data: newSekolah,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal menyimpan data sekolah." },
      { status: 500 }
    );
  }
}
