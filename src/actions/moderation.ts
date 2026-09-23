"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_JOB_ACTIONS } from "@/lib/jobs";
import { fieldErrors, readForm, type FormState } from "@/lib/validation/form";
import { rejectJobSchema } from "@/lib/validation/job";

export type ModerationState = FormState<"reason">;

const failure = (error: unknown): ModerationState => {
  console.error("[moderation] failed:", error instanceof Prisma.PrismaClientKnownRequestError ? error.code : error instanceof Error ? error.name : "unknown");
  return { message: "Não foi possível concluir a moderação agora. Tente novamente em instantes." };
};
const notPending: ModerationState = { message: "Esta vaga não está mais pendente de análise." };

function revalidateModeration(jobId: string) {
  revalidatePath("/admin", "layout");
  revalidatePath("/contratante/vagas", "layout");
  revalidatePath("/vagas");
  revalidatePath(`/vagas/${jobId}`);
}

// Só vagas PENDING mudam de status; a checagem fica no WHERE para ser atômica com a escrita.
export async function approveJob(jobId: string): Promise<ModerationState> {
  const admin = await requireRole("ADMIN");
  try {
    const approved = await db.$transaction(async (tx) => {
      const { count } = await tx.job.updateMany({ where: { id: jobId, status: "PENDING" }, data: { status: "PUBLISHED", publishedAt: new Date() } });
      if (count) await tx.adminAction.create({ data: { actorId: admin.id, action: ADMIN_JOB_ACTIONS.approved, targetType: "JOB", targetId: jobId } });
      return count > 0;
    });
    if (!approved) return notPending;
  } catch (error) {
    return failure(error);
  }
  revalidateModeration(jobId);
  redirect("/admin/vagas?aviso=aprovada");
}

export async function rejectJob(jobId: string, _prev: ModerationState, formData: FormData): Promise<ModerationState> {
  const admin = await requireRole("ADMIN");
  const raw = readForm(formData, ["reason"]);
  const parsed = rejectJobSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: raw };
  try {
    const rejected = await db.$transaction(async (tx) => {
      const { count } = await tx.job.updateMany({ where: { id: jobId, status: "PENDING" }, data: { status: "REJECTED" } });
      if (count) await tx.adminAction.create({ data: { actorId: admin.id, action: ADMIN_JOB_ACTIONS.rejected, targetType: "JOB", targetId: jobId, metadata: { reason: parsed.data.reason } } });
      return count > 0;
    });
    if (!rejected) return notPending;
  } catch (error) {
    return failure(error);
  }
  revalidateModeration(jobId);
  redirect("/admin/vagas?aviso=recusada");
}
