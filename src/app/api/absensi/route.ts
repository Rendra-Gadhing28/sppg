import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { absensi, konfigurasiDapur, jadwalShift, shiftKerja, anggota } from "@/db/schema";
import { cekDalamRadius } from "@/lib/geo";
import { evaluasiStatusMasuk, evaluasiStatusKeluar } from "@/lib/shift";
import { checkRateLimit } from "@/lib/rate-limit";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    const [dapur] = await db
      .select()
      .from(konfigurasiDapur)
      .where(eq(konfigurasiDapur.id, 1))
      .limit(1);

    const daftarAnggota = await db
      .select({
        id: anggota.id,
        namaLengkap: anggota.namaLengkap,
        jabatan: anggota.jabatan,
        nik: anggota.nik,
        fotoUrl: anggota.fotoUrl,
        fotoTanganUrl: anggota.fotoTanganUrl,
      })
      .from(anggota)
      .where(eq(anggota.statusAktif, true));

    const shifts = await db.select().from(shiftKerja);

    const presensiHariIni = await db
      .select({
        id: absensi.id,
        anggotaId: absensi.anggotaId,
        namaAnggota: anggota.namaLengkap,
        jenis: absensi.jenis,
        waktuCatat: absensi.waktuCatat,
        status: absensi.status,
        isInRadius: absensi.isInRadius,
        jarakKeDapurMeter: absensi.jarakKeDapurMeter,
      })
      .from(absensi)
      .innerJoin(anggota, eq(absensi.anggotaId, anggota.id))
      .where(eq(absensi.tanggal, todayStr))
      .orderBy(desc(absensi.waktuCatat));

    return NextResponse.json({
      dapur: dapur || {
        namaDapur: "Dapur Sentral SPPG",
        latitude: process.env.DEFAULT_LATITUDE || "-7.01513889",
        longitude: process.env.DEFAULT_LONGITUDE || "110.44802778",
        radiusMeter: 100,
      },
      daftarAnggota,
      shifts,
      presensiHariIni,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat data presensi." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`absensi:${ip}`, 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan presensi. Tunggu 1 menit." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      anggotaId,
      jenis,
      latitude,
      longitude,
      fotoBuktiUrl,
      catatan,
      isBiometricVerified,
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

    const dapurLat = dapur ? Number(dapur.latitude) : Number(process.env.DEFAULT_LATITUDE || -7.01513889);
    const dapurLon = dapur ? Number(dapur.longitude) : Number(process.env.DEFAULT_LONGITUDE || 110.44802778);
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

    // 4. Hash foto bukti (jangan simpan base64 raw ke DB)
    let fotoHash: string | null = null;
    if (fotoBuktiUrl) {
      if (typeof fotoBuktiUrl === "string" && fotoBuktiUrl.startsWith("sha256:")) {
        fotoHash = fotoBuktiUrl;
      } else {
        const hash = crypto.createHash("sha256").update(String(fotoBuktiUrl)).digest("hex");
        fotoHash = `sha256:${hash}`;
      }
    }

    // 5. Simpan presensi
    const [record] = await db
      .insert(absensi)
      .values({
        anggotaId,
        jenis,
        status: statusPresensi,
        metode: isBiometricVerified ? "selfie_gps" : "selfie_gps",
        latitude: String(latitude),
        longitude: String(longitude),
        jarakKeDapurMeter: jarakMeter,
        isInRadius,
        fotoBuktiUrl: fotoHash,
        catatan: catatan || (isBiometricVerified ? "Verifikasi Biometrik WebAuthn Sukses" : null),
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
    const err = error as { code?: string; cause?: { code?: string }; message?: string };
    const errCode = err?.code || err?.cause?.code;

    // PostgreSQL unique violation code 23505
    if (errCode === "23505") {
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
