import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { waMessageLogs } from "@/db/schema";
import { waMessageSchema } from "@/lib/validators";
import { kirimPesanWaQueue } from "@/lib/whatsapp";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const logs = await db.query.waMessageLogs.findMany({
      orderBy: [desc(waMessageLogs.createdAt)],
    });

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat riwayat pesan WhatsApp." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = waMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validasi pesan WA gagal." },
        { status: 400 }
      );
    }

    const { nomorTujuan, tipePesan, payloadPesan } = parsed.data;

    // Enqueue via service (mock)
    const result = await kirimPesanWaQueue({ nomorTujuan, tipePesan, payloadPesan });

    if (!result.success || !result.payload) {
      return NextResponse.json(
        { error: result.error || "Gagal mengantrean pesan WA." },
        { status: 400 }
      );
    }

    // Simpan log ke DB
    const [log] = await db
      .insert(waMessageLogs)
      .values({
        nomorTujuan: result.payload.nomorTujuanNormalized,
        tipePesan,
        payloadPesan,
        status: "queued",
      })
      .returning();

    return NextResponse.json(
      { message: "Pesan WhatsApp berhasil diantrean.", log },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal mengirim pesan WhatsApp." },
      { status: 500 }
    );
  }
}
