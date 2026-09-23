import type { Metadata } from "next";
import { approveJob, rejectJob } from "@/actions/moderation";
import { FormAlert } from "@/components/forms/fields";
import { JobFacts, JobSections } from "@/components/jobs/job-details";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { ModerationActions } from "@/components/jobs/moderation-actions";
import { requireRole } from "@/lib/auth/session";
import { formatDate } from "@/lib/job-format";
import { getPendingJobs } from "@/lib/jobs";

export const metadata: Metadata = { title: "Moderação de vagas" };

const notices: Record<string, string> = { aprovada: "Vaga aprovada e publicada.", recusada: "Vaga recusada. O contratante verá o motivo informado." };

export default async function Page({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  await requireRole("ADMIN");
  const [{ aviso }, jobs] = await Promise.all([searchParams, getPendingJobs()]);
  return (
    <section>
      <p className="font-semibold text-blue-700">Administração</p>
      <h1 className="mt-2 text-3xl font-bold">Moderação de vagas</h1>
      <p className="mt-3 text-slate-600">{jobs.length === 1 ? "1 vaga aguardando análise." : `${jobs.length} vagas aguardando análise.`} As mais antigas aparecem primeiro.</p>
      <div className="mt-6"><FormAlert message={aviso ? notices[aviso] : undefined} success /></div>
      {jobs.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-900">Nenhuma vaga pendente.</p>
          <p className="mt-2 text-sm text-slate-600">Novas vagas enviadas pelos contratantes aparecerão aqui.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-5">
          {jobs.map((job) => (
            <li className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" key={job.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">{job.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{job.company.name} · enviada em {formatDate(job.createdAt)}</p>
                </div>
                <JobStatusBadge status={job.status} />
              </div>
              <JobFacts job={job} />
              <details className="rounded-lg bg-slate-50 p-4">
                <summary className="cursor-pointer font-semibold text-slate-800">Ver conteúdo completo da vaga</summary>
                <div className="mt-4"><JobSections job={job} /></div>
              </details>
              <ModerationActions approve={approveJob.bind(null, job.id)} jobId={job.id} reject={rejectJob.bind(null, job.id)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
