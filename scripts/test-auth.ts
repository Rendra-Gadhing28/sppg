import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/lib/password";
import { signToken, verifyToken } from "../src/lib/jwt";

async function testAuth() {
  // 1. Test Password Hashing
  const raw = "password123";
  const hash = hashPassword(raw);
  assert.equal(verifyPassword(raw, hash), true);
  assert.equal(verifyPassword("wrongpass", hash), false);

  // 2. Test JWT Signing & Verification
  const payload = {
    id: "user-123",
    role: "admin",
    nomorHp: "081200000001",
    email: "admin@sppg.id",
  };
  const token = await signToken(payload);
  assert.ok(typeof token === "string" && token.length > 20);

  const decoded = await verifyToken(token);
  assert.ok(decoded);
  assert.equal(decoded.id, payload.id);
  assert.equal(decoded.role, payload.role);

  // 3. Test Invalid Token
  const badToken = await verifyToken("invalid.token.signature");
  assert.equal(badToken, null);

  console.log("✓ Semua runnable check auth (scrypt hash + JWT) lolos 100%.");
}

testAuth().catch((err) => {
  console.error("Auth test failed:", err);
  process.exit(1);
});
