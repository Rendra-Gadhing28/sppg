export interface TitikGeospasial {
  latitude: number;
  longitude: number;
}

export interface SekolahTitikSinggah {
  id: string;
  namaSekolah: string;
  latitude: number;
  longitude: number;
  jumlahPorsi: number;
  jamMakan: string; // e.g. "10:30"
}

export interface HasilStopUrutan {
  urutan: number;
  sekolahId: string;
  namaSekolah: string;
  porsi: number;
  estJamTiba: string;
  jarakDariSebelumnyaKm: number;
  durasiMenitDariSebelumnya: number;
}

export interface HasilOptimasiVrp {
  armadaId: string;
  kapasitasArmada: number;
  totalPorsiDiangkut: number;
  totalJarakKm: number;
  totalEstimasiMenit: number;
  isBatasHangatAman: boolean; // durasi <= 90 menit
  urutanStops: HasilStopUrutan[];
}

/**
 * Formula Haversine menghitung jarak kilometer antara dua titik koordinat
 */
export function hitungJarakKm(asal: TitikGeospasial, tujuan: TitikGeospasial): number {
  const R = 6371; // Radius bumi km
  const dLat = ((tujuan.latitude - asal.latitude) * Math.PI) / 180;
  const dLon = ((tujuan.longitude - asal.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((asal.latitude * Math.PI) / 180) *
      Math.cos((tujuan.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Estimasi durasi tempuh dalam menit (asumsi rerata kecepatan lalu lintas kota 25 km/jam + 5 menit waktu bongkar per titik)
 */
export function estimasiDurasiMenit(jarakKm: number): number {
  const durasiJalan = (jarakKm / 25) * 60;
  return Math.round(durasiJalan + 5);
}

/**
 * Format penambahan menit pada string waktu "HH:mm"
 */
export function tambahMenitWaktu(waktuMulai: string, menitTambahan: number): string {
  const [jam, mnt] = waktuMulai.split(":").map(Number);
  const date = new Date(2026, 0, 1, jam, mnt);
  date.setMinutes(date.getMinutes() + menitTambahan);
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Algoritma Heuristik Nearest-Neighbor VRP dengan pembatas:
 * 1. Kapasitas muat armada
 * 2. Batas waktu maksimum 90 menit insulasi termal makanan hangat
 */
export function optimasiRuteVrp(
  depotDapur: TitikGeospasial,
  sekolahList: SekolahTitikSinggah[],
  armadaId: string,
  kapasitasArmada: number,
  jamBerangkat: string = "08:30"
): HasilOptimasiVrp {
  const sisaSekolah = [...sekolahList];
  const urutanStops: HasilStopUrutan[] = [];

  let lokasiSaatIni = depotDapur;
  let totalJarakKm = 0;
  let totalEstimasiMenit = 0;
  let totalPorsiDiangkut = 0;
  let urutan = 1;

  while (sisaSekolah.length > 0) {
    // Cari sekolah terdekat yang kapasitasnya masih muat
    let indexTerdekat = -1;
    let jarakTerpendek = Infinity;

    for (let i = 0; i < sisaSekolah.length; i++) {
      const s = sisaSekolah[i];
      if (totalPorsiDiangkut + s.jumlahPorsi <= kapasitasArmada) {
        const jarak = hitungJarakKm(lokasiSaatIni, {
          latitude: s.latitude,
          longitude: s.longitude,
        });
        if (jarak < jarakTerpendek) {
          jarakTerpendek = jarak;
          indexTerdekat = i;
        }
      }
    }

    if (indexTerdekat === -1) {
      // Tidak ada sekolah yang muat di sisa kapasitas armada ini
      break;
    }

    const sekolahTerpilih = sisaSekolah.splice(indexTerdekat, 1)[0];
    const durasiSegment = estimasiDurasiMenit(jarakTerpendek);

    totalJarakKm += jarakTerpendek;
    totalEstimasiMenit += durasiSegment;
    totalPorsiDiangkut += sekolahTerpilih.jumlahPorsi;

    const estJamTiba = tambahMenitWaktu(jamBerangkat, totalEstimasiMenit);

    urutanStops.push({
      urutan: urutan++,
      sekolahId: sekolahTerpilih.id,
      namaSekolah: sekolahTerpilih.namaSekolah,
      porsi: sekolahTerpilih.jumlahPorsi,
      estJamTiba,
      jarakDariSebelumnyaKm: jarakTerpendek,
      durasiMenitDariSebelumnya: durasiSegment,
    });

    lokasiSaatIni = {
      latitude: sekolahTerpilih.latitude,
      longitude: sekolahTerpilih.longitude,
    };
  }

  // Batas suhu termal aman HACCP: total durasi pengantaran <= 90 menit
  const isBatasHangatAman = totalEstimasiMenit <= 90;

  return {
    armadaId,
    kapasitasArmada,
    totalPorsiDiangkut,
    totalJarakKm: Math.round(totalJarakKm * 100) / 100,
    totalEstimasiMenit,
    isBatasHangatAman,
    urutanStops,
  };
}
