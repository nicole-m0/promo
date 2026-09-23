import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateJob } from "@/actions/jobs";
import { JobForm } from "@/components/forms/job-form";
import { requireRole } from "@/lib/auth/session";
import { EDITABLE_JOB_STATUSES, type JobField } from "@/lib/job-options";
import { deadlineToInput } from "@/lib/job-format";
import { getOwnedJob } from "@/lib/jobs";
import { formatCentsForInput } from "@/lib/validation/form";

export const metadata: Metadata = { title: "Editar vaga" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("EMPLOYER");
  const { id } = await params;
  const job = await getOwnedJob(user.id, id);
  if (!job) notFound();

  if (!EDITABLE_JOB_STATUSES.includes(job.status)) {
    return (
      <section>
        <h1 className="text-3xl font-bold">Vaga encerrada</h1>
        <p className="mt-3 text-slate-600">Vagas encerradas não podem ser editadas. Publique uma nova vaga se precisar reabrir a seleção.</p>
        <Link className="mt-6 inline-flex font-semibold text-blue-700" href={`/contratante/vagas/${job.id}`}>← Voltar para a vaga</Link>
      </section>
    );
  }

  const initial: Record<JobField, string> = {
    title: job.title, area: job.area ?? "", summary: job.summary ?? "", city: job.city ?? "", state: job.state ?? "", workMode: job.workMode, employmentType: job.employmentType,
    salaryMin: formatCentsForInput(job.salaryMinCents), salaryMax: formatCentsForInput(job.salaryMaxCents), salaryNegotiable: job.salaryNegotiable ? "on" : "", salaryHidden: job.salaryHidden ? "on" : "",
    description: job.description, responsibilities: job.responsibilities ?? "", requiredSkills: job.requiredSkills ?? "", desiredSkills: job.desiredSkills ?? "", benefits: job.benefits ?? "",
    workSchedule: job.workSchedule ?? "", additionalInformation: job.additionalInformation ?? "", applicationDeadline: deadlineToInput(job.applicationDeadline), maxApplications: job.maxApplications?.toString() ?? "",
  };
  return (
    <section>
      <Link className="text-sm font-semibold text-blue-700" href={`/contratante/vagas/${job.id}`}>← Voltar para a vaga</Link>
      <h1 className="mt-4 text-3xl font-bold">Editar vaga</h1>
      {job.status === "PUBLISHED" && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Esta vaga está publicada. Ao salvar, ela sai do ar e volta para análise da equipe antes de ser publicada novamente.</p>}
      <div className="mt-8"><JobForm action={updateJob.bind(null, job.id)} cancelHref={`/contratante/vagas/${job.id}`} initial={initial} submitLabel="Salvar e enviar para análise" /></div>
    </section>
  );
}
