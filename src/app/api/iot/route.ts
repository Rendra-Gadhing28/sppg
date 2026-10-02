import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { iotSensorDevice, iotTelemetriSuhu } from "@/db/schema";
import { iotSensorDeviceSchema, iotTelemetriSchema } from "@/lib/validators";
import { evaluasiSuhuHaccp, hitungSkorKepatuhanHaccp } from "@/lib/iot-haccp";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const devices = await db.query.iotSensorDevice.findMany({
      orderBy: [desc(iotSensorDevice.createdAt)],
      with: {
        dapur: true,
        armada: true,
        telemetriList: {
          orderBy: [desc(iotTelemetriSuhu.waktuRekam)],
          limit: 10,
        },
      },
    });

    // Ambil 100 telemetri terakhir untuk kalkulasi skor kepatuhan agregat
    const recentTelemetri = await db.query.iotTelemetriSuhu.findMany({
      orderBy: [desc(iotTelemetriSuhu.waktuRekam)],
      limit: 100,
    });

    const skorKepatuhan = hitungSkorKepatuhanHaccp(
      recentTelemetri.map((t) => ({
        suhuCelsius: Number(t.suhuCelsius),
        isAnomaliHaccp: t.isAnomaliHaccp,
      }))
    );

    return NextResponse.json({
      devices,
      skorKepatuhan,
      totalLogTelemetri: recentTelemetri.length,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat data IoT Cold-Chain." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: Register Device Sensor Baru
    if (action === "register_device") {
      const parsed = iotSensorDeviceSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Validasi alat sensor gagal." },
          { status: 400 }
        );
      }

      const { kodeAlat, tipePenempatan, dapurId, armadaId, ambangSuhuMin, ambangSuhuMax, statusAktif } =
        parsed.data;

      const [device] = await db
        .insert(iotSensorDevice)
        .values({
          kodeAlat,
          tipePenempatan,
          dapurId: dapurId ?? null,
          armadaId: armadaId ?? null,
          ambangSuhuMin: String(ambangSuhuMin),
          ambangSuhuMax: String(ambangSuhuMax),
          statusAktif: statusAktif ?? true,
        })
        .returning();

      return NextResponse.json(
        { message: "Sensor IoT berhasil didaftarkan.", device },
        { status: 201 }
      );
    }

    // Action 2: Ingest Data Telemetri Suhu
    const parsed = iotTelemetriSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validasi data telemetri gagal." },
        { status: 400 }
      );
    }

    const { deviceId, suhuCelsius, kelembapanPersen, latitude, longitude } = parsed.data;

    // Ambil device untuk cek tipe penempatan
    const [device] = await db
      .select()
      .from(iotSensorDevice)
      .where(eq(iotSensorDevice.id, deviceId))
      .limit(1);

    if (!device) {
      return NextResponse.json({ error: "Device sensor tidak ditemukan." }, { status: 404 });
    }

    // Evaluasi batas HACCP
    const evalHaccp = evaluasiSuhuHaccp(device.tipePenempatan, suhuCelsius);

    const [telemetri] = await db
      .insert(iotTelemetriSuhu)
      .values({
        deviceId,
        suhuCelsius: String(suhuCelsius),
        kelembapanPersen: kelembapanPersen != null ? String(kelembapanPersen) : null,
        latitude: latitude != null ? String(latitude) : null,
        longitude: longitude != null ? String(longitude) : null,
        isAnomaliHaccp: evalHaccp.isAnomaliHaccp,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Data telemetri suhu berhasil dicatat.",
        evaluasiHaccp: evalHaccp,
        telemetri,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memproses telemetri IoT." },
      { status: 500 }
    );
  }
}
