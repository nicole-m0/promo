"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { EDITABLE_JOB_STATUSES, JOB_FIELDS, type JobField } from "@/lib/job-options";
import { jobSlug } from "@/lib/slug";
import { fieldErrors, readForm, type FormState } from "@/lib/validation/form";
import { jobSchema } from "@/lib/validation/job";

export type JobFormState = FormState<JobField>;

const saveError = (error: unknown) => {
  console.error("[jobs] save failed:", error instanceof Prisma.PrismaClientKnownRequestError ? error.code : error instanceof Error ? error.name : "unknown");
  return "Não foi possível salvar a vaga agora. Tente novamente em instantes.";
};

function revalidateJob(jobId?: string) {
  revalidatePath("/contratante/vagas", "layout");
  revalidatePath("/admin/vagas");
  revalidatePath("/vagas");
  if (jobId) revalidatePath(`/vagas/${jobId}`);
}

// A empresa vem sempre do usuário da sessão; companyId, status e slug nunca são lidos do formulário.
export async function createJob(_prev: JobFormState, formData: FormData): Promise<JobFormState> {
  const user = await requireRole("EMPLOYER");
  const raw = readForm(formData, JOB_FIELDS);
  const parsed = jobSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: raw };

  let jobId: string;
  try {
    const company = await db.companyProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!company) return { message: "Complete o perfil da empresa antes de publicar vagas.", values: raw };
    const job = await db.job.create({ data: { ...parsed.data, companyId: company.id, slug: jobSlug(parsed.data.title), status: "PENDING" }, select: { id: true } });
    jobId = job.id;
  } catch (error) {
    return { message: saveError(error), values: raw };
  }
  revalidateJob();
  redirect(`/contratante/vagas/${jobId}?aviso=criada`);
}

/** Qualquer edição devolve a vaga para análise (PENDING), inclusive se já estava publicada. */
export async function updateJob(jobId: string, _prev: JobFormState, formData: FormData): Promise<JobFormState> {
  const user = await requireRole("EMPLOYER");
  const raw = readForm(formData, JOB_FIELDS);
  const parsed = jobSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: raw };

  try {
    const job = await db.job.findFirst({ where: { id: jobId, company: { userId: user.id } }, select: { status: true } });
    if (!job) return { message: "Vaga não encontrada." };
    if (!EDITABLE_JOB_STATUSES.includes(job.status)) return { message: "Vagas encerradas não podem ser editadas.", values: raw };
    // O filtro de dono e de status é repetido na escrita para não depender só da leitura acima.
    const { count } = await db.job.updateMany({ where: { id: jobId, company: { userId: user.id }, status: { in: [...EDITABLE_JOB_STATUSES] } }, data: { ...parsed.data, status: "PENDING" } });
    if (!count) return { message: "Não foi possível atualizar esta vaga.", values: raw };
  } catch (error) {
    return { message: saveError(error), values: raw };
  }
  revalidateJob(jobId);
  redirect(`/contratante/vagas/${jobId}?aviso=atualizada`);
}

export async function closeJob(jobId: string) {
  const user = await requireRole("EMPLOYER");
  const { count } = await db.job.updateMany({ where: { id: jobId, company: { userId: user.id }, status: { not: "CLOSED" } }, data: { status: "CLOSED" } });
  revalidateJob(jobId);
  redirect(count ? `/contratante/vagas/${jobId}?aviso=encerrada` : "/contratante/vagas");
}
