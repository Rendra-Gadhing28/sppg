# Rencana Implementasi: Face Recognition & Vector Matching Presensi SPPG

**Dokumen Desain:** `docs/superpowers/specs/2026-10-03-face-recognition-attendance-design.md`  
**Tanggal:** 2026-10-03  
**Status:** Menunggu Review & Pemilihan Metode Eksekusi

---

## Ringkasan Tugas
Mengganti sistem verifikasi presensi dummy (`setTimeout`) dengan deteksi biometrik wajah berbasis vektor (face embedding 128 dimensi) menggunakan `@vladmandic/face-api`, verifikasi jarak Euclidean di backend, serta penyimpanan embedding pada tabel PostgreSQL.

---

## Rincian Fase Eksekusi

### Fase 1: Modul Biometrik & Unit Testing
- **Tugas 1.1**: Buat file `src/lib/face-biometric.ts` berisi:
  - `hitungJarakEuclidean(v1: number[], v2: number[]): number`
  - `hitungConfidenceScore(distance: number, threshold?: number): number`
  - `isWajahCocok(v1: number[], v2: number[], threshold?: number): boolean` (default threshold 0.55)
- **Tugas 1.2**: Buat test suite `scripts/test-biometrics.ts` mencakup:
  - Vektor identik (jarak = 0, skor = 1.0).
  - Vektor serupa dalam ambang batas (jarak $\le 0.55$, valid).
  - Vektor berbeda orang (jarak $> 0.55$, ditolak).
  - Validasi panjang array 128 dimensi.
- **Kriteria Verifikasi**: `tsx scripts/test-biometrics.ts` lulus 100%.

---

### Fase 2: Perubahan Skema DB & Validasi Input
- **Tugas 2.1**: Update `src/db/schema.ts`:
  - Tambah kolom `faceEmbedding: jsonb("face_embedding").$type<number[]>()` pada tabel `anggota`.
  - Tambah nilai `'face_recognition'` pada enum `absensiMetodeEnum`.
  - Tambah kolom `faceConfidence: numeric("face_confidence", { precision: 5, scale: 4 })` pada tabel `absensi`.
- **Tugas 2.2**: Update `src/lib/validators.ts`:
  - Tambah `faceEmbedding: z.array(z.number()).length(128).optional()` pada `anggotaSchema`.
- **Tugas 2.3**: Jalankan sinkronisasi database (`npx drizzle-kit push` atau migrasi drizzle).
- **Kriteria Verifikasi**: Database schema ter-update tanpa merusak data eksisting.

---

### Fase 3: Backend API Verification (`/api/anggota` & `/api/absensi`)
- **Tugas 3.1**: Update `src/app/api/anggota/route.ts`:
  - Simpan `faceEmbedding` saat registrasi anggota baru.
  - Return `faceEmbedding` jika diperlukan atau status `hasFaceEmbedding: boolean`.
- **Tugas 3.2**: Update `src/app/api/absensi/route.ts`:
  - Terima `faceVector` (array 128 float) dalam payload POST.
  - Ambil `faceEmbedding` anggota dari database.
  - Jika anggota memiliki data wajah, validasi `isWajahCocok(faceVector, anggota.faceEmbedding)`.
  - Jika tidak cocok, kembalikan HTTP 403 Forbidden: `"Verifikasi wajah gagal: Wajah tidak cocok dengan data profil pekerja."`
  - Jika cocok, simpan record presensi dengan `metode: 'face_recognition'` dan nilai `faceConfidence`.
- **Tugas 3.3**: Buat script test API `scripts/test-absensi-face.ts`.
- **Kriteria Verifikasi**: Test API mencakup kasus berhasil (wajah cocok), ditolak (wajah tidak cocok), dan handling jika pekerja belum rekam wajah.

---

### Fase 4: Integrasi Client Model & Antarmuka UI
- **Tugas 4.1**: Instal dependensi `@vladmandic/face-api` dan siapkan bobot model TinyFace / FaceRecognition di `public/models/`.
- **Tugas 4.2**: Update halaman Pendaftaran (`src/app/daftar/page.tsx`):
  - Ekstrak 128-float face descriptor saat pekerja mengambil foto wajah.
  - Simpan descriptor ke payload `faceEmbedding` saat mendaftar.
- **Tugas 4.3**: Update halaman Presensi (`src/app/presensi/page.tsx`):
  - Inisialisasi model face-api pada elemen `<video>`.
  - Tampilkan status deteksi wajah (misal: "Wajah Terdeteksi", "Posisikan Wajah di Lingkaran").
  - Ganti simulasi `setTimeout` dengan ekstraksi real descriptor dari video stream.
  - Kirim `faceVector` aktual ke endpoint `/api/absensi`.
- **Kriteria Verifikasi**: Pengujian alur kamera di browser mendeteksi wajah dan mengirim vektor ke API.

---

### Fase 5: Regresi & Validasi Akhir
- **Tugas 5.1**: Jalankan seluruh rangkaian test suite (`npm run test` + script pengujian biometrik).
- **Tugas 5.2**: Jalankan `npm run lint` dan `npm run build` untuk memastikan tidak ada kesalahan kompilasi Next.js.
