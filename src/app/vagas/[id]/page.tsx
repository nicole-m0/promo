import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { JobFacts, JobSections } from "@/components/jobs/job-details";
import { SiteHeader } from "@/components/site-header";
import { formatDate } from "@/lib/job-format";
import { isAcceptingApplications } from "@/lib/job-rules";
import { getPublicJob } from "@/lib/jobs";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const job = await getPublicJob((await params).id);
  return job ? { title: `${job.title} · ${job.company.name}`, description: job.summary ?? undefined } : { title: "Vaga não encontrada" };
}

export default async function Page({ params }: Props) {
  // Sempre renderizada por request: status e prazo mudam e a página não pode ficar em cache.
  await connection();
  const job = await getPublicJob((await params).id);
  if (!job) notFound();
  const open = isAcceptingApplications(job, new Date());

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <Link className="text-sm font-semibold text-blue-700" href="/vagas">← Todas as vagas</Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-950">{job.title}</h1>
        <p className="mt-1 text-lg text-slate-700">{job.company.name}</p>
        {job.publishedAt && <p className="mt-1 text-sm text-slate-500">Publicada em {formatDate(job.publishedAt)}</p>}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><JobFacts job={job} /></div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><JobSections job={job} /></div>
        <aside className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          {open ? (
            <>
              {/* A candidatura será implementada na Fase 4. */}
              <button className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white opacity-60 sm:w-auto" disabled type="button">Candidatar-se</button>
              <p className="mt-3 text-sm text-slate-600">As candidaturas pela plataforma serão liberadas em breve.</p>
            </>
          ) : (
            <p className="font-semibold text-slate-700">Inscrições encerradas{job.applicationDeadline ? ` em ${formatDate(job.applicationDeadline)}` : ""}.</p>
          )}
        </aside>
      </main>
    </div>
  );
}
