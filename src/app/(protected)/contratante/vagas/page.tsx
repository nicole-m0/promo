import type { Metadata } from "next";
import Link from "next/link";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { requireRole } from "@/lib/auth/session";
import { EDITABLE_JOB_STATUSES } from "@/lib/job-options";
import { formatDate, formatLocation } from "@/lib/job-format";
import { isPubliclyVisible } from "@/lib/job-rules";
import { getEmployerJobs } from "@/lib/jobs";
import { workModeLabels } from "@/lib/profile-options";

export const metadata: Metadata = { title: "Minhas vagas" };

export default async function Page() {
  const user = await requireRole("EMPLOYER");
  const jobs = await getEmployerJobs(user.id);
  const now = new Date();
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-semibold text-blue-700">Vagas</p>
          <h1 className="mt-2 text-3xl font-bold">Minhas vagas</h1>
        </div>
        <Link className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700" href="/contratante/vagas/nova">+ Publicar nova vaga</Link>
      </div>
      {jobs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-900">Você ainda não publicou nenhuma vaga.</p>
          <p className="mt-2 text-sm text-slate-600">Crie sua primeira vaga; ela será analisada pela equipe antes de ir ao ar.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {jobs.map((job) => (
            <li className="rounded-2xl border border-slate-200 bg-white p-5" key={job.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link className="text-lg font-bold text-slate-950 hover:text-blue-700" href={`/contratante/vagas/${job.id}`}>{job.title}</Link>
                  <p className="mt-1 text-sm text-slate-600">{formatLocation(job)}{job.workMode !== "REMOTE" && ` · ${workModeLabels[job.workMode]}`}</p>
                </div>
                <JobStatusBadge status={job.status} />
              </div>
              <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                <div><dt className="inline">Criada em </dt><dd className="inline font-medium text-slate-800">{formatDate(job.createdAt)}</dd></div>
                <div><dt className="inline">Prazo: </dt><dd className="inline font-medium text-slate-800">{formatDate(job.applicationDeadline) || "sem prazo"}</dd></div>
                <div><dt className="inline">Candidaturas: </dt><dd className="inline font-medium text-slate-800">{job._count.applications}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                <Link className="text-blue-700" href={`/contratante/vagas/${job.id}`}>Ver detalhes</Link>
                {EDITABLE_JOB_STATUSES.includes(job.status) && <Link className="text-blue-700" href={`/contratante/vagas/${job.id}/editar`}>Editar</Link>}
                {isPubliclyVisible(job, now) ? <Link className="text-blue-700" href={`/vagas/${job.id}`}>Ver anúncio</Link> : job.status === "PUBLISHED" && <span className="text-slate-500">Anúncio expirado</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
