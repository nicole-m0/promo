import { randomBytes } from "crypto";

export function slugify(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "");
}

/** Slug público da empresa; o sufixo aleatório evita colisão entre empresas com o mesmo nome. */
export function companySlug(name: string) {
  return `${slugify(name) || "empresa"}-${randomBytes(3).toString("hex")}`;
}

/** Slug da vaga; o id continua sendo o identificador usado nas rotas. */
export function jobSlug(title: string) {
  return `${slugify(title) || "vaga"}-${randomBytes(4).toString("hex")}`;
}
