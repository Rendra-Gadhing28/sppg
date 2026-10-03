import assert from "node:assert/strict";
import {
  hitungJarakEuclidean,
  hitungConfidenceScore,
  isWajahCocok,
  DEFAULT_FACE_THRESHOLD,
  FACE_VECTOR_DIMENSION,
} from "../src/lib/face-biometric.js";

const zeros = () => Array(FACE_VECTOR_DIMENSION).fill(0) as number[];
const small = () => {
  // distance ~0.3 < 0.55
  const v = zeros();
  v[0] = 0.3;
  return v;
};
const far = () => {
  // distance > 0.55
  const v = zeros();
  for (let i = 0; i < 10; i++) v[i] = 0.5;
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

// 1. Vektor identik
test("vektor identik: distance == 0, confidence == 1, cocok == true", () => {
  const v = zeros();
  const d = hitungJarakEuclidean(v, v);
  assert.equal(d, 0);
  assert.equal(hitungConfidenceScore(0), 1);
  const r = isWajahCocok(v, v);
  assert.equal(r.cocok, true);
  assert.equal(r.distance, 0);
  assert.equal(r.confidence, 1);
});

// 2. Vektor sedikit berbeda (<= 0.55)
test("vektor dalam ambang batas: cocok == true", () => {
  const v1 = zeros();
  const v2 = small();
  const r = isWajahCocok(v1, v2);
  assert.ok(r.distance <= DEFAULT_FACE_THRESHOLD, `distance ${r.distance} harus <= ${DEFAULT_FACE_THRESHOLD}`);
  assert.equal(r.cocok, true);
  assert.ok(r.confidence > 0 && r.confidence <= 1);
});

// 3. Vektor jauh (> 0.55)
test("vektor jauh: cocok == false", () => {
  const v1 = zeros();
  const v2 = far();
  const r = isWajahCocok(v1, v2);
  assert.ok(r.distance > DEFAULT_FACE_THRESHOLD, `distance ${r.distance} harus > ${DEFAULT_FACE_THRESHOLD}`);
  assert.equal(r.cocok, false);
});

// 4. Error jika dimensi bukan 128
test("error: vektor ukuran salah", () => {
  assert.throws(
    () => hitungJarakEuclidean([0, 1], [0, 1]),
    /128/
  );
});

test("error: v1 ukuran salah, v2 benar", () => {
  assert.throws(
    () => hitungJarakEuclidean(Array(5).fill(0), zeros()),
    /128/
  );
});

// 5. Confidence clamped ke [0,1]
test("confidence tidak negatif saat distance sangat besar", () => {
  const c = hitungConfidenceScore(999);
  assert.equal(c, 0);
});

test("confidence presisi 4 desimal", () => {
  const c = hitungConfidenceScore(0.3);
  assert.ok(typeof c === "number");
  const decimals = c.toString().split(".")[1]?.length ?? 0;
  assert.ok(decimals <= 4);
});

console.log(`\n${passed} test lulus.`);
