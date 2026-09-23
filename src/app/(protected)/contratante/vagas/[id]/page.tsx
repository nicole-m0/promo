import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { closeJob } from "@/actions/jobs";
import { FormAlert } from "@/components/forms/fields";
import { JobFacts, JobSections } from "@/components/jobs/job-details";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { requireRole } from "@/lib/auth/session";
import { EDITABLE_JOB_STATUSES } from "@/lib/job-options";
import { formatDate } from "@/lib/job-format";
import { getLatestRejectionReason, getOwnedJob } from "@/lib/jobs";

export const metadata: Metadata = { title: "Detalhes da vaga" };

const notices: Record<string, string> = {
  criada: "Vaga enviada para análise. Você será avisado quando ela for publicada.",
  atualizada: "Alterações salvas. A vaga voltou para análise e ficará fora do ar até ser aprovada novamente.",
  encerrada: "Vaga encerrada. Ela não aparece mais na busca pública.",
};

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aviso?: string }> }) {
  const user = await requireRole("EMPLOYER");
  const [{ id }, { aviso }] = await Promise.all([params, searchParams]);
  // Filtra pelo dono: vaga de outra empresa se comporta como inexistente.
  const job = await getOwnedJob(user.id, id);
  if (!job) notFound();
  const rejection = job.status === "REJECTED" ? await getLatestRejectionReason(job.id) : null;

  return (
    <section className="space-y-6">
      <Link className="text-sm font-semibold text-blue-700" href="/contratante/vagas">← Minhas vagas</Link>
      <FormAlert message={aviso ? notices[aviso] : undefined} success />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <JobStatusBadge status={job.status} />
          <h1 className="mt-3 text-3xl font-bold">{job.title}</h1>
          <p className="mt-2 text-sm text-slate-600">Criada em {formatDate(job.createdAt)}{job.publishedAt && job.status === "PUBLISHED" ? ` · publicada em ${formatDate(job.publishedAt)}` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          {EDITABLE_JOB_STATUSES.includes(job.status) && <Link className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 hover:bg-slate-50" href={`/contratante/vagas/${job.id}/editar`}>Editar</Link>}
          {job.status === "PUBLISHED" && <Link className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 hover:bg-slate-50" href={`/vagas/${job.id}`}>Ver anúncio</Link>}
        </div>
      </div>
      {job.status === "PENDING" && <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Esta vaga está em análise pela equipe Promo Oeiras e ainda não aparece na busca pública.</p>}
      {job.status === "REJECTED" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold">A vaga não foi aprovada.</p>
          {rejection && <p className="mt-1 whitespace-pre-line">Motivo: {rejection}</p>}
          <p className="mt-1">Ajuste as informações e salve para enviar novamente para análise.</p>
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><JobFacts job={job} /></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><JobSections job={job} /></div>
      {job.status !== "CLOSED" && (
        <details className="rounded-2xl border border-slate-200 bg-white p-5">
          <summary className="cursor-pointer font-semibold text-slate-800">Encerrar vaga</summary>
          <p className="mt-3 text-sm text-slate-600">A vaga sai da busca pública e não poderá mais ser editada. Esta ação não pode ser desfeita.</p>
          <form action={closeJob.bind(null, job.id)} className="mt-4"><button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" type="submit">Confirmar encerramento</button></form>
        </details>
      )}
    </section>
  );
}
