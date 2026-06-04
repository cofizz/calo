// Authentication helpers: password hashing + signed session cookies.
//
// Security choices:
// - Passwords are hashed with bcrypt (never stored or logged in plain text).
// - The session is a signed JWT stored in an httpOnly, Secure, SameSite=Lax cookie,
//   so client-side JavaScript (and any injected/XSS script) can't read the token.
// - The token is signed with AUTH_SECRET; a tampered token fails verification.
import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const SESSION_DAYS = 30;

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET is missing or too short. Set it in .env");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(plain: string): Promise<string> {
  // Cost factor 12 ≈ a good balance of security and speed in 2026.
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Create the signed token for a user id.
async function signSession(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecretKey());
}

// Set the login cookie. Call after a successful signup or login.
export async function createSession(userId: string): Promise<void> {
  const token = await signSession(userId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // not readable by JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS-only in prod
    sameSite: "lax", // mitigates CSRF
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Returns the logged-in user's id, or null if not authenticated.
// Verifies the signature + expiry; a forged or expired token returns null.
export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
