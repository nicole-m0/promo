import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JOB_FIELDS, type JobField } from "@/lib/job-options";
import { jobSchema, rejectJobSchema } from "@/lib/validation/job";

const empty = Object.fromEntries(JOB_FIELDS.map((field) => [field, ""])) as Record<JobField, string>;
const valid = { ...empty, title: "Atendente de loja", workMode: "ON_SITE", employmentType: "CLT", city: "Oeiras", state: "PI", description: "Atendimento ao público, organização da loja e apoio ao caixa." };
const issuesOf = (input: object) => { const result = jobSchema.safeParse(input); return result.success ? [] : result.error.issues.map((issue) => issue.path[0]); };

describe("jobSchema", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-23T15:00:00Z")); });
  afterEach(() => vi.useRealTimers());

  it("aceita uma vaga válida e normaliza campos opcionais para null", () => {
    const job = jobSchema.parse(valid);
    expect(job).toMatchObject({ title: "Atendente de loja", area: null, summary: null, salaryMinCents: null, salaryMaxCents: null, salaryNegotiable: false, applicationDeadline: null, maxApplications: null });
  });

  it("nunca produz campos controlados pelo servidor, mesmo se enviados", () => {
    const job = jobSchema.parse({ ...valid, companyId: "outra-empresa", status: "PUBLISHED", slug: "x", publishedAt: "2026-01-01" });
    for (const key of ["companyId", "status", "slug", "publishedAt"]) expect(job).not.toHaveProperty(key);
  });

  it("converte salários para centavos e checkboxes para boolean", () => {
    const job = jobSchema.parse({ ...valid, salaryMin: "1.800,00", salaryMax: "2500", salaryNegotiable: "on", salaryHidden: "on" });
    expect(job).toMatchObject({ salaryMinCents: 180000, salaryMaxCents: 250000, salaryNegotiable: true, salaryHidden: true });
  });

  it("exige cidade e UF para vagas presenciais/híbridas, mas não para remotas", () => {
    expect(issuesOf({ ...valid, city: "", state: "" })).toEqual(expect.arrayContaining(["city", "state"]));
    expect(jobSchema.safeParse({ ...valid, workMode: "REMOTE", city: "", state: "" }).success).toBe(true);
  });

  it.each([
    ["título curto", { title: "AB" }, "title"],
    ["descrição curta", { description: "Curta" }, "description"],
    ["modalidade inválida", { workMode: "OFFICE" }, "workMode"],
    ["contratação inválida", { employmentType: "Outro" }, "employmentType"],
    ["salário inválido", { salaryMin: "abc" }, "salaryMin"],
    ["máximo menor que mínimo", { salaryMin: "3000", salaryMax: "2000" }, "salaryMax"],
    ["prazo no passado", { applicationDeadline: "2026-09-22" }, "applicationDeadline"],
    ["prazo acima de 1 ano", { applicationDeadline: "2028-01-01" }, "applicationDeadline"],
    ["data malformada", { applicationDeadline: "23/09/2026" }, "applicationDeadline"],
    ["limite zero", { maxApplications: "0" }, "maxApplications"],
    ["limite fracionado", { maxApplications: "2.5" }, "maxApplications"],
  ])("rejeita %s", (_label, override, field) => {
    expect(issuesOf({ ...valid, ...override })).toContain(field);
  });

  it("aceita prazo no próprio dia (encerra no fim do dia)", () => {
    const job = jobSchema.parse({ ...valid, applicationDeadline: "2026-09-23", maxApplications: "50" });
    expect(job.applicationDeadline?.toISOString()).toBe("2026-09-24T02:59:59.999Z");
    expect(job.maxApplications).toBe(50);
  });
});

describe("rejectJobSchema", () => {
  it("exige motivo com pelo menos 10 caracteres", () => {
    expect(rejectJobSchema.safeParse({ reason: "curto" }).success).toBe(false);
    expect(rejectJobSchema.safeParse({ reason: "Faltam informações sobre o salário." }).success).toBe(true);
  });
});
