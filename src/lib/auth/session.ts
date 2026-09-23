import "server-only";
import { createHash, randomBytes } from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/auth/constants";

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.deleteMany({ where: { userId, expiresAt: { lte: new Date() } } });
  await db.session.create({ data: { userId, tokenHash: tokenHash(token), expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", expires: expiresAt, path: "/" });
}

export async function destroySession() {
  const store = await cookies(); const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
  store.delete(SESSION_COOKIE);
}

/** Usuário da sessão atual (sem dados sensíveis), memoizado por request. */
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { tokenHash: tokenHash(token) }, select: { expiresAt: true, user: { select: { id: true, email: true, role: true, status: true } } } });
  if (!session || session.expiresAt <= new Date() || session.user.status !== "ACTIVE") return null;
  const { id, email, role } = session.user;
  return { id, email, role };
});
export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  return user;
}

export async function requireRole(role: UserRole): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== role) redirect("/acesso-negado");
  return user;
}
