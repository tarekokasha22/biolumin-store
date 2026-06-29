import { SignJWT, jwtVerify } from "jose";
import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "biolumin_admin";

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? "biolumin-dev-secret-change-me",
);

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "biolumin";
  // Constant-time comparison to avoid leaking the password length/contents
  // via response-timing differences. Hash both sides to equal-length buffers
  // so timingSafeEqual never throws on a length mismatch.
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
