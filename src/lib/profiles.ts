import "server-only";
import { db } from "@/lib/db";

// Sempre filtrado pelo id do usuário autenticado, nunca por um id vindo do cliente.
export function getCandidateProfile(userId: string) {
  return db.candidateProfile.findUnique({ where: { userId }, select: { fullName: true, phone: true, city: true, state: true, professionalTitle: true, professionalArea: true, professionalSummary: true, salaryExpectationCents: true, desiredWorkMode: true, desiredEmploymentType: true, availability: true } });
}
export type CandidateProfileData = NonNullable<Awaited<ReturnType<typeof getCandidateProfile>>>;

export function getCompanyProfile(userId: string) {
  return db.companyProfile.findUnique({ where: { userId }, select: { name: true, slug: true, description: true, industry: true, website: true, linkedInUrl: true, instagramUrl: true, contactEmail: true, contactPhone: true, city: true, state: true, companySize: true } });
}
export type CompanyProfileData = NonNullable<Awaited<ReturnType<typeof getCompanyProfile>>>;
