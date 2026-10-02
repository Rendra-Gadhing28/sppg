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
  supplier,
  purchaseOrder,
  stokBatch,
  distribusiPengiriman,
  dapurCabang,
  transferStokCabang,
  foodWasteLog,
  komplainSekolah,
  waMessageLogs,
  aiMenuPreset,
  vrpRuteHarian,
  iotSensorDevice,
  iotTelemetriSuhu,
  bgnLaporanAudit,
} from "@/db/schema";
import { kalkulasiKebutuhanBOM } from "@/lib/bom";
import { evaluasiStatusExpiry } from "@/lib/fefo";
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

    // 5. Metrik Fase 2 (Pengadaan, Batch Expiry, Distribusi)
    const [supplierCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(supplier)
      .where(eq(supplier.isActive, true));

    const [poCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(purchaseOrder)
      .where(eq(purchaseOrder.status, "diajukan"));

    const activeBatches = await db
      .select({
        id: stokBatch.id,
        tanggalExpired: stokBatch.tanggalExpired,
      })
      .from(stokBatch)
      .where(eq(stokBatch.statusBatch, "aktif"));

    const batchSegeraExpired = activeBatches.filter((b) => {
      const { status } = evaluasiStatusExpiry(b.tanggalExpired);
      return status === "segera_kedaluwarsa" || status === "kedaluwarsa";
    }).length;

    const listDistribusiHariIni = await db.query.distribusiPengiriman.findMany({
      where: eq(distribusiPengiriman.tanggal, todayStr),
      with: {
        armada: true,
        serahTerimaList: {
          with: {
            sekolah: true,
          },
        },
      },
      limit: 5,
    });

    const pengirimanTotal = listDistribusiHariIni.length;
    const pengirimanSelesai = listDistribusiHariIni.filter(
      (d) => d.status === "selesai"
    ).length;
    const pengirimanJalan = listDistribusiHariIni.filter(
      (d) => d.status === "dalam_perjalanan"
    ).length;

    // 6. Metrik Fase 3 (Multi-Dapur, Waste, Komplain, WhatsApp)
    const [cabangCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(dapurCabang)
      .where(eq(dapurCabang.isActive, true));

    const [transferAktifCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(transferStokCabang)
      .where(sql`status IN ('diajukan', 'dalam_perjalanan')`);

    const [wasteHariIni] = await db
      .select({
        totalKg: sql<string>`coalesce(sum(berat_kg), 0)::text`,
        totalRp: sql<string>`coalesce(sum(estimasi_kerugian_rp), 0)::text`,
      })
      .from(foodWasteLog)
      .where(eq(foodWasteLog.tanggal, todayStr));

    const [komplainPendingCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(komplainSekolah)
      .where(sql`status IN ('baru', 'investigasi')`);

    const [waCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(waMessageLogs);

    // 7. Metrik Fase 4 (AI Menu, VRP Routing, IoT HACCP & BGN Audit)
    const [aiCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(aiMenuPreset);

    const [vrpCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(vrpRuteHarian)
      .where(eq(vrpRuteHarian.tanggal, todayStr));

    const [iotCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(iotSensorDevice)
      .where(eq(iotSensorDevice.statusAktif, true));

    const telemetriHaccp = await db
      .select({ isAnomali: iotTelemetriSuhu.isAnomaliHaccp })
      .from(iotTelemetriSuhu)
      .limit(100);

    const totalTelem = telemetriHaccp.length;
    const anomaliCount = telemetriHaccp.filter((t) => t.isAnomali).length;
    const haccpScore = totalTelem > 0 ? Math.round(((totalTelem - anomaliCount) / totalTelem) * 1000) / 10 : 100;

    const [bgnCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bgnLaporanAudit);

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
        // Fase 2 Metrics
        totalSupplier: supplierCount?.count || 0,
        poDiajukanCount: poCount?.count || 0,
        batchSegeraExpired,
        pengirimanTotal,
        pengirimanSelesai,
        pengirimanJalan,
        // Fase 3 Metrics
        totalCabang: cabangCount?.count || 0,
        transferStokAktif: transferAktifCount?.count || 0,
        foodWasteHariIniKg: parseFloat(wasteHariIni?.totalKg || "0"),
        foodWasteHariIniRp: parseFloat(wasteHariIni?.totalRp || "0"),
        komplainPendingCount: komplainPendingCount?.count || 0,
        waTotalCount: waCount?.count || 0,
        // Fase 4 Metrics
        aiPresetCount: aiCount?.count || 0,
        vrpRuteCount: vrpCount?.count || 0,
        iotDeviceCount: iotCount?.count || 0,
        haccpScore,
        bgnAuditCount: bgnCount?.count || 0,
      },
      jadwal,
      bomList,
      daftarSekolah,
      presensiHariIni,
      mutasiTerbaru,
      distribusiHariIni: listDistribusiHariIni,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memuat dashboard." },
      { status: 500 }
    );
  }
}
