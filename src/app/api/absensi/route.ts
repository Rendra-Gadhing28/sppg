import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { absensi, konfigurasiDapur, jadwalShift, shiftKerja } from "@/db/schema";
import { cekDalamRadius } from "@/lib/geo";
import { evaluasiStatusMasuk, evaluasiStatusKeluar } from "@/lib/shift";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      anggotaId,
      jenis,
      latitude,
      longitude,
      fotoBuktiUrl,
      catatan,
    } = body;

    if (!anggotaId || !jenis || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "anggotaId, jenis, latitude, dan longitude wajib diisi." },
        { status: 400 }
      );
    }

    if (jenis !== "masuk" && jenis !== "keluar") {
      return NextResponse.json(
        { error: "Jenis absensi harus 'masuk' atau 'keluar'." },
        { status: 400 }
      );
    }

    // 1. Ambil config dapur (default ke titik acuan jika belum di-seed)
    const [dapur] = await db
      .select()
      .from(konfigurasiDapur)
      .where(eq(konfigurasiDapur.id, 1))
      .limit(1);

    const dapurLat = dapur ? Number(dapur.latitude) : -6.2;
    const dapurLon = dapur ? Number(dapur.longitude) : 106.816666;
    const radiusMaks = dapur ? dapur.radiusMeter : 100;

    // 2. Evaluasi Geofence
    const { jarakMeter, isInRadius } = cekDalamRadius(
      Number(latitude),
      Number(longitude),
      dapurLat,
      dapurLon,
      radiusMaks
    );

    // 3. Evaluasi Shift Hari Ini (1 = Senin ... 7 = Minggu)
    const sekarang = new Date();
    const hariKe = (sekarang.getDay() === 0 ? 7 : sekarang.getDay()) as number;

    const [jadwal] = await db
      .select({
        shiftId: shiftKerja.id,
        jamMasuk: shiftKerja.jamMasuk,
        jamPulang: shiftKerja.jamPulang,
        toleransiMenit: shiftKerja.toleransiMenit,
      })
      .from(jadwalShift)
      .innerJoin(shiftKerja, eq(jadwalShift.shiftId, shiftKerja.id))
      .where(
        and(
          eq(jadwalShift.anggotaId, anggotaId),
          eq(jadwalShift.hariKe, hariKe)
        )
      )
      .limit(1);

    // Default toleransi 15 menit jika belum ada jadwal terdaftar
    let statusPresensi: "tepat_waktu" | "terlambat" | "pulang_cepat" = "tepat_waktu";

    if (jadwal) {
      if (jenis === "masuk") {
        statusPresensi = evaluasiStatusMasuk(
          sekarang,
          jadwal.jamMasuk,
          jadwal.toleransiMenit
        );
      } else {
        statusPresensi = evaluasiStatusKeluar(sekarang, jadwal.jamPulang);
      }
    }

    // 4. Simpan presensi
    const [record] = await db
      .insert(absensi)
      .values({
        anggotaId,
        jenis,
        status: statusPresensi,
        metode: "selfie_gps",
        latitude: String(latitude),
        longitude: String(longitude),
        jarakKeDapurMeter: jarakMeter,
        isInRadius,
        fotoBuktiUrl: fotoBuktiUrl || null,
        catatan: catatan || null,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: record,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    // PostgreSQL unique violation code 23505
    if (err?.code === "23505") {
      return NextResponse.json(
        { error: "Anda sudah melakukan presensi ini hari ini." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Gagal mencatat presensi." },
      { status: 500 }
    );
  }
}
