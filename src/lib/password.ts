import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Hash password menggunakan scrypt dengan salt acak 16 byte.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifikasi password terhadap hash yang tersimpan.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;

    const hashBuffer = Buffer.from(hash, "hex");
    const testHashBuffer = scryptSync(password, salt, 64);

    return timingSafeEqual(hashBuffer, testHashBuffer);
  } catch {
    return false;
  }
}
