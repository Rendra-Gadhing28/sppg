import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vrpRuteHarian, konfigurasiDapur, sekolah, armada } from "@/db/schema";
import { optimasiRuteVrp } from "@/lib/vrp";
import { vrpRuteSchema } from "@/lib/validators";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const listRute = await db.query.vrpRuteHarian.findMany({
      orderBy: [desc(vrpRuteHarian.createdAt)],
      with: {
        armada: true,
        driver: {
          columns: { id: true, nomorHp: true, email: true, role: true },
        },
      },
    });

    const daftarArmada = await db.select().from(armada);
    const daftarSekolah = await db.select().from(sekolah);

    return NextResponse.json({ listRute, daftarArmada, daftarSekolah });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat rute VRP." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action: Auto-Compute VRP Route
    if (action === "optimasi") {
      const { armadaId, jamBerangkat = "08:30" } = body;

      if (!armadaId) {
        return NextResponse.json({ error: "armadaId wajib diisi." }, { status: 400 });
      }

      // Ambil koordinat dapur
      const [konfig] = await db.select().from(konfigurasiDapur).limit(1);
      const depot = {
        latitude: konfig?.latitude ? Number(konfig.latitude) : -6.2,
        longitude: konfig?.longitude ? Number(konfig.longitude) : 106.816666,
      };

      // Ambil kapasitas armada
      const [kendaraan] = await db
        .select()
        .from(armada)
        .where(eq(armada.id, armadaId))
        .limit(1);

      if (!kendaraan) {
        return NextResponse.json({ error: "Armada tidak ditemukan." }, { status: 404 });
      }

      // Ambil daftar sekolah aktif
      const daftarSekolah = await db
        .select()
        .from(sekolah)
        .where(eq(sekolah.isActive, true));

      const sekolahTitik = daftarSekolah.map((s) => ({
        id: s.id,
        namaSekolah: s.namaSekolah,
        latitude: Number(s.latitude),
        longitude: Number(s.longitude),
        jumlahPorsi: s.jumlahPorsiTarget,
        jamMakan: s.jamMakan.substring(0, 5),
      }));

      // Eksekusi optimasi VRP CVRPTW
      const hasilVrp = optimasiRuteVrp(
        depot,
        sekolahTitik,
        armadaId,
        kendaraan.kapasitasPorsi,
        jamBerangkat
      );

      // Simpan ke DB vrp_rute_harian
      const [ruteBaru] = await db
        .insert(vrpRuteHarian)
        .values({
          armadaId,
          urutanSekolahJson: hasilVrp.urutanStops,
          totalJarakKm: String(hasilVrp.totalJarakKm),
          totalEstimasiMenit: hasilVrp.totalEstimasiMenit,
          statusRute: "terencana",
        })
        .returning();

      return NextResponse.json(
        {
          message: "Optimasi rute armada VRP CVRPTW berhasil dikomputasi.",
          hasilVrp,
          rute: ruteBaru,
        },
        { status: 201 }
      );
    }

    // Manual insert rute
    const parsed = vrpRuteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validasi rute gagal." },
        { status: 400 }
      );
    }

    const { armadaId, driverId, urutanSekolahJson, totalJarakKm, totalEstimasiMenit, statusRute } =
      parsed.data;

    const [rute] = await db
      .insert(vrpRuteHarian)
      .values({
        armadaId,
        driverId: driverId ?? null,
        urutanSekolahJson,
        totalJarakKm: String(totalJarakKm),
        totalEstimasiMenit,
        statusRute: statusRute ?? "terencana",
      })
      .returning();

    return NextResponse.json({ message: "Rute berhasil disimpan.", rute }, { status: 201 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memproses rute VRP." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, statusRute } = body;

    if (!id || !["terencana", "berjalan", "selesai", "batal"].includes(statusRute)) {
      return NextResponse.json(
        { error: "Status rute tidak valid. Pilih: terencana, berjalan, selesai, batal." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(vrpRuteHarian)
      .set({ statusRute })
      .where(eq(vrpRuteHarian.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Rute tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      message: `Status rute diperbarui menjadi ${statusRute}.`,
      rute: updated,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memperbarui status rute." },
      { status: 500 }
    );
  }
}
