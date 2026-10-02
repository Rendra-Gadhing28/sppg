const VALID_ENTITIES = ["absensi", "serah_terima_sekolah"] as const;
type EntitasTarget = (typeof VALID_ENTITIES)[number];

export interface OfflineMutasi {
  idempotencyKey: string;
  userId: string;
  entitasTarget: string;
  clientRecordedAt: string;
  payloadJson: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validasi format idempotencyKey: harus non-empty string, <= 100 chars,
 * pattern: {entitas}_{uuid}_{timestamp}.
 */
export function validateIdempotencyKey(key: string): ValidationResult {
  if (!key || typeof key !== "string") {
    return { valid: false, error: "idempotencyKey wajib diisi." };
  }
  if (key.length > 100) {
    return { valid: false, error: "idempotencyKey maksimal 100 karakter." };
  }
  // Pattern: minimal ada underscore pemisah
  if (!/^[a-z_]+_.+/.test(key)) {
    return {
      valid: false,
      error: "Format idempotencyKey tidak valid. Gunakan pattern: {entitas}_{uid}.",
    };
  }
  return { valid: true };
}

/**
 * Parse dan validasi payload offline sync untuk entitas yang didukung.
 */
export function parseOfflinePayload(
  entitas: string,
  payload: Record<string, unknown>
): ValidationResult {
  if (!VALID_ENTITIES.includes(entitas as EntitasTarget)) {
    return {
      valid: false,
      error: `Entitas '${entitas}' tidak didukung. Pilih: ${VALID_ENTITIES.join(", ")}.`,
    };
  }

  if (entitas === "absensi") {
    const required = ["anggotaId", "jenis", "waktuCatat"];
    for (const field of required) {
      if (!payload[field]) {
        return { valid: false, error: `Field '${field}' wajib ada untuk absensi.` };
      }
    }
    if (!["masuk", "keluar"].includes(payload.jenis as string)) {
      return { valid: false, error: "Field 'jenis' harus 'masuk' atau 'keluar'." };
    }
  }

  if (entitas === "serah_terima_sekolah") {
    const required = ["pengirimanId", "sekolahId", "porsiDiterima"];
    for (const field of required) {
      if (payload[field] === undefined || payload[field] === null) {
        return { valid: false, error: `Field '${field}' wajib ada untuk serah_terima_sekolah.` };
      }
    }
    if (typeof payload.porsiDiterima !== "number" || (payload.porsiDiterima as number) <= 0) {
      return { valid: false, error: "Field 'porsiDiterima' harus angka positif." };
    }
  }

  return { valid: true };
}

/**
 * Proses batch mutasi offline: filter duplikat by idempotencyKey (sudah ada di DB),
 * kembalikan daftar yang lolos validasi.
 */
export function filterValidMutasi(
  batch: OfflineMutasi[],
  existingKeys: Set<string>
): { toProcess: OfflineMutasi[]; skipped: Array<{ key: string; reason: string }> } {
  const toProcess: OfflineMutasi[] = [];
  const skipped: Array<{ key: string; reason: string }> = [];
  const seenInBatch = new Set<string>();

  for (const mutasi of batch) {
    const keyValidation = validateIdempotencyKey(mutasi.idempotencyKey);
    if (!keyValidation.valid) {
      skipped.push({ key: mutasi.idempotencyKey, reason: keyValidation.error! });
      continue;
    }

    if (existingKeys.has(mutasi.idempotencyKey)) {
      skipped.push({ key: mutasi.idempotencyKey, reason: "Duplikat: sudah diproses sebelumnya." });
      continue;
    }

    if (seenInBatch.has(mutasi.idempotencyKey)) {
      skipped.push({ key: mutasi.idempotencyKey, reason: "Duplikat dalam batch yang sama." });
      continue;
    }

    const payloadValidation = parseOfflinePayload(mutasi.entitasTarget, mutasi.payloadJson);
    if (!payloadValidation.valid) {
      skipped.push({ key: mutasi.idempotencyKey, reason: payloadValidation.error! });
      continue;
    }

    seenInBatch.add(mutasi.idempotencyKey);
    toProcess.push(mutasi);
  }

  return { toProcess, skipped };
}
