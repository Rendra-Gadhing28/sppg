export const DEFAULT_FACE_THRESHOLD = 0.55;
export const FACE_VECTOR_DIMENSION = 128;

export function hitungJarakEuclidean(v1: number[], v2: number[]): number {
  if (v1.length !== FACE_VECTOR_DIMENSION || v2.length !== FACE_VECTOR_DIMENSION) {
    throw new Error(
      `Dimensi vektor harus ${FACE_VECTOR_DIMENSION}. Diterima: v1=${v1.length}, v2=${v2.length}`
    );
  }
  if (v1.length !== v2.length) {
    throw new Error(`Dimensi vektor tidak sama: v1=${v1.length}, v2=${v2.length}`);
  }
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    const diff = v1[i] - v2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function hitungConfidenceScore(
  distance: number,
  threshold = DEFAULT_FACE_THRESHOLD
): number {
  return Number(Math.max(0, Math.min(1, 1 - distance / (threshold * 1.5))).toFixed(4));
}

export function isWajahCocok(
  v1: number[],
  v2: number[],
  threshold = DEFAULT_FACE_THRESHOLD
): { cocok: boolean; distance: number; confidence: number } {
  const distance = hitungJarakEuclidean(v1, v2);
  const confidence = hitungConfidenceScore(distance, threshold);
  return { cocok: distance <= threshold, distance, confidence };
}
