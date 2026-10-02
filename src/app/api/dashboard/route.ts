import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  sekolah,
  anggota,
  absensi,
  jadwalMenu,
  menu,
  resepItem,
  bahan,
  stokMutasi,
} from "@/db/schema";
import { kalkulasiKebutuhanBOM } from "@/lib/bom";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Data Sekolah
    const daftarSekolah = await db
      .select()
      .from(sekolah)
      .where(eq(sekolah.isActive, true));

    const totalPorsi = daftarSekolah.reduce(
      (sum, s) => sum + s.jumlahPorsiTarget,
      0
    );

    // 2. Data Anggota & Presensi
    const totalAnggotaCount = (
      await db
        .select({ count: sql<number>`count(*)::int` })
        .from(anggota)
        .where(eq(anggota.statusAktif, true))
    )[0]?.count || 0;

    const presensiHariIni = await db
      .select({
        id: absensi.id,
        anggotaId: absensi.anggotaId,
        namaAnggota: anggota.namaLengkap,
        jabatan: anggota.jabatan,
        jenis: absensi.jenis,
        waktuCatat: absensi.waktuCatat,
        status: absensi.status,
        isInRadius: absensi.isInRadius,
        jarakKeDapurMeter: absensi.jarakKeDapurMeter,
        fotoBuktiUrl: absensi.fotoBuktiUrl,
      })
      .from(absensi)
      .innerJoin(anggota, eq(absensi.anggotaId, anggota.id))
      .where(eq(absensi.tanggal, todayStr))
      .orderBy(desc(absensi.waktuCatat));

    // Anggota unik yang sudah presensi masuk hari ini
    const hadirIds = new Set(
      presensiHariIni.filter((p) => p.jenis === "masuk").map((p) => p.anggotaId)
    );
    const anggotaHadirCount = hadirIds.size;
    const tepatWaktuCount = presensiHariIni.filter(
      (p) => p.jenis === "masuk" && p.status === "tepat_waktu"
    ).length;

    // 3. Menu & BOM Hari Ini
    const [jadwal] = await db
      .select({
        jadwalId: jadwalMenu.id,
        tanggal: jadwalMenu.tanggal,
        menuId: jadwalMenu.menuId,
        namaMenu: menu.namaMenu,
        deskripsi: menu.deskripsi,
        totalKalori: menu.totalKalori,
        proteinGram: menu.proteinGram,
        lemakGram: menu.lemakGram,
        karboGram: menu.karboGram,
        isApprovedGizi: menu.isApprovedGizi,
        statusProduksi: jadwalMenu.statusProduksi,
      })
      .from(jadwalMenu)
      .innerJoin(menu, eq(jadwalMenu.menuId, menu.id))
      .where(eq(jadwalMenu.tanggal, todayStr))
      .limit(1);

    let bomList: ReturnType<typeof kalkulasiKebutuhanBOM> = [];
    let defisitCount = 0;

    if (jadwal) {
      const itemsResep = await db
        .select({
          bahanId: bahan.id,
          namaBahan: bahan.namaBahan,
          satuanStandar: bahan.satuanStandar,
          jumlahPerPorsi: resepItem.jumlahPerPorsi,
          stokSaatIni: bahan.stokSaatIni,
        })
        .from(resepItem)
        .innerJoin(bahan, eq(resepItem.bahanId, bahan.id))
        .where(eq(resepItem.menuId, jadwal.menuId));

      bomList = kalkulasiKebutuhanBOM(
        itemsResep.map((item) => ({
          bahanId: item.bahanId,
          namaBahan: item.namaBahan,
          satuanStandar: item.satuanStandar,
          jumlahPerPorsi: Number(item.jumlahPerPorsi),
          stokSaatIni: Number(item.stokSaatIni),
        })),
        totalPorsi
      );

      defisitCount = bomList.filter((b) => b.isDefisit).length;
    }

    // 4. Riwayat Mutasi Stok Terbaru
    const mutasiTerbaru = await db
      .select({
        id: stokMutasi.id,
        namaBahan: bahan.namaBahan,
        jenis: stokMutasi.jenis,
        jumlah: stokMutasi.jumlah,
        saldoSetelahnya: stokMutasi.saldoSetelahnya,
        keterangan: stokMutasi.keterangan,
        createdAt: stokMutasi.createdAt,
      })
      .from(stokMutasi)
      .innerJoin(bahan, eq(stokMutasi.bahanId, bahan.id))
      .orderBy(desc(stokMutasi.createdAt))
      .limit(5);

    return NextResponse.json({
      tanggal: todayStr,
      metrics: {
        totalPorsi,
        totalSekolah: daftarSekolah.length,
        totalAnggota: totalAnggotaCount,
        anggotaHadir: anggotaHadirCount,
        tepatWaktuCount,
        defisitCount,
        statusProduksi: jadwal?.statusProduksi || "draft",
      },
      jadwal,
      bomList,
      daftarSekolah,
      presensiHariIni,
      mutasiTerbaru,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat dashboard." },
      { status: 500 }
    );
  }
}
