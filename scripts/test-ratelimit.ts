import assert from "node:assert/strict";
import { checkRateLimit } from "../src/lib/rate-limit";

// Test 1: Within limit
const key = "test-user-ip-1";
const r1 = checkRateLimit(key, 3, 1000);
assert.equal(r1.allowed, true);
assert.equal(r1.remaining, 2);

const r2 = checkRateLimit(key, 3, 1000);
assert.equal(r2.allowed, true);
assert.equal(r2.remaining, 1);

const r3 = checkRateLimit(key, 3, 1000);
assert.equal(r3.allowed, true);
assert.equal(r3.remaining, 0);

// Test 2: Limit exceeded
const r4 = checkRateLimit(key, 3, 1000);
assert.equal(r4.allowed, false);
assert.equal(r4.remaining, 0);

console.log("✓ Rate limiting in-memory algorithm lolos 100%.");
