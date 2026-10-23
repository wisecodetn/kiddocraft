import { createHmac, timingSafeEqual } from "node:crypto";

// Signed admin session cookie: base64url(JSON {uid, exp}) + "." + HMAC-SHA256.
// Kept free of database and next/headers imports so the proxy can verify it too.

export const SESSION_COOKIE = "kc_admin";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return s;
}

export const signSession = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function readSessionToken(token: string | undefined): { uid: string } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(signSession(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { uid: string; exp: number };
    return data.exp > Date.now() ? { uid: data.uid } : null;
  } catch {
    return null;
  }
}
