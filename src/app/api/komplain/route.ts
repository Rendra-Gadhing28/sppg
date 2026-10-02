import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { komplainSekolah } from "@/db/schema";
import { komplainSekolahSchema, komplainUpdateSchema } from "@/lib/validators";
import { eq, desc } from "drizzle-orm";

function generateNomorTiket(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `TIK-${dateStr}-${seq}`;
}

export async function GET() {
  try {
    const tikets = await db.query.komplainSekolah.findMany({
      orderBy: [desc(komplainSekolah.createdAt)],
      with: {
        sekolah: true,
        pengiriman: true,
        penyelesai: {
          columns: { id: true, nomorHp: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({ tikets });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat daftar komplain." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = komplainSekolahSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validasi komplain gagal." },
        { status: 400 }
      );
    }

    const { sekolahId, pengirimanId, kategoriKendala, deskripsi, fotoBuktiUrl } = parsed.data;

    const nomorTiket = generateNomorTiket();

    const [tiket] = await db
      .insert(komplainSekolah)
      .values({
        nomorTiket,
        sekolahId,
        pengirimanId: pengirimanId ?? null,
        kategoriKendala,
        deskripsi,
        fotoBuktiUrl: fotoBuktiUrl ?? null,
        status: "baru",
      })
      .returning();

    return NextResponse.json(
      { message: "Tiket komplain berhasil diajukan.", tiket },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal mengajukan tiket komplain." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = komplainUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validasi update komplain gagal." },
        { status: 400 }
      );
    }

    const { id, status, catatanInvestigasi, tindakanPerbaikan } = parsed.data;

    const userId = req.headers.get("x-user-id") ?? undefined;

    const updatePayload: Record<string, unknown> = { status };
    if (catatanInvestigasi !== undefined) updatePayload.catatanInvestigasi = catatanInvestigasi;
    if (tindakanPerbaikan !== undefined) updatePayload.tindakanPerbaikan = tindakanPerbaikan;

    if (status === "selesai" || status === "ditutup") {
      updatePayload.diselesaikanPada = new Date();
      if (userId) updatePayload.diselesaikanOleh = userId;
    }

    const [updated] = await db
      .update(komplainSekolah)
      .set(updatePayload)
      .where(eq(komplainSekolah.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Status tiket komplain berhasil diperbarui.",
      tiket: updated,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memperbarui tiket komplain." },
      { status: 500 }
    );
  }
}
