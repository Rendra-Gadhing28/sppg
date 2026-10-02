interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Bersihkan memori setiap 5 menit (unref agar tidak mengunci event loop)
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  if (typeof timer.unref === "function") {
    timer.unref();
  }
}

/**
 * Cek pembatasan laju permintaan (Rate Limiting).
 * @param key Identifier unik (misal IP atau kombinasi IP:route)
 * @param limit Batas maksimum permintaan yang diizinkan
 * @param windowMs Jendela waktu dalam milidetik (misal 60.000 ms = 1 menit)
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, record.resetTime - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetMs: Math.max(0, record.resetTime - now),
  };
}

export function isRateLimited(
  key: string,
  limit: number = 5
): { blocked: boolean; resetMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    return { blocked: false, resetMs: 0 };
  }
  if (record.count >= limit) {
    return { blocked: true, resetMs: Math.max(0, record.resetTime - now) };
  }
  return { blocked: false, resetMs: 0 };
}

export function recordFailedAttempt(
  key: string,
  windowMs: number = 15 * 60 * 1000
): void {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
  } else {
    record.count += 1;
  }
}

export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

export function clearAllRateLimits(): void {
  rateLimitMap.clear();
}
