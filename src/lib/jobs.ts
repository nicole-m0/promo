import "server-only";
import type { Prisma } from "@prisma/client";
import { cache } from "react";
import { db } from "@/lib/db";
import { buildPublicJobWhere, type JobFilters, JOBS_PAGE_SIZE, publicJobWhere } from "@/lib/job-rules";

export const ADMIN_JOB_ACTIONS = { approved: "JOB_APPROVED", rejected: "JOB_REJECTED" } as const;

// Somente dados públicos: da empresa sai apenas o nome (nunca contatos ou dados do usuário).
const jobCardSelect = {
  id: true, title: true, area: true, city: true, state: true, workMode: true, employmentType: true, summary: true, status: true,
  salaryMinCents: true, salaryMaxCents: true, salaryNegotiable: true, salaryHidden: true, applicationDeadline: true, expiresAt: true,
  publishedAt: true, createdAt: true, company: { select: { name: true } },
} satisfies Prisma.JobSelect;

const jobDetailSelect = {
  ...jobCardSelect, description: true, responsibilities: true, requiredSkills: true, desiredSkills: true, benefits: true,
  workSchedule: true, additionalInformation: true, maxApplications: true,
} satisfies Prisma.JobSelect;

export type JobCardData = Prisma.JobGetPayload<{ select: typeof jobCardSelect }>;
export type JobDetailData = Prisma.JobGetPayload<{ select: typeof jobDetailSelect }>;

// ---- Público ----

export async function searchPublicJobs(filters: JobFilters, now: Date) {
  const where = buildPublicJobWhere(filters, now);
  const [jobs, total] = await Promise.all([
    db.job.findMany({ where, select: jobCardSelect, orderBy: [{ publishedAt: "desc" }, { id: "desc" }], skip: (filters.page - 1) * JOBS_PAGE_SIZE, take: JOBS_PAGE_SIZE }),
    db.job.count({ where }),
  ]);
  return { jobs, total, pages: Math.max(1, Math.ceil(total / JOBS_PAGE_SIZE)) };
}

export async function getPublicJobAreas(now: Date) {
  const rows = await db.job.findMany({ where: { AND: [publicJobWhere(now), { area: { not: null } }] }, distinct: ["area"], select: { area: true }, orderBy: { area: "asc" }, take: 100 });
  return rows.map((row) => row.area).filter((area): area is string => Boolean(area));
}

/** Memoizado por request: a página e o generateMetadata usam a mesma consulta. */
export const getPublicJob = cache((id: string) => db.job.findFirst({ where: { AND: [{ id }, publicJobWhere(new Date())] }, select: jobDetailSelect }));

// ---- Contratante (sempre filtrado pelo dono da empresa) ----

export function getEmployerJobs(userId: string) {
  return db.job.findMany({ where: { company: { userId } }, select: { ...jobCardSelect, _count: { select: { applications: true } } }, orderBy: { createdAt: "desc" } });
}

export function getOwnedJob(userId: string, id: string) {
  return db.job.findFirst({ where: { id, company: { userId } }, select: jobDetailSelect });
}

/** Motivo da última recusa, guardado em AdminAction.metadata. Não expõe quem moderou. */
export async function getLatestRejectionReason(jobId: string) {
  const action = await db.adminAction.findFirst({ where: { targetType: "JOB", targetId: jobId, action: ADMIN_JOB_ACTIONS.rejected }, orderBy: { createdAt: "desc" }, select: { metadata: true } });
  const metadata = action?.metadata;
  return metadata && typeof metadata === "object" && !Array.isArray(metadata) && typeof metadata.reason === "string" ? metadata.reason : null;
}

// ---- Admin ----

export function getPendingJobs() {
  return db.job.findMany({ where: { status: "PENDING" }, select: jobDetailSelect, orderBy: { createdAt: "asc" } });
}

export function countPendingJobs() {
  return db.job.count({ where: { status: "PENDING" } });
}
