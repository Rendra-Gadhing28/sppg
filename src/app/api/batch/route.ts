import { NextResponse } from "next/server";
import { db } from "@/db";
import { stokBatch } from "@/db/schema";
import { evaluasiStatusExpiry } from "@/lib/fefo";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const listBatch = await db.query.stokBatch.findMany({
      where: eq(stokBatch.statusBatch, "aktif"),
      orderBy: [asc(stokBatch.tanggalExpired)],
      with: {
        bahan: true,
      },
    });

    const enriched = listBatch.map((b) => {
      const expEval = evaluasiStatusExpiry(b.tanggalExpired);
      return {
        ...b,
        statusExpiry: expEval.status,
        sisaHari: expEval.sisaHari,
      };
    });

    return NextResponse.json({ daftarBatch: enriched });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat daftar batch stok." },
      { status: 500 }
    );
  }
}
