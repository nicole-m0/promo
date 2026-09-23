import type { Metadata } from "next";
import Link from "next/link";
import { createJob } from "@/actions/jobs";
import { JobForm } from "@/components/forms/job-form";
import { requireRole } from "@/lib/auth/session";
import { JOB_FIELDS, type JobField } from "@/lib/job-options";
import { getCompanyProfile } from "@/lib/profiles";

export const metadata: Metadata = { title: "Nova vaga" };

const empty = Object.fromEntries(JOB_FIELDS.map((field) => [field, ""])) as Record<JobField, string>;

export default async function Page() {
  const user = await requireRole("EMPLOYER");
  const company = await getCompanyProfile(user.id);
  return (
    <section>
      <p className="font-semibold text-blue-700">Vagas</p>
      <h1 className="mt-2 text-3xl font-bold">Publicar nova vaga</h1>
      {company ? (
        <>
          <p className="mt-3 text-slate-600">A vaga será publicada em nome de <strong>{company.name}</strong> após a análise da equipe.</p>
          <div className="mt-8"><JobForm action={createJob} cancelHref="/contratante/vagas" initial={{ ...empty, city: company.city ?? "", state: company.state ?? "" }} submitLabel="Enviar para análise" /></div>
        </>
      ) : (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">Complete o <Link className="font-semibold underline" href="/contratante/perfil">perfil da empresa</Link> antes de publicar vagas.</p>
      )}
    </section>
  );
}
