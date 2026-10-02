import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiMenuPreset } from "@/db/schema";
import { aiMenuGenerateSchema, aiMenuPresetSchema } from "@/lib/validators";
import { generateMenuCycle, generateMenuCycleWithAI, STANDAR_AKG } from "@/lib/ai-planner";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const presets = await db.query.aiMenuPreset.findMany({
      orderBy: [desc(aiMenuPreset.createdAt)],
      with: {
        approver: {
          columns: { id: true, nomorHp: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({
      presets,
      standarAkg: STANDAR_AKG,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat preset AI menu." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: Generate AI Menu Cycle
    if (action === "generate") {
      const parsed = aiMenuGenerateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Validasi parameter generator gagal." },
          { status: 400 }
        );
      }

      const { targetJenjang, hariSiklus, maxHppPerPorsi, pantangAlergen } = parsed.data;

      const hasil = await generateMenuCycleWithAI(
        targetJenjang,
        hariSiklus,
        maxHppPerPorsi,
        pantangAlergen
      );

      return NextResponse.json({ hasil });
    }

    // Action 2: Simpan Preset AI Menu
    const parsed = aiMenuPresetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validasi preset menu gagal." },
        { status: 400 }
      );
    }

    const {
      namaPaketSiklus,
      targetJenjang,
      targetKaloriMin,
      targetKaloriMax,
      estimasiHppRataRata,
      rekomendasiMenuJson,
      statusApproval,
    } = parsed.data;

    const [preset] = await db
      .insert(aiMenuPreset)
      .values({
        namaPaketSiklus,
        targetJenjang,
        targetKaloriMin: String(targetKaloriMin),
        targetKaloriMax: String(targetKaloriMax),
        estimasiHppRataRata: String(estimasiHppRataRata),
        rekomendasiMenuJson,
        statusApproval: statusApproval || "draft",
      })
      .returning();

    return NextResponse.json(
      { message: "Preset menu AI berhasil disimpan.", preset },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memproses menu AI." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, statusApproval } = body;

    if (!id || !["disetujui", "ditolak", "draft"].includes(statusApproval)) {
      return NextResponse.json(
        { error: "Status approval tidak valid. Pilih: draft, disetujui, ditolak." },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id") ?? undefined;

    const [updated] = await db
      .update(aiMenuPreset)
      .set({
        statusApproval,
        approvedBy: statusApproval === "disetujui" ? userId : null,
        approvedAt: statusApproval === "disetujui" ? new Date() : null,
      })
      .where(eq(aiMenuPreset.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Preset tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      message: `Status approval preset diperbarui menjadi ${statusApproval}.`,
      preset: updated,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memperbarui status preset." },
      { status: 500 }
    );
  }
}
