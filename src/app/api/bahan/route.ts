import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bahan, stokMutasi } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const listBahan = await db.select().from(bahan).orderBy(desc(bahan.createdAt));
    return NextResponse.json({ daftarBahan: listBahan });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat master bahan." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: Restock Bahan yang sudah ada
    if (action === "restock") {
      const { bahanId, jumlah, keterangan } = body;

      if (!bahanId || !jumlah || Number(jumlah) <= 0) {
        return NextResponse.json(
          { error: "Pilih bahan dan masukkan jumlah restock yang valid." },
          { status: 400 }
        );
      }

      const [targetBahan] = await db
        .select()
        .from(bahan)
        .where(eq(bahan.id, bahanId))
        .limit(1);

      if (!targetBahan) {
        return NextResponse.json(
          { error: "Bahan tidak ditemukan." },
          { status: 404 }
        );
      }

      const saldoAwal = Number(targetBahan.stokSaatIni);
      const penambahan = Number(jumlah);
      const saldoAkhir = Number((saldoAwal + penambahan).toFixed(3));

      await db.transaction(async (tx) => {
        // Update saldo stok bahan
        await tx
          .update(bahan)
          .set({ stokSaatIni: String(saldoAkhir) })
          .where(eq(bahan.id, bahanId));

        // Catat mutasi masuk
        await tx.insert(stokMutasi).values({
          bahanId,
          jenis: "masuk",
          jumlah: String(penambahan),
          saldoSebelumnya: String(saldoAwal),
          saldoSetelahnya: String(saldoAkhir),
          keterangan: keterangan || `Restock pengadaan masuk (${penambahan} ${targetBahan.satuanStandar})`,
        });
      });

      return NextResponse.json({
        success: true,
        message: `Stok ${targetBahan.namaBahan} berhasil ditambah ${penambahan} ${targetBahan.satuanStandar}. Saldo baru: ${saldoAkhir} ${targetBahan.satuanStandar}.`,
      });
    }

    // Action 2: Tambah Master Bahan Baru
    if (action === "tambah_master") {
      const { kodeBahan, namaBahan, kategori, satuanStandar, stokAwal, stokMinimum } = body;

      if (!kodeBahan || !namaBahan || !kategori || !satuanStandar) {
        return NextResponse.json(
          { error: "Kode, nama bahan, kategori, dan satuan wajib diisi." },
          { status: 400 }
        );
      }

      const [newBahan] = await db
        .insert(bahan)
        .values({
          kodeBahan,
          namaBahan,
          kategori,
          satuanStandar,
          stokSaatIni: String(stokAwal || 0),
          stokMinimum: String(stokMinimum || 0),
        })
        .returning();

      return NextResponse.json(
        {
          success: true,
          message: `Master bahan ${namaBahan} berhasil ditambahkan.`,
          data: newBahan,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Aksi tidak dikenali. Gunakan 'restock' atau 'tambah_master'." },
      { status: 400 }
    );
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === "23505") {
      return NextResponse.json(
        { error: "Kode bahan sudah digunakan. Gunakan kode lain." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: err?.message || "Gagal memproses master bahan." },
      { status: 500 }
    );
  }
}
