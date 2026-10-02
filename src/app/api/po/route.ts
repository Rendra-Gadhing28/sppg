import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { purchaseOrder, purchaseOrderItem, supplier, bahan } from "@/db/schema";
import { purchaseOrderSchema } from "@/lib/validators";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const listPO = await db.query.purchaseOrder.findMany({
      orderBy: [desc(purchaseOrder.createdAt)],
      with: {
        supplier: true,
        items: {
          with: {
            bahan: true,
          },
        },
        qcList: true,
      },
    });

    return NextResponse.json({ daftarPO: listPO });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat data Purchase Order." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = purchaseOrderSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Validasi PO gagal.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { supplierId, targetPengiriman, catatan, items } = parsed.data;

    const [targetSupplier] = await db
      .select()
      .from(supplier)
      .where(eq(supplier.id, supplierId))
      .limit(1);

    if (!targetSupplier) {
      return NextResponse.json({ error: "Supplier tidak ditemukan." }, { status: 404 });
    }

    // Hitung total nilai PO
    let totalBiaya = 0;
    const computedItems = items.map((item) => {
      const sub = Number((item.jumlahPesan * item.hargaSatuan).toFixed(2));
      totalBiaya += sub;
      return {
        bahanId: item.bahanId,
        jumlahPesan: String(item.jumlahPesan),
        hargaSatuan: String(item.hargaSatuan),
        subtotal: String(sub),
      };
    });

    const now = new Date();
    const dateCode = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const nomorPo = `PO-MBG-${dateCode}-${randomSuffix}`;

    const newPO = await db.transaction(async (tx) => {
      const [createdPo] = await tx
        .insert(purchaseOrder)
        .values({
          nomorPo,
          supplierId,
          targetPengiriman,
          status: "diajukan",
          totalBiaya: String(totalBiaya.toFixed(2)),
          catatan,
        })
        .returning();

      for (const item of computedItems) {
        await tx.insert(purchaseOrderItem).values({
          poId: createdPo.id,
          bahanId: item.bahanId,
          jumlahPesan: item.jumlahPesan,
          hargaSatuan: item.hargaSatuan,
          subtotal: item.subtotal,
        });
      }

      return createdPo;
    });

    return NextResponse.json(
      {
        message: "Purchase Order berhasil diterbitkan.",
        po: newPO,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal membuat Purchase Order." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !["draft", "diajukan", "dikirim", "batal"].includes(status)) {
      return NextResponse.json({ error: "Data status PO tidak valid." }, { status: 400 });
    }

    const [updated] = await db
      .update(purchaseOrder)
      .set({ status })
      .where(eq(purchaseOrder.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "PO tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ message: "Status PO berhasil diperbarui.", po: updated });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memperbarui status PO." },
      { status: 500 }
    );
  }
}
