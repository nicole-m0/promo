import { describe, expect, it } from "vitest";
import { parseCurrencyToCents } from "@/lib/validation/form";
import { candidateProfileSchema, companyProfileSchema } from "@/lib/validation/profile";

describe("parseCurrencyToCents", () => {
  it.each([
    ["", null], ["2500", 250000], ["2.500", 250000], ["2.500,50", 250050], ["R$ 1.234.567,8", 123456780], ["2500,5", 250050], ["2500.50", 250050],
  ])("%s → %s", (input, cents) => expect(parseCurrencyToCents(input)).toBe(cents));

  it.each(["abc", "2,500.00", "1.23.4", "-10"])("rejeita %s", (input) => expect(parseCurrencyToCents(input)).toBeUndefined());
});

const candidate = { fullName: "Maria Silva", phone: "", city: "", state: "", professionalTitle: "", professionalArea: "", professionalSummary: "", salaryExpectation: "", desiredWorkMode: "", desiredEmploymentType: "", availability: "" };

describe("candidateProfileSchema", () => {
  it("converte campos vazios em null e salário em centavos", () => {
    const result = candidateProfileSchema.parse({ ...candidate, salaryExpectation: "3.000,00", state: "PI", desiredWorkMode: "REMOTE" });
    expect(result).toMatchObject({ city: null, state: "PI", desiredWorkMode: "REMOTE", salaryExpectationCents: 300000 });
    expect(result).not.toHaveProperty("salaryExpectation");
  });

  it("rejeita valores fora das opções", () => {
    expect(candidateProfileSchema.safeParse({ ...candidate, state: "XX" }).success).toBe(false);
    expect(candidateProfileSchema.safeParse({ ...candidate, desiredWorkMode: "OFFICE" }).success).toBe(false);
    expect(candidateProfileSchema.safeParse({ ...candidate, phone: "123" }).success).toBe(false);
  });
});

describe("companyProfileSchema", () => {
  const company = { name: "Loja Oeiras", description: "", industry: "", website: "", linkedInUrl: "", instagramUrl: "", contactEmail: "", contactPhone: "", city: "", state: "", companySize: "" };

  it("adiciona https:// às URLs sem protocolo", () => {
    expect(companyProfileSchema.parse({ ...company, website: "lojaoeiras.com.br" }).website).toBe("https://lojaoeiras.com.br");
  });

  it("rejeita URL e e-mail inválidos", () => {
    expect(companyProfileSchema.safeParse({ ...company, website: "não é url" }).success).toBe(false);
    expect(companyProfileSchema.safeParse({ ...company, contactEmail: "contato@" }).success).toBe(false);
  });
});
