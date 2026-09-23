import type { JobDetailData } from "@/lib/jobs";
import { formatDate, formatLocation, formatSalary } from "@/lib/job-format";
import { workModeLabels } from "@/lib/profile-options";

export function JobFacts({ job }: { job: Pick<JobDetailData, "company" | "city" | "state" | "workMode" | "employmentType" | "salaryMinCents" | "salaryMaxCents" | "salaryNegotiable" | "salaryHidden" | "area" | "applicationDeadline"> }) {
  const salary = formatSalary(job);
  const facts = [
    ["Empresa", job.company.name], ["Localização", formatLocation(job)], ["Modalidade", workModeLabels[job.workMode]], ["Contratação", job.employmentType],
    ["Área", job.area], ["Salário", salary], ["Inscrições até", formatDate(job.applicationDeadline) || null],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {facts.map(([term, value]) => <div key={term}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{term}</dt><dd className="mt-1 text-slate-900">{value}</dd></div>)}
    </dl>
  );
}

/** Conteúdo descritivo da vaga. Os textos são exibidos como texto puro (sem HTML), preservando quebras de linha. */
export function JobSections({ job }: { job: Pick<JobDetailData, "summary" | "description" | "responsibilities" | "requiredSkills" | "desiredSkills" | "benefits" | "workSchedule" | "additionalInformation"> }) {
  const sections = [
    ["Resumo", job.summary], ["Descrição", job.description], ["Responsabilidades", job.responsibilities], ["Requisitos obrigatórios", job.requiredSkills],
    ["Requisitos desejáveis", job.desiredSkills], ["Benefícios", job.benefits], ["Horário / escala", job.workSchedule], ["Informações adicionais", job.additionalInformation],
  ].filter((section): section is [string, string] => Boolean(section[1]));
  return (
    <div className="space-y-7">
      {sections.map(([title, text]) => <section key={title}><h2 className="text-lg font-bold text-slate-950">{title}</h2><p className="mt-2 whitespace-pre-line leading-7 text-slate-700">{text}</p></section>)}
    </div>
  );
}
