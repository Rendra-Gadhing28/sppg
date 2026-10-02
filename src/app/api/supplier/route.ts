import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supplier } from "@/db/schema";
import { supplierSchema } from "@/lib/validators";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const listSupplier = await db
      .select()
      .from(supplier)
      .where(eq(supplier.isActive, true))
      .orderBy(desc(supplier.createdAt));

    return NextResponse.json({ daftarSupplier: listSupplier });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat daftar supplier." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = supplierSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Validasi data supplier gagal.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { kodeSupplier, namaSupplier, kategoriPasokan, kontakPerson, nomorHp, alamat } =
      parsed.data;

    // Cek duplikasi kode supplier
    const [existing] = await db
      .select({ id: supplier.id })
      .from(supplier)
      .where(eq(supplier.kodeSupplier, kodeSupplier))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: `Kode supplier ${kodeSupplier} sudah digunakan.` },
        { status: 400 }
      );
    }

    const [newSupplier] = await db
      .insert(supplier)
      .values({
        kodeSupplier,
        namaSupplier,
        kategoriPasokan,
        kontakPerson,
        nomorHp,
        alamat,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Supplier berhasil ditambahkan.",
        supplier: newSupplier,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal menambahkan data supplier." },
      { status: 500 }
    );
  }
}
