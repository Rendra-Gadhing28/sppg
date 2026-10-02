import assert from "node:assert/strict";
import { alokasikanBatchFEFO, evaluasiStatusExpiry } from "../src/lib/fefo";
import {
  supplierSchema,
  purchaseOrderSchema,
  qcPenerimaanSchema,
  serahTerimaSekolahSchema,
} from "../src/lib/validators";

console.log("▶ Menguji Unit Logic FEFO & Expiry...");

// 1. Test FEFO Allocation
const mockBatches = [
  {
    id: "batch-b",
    bahanId: "b1",
    nomorBatch: "BATCH-002",
    tanggalExpired: "2026-10-15", // Expired lebih lama
    jumlahSisa: 50,
  },
  {
    id: "batch-a",
    bahanId: "b1",
    nomorBatch: "BATCH-001",
    tanggalExpired: "2026-10-05", // Expired lebih cepat (FEFO First)
    jumlahSisa: 30,
  },
];

// Butuh 40 kg. Harusnya ambil 30 kg dari BATCH-001 (habis) dan 10 kg dari BATCH-002 (sisa 40)
const alokasi1 = alokasikanBatchFEFO(mockBatches, 40);
assert.equal(alokasi1.totalTerpotong, 40);
assert.equal(alokasi1.sisaKekurangan, 0);
assert.equal(alokasi1.alokasi.length, 2);

assert.equal(alokasi1.alokasi[0].nomorBatch, "BATCH-001");
assert.equal(alokasi1.alokasi[0].jumlahDipotong, 30);
assert.equal(alokasi1.alokasi[0].statusBatchBaru, "habis");

assert.equal(alokasi1.alokasi[1].nomorBatch, "BATCH-002");
assert.equal(alokasi1.alokasi[1].jumlahDipotong, 10);
assert.equal(alokasi1.alokasi[1].sisaSetelahnya, 40);
assert.equal(alokasi1.alokasi[1].statusBatchBaru, "aktif");

// Test Defisit FEFO
const alokasiDefisit = alokasikanBatchFEFO(mockBatches, 100);
assert.equal(alokasiDefisit.totalTerpotong, 80); // Hanya ada 30 + 50 = 80
assert.equal(alokasiDefisit.sisaKekurangan, 20);

// 2. Test Evaluasi Status Expiry
const refNow = new Date("2026-10-02T00:00:00Z");
assert.equal(evaluasiStatusExpiry("2026-10-01", refNow).status, "kedaluwarsa");
assert.equal(evaluasiStatusExpiry("2026-10-04", refNow).status, "segera_kedaluwarsa"); // 2 hari lagi
assert.equal(evaluasiStatusExpiry("2026-10-10", refNow).status, "aman"); // 8 hari lagi

console.log("✓ Logic FEFO & Expiry lolos 100%.");

console.log("▶ Menguji Validator Fase 2...");

// 3. Test Validator Supplier
const supValid = supplierSchema.safeParse({
  kodeSupplier: "SUP-999",
  namaSupplier: "<b>PT Pangan Berkah</b>",
  kategoriPasokan: "Sayur & Bumbu",
  kontakPerson: "Ahmad",
  nomorHp: "081234567890",
  alamat: "Jl. Industri Pangan Sehat No. 10",
});
assert.ok(supValid.success);
assert.equal(supValid.data.namaSupplier, "PT Pangan Berkah");

// 4. Test Validator PO
const poValid = purchaseOrderSchema.safeParse({
  supplierId: "a0000000-0000-4000-a000-000000000001",
  targetPengiriman: "2026-10-05",
  catatan: "Pesanan bahan baku mingguan",
  items: [
    {
      bahanId: "b0000000-0000-4000-a000-000000000002",
      jumlahPesan: 100,
      hargaSatuan: 25000,
    },
  ],
});
assert.ok(poValid.success);

// 5. Test Validator QC
const qcValid = qcPenerimaanSchema.safeParse({
  poId: "a0000000-0000-4000-a000-000000000001",
  status: "lolos",
  catatanSuhu: "4°C",
  items: [
    {
      bahanId: "b0000000-0000-4000-a000-000000000002",
      jumlahDiterima: 100,
      nomorBatch: "BATCH-20261002-01",
      tanggalExpired: "2026-10-20",
    },
  ],
});
assert.ok(qcValid.success);

// 6. Test Validator Serah Terima Sekolah
const stValid = serahTerimaSekolahSchema.safeParse({
  serahTerimaId: "c0000000-0000-4000-a000-000000000003",
  porsiDiterima: 450,
  namaPenerimaSekolah: "Ibu Nurul",
  kontakPenerimaSekolah: "081299998888",
  kondisiMakanan: "baik_layak",
  catatan: "Makanan hangat dan lengkap",
});
assert.ok(stValid.success);

console.log("✓ Semua validator Fase 2 lolos 100%.");
