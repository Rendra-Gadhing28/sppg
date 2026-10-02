import assert from "node:assert";
import { sanitizeString, sekolahSchema, anggotaSchema } from "../src/lib/validators";

// 1. Sanitize XSS test
const dirty = "<script>alert('xss')</script>SDN 01 <b>Pagi</b>";
const clean = sanitizeString(dirty);
assert.strictEqual(clean, "SDN 01 Pagi");

// 2. Sekolah valid test
const validSch = sekolahSchema.safeParse({
  namaSekolah: "<b>SDN Sukamaju</b>",
  alamat: "Jl. Merdeka No. 45",
  jumlahPorsiTarget: 350,
  picNama: "Budi Santoso",
  picKontak: "081234567890",
  jamMakan: "10:00",
});
assert.strictEqual(validSch.success, true);
if (validSch.success) {
  assert.strictEqual(validSch.data.namaSekolah, "SDN Sukamaju");
  assert.strictEqual(validSch.data.jamMakan, "10:00:00");
}

// 3. Sekolah invalid test (negative portion)
const invalidSch = sekolahSchema.safeParse({
  namaSekolah: "SDN 1",
  alamat: "Jl. A",
  jumlahPorsiTarget: -10,
  picNama: "A",
  picKontak: "123",
  jamMakan: "99:99",
});
assert.strictEqual(invalidSch.success, false);

// 4. Anggota NIK valid (16 digit) & invalid
const validAnggota = anggotaSchema.safeParse({
  nik: "3201012345670001",
  namaLengkap: "Ahmad Fauzi",
  jabatan: "Chef Utama",
  shiftId: 1,
});
assert.strictEqual(validAnggota.success, true);

const invalidNik = anggotaSchema.safeParse({
  nik: "320101234",
  namaLengkap: "Ahmad",
  jabatan: "Chef",
});
assert.strictEqual(invalidNik.success, false);

console.log("✓ Semua runnable check validator lolos 100%.");
