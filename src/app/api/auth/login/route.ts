import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { or, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/Nomor HP dan password wajib diisi." },
        { status: 400 }
      );
    }

    // Rate Limiting anti-brute force: Maksimal 5x gagal dalam 15 menit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`login:${ip}:${identifier}`, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil(rateLimit.resetMs / 60000);
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan login gagal. Demi keamanan, silakan tunggu ${waitMinutes} menit sebelum mencoba kembali.`,
        },
        { status: 429 }
      );
    }

    // Cari user berdasarkan email atau nomor HP
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.nomorHp, identifier)))
      .limit(1);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan atau tidak aktif." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Password yang Anda masukkan salah." },
        { status: 401 }
      );
    }

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

    // Pasang HttpOnly cookie
    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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
