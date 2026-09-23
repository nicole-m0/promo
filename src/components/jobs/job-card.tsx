import Link from "next/link";
import type { JobCardData } from "@/lib/jobs";
import { formatDate, formatLocation, formatSalary } from "@/lib/job-format";
import { isAcceptingApplications } from "@/lib/job-rules";
import { workModeLabels } from "@/lib/profile-options";

export function JobCard({ job, now }: { job: JobCardData; now: Date }) {
  const salary = formatSalary(job);
  const open = isAcceptingApplications(job, now);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-950"><Link className="hover:text-blue-700" href={`/vagas/${job.id}`}>{job.title}</Link></h2>
          <p className="mt-0.5 text-sm text-slate-600">{job.company.name}</p>
        </div>
        {!open && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Inscrições encerradas</span>}
      </div>
      {job.summary && <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-700">{job.summary}</p>}
      <ul className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-700">
        {[formatLocation(job), workModeLabels[job.workMode], job.employmentType, job.area, salary].filter(Boolean).map((tag) => <li className="rounded-full bg-slate-100 px-2.5 py-1" key={tag}>{tag}</li>)}
      </ul>
      {job.applicationDeadline && open && <p className="mt-3 text-xs text-slate-500">Inscrições até {formatDate(job.applicationDeadline)}</p>}
    </article>
  );
}
