import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";

const cookieName = "promo_oeiras_session";
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { userId, tokenHash: tokenHash(token), expiresAt } });
  (await cookies()).set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", expires: expiresAt, path: "/" });
}
export async function destroySession() {
  const store = await cookies(); const token = store.get(cookieName)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
  store.delete(cookieName);
}
export async function getCurrentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  return (await db.session.findFirst({ where: { tokenHash: tokenHash(token), expiresAt: { gt: new Date() }, user: { status: "ACTIVE" } }, include: { user: true } }))?.user ?? null;
}
export async function requireRole(role: UserRole) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (user.role !== role) redirect("/");
  return user;
}
