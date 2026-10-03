/**
 * Unit test untuk logika validasi biometrik di POST /api/absensi.
 * Menguji tiga skenario tanpa HTTP — langsung panggil fungsi biometrik.
 */
import assert from "node:assert/strict";
import {
  isWajahCocok,
  FACE_VECTOR_DIMENSION,
  DEFAULT_FACE_THRESHOLD,
} from "../src/lib/face-biometric.js";

const zeros = (): number[] => Array(FACE_VECTOR_DIMENSION).fill(0);

// Vektor "orang lain" — jarak besar melebihi threshold
const stranger = (): number[] => {
  const v = zeros();
  for (let i = 0; i < 20; i++) v[i] = 0.5;
  return v;
};

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${e}`);
    process.exitCode = 1;
  }
}

// Simulasi logika validasi dari route POST /api/absensi
function simulasiValidasiAbsensi(
  embeddingDiDB: number[] | null,
  faceVectorInput: number[] | null | undefined
): { status: number; error?: string; metode?: string; confidenceStr?: string } {
  let metodePresensi: "selfie_gps" | "face_recognition" = "selfie_gps";
  let confidenceStr: string | null = null;

  if (embeddingDiDB && Array.isArray(embeddingDiDB)) {
    if (!faceVectorInput || !Array.isArray(faceVectorInput)) {
      return {
        status: 400,
        error: "Pekerja ini wajib verifikasi scan wajah. Data koordinat wajah tidak terdeteksi.",
      };
    }

    const hasilWajah = isWajahCocok(faceVectorInput, embeddingDiDB);
    if (!hasilWajah.cocok) {
      return {
        status: 403,
        error: `Verifikasi wajah ditolak: Jarak ${hasilWajah.distance.toFixed(3)} melebihi ambang batas.`,
      };
    }

    metodePresensi = "face_recognition";
    confidenceStr = hasilWajah.confidence.toFixed(4);
  } else if (faceVectorInput && Array.isArray(faceVectorInput)) {
    metodePresensi = "face_recognition";
    confidenceStr = "1.0000";
  }

  return { status: 201, metode: metodePresensi, confidenceStr: confidenceStr ?? undefined };
}

// --- Skenario 1: Anggota punya embedding, kirim vektor identik → lolos ---
test("embedding ada + vektor identik → face_recognition, confidence tinggi", () => {
  const embedding = zeros();
  const hasil = simulasiValidasiAbsensi(embedding, zeros());
  assert.equal(hasil.status, 201);
  assert.equal(hasil.metode, "face_recognition");
  assert.ok(hasil.confidenceStr !== undefined, "confidenceStr harus ada");
  const conf = Number(hasil.confidenceStr);
  assert.ok(conf > 0 && conf <= 1, `confidence ${conf} harus dalam [0,1]`);
});

// --- Skenario 2: Anggota punya embedding, kirim vektor orang lain → ditolak 403 ---
test("embedding ada + vektor orang lain → ditolak 403", () => {
  const embedding = zeros();
  const hasil = simulasiValidasiAbsensi(embedding, stranger());
  assert.equal(hasil.status, 403);
  assert.ok(hasil.error?.includes("Verifikasi wajah ditolak"), `pesan error: ${hasil.error}`);
});

// --- Skenario 3: Anggota punya embedding, tanpa vektor → ditolak 400 ---
test("embedding ada + tanpa faceVector → ditolak 400", () => {
  const embedding = zeros();
  const hasil = simulasiValidasiAbsensi(embedding, null);
  assert.equal(hasil.status, 400);
  assert.ok(hasil.error?.includes("wajib verifikasi scan wajah"), `pesan error: ${hasil.error}`);
});

// --- Skenario 4: Anggota tanpa embedding, kirim vektor → fallback face_recognition 1.0000 ---
test("tanpa embedding + ada vektor → face_recognition confidence 1.0000", () => {
  const hasil = simulasiValidasiAbsensi(null, zeros());
  assert.equal(hasil.status, 201);
  assert.equal(hasil.metode, "face_recognition");
  assert.equal(hasil.confidenceStr, "1.0000");
});

// --- Skenario 5: Anggota tanpa embedding, tanpa vektor → selfie_gps normal ---
test("tanpa embedding + tanpa vektor → selfie_gps", () => {
  const hasil = simulasiValidasiAbsensi(null, null);
  assert.equal(hasil.status, 201);
  assert.equal(hasil.metode, "selfie_gps");
});

// --- Skenario 6: Vektor dalam ambang batas (distance < 0.55) → lolos ---
test("embedding ada + vektor sedikit berbeda (distance < threshold) → lolos", () => {
  const embedding = zeros();
  const sedikit = zeros();
  sedikit[0] = 0.3; // distance = 0.3 < 0.55
  const hasil = simulasiValidasiAbsensi(embedding, sedikit);
  assert.equal(hasil.status, 201);
  assert.equal(hasil.metode, "face_recognition");
  const conf = Number(hasil.confidenceStr);
  assert.ok(conf > 0 && conf <= 1);
});

console.log(`\n${passed} test lulus.`);

// Pastikan distance vektor orang lain memang > threshold
const d = isWajahCocok(zeros(), stranger()).distance;
assert.ok(d > DEFAULT_FACE_THRESHOLD, `setup salah: distance stranger ${d} harus > ${DEFAULT_FACE_THRESHOLD}`);
