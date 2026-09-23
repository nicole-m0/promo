import type { JobStatus } from "@prisma/client";

// Campos do formulário de vaga, compartilhados entre cliente e servidor.
export const JOB_FIELDS = [
  "title", "area", "summary", "city", "state", "workMode", "employmentType", "salaryMin", "salaryMax", "salaryNegotiable", "salaryHidden",
  "description", "responsibilities", "requiredSkills", "desiredSkills", "benefits", "workSchedule", "additionalInformation",
  "applicationDeadline", "maxApplications",
] as const;
export type JobField = (typeof JOB_FIELDS)[number];

export const jobStatusLabels: Record<JobStatus, string> = {
  DRAFT: "Rascunho", PENDING: "Em análise", PUBLISHED: "Publicada", PAUSED: "Pausada", CLOSED: "Encerrada", REJECTED: "Recusada",
};

/** Status em que o contratante ainda pode editar a vaga. Toda edição devolve a vaga para análise (PENDING). */
export const EDITABLE_JOB_STATUSES: readonly JobStatus[] = ["DRAFT", "PENDING", "PUBLISHED", "PAUSED", "REJECTED"];
