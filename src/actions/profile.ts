"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { companySlug } from "@/lib/slug";
import { fieldErrors, readForm, type FormState } from "@/lib/validation/form";
import { CANDIDATE_PROFILE_FIELDS, candidateProfileSchema, COMPANY_PROFILE_FIELDS, companyProfileSchema } from "@/lib/validation/profile";

type CandidateProfileState = FormState<(typeof CANDIDATE_PROFILE_FIELDS)[number]>;
type CompanyProfileState = FormState<(typeof COMPANY_PROFILE_FIELDS)[number]>;

const saveError = (error: unknown) => {
  console.error("[profile] save failed:", error instanceof Prisma.PrismaClientKnownRequestError ? error.code : error instanceof Error ? error.name : "unknown");
  return "Não foi possível salvar as alterações agora. Tente novamente em instantes.";
};

export async function updateCandidateProfile(_prev: CandidateProfileState, formData: FormData): Promise<CandidateProfileState> {
  const user = await requireRole("CANDIDATE");
  const raw = readForm(formData, CANDIDATE_PROFILE_FIELDS);
  const parsed = candidateProfileSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: raw };
  try {
    await db.candidateProfile.upsert({ where: { userId: user.id }, update: parsed.data, create: { ...parsed.data, userId: user.id } });
  } catch (error) {
    return { message: saveError(error), values: raw };
  }
  revalidatePath("/candidato", "layout");
  return { success: true, message: "Perfil atualizado com sucesso." };
}

export async function updateCompanyProfile(_prev: CompanyProfileState, formData: FormData): Promise<CompanyProfileState> {
  const user = await requireRole("EMPLOYER");
  const raw = readForm(formData, COMPANY_PROFILE_FIELDS);
  const parsed = companyProfileSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: raw };
  try {
    // O slug é definido na criação e não muda ao editar, para manter links estáveis.
    await db.companyProfile.upsert({ where: { userId: user.id }, update: parsed.data, create: { ...parsed.data, userId: user.id, slug: companySlug(parsed.data.name) } });
  } catch (error) {
    return { message: saveError(error), values: raw };
  }
  revalidatePath("/contratante", "layout");
  return { success: true, message: "Dados da empresa atualizados com sucesso." };
}
