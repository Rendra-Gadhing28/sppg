import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE_NAME = "sppg_token";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sppg_secret_key_mbg_mandiri_jaya_2026_super_secure"
);

export interface TokenPayload {
  id: string;
  role: string;
  nomorHp: string;
  email?: string | null;
}

/**
 * Tanda tangani JWT dengan masa berlaku 7 hari.
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verifikasi dan decode token JWT (murni Web Crypto / Jose, aman di Edge Middleware).
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
