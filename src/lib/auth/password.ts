import "server-only";
import { compare, hash } from "bcryptjs";

const ROUNDS = 12;
let dummyHash: Promise<string> | undefined;

export function hashPassword(password: string) {
  return hash(password, ROUNDS);
}

/** Sempre executa uma comparação bcrypt, mesmo sem hash, para que o tempo de resposta não revele se o e-mail existe. */
export async function verifyPassword(password: string, passwordHash: string | null | undefined) {
  if (passwordHash) return compare(password, passwordHash);
  dummyHash ??= hash("promo-oeiras-dummy-password", ROUNDS);
  await compare(password, await dummyHash);
  return false;
}
