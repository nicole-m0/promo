import type { WorkMode } from "@prisma/client";
import { workModeLabels } from "@/lib/profile-options";

// Oeiras (PI) usa UTC-3 o ano todo; as datas de prazo são interpretadas nesse fuso.
export const APP_TIME_ZONE = "America/Fortaleza";
const OFFSET = "-03:00";

/** "2026-10-15" → fim desse dia no fuso da aplicação. */
export function deadlineFromInput(value: string) {
  return new Date(`${value}T23:59:59.999${OFFSET}`);
}

/** Date → "2026-10-15" para <input type="date">. */
export function deadlineToInput(date: Date | null | undefined) {
  return date ? new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE }).format(date) : "";
}

export function formatDate(date: Date | null | undefined) {
  return date ? new Intl.DateTimeFormat("pt-BR", { timeZone: APP_TIME_ZONE }).format(date) : "";
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function formatSalary(job: { salaryMinCents: number | null; salaryMaxCents: number | null; salaryNegotiable: boolean; salaryHidden: boolean }) {
  if (job.salaryHidden) return null;
  const min = job.salaryMinCents != null ? brl.format(job.salaryMinCents / 100) : null;
  const max = job.salaryMaxCents != null ? brl.format(job.salaryMaxCents / 100) : null;
  if (min && max) return min === max ? min : `${min} a ${max}`;
  if (min) return `A partir de ${min}`;
  if (max) return `Até ${max}`;
  return job.salaryNegotiable ? "A combinar" : null;
}

export function formatLocation(job: { city: string | null; state: string | null; workMode: WorkMode }) {
  const place = [job.city, job.state].filter(Boolean).join(" - ");
  if (job.workMode === "REMOTE") return place ? `Remoto (${place})` : "Remoto";
  return place || workModeLabels[job.workMode];
}
