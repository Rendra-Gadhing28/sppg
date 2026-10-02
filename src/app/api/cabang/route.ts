import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dapurCabang, transferStokCabang } from "@/db/schema";
import { dapurCabangSchema, transferStokSchema } from "@/lib/validators";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const [cabangList, transferList] = await Promise.all([
      db.query.dapurCabang.findMany({
        orderBy: [desc(dapurCabang.createdAt)],
      }),
      db.query.transferStokCabang.findMany({
        orderBy: [desc(transferStokCabang.createdAt)],
        with: {
          dapurAsal: true,
          dapurTujuan: true,
          bahan: true,
          batch: true,
          creator: {
            columns: { id: true, nomorHp: true, email: true, role: true },
          },
        },
      }),
    ]);

    return NextResponse.json({ cabang: cabangList, riwayatTransfer: transferList });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat data cabang." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "transfer_stok") {
      // Ajukan transfer stok antar cabang
      const parsed = transferStokSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Validasi transfer stok gagal." },
          { status: 400 }
        );
      }

      const { dapurAsalId, dapurTujuanId, bahanId, batchId, jumlah, catatan } = parsed.data;

      if (dapurAsalId === dapurTujuanId) {
        return NextResponse.json(
          { error: "Dapur asal dan tujuan tidak boleh sama." },
          { status: 400 }
        );
      }

      const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const suffix = Math.floor(1000 + Math.random() * 9000);
      const nomorTransfer = `TRF-${dateCode}-${suffix}`;

      const [transfer] = await db
        .insert(transferStokCabang)
        .values({
          nomorTransfer,
          dapurAsalId,
          dapurTujuanId,
          bahanId,
          batchId,
          jumlah: String(jumlah),
          status: "diajukan",
          catatan,
        })
        .returning();

      return NextResponse.json(
        { message: "Transfer stok berhasil diajukan.", transfer },
        { status: 201 }
      );
    }

    // Default: buat dapur cabang baru
    const parsed = dapurCabangSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validasi data dapur cabang gagal." },
        { status: 400 }
      );
    }

    const { kodeDapur, namaDapur, tipeDapur, alamat, latitude, longitude, radiusMeter, kapasitasMaksPorsi } =
      parsed.data;

    const [cabang] = await db
      .insert(dapurCabang)
      .values({
        kodeDapur,
        namaDapur,
        tipeDapur,
        alamat,
        latitude: latitude != null ? String(latitude) : null,
        longitude: longitude != null ? String(longitude) : null,
        radiusMeter,
        kapasitasMaksPorsi,
      })
      .returning();

    return NextResponse.json(
      { message: "Dapur cabang berhasil ditambahkan.", cabang },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memproses permintaan cabang." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !["dalam_perjalanan", "diterima", "batal"].includes(status)) {
      return NextResponse.json(
        { error: "Status transfer tidak valid. Pilih: dalam_perjalanan, diterima, batal." },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = { status };
    if (status === "dalam_perjalanan") {
      updatePayload.dikirimPada = new Date();
    } else if (status === "diterima") {
      updatePayload.diterimaPada = new Date();
    }

    const [updated] = await db
      .update(transferStokCabang)
      .set(updatePayload)
      .where(eq(transferStokCabang.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Transfer stok tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Status transfer stok berhasil diperbarui.",
      transfer: updated,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memperbarui status transfer." },
      { status: 500 }
    );
  }
}
