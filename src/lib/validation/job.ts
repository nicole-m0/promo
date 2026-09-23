import { z } from "zod";
import { deadlineFromInput } from "@/lib/job-format";
import { BRAZILIAN_STATES, EMPLOYMENT_TYPES, WORK_MODES } from "@/lib/profile-options";
import { optionalChoice, optionalText, parseCurrencyToCents } from "@/lib/validation/form";

const MAX_SALARY_CENTS = 100_000_000;
const DAY_MS = 24 * 60 * 60 * 1000;

const salary = z.string().transform((value, ctx) => {
  const cents = parseCurrencyToCents(value);
  if (cents === undefined || (cents !== null && cents > MAX_SALARY_CENTS)) { ctx.addIssue({ code: "custom", message: "Informe um valor válido em reais (ex.: 2.500,00)." }); return z.NEVER; }
  return cents;
});
const checkbox = z.string().transform((value) => value === "on");

/**
 * Valida o formulário de vaga. Só produz campos editáveis pelo contratante:
 * companyId, status, slug e datas de publicação são sempre definidos no servidor.
 */
export const jobSchema = z.object({
  title: z.string().trim().min(3, { error: "Informe o título da vaga (mínimo de 3 caracteres)." }).max(120, { error: "Use no máximo 120 caracteres." }),
  area: optionalText(100),
  summary: optionalText(500),
  city: optionalText(100),
  state: optionalChoice(BRAZILIAN_STATES, "Selecione um estado válido."),
  workMode: z.enum(WORK_MODES, { error: "Selecione a modalidade de trabalho." }),
  employmentType: z.enum(EMPLOYMENT_TYPES, { error: "Selecione o tipo de contratação." }),
  salaryMin: salary,
  salaryMax: salary,
  salaryNegotiable: checkbox,
  salaryHidden: checkbox,
  description: z.string().trim().min(30, { error: "Descreva a vaga com pelo menos 30 caracteres." }).max(5000, { error: "Use no máximo 5000 caracteres." }),
  responsibilities: optionalText(3000),
  requiredSkills: optionalText(3000),
  desiredSkills: optionalText(3000),
  benefits: optionalText(2000),
  workSchedule: optionalText(120),
  additionalInformation: optionalText(2000),
  applicationDeadline: z.string().trim().transform((value, ctx) => {
    if (!value) return null;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? deadlineFromInput(value) : new Date(NaN);
    const now = Date.now();
    if (Number.isNaN(date.getTime())) ctx.addIssue({ code: "custom", message: "Informe uma data válida." });
    else if (date.getTime() < now) ctx.addIssue({ code: "custom", message: "O prazo não pode estar no passado." });
    else if (date.getTime() > now + 365 * DAY_MS) ctx.addIssue({ code: "custom", message: "O prazo deve ser de no máximo 1 ano." });
    else return date;
    return z.NEVER;
  }),
  maxApplications: z.string().trim().transform((value, ctx) => {
    if (!value) return null;
    const number = Number(value);
    if (Number.isInteger(number) && number >= 1 && number <= 10_000) return number;
    ctx.addIssue({ code: "custom", message: "Informe um número inteiro entre 1 e 10.000." });
    return z.NEVER;
  }),
}).superRefine((job, ctx) => {
  if (job.workMode !== "REMOTE" && (!job.city || !job.state)) {
    if (!job.city) ctx.addIssue({ code: "custom", path: ["city"], message: "Informe a cidade para vagas presenciais ou híbridas." });
    if (!job.state) ctx.addIssue({ code: "custom", path: ["state"], message: "Informe a UF." });
  }
  if (job.salaryMin != null && job.salaryMax != null && job.salaryMax < job.salaryMin)
    ctx.addIssue({ code: "custom", path: ["salaryMax"], message: "O salário máximo deve ser maior ou igual ao mínimo." });
}).transform(({ salaryMin, salaryMax, ...job }) => ({ ...job, salaryMinCents: salaryMin, salaryMaxCents: salaryMax }));

export type JobInput = z.output<typeof jobSchema>;

export const rejectJobSchema = z.object({
  reason: z.string().trim().min(10, { error: "Explique o motivo da recusa (mínimo de 10 caracteres)." }).max(1000, { error: "Use no máximo 1000 caracteres." }),
});
