import type { UserRole } from "@prisma/client";

// Sem dependências de servidor: este módulo também é usado pelo proxy.
export const SESSION_COOKIE = "promo_oeiras_session";
export const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export const roleHome: Record<UserRole, string> = { CANDIDATE: "/candidato/dashboard", EMPLOYER: "/contratante/dashboard", ADMIN: "/admin" };
const roleArea: Record<UserRole, string> = { CANDIDATE: "/candidato", EMPLOYER: "/contratante", ADMIN: "/admin" };

/** Destino após o login: aceita `next` apenas se for um caminho interno dentro da área da própria role. */
export function postLoginPath(role: UserRole, next?: string | null) {
  const area = roleArea[role];
  if (next && /^\/(?![/\\])[\w\-/]*$/.test(next) && (next === area || next.startsWith(`${area}/`))) return next;
  return roleHome[role];
}
