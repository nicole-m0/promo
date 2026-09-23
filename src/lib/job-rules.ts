import type { Prisma } from "@prisma/client";
import { BRAZILIAN_STATES, EMPLOYMENT_TYPES, WORK_MODES } from "@/lib/profile-options";

// Regras de visibilidade e busca de vagas. Módulo puro (sem banco) para ser testável.

export const JOBS_PAGE_SIZE = 20;

/** Uma vaga só é pública quando está PUBLISHED e não expirou. */
export function publicJobWhere(now: Date): Prisma.JobWhereInput {
  return { status: "PUBLISHED", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] };
}

/** Mesma regra de publicJobWhere, para uma vaga já carregada (ex.: decidir se o anúncio público existe). */
export function isPubliclyVisible(job: { status: string; expiresAt: Date | null }, now: Date) {
  return job.status === "PUBLISHED" && (!job.expiresAt || job.expiresAt > now);
}

/** Aceita candidaturas: pública e dentro do prazo (o prazo é o fim do dia informado). */
export function isAcceptingApplications(job: { status: string; applicationDeadline: Date | null; expiresAt: Date | null }, now: Date) {
  return isPubliclyVisible(job, now) && (!job.applicationDeadline || job.applicationDeadline >= now);
}

export type JobFilters = {
  q?: string; city?: string; state?: (typeof BRAZILIAN_STATES)[number]; workMode?: (typeof WORK_MODES)[number];
  employmentType?: (typeof EMPLOYMENT_TYPES)[number]; area?: string; includeClosed: boolean; page: number;
};
type SearchParams = Record<string, string | string[] | undefined>;

const text = (value: string | string[] | undefined, max = 100) => {
  const single = (Array.isArray(value) ? value[0] : value)?.trim().slice(0, max);
  return single || undefined;
};
const oneOf = <T extends string>(options: readonly T[], value: string | string[] | undefined) => {
  const single = text(value);
  return options.includes(single as T) ? (single as T) : undefined;
};

/** Lê os filtros da URL. Valores inválidos são ignorados em vez de gerar erro. */
export function parseJobFilters(params: SearchParams): JobFilters {
  const page = Number(text(params.pagina));
  return {
    q: text(params.q), city: text(params.cidade), state: oneOf(BRAZILIAN_STATES, params.uf), workMode: oneOf(WORK_MODES, params.modalidade),
    employmentType: oneOf(EMPLOYMENT_TYPES, params.tipo), area: text(params.area), includeClosed: text(params.encerradas) === "1",
    page: Number.isInteger(page) && page > 0 && page <= 1000 ? page : 1,
  };
}

export function buildPublicJobWhere(filters: JobFilters, now: Date): Prisma.JobWhereInput {
  const and: Prisma.JobWhereInput[] = [publicJobWhere(now)];
  const contains = (value: string) => ({ contains: value, mode: "insensitive" as const });
  if (!filters.includeClosed) and.push({ OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: now } }] });
  if (filters.q) and.push({ OR: [{ title: contains(filters.q) }, { summary: contains(filters.q) }, { description: contains(filters.q) }, { area: contains(filters.q) }, { company: { name: contains(filters.q) } }] });
  if (filters.city) and.push({ city: contains(filters.city) });
  if (filters.state) and.push({ state: filters.state });
  if (filters.workMode) and.push({ workMode: filters.workMode });
  if (filters.employmentType) and.push({ employmentType: filters.employmentType });
  if (filters.area) and.push({ area: { equals: filters.area, mode: "insensitive" } });
  return { AND: and };
}

/** Monta a query string mantendo os filtros atuais (para paginação). */
export function jobFiltersToQuery(filters: JobFilters, overrides: Partial<JobFilters> = {}) {
  const f = { ...filters, ...overrides };
  const entries: [string, string | undefined][] = [["q", f.q], ["cidade", f.city], ["uf", f.state], ["modalidade", f.workMode], ["tipo", f.employmentType], ["area", f.area], ["encerradas", f.includeClosed ? "1" : undefined], ["pagina", f.page > 1 ? String(f.page) : undefined]];
  const query = new URLSearchParams(entries.filter((entry): entry is [string, string] => Boolean(entry[1])));
  return query.size ? `?${query}` : "";
}
