import type { JobStatus } from "@prisma/client";
import { jobStatusLabels } from "@/lib/job-options";

const styles: Record<JobStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700", PENDING: "bg-amber-50 text-amber-800", PUBLISHED: "bg-green-50 text-green-800",
  PAUSED: "bg-slate-100 text-slate-700", CLOSED: "bg-slate-200 text-slate-700", REJECTED: "bg-red-50 text-red-700",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>{jobStatusLabels[status]}</span>;
}
