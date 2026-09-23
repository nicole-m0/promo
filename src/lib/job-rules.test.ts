import { describe, expect, it } from "vitest";
import { deadlineFromInput, deadlineToInput, formatLocation, formatSalary } from "@/lib/job-format";
import { buildPublicJobWhere, isAcceptingApplications, isPubliclyVisible, jobFiltersToQuery, parseJobFilters, publicJobWhere } from "@/lib/job-rules";

const now = new Date("2026-09-23T15:00:00Z");

describe("regra de publicação", () => {
  it("só considera públicas vagas PUBLISHED e não expiradas", () => {
    expect(publicJobWhere(now)).toEqual({ status: "PUBLISHED", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] });
  });

  it.each([
    ["publicada sem prazo", { status: "PUBLISHED", applicationDeadline: null, expiresAt: null }, true],
    ["publicada no último dia do prazo", { status: "PUBLISHED", applicationDeadline: deadlineFromInput("2026-09-23"), expiresAt: null }, true],
    ["prazo vencido", { status: "PUBLISHED", applicationDeadline: deadlineFromInput("2026-09-22"), expiresAt: null }, false],
    ["expirada", { status: "PUBLISHED", applicationDeadline: null, expiresAt: new Date("2026-09-01") }, false],
    ["pendente", { status: "PENDING", applicationDeadline: null, expiresAt: null }, false],
    ["recusada", { status: "REJECTED", applicationDeadline: null, expiresAt: null }, false],
    ["encerrada", { status: "CLOSED", applicationDeadline: null, expiresAt: null }, false],
  ])("aceita candidaturas: %s → %s", (_label, job, expected) => {
    expect(isAcceptingApplications(job, now)).toBe(expected);
  });

  it.each([
    ["publicada sem expiração", { status: "PUBLISHED", expiresAt: null }, true],
    ["publicada ainda válida", { status: "PUBLISHED", expiresAt: new Date("2026-10-01") }, true],
    ["publicada e expirada", { status: "PUBLISHED", expiresAt: new Date("2026-09-01") }, false],
    ["expira exatamente agora", { status: "PUBLISHED", expiresAt: now }, false],
    ["pendente", { status: "PENDING", expiresAt: null }, false],
  ])("anúncio público visível: %s → %s", (_label, job, expected) => {
    expect(isPubliclyVisible(job, now)).toBe(expected);
  });
});

describe("filtros de vagas", () => {
  it("lê filtros válidos da URL", () => {
    expect(parseJobFilters({ q: " atendente ", cidade: "Oeiras", uf: "PI", modalidade: "REMOTE", tipo: "CLT", area: "Comércio", encerradas: "1", pagina: "2" }))
      .toEqual({ q: "atendente", city: "Oeiras", state: "PI", workMode: "REMOTE", employmentType: "CLT", area: "Comércio", includeClosed: true, page: 2 });
  });

  it("ignora valores inválidos em vez de falhar", () => {
    expect(parseJobFilters({ uf: "XX", modalidade: "OFFICE", tipo: "Qualquer", pagina: "-3", q: ["a", "b"], encerradas: "sim" }))
      .toEqual({ q: "a", city: undefined, state: undefined, workMode: undefined, employmentType: undefined, area: undefined, includeClosed: false, page: 1 });
  });

  it("sempre inclui a regra de publicação e, por padrão, esconde inscrições encerradas", () => {
    const where = buildPublicJobWhere(parseJobFilters({}), now);
    expect(where.AND).toEqual([publicJobWhere(now), { OR: [{ applicationDeadline: null }, { applicationDeadline: { gte: now } }] }]);
  });

  it("combina os filtros com AND sem afrouxar a regra de publicação", () => {
    const where = buildPublicJobWhere(parseJobFilters({ q: "caixa", uf: "PI", modalidade: "ON_SITE", tipo: "CLT", area: "Comércio", cidade: "oeiras", encerradas: "1" }), now);
    const and = where.AND as object[];
    expect(and[0]).toEqual(publicJobWhere(now));
    expect(and).toContainEqual({ state: "PI" });
    expect(and).toContainEqual({ workMode: "ON_SITE" });
    expect(and).toContainEqual({ employmentType: "CLT" });
    expect(and).toContainEqual({ city: { contains: "oeiras", mode: "insensitive" } });
    expect(and).toContainEqual({ area: { equals: "Comércio", mode: "insensitive" } });
    expect(JSON.stringify(and)).toContain('"company":{"name":{"contains":"caixa"');
    expect(JSON.stringify(and)).not.toContain("applicationDeadline");
  });

  it("gera a query string de paginação preservando os filtros", () => {
    const filters = parseJobFilters({ q: "caixa", uf: "PI" });
    expect(jobFiltersToQuery(filters, { page: 2 })).toBe("?q=caixa&uf=PI&pagina=2");
    expect(jobFiltersToQuery(parseJobFilters({}))).toBe("");
  });
});

describe("formatação", () => {
  const base = { salaryMinCents: null, salaryMaxCents: null, salaryNegotiable: false, salaryHidden: false };
  it.each([
    [{ salaryMinCents: 180000, salaryMaxCents: 250000 }, "R$ 1.800 a R$ 2.500"],
    [{ salaryMinCents: 180000 }, "A partir de R$ 1.800"],
    [{ salaryMaxCents: 250000 }, "Até R$ 2.500"],
    [{ salaryNegotiable: true }, "A combinar"],
    [{ salaryMinCents: 180000, salaryHidden: true }, null],
    [{}, null],
  ])("salário %o → %s", (job, expected) => {
    expect(formatSalary({ ...base, ...job })?.replace(/ /g, " ") ?? null).toBe(expected);
  });

  it("converte o prazo para o fim do dia em UTC-3 e de volta", () => {
    const deadline = deadlineFromInput("2026-10-15");
    expect(deadline.toISOString()).toBe("2026-10-16T02:59:59.999Z");
    expect(deadlineToInput(deadline)).toBe("2026-10-15");
  });

  it("formata a localização", () => {
    expect(formatLocation({ city: "Oeiras", state: "PI", workMode: "ON_SITE" })).toBe("Oeiras - PI");
    expect(formatLocation({ city: null, state: null, workMode: "REMOTE" })).toBe("Remoto");
  });
});
