import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { anggota, jadwalShift, shiftKerja } from "@/db/schema";
import { anggotaSchema } from "@/lib/validators";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select({
        id: anggota.id,
        nik: anggota.nik,
        namaLengkap: anggota.namaLengkap,
        jabatan: anggota.jabatan,
        nomorHp: anggota.nomorHp,
        fotoUrl: anggota.fotoUrl,
        fotoTanganUrl: anggota.fotoTanganUrl,
        statusAktif: anggota.statusAktif,
        createdAt: anggota.createdAt,
        hasFaceEmbedding: sql<boolean>`case when ${anggota.faceEmbedding} is not null then true else false end`,
      })
      .from(anggota)
      .orderBy(desc(anggota.createdAt));

    const shifts = await db.select().from(shiftKerja);

    return NextResponse.json({ daftarAnggota: list, shifts });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat data anggota." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // Validasi & Sanitasi Zod
    const parsed = anggotaSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Input tidak valid.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parsed.data;

    const newAnggota = await db.transaction(async (tx) => {
      const [record] = await tx
        .insert(anggota)
        .values({
          nik: data.nik,
          namaLengkap: data.namaLengkap,
          jabatan: data.jabatan,
          nomorHp: data.nomorHp || null,
          fotoUrl: data.fotoUrl || null,
          fotoTanganUrl: data.fotoTanganUrl || null,
          faceEmbedding: data.faceEmbedding || null,
          statusAktif: true,
        })
        .returning();

      // Jika shift dipilih, jadwalkan otomatis ke semua hari kerja (1-7)
      if (data.shiftId) {
        for (let hari = 1; hari <= 7; hari++) {
          await tx
            .insert(jadwalShift)
            .values({
              anggotaId: record.id,
              shiftId: data.shiftId,
              hariKe: hari,
            })
            .onConflictDoNothing();
        }
      }

      return record;
    });

    return NextResponse.json(
      {
        success: true,
        message: `Anggota ${data.namaLengkap} (${data.jabatan}) berhasil didaftarkan.`,
        data: newAnggota,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === "23505") {
      return NextResponse.json(
        { error: "NIK tersebut sudah terdaftar pada sistem." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: err?.message || "Gagal menyimpan data anggota." },
      { status: 500 }
    );
  }
}
