import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, readSessionToken, signSession } from "./session";

const SESSION_DAYS = 7;

export { hashPassword, verifyPassword } from "./password";

// ---------------------------------------------------------------- session

export async function setSession(userId: string) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + SESSION_DAYS * 864e5 })).toString("base64url");
  (await cookies()).set(SESSION_COOKIE, `${payload}.${signSession(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in admin, or null. */
export async function getAdmin() {
  const session = readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  return db.adminUser.findUnique({ where: { id: session.uid }, select: { id: true, email: true, name: true } });
}

/** Guards admin pages and every admin server action. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
