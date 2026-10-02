/**
 * Hitung jarak Haversine (meter) antara dua titik koordinat.
 */
export function hitungJarakMeter(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Radius bumi dalam meter
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function cekDalamRadius(
  userLat: number,
  userLon: number,
  dapurLat: number,
  dapurLon: number,
  radiusMeter: number
): { jarakMeter: number; isInRadius: boolean } {
  const jarakMeter = hitungJarakMeter(userLat, userLon, dapurLat, dapurLon);
  return {
    jarakMeter,
    isInRadius: jarakMeter <= radiusMeter,
  };
}
