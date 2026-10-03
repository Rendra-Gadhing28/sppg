# Spesifikasi Desain: Face Recognition & Vector Matching Presensi SPPG

**Tanggal:** 2026-10-03  
**Status:** Review  
**Topik:** Verifikasi Biometrik Wajah Menggunakan Vektor Fitur (Face Embedding) untuk Mencegah Titip Absen

---

## 1. Latar Belakang & Masalah
Model presensi saat ini pada `/presensi` mengandalkan pemilihan nama pekerja via dropdown dan simulasi deteksi wajah menggunakan `setTimeout` tanpa validasi biometrik nyata. Kondisi ini memungkinkan pekerja melakukan titip absen untuk rekan kerja lainnya.

## 2. Tujuan & Kriteria Keberhasilan
1. **Deteksi & Verifikasi Wajah Nyata**: Setiap proses presensi wajib mendeteksi wajah di depan kamera dan mengekstrak 128-dimensional embedding vector.
2. **Pencocokan Vektor (1:1 Verification)**: Vektor wajah saat presensi dibandingkan dengan vektor referensi pekerja yang tersimpan di database menggunakan jarak Euclidean.
3. **Pencegahan Titip Absen**: Jika jarak Euclidean $> 0.55$, presensi otomatis ditolak dengan pesan error.
4. **Performa Ringan**: Komputasi ekstraksi fitur dilakukan di client browser via WebGL/WASM menggunakan `@vladmandic/face-api`, sehingga server Next.js tidak memerlukan runtime Python/GPU tambahan.

---

## 3. Perubahan Skema Database (`src/db/schema.ts`)

### A. Tabel `anggota`
* Tambah kolom `faceEmbedding`:
  ```typescript
  faceEmbedding: jsonb("face_embedding").$type<number[]>(),
  ```
  Menyimpan array 128 angka desimal (`number[]`) hasil ekstraksi model FaceNet/face-api.

### B. Enum `absensi_metode` & Tabel `absensi`
* Perluas enum metode presensi:
  ```typescript
  export const absensiMetodeEnum = pgEnum("absensi_metode", [
    "selfie_gps",
    "face_recognition",
    "manual_supervisor",
  ]);
  ```
* Tambah kolom di tabel `absensi`:
  ```typescript
  faceConfidence: numeric("face_confidence", { precision: 5, scale: 4 }),
  ```
  Menyimpan persentase/skor kecocokan wajah (skala 0.0000 - 1.0000).

---

## 4. Logika Perhitungan & Validasi Kemiripan

### A. Fungsi Jarak Euclidean (Backend & Frontend)
```typescript
export function hitungJarakEuclidean(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) {
    throw new Error("Dimensi vektor tidak sesuai.");
  }
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    const diff = v1[i] - v2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function hitungConfidenceScore(distance: number, threshold = 0.55): number {
  // Confidence 1.0 jika distance = 0, mendekati 0 jika distance >= threshold * 1.5
  const score = Math.max(0, 1 - (distance / (threshold * 1.5)));
  return Number(score.toFixed(4));
}
```

### B. Aturan Keputusan
* `distance <= 0.55`: **Wajah Cocok (Valid)**. Presensi disetujui, `faceConfidence` dicatat.
* `distance > 0.55`: **Wajah Tidak Cocok (Ditolak)**. HTTP 403 Forbidden dengan respon `Wajah tidak sesuai dengan identitas pekerja yang dipilih.`
* Pekerja belum memiliki data wajah di DB:
  * Wajibkan daftarkan wajah terlebih dahulu (HTTP 400).

---

## 5. Alur Pengguna (User Flows)

### A. Pendaftaran Wajah Baru (`/daftar`)
1. Pengguna membuka kamera di form pendaftaran pekerja baru.
2. Library `@vladmandic/face-api` memuat model dari folder `/models`.
3. Deteksi wajah otomatis mendeteksi kotak wajah (bounding box) dan landmarks.
4. Saat tombol foto ditekan, sistem mengekstrak descriptor 128-float.
5. Payload registrasi ke `/api/anggota` mencakup array `faceEmbedding`.
6. Server menyimpan array tersebut ke kolom `face_embedding` anggota.

### B. Presensi Masuk / Pulang (`/presensi`)
1. Kamera live aktif dengan face detector berjalan (interval 200ms atau per frame).
2. Tampilan UI menampilkan panduan oval / visual face frame.
3. Saat pekerja memilih namanya dan menekan tombol verifikasi:
   - Sistem mengambil frame video terkini.
   - Menghasilkan 128-float descriptor.
   - Mengirimkan `faceVector` bersama `anggotaId`, koordinat GPS, dan foto bukti ke `/api/absensi`.
4. Endpoint `/api/absensi` memvalidasi:
   - Lokasi dalam geofence dapur.
   - Kecocokan vektor `faceVector` vs `anggota.faceEmbedding` ($\le 0.55$).
5. Jika kedua syarat lolos, catatan presensi dibuat dengan `metode = 'face_recognition'` dan `faceConfidence`.

---

## 6. Aset Model & Penempatan File
* Library client: `@vladmandic/face-api`
* Model weights diletakkan di `public/models/`:
  - `tiny_face_detector_model-weights_manifest.json` + shard
  - `face_landmark_68_model-weights_manifest.json` + shard
  - `face_recognition_model-weights_manifest.json` + shard
* Utility biometrik: `src/lib/face-biometric.ts` (helper kalkulasi jarak dan confidence).

---

## 7. Rencana Pengujian
1. **Unit Test Jarak Vektor (`scripts/test-biometrics.ts`)**:
   - Vektor identik (distance = 0, confidence = 1.0).
   - Vektor mirip dalam ambang batas $\le 0.55$.
   - Vektor acak / berbeda orang ($> 0.55$, ekspektasi rejected).
2. **Integrasi API (`/api/absensi`)**:
   - Kirim presensi dengan face vector yang cocok -> Status 201 Created.
   - Kirim presensi dengan face vector salah -> Status 403 Forbidden.
   - Kirim presensi tanpa face vector -> Status 400 Bad Request.
