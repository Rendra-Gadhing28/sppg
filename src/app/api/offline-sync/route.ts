import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { offlineSyncJournal } from "@/db/schema";
import { offlineSyncBatchSchema } from "@/lib/validators";
import { filterValidMutasi } from "@/lib/offline-sync";
import { inArray } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = offlineSyncBatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validasi batch offline sync gagal." },
        { status: 400 }
      );
    }

    const { mutasi } = parsed.data;
    const keys = mutasi.map((m) => m.idempotencyKey);

    // Cek idempotencyKey yang sudah ada di DB
    const existing = await db.query.offlineSyncJournal.findMany({
      where: inArray(offlineSyncJournal.idempotencyKey, keys),
      columns: { idempotencyKey: true },
    });
    const existingKeySet = new Set(existing.map((e) => e.idempotencyKey));

    // Filter valid, skip duplikat & invalid
    const { toProcess, skipped } = filterValidMutasi(
      mutasi as Parameters<typeof filterValidMutasi>[0],
      existingKeySet
    );

    if (toProcess.length === 0) {
      return NextResponse.json({
        message: "Semua mutasi telah diproses sebelumnya atau tidak valid.",
        processed: 0,
        skipped,
      });
    }

    // Simpan batch yang lolos ke journal
    const inserted = await db
      .insert(offlineSyncJournal)
      .values(
        toProcess.map((m) => ({
          idempotencyKey: m.idempotencyKey,
          userId: m.userId,
          entitasTarget: m.entitasTarget,
          clientRecordedAt: new Date(m.clientRecordedAt),
          payloadJson: m.payloadJson,
          syncStatus: "synced" as const,
        }))
      )
      .returning({ id: offlineSyncJournal.id, idempotencyKey: offlineSyncJournal.idempotencyKey });

    return NextResponse.json(
      {
        message: `${inserted.length} mutasi offline berhasil disinkronisasi.`,
        processed: inserted.length,
        processedKeys: inserted.map((i) => i.idempotencyKey),
        skipped,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memproses sync offline." },
      { status: 500 }
    );
  }
}
