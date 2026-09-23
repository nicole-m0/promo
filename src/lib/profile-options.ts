// Opções e campos dos formulários de perfil, compartilhados entre cliente e servidor.
export const BRAZILIAN_STATES = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] as const;
export const WORK_MODES = ["ON_SITE", "HYBRID", "REMOTE"] as const;
export const workModeLabels: Record<(typeof WORK_MODES)[number], string> = { ON_SITE: "Presencial", HYBRID: "Híbrido", REMOTE: "Remoto" };
export const EMPLOYMENT_TYPES = ["CLT", "PJ", "Estágio", "Temporário", "Freelancer", "Jovem Aprendiz"] as const;
export const COMPANY_SIZES = ["1 a 10 pessoas", "11 a 50 pessoas", "51 a 200 pessoas", "201 a 500 pessoas", "Mais de 500 pessoas"] as const;
export const CANDIDATE_PROFILE_FIELDS = ["fullName", "phone", "city", "state", "professionalTitle", "professionalArea", "professionalSummary", "salaryExpectation", "desiredWorkMode", "desiredEmploymentType", "availability"] as const;
export const COMPANY_PROFILE_FIELDS = ["name", "description", "industry", "website", "linkedInUrl", "instagramUrl", "contactEmail", "contactPhone", "city", "state", "companySize"] as const;
