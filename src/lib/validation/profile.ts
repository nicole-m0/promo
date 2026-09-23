import { z } from "zod";
import { BRAZILIAN_STATES, COMPANY_SIZES, EMPLOYMENT_TYPES, WORK_MODES } from "@/lib/profile-options";
import { optionalChoice, optionalEmail, optionalPhone, optionalText, optionalUrl, parseCurrencyToCents } from "@/lib/validation/form";

const requiredName = (label: string) => z.string().trim().min(2, { error: `Informe ${label} com pelo menos 2 caracteres.` }).max(120, { error: "Use no máximo 120 caracteres." });
const state = optionalChoice(BRAZILIAN_STATES, "Selecione um estado válido.");

export { CANDIDATE_PROFILE_FIELDS, COMPANY_PROFILE_FIELDS } from "@/lib/profile-options";

export const candidateProfileSchema = z.object({
  fullName: requiredName("seu nome"),
  phone: optionalPhone,
  city: optionalText(100),
  state,
  professionalTitle: optionalText(120),
  professionalArea: optionalText(100),
  professionalSummary: optionalText(2000),
  salaryExpectation: z.string().transform((value, ctx) => {
    const cents = parseCurrencyToCents(value);
    if (cents === undefined || (cents !== null && cents > 100_000_000)) { ctx.addIssue({ code: "custom", message: "Informe um valor válido em reais (ex.: 2.500,00)." }); return z.NEVER; }
    return cents;
  }),
  desiredWorkMode: optionalChoice(WORK_MODES, "Selecione uma modalidade válida."),
  desiredEmploymentType: optionalChoice(EMPLOYMENT_TYPES, "Selecione um tipo de contratação válido."),
  availability: optionalText(120),
}).transform(({ salaryExpectation, ...data }) => ({ ...data, salaryExpectationCents: salaryExpectation }));

export const companyProfileSchema = z.object({
  name: requiredName("o nome da empresa"),
  description: optionalText(3000),
  industry: optionalText(100),
  website: optionalUrl,
  linkedInUrl: optionalUrl,
  instagramUrl: optionalUrl,
  contactEmail: optionalEmail,
  contactPhone: optionalPhone,
  city: optionalText(100),
  state,
  companySize: optionalChoice(COMPANY_SIZES, "Selecione um porte válido."),
});
