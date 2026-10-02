import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  purchaseOrder,
  purchaseOrderItem,
  qcPenerimaan,
  stokBatch,
  bahan,
  stokMutasi,
} from "@/db/schema";
import { qcPenerimaanSchema } from "@/lib/validators";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const listQC = await db.query.qcPenerimaan.findMany({
      orderBy: [desc(qcPenerimaan.createdAt)],
      with: {
        purchaseOrder: {
          with: {
            supplier: true,
          },
        },
        batches: {
          with: {
            bahan: true,
          },
        },
      },
    });

    return NextResponse.json({ daftarQC: listQC });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat data QC penerimaan." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = qcPenerimaanSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Validasi QC penerimaan gagal.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { poId, status, catatanSuhu, catatanKebersihan, fotoBuktiUrl, items } = parsed.data;

    // Cek PO
    const [targetPo] = await db
      .select()
      .from(purchaseOrder)
      .where(eq(purchaseOrder.id, poId))
      .limit(1);

    if (!targetPo) {
      return NextResponse.json({ error: "PO tidak ditemukan." }, { status: 404 });
    }

    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const nomorQc = `QC-${dateCode}-${randomSuffix}`;

    const result = await db.transaction(async (tx) => {
      // 1. Simpan catatan QC
      const [qc] = await tx
        .insert(qcPenerimaan)
        .values({
          nomorQc,
          poId,
          status,
          catatanSuhu,
          catatanKebersihan,
          fotoBuktiUrl,
        })
        .returning();

      // Jika QC ditolak, tidak masukkan stok
      if (status === "ditolak") {
        return { qc, batches: [] };
      }

      const createdBatches = [];

      // 2. Loop setiap item yang diterima & lolos QC
      for (const item of items) {
        const [targetBahan] = await tx
          .select()
          .from(bahan)
          .where(eq(bahan.id, item.bahanId))
          .limit(1);

        if (!targetBahan) continue;

        const saldoAwal = Number(targetBahan.stokSaatIni);
        const masuk = Number(item.jumlahDiterima);
        const saldoAkhir = Number((saldoAwal + masuk).toFixed(3));

        // Tambah ke tabel stok_batch (FIFO/FEFO tracking)
        const [batch] = await tx
          .insert(stokBatch)
          .values({
            bahanId: item.bahanId,
            qcId: qc.id,
            nomorBatch: item.nomorBatch,
            tanggalExpired: item.tanggalExpired,
            jumlahAwal: String(masuk),
            jumlahSisa: String(masuk),
            statusBatch: "aktif",
          })
          .returning();

        createdBatches.push(batch);

        // Update saldo master bahan
        await tx
          .update(bahan)
          .set({ stokSaatIni: String(saldoAkhir) })
          .where(eq(bahan.id, item.bahanId));

        // Catat di ledger mutasi stok
        await tx.insert(stokMutasi).values({
          bahanId: item.bahanId,
          jenis: "masuk",
          jumlah: String(masuk),
          saldoSebelumnya: String(saldoAwal),
          saldoSetelahnya: String(saldoAkhir),
          referensiId: poId,
          keterangan: `QC Lolos Penerimaan ${targetPo.nomorPo} - Batch: ${item.nomorBatch} (Exp: ${item.tanggalExpired})`,
        });

        // Update jumlahDiterima di purchase_order_item jika ada
        await tx
          .update(purchaseOrderItem)
          .set({ jumlahDiterima: String(masuk) })
          .where(
            eq(purchaseOrderItem.poId, poId)
          );
      }

      // Update status PO menjadi diterima
      await tx
        .update(purchaseOrder)
        .set({ status: "diterima" })
        .where(eq(purchaseOrder.id, poId));

      return { qc, batches: createdBatches };
    });

    return NextResponse.json(
      {
        message:
          status === "ditolak"
            ? "Pemeriksaan QC selesai. Barang berstatus ditolak."
            : "QC Lolos. Batch baru dan stok bahan berhasil dicatat.",
        qc: result.qc,
        batches: result.batches,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memproses penerimaan QC." },
      { status: 500 }
    );
  }
}
