import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  distribusiPengiriman,
  serahTerimaSekolah,
  armada,
  jadwalMenu,
} from "@/db/schema";
import { distribusiPengirimanSchema } from "@/lib/validators";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const listDistribusi = await db.query.distribusiPengiriman.findMany({
      orderBy: [desc(distribusiPengiriman.createdAt)],
      with: {
        armada: true,
        driver: {
          columns: {
            id: true,
            nomorHp: true,
            email: true,
            role: true,
          },
        },
        jadwalMenu: {
          with: {
            menu: true,
          },
        },
        serahTerimaList: {
          with: {
            sekolah: true,
          },
        },
      },
    });

    return NextResponse.json({ daftarDistribusi: listDistribusi });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat daftar distribusi pengiriman." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = distribusiPengirimanSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Validasi distribusi pengiriman gagal.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { jadwalMenuId, armadaId, driverId, catatan, alokasiSekolah } = parsed.data;

    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const nomorSuratJalan = `SJ-MBG-${dateCode}-${randomSuffix}`;

    const result = await db.transaction(async (tx) => {
      // 1. Buat Header Surat Jalan Distribusi
      const [pengiriman] = await tx
        .insert(distribusiPengiriman)
        .values({
          nomorSuratJalan,
          jadwalMenuId,
          armadaId,
          driverId,
          status: "disiapkan",
          catatan,
        })
        .returning();

      // 2. Buat Alokasi Serah Terima per Sekolah
      const stItems = [];
      for (const alokasi of alokasiSekolah) {
        const [st] = await tx
          .insert(serahTerimaSekolah)
          .values({
            pengirimanId: pengiriman.id,
            sekolahId: alokasi.sekolahId,
            porsiKirim: alokasi.porsiKirim,
            statusSerahTerima: "pending",
          })
          .returning();
        stItems.push(st);
      }

      // Update status armada menjadi beroperasi
      await tx
        .update(armada)
        .set({ status: "beroperasi" })
        .where(eq(armada.id, armadaId));

      return { pengiriman, serahTerima: stItems };
    });

    return NextResponse.json(
      {
        message: "Surat jalan distribusi berhasil diterbitkan.",
        distribusi: result.pengiriman,
        serahTerima: result.serahTerima,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal membuat surat jalan distribusi." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !["disiapkan", "dalam_perjalanan", "selesai", "batal"].includes(status)) {
      return NextResponse.json({ error: "Status distribusi tidak valid." }, { status: 400 });
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const updatePayload: Record<string, unknown> = { status };
    if (status === "dalam_perjalanan") {
      updatePayload.jamBerangkat = timeStr;
    } else if (status === "selesai") {
      updatePayload.jamSelesai = timeStr;
    }

    const [updated] = await db
      .update(distribusiPengiriman)
      .set(updatePayload)
      .where(eq(distribusiPengiriman.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Distribusi tidak ditemukan." }, { status: 404 });
    }

    // Jika selesai atau batal, kembalikan status armada ke tersedia
    if (status === "selesai" || status === "batal") {
      if (updated.armadaId) {
        await db
          .update(armada)
          .set({ status: "tersedia" })
          .where(eq(armada.id, updated.armadaId));
      }
    }

    return NextResponse.json({
      message: "Status distribusi pengiriman berhasil diperbarui.",
      distribusi: updated,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memperbarui status pengiriman." },
      { status: 500 }
    );
  }
}
