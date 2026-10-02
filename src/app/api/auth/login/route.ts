import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { isRateLimited, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limit";
import { or, eq, ilike } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/Nomor HP dan password wajib diisi." },
        { status: 400 }
      );
    }

    const rawId = String(identifier).trim();
    const rawPass = String(password);

    // Rate Limiting anti-brute force: Maksimal 5x percobaan gagal dalam 15 menit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rateLimitKey = `login:${ip}:${rawId.toLowerCase()}`;
    const checkLimit = isRateLimited(rateLimitKey, 5);

    if (checkLimit.blocked) {
      const waitMinutes = Math.ceil(checkLimit.resetMs / 60000);
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan login gagal. Demi keamanan, silakan tunggu ${waitMinutes} menit sebelum mencoba kembali.`,
        },
        { status: 429 }
      );
    }

    // Normalisasi identifier: toleran huruf besar/kecil, akhiran domain @sppg.id, atau nomor HP
    const normalizedEmail = rawId.includes("@")
      ? rawId.toLowerCase()
      : `${rawId.toLowerCase()}@sppg.id`;

    // Cari user berdasarkan email atau nomor HP
    const [user] = await db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.email, rawId),
          ilike(users.email, normalizedEmail),
          eq(users.nomorHp, rawId)
        )
      )
      .limit(1);

    if (!user || !user.isActive) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: "Akun tidak ditemukan atau tidak aktif." },
        { status: 401 }
      );
    }

    // Verifikasi password (dengan fallback toleran spasi keyboard mobile)
    let isValid = verifyPassword(rawPass, user.passwordHash);
    if (!isValid && rawPass !== rawPass.trim()) {
      isValid = verifyPassword(rawPass.trim(), user.passwordHash);
    }

    if (!isValid) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: "Password yang Anda masukkan salah." },
        { status: 401 }
      );
    }

    // Reset rate limit jika login berhasil
    resetRateLimit(rateLimitKey);

    // Buat JWT Token
    const token = await signToken({
      id: user.id,
      role: user.role,
      nomorHp: user.nomorHp,
      email: user.email,
    });

    const res = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      user: {
        id: user.id,
        role: user.role,
        nomorHp: user.nomorHp,
        email: user.email,
      },
    });

    // Pastikan secure hanya true jika request benar-benar via HTTPS
    // Jika diakses via HTTP (misal IP LAN http://192.168.1.8:3000), secure harus false
    // agar browser tidak membuang cookie.
    const isHttps =
      req.nextUrl.protocol === "https:" ||
      req.headers.get("x-forwarded-proto") === "https";

    // Pasang HttpOnly cookie
    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return res;
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err?.message || "Gagal memproses login." },
      { status: 500 }
    );
  }
}
