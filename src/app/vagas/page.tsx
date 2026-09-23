import type { Metadata } from "next";
import Link from "next/link";
import { JobCard } from "@/components/jobs/job-card";
import { SiteHeader } from "@/components/site-header";
import { jobFiltersToQuery, parseJobFilters } from "@/lib/job-rules";
import { getPublicJobAreas, searchPublicJobs } from "@/lib/jobs";
import { BRAZILIAN_STATES, EMPLOYMENT_TYPES, WORK_MODES, workModeLabels } from "@/lib/profile-options";

export const metadata: Metadata = { title: "Vagas", description: "Encontre vagas de emprego publicadas na Promo Oeiras." };

const control = "mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const label = "block text-xs font-semibold uppercase tracking-wide text-slate-500";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseJobFilters(await searchParams);
  const now = new Date();
  const [{ jobs, total, pages }, areas] = await Promise.all([searchPublicJobs(filters, now), getPublicJobAreas(now)]);
  const hasFilters = Boolean(filters.q || filters.city || filters.state || filters.workMode || filters.employmentType || filters.area || filters.includeClosed);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-3xl font-bold text-slate-950">Encontre vagas</h1>
        <p className="mt-2 text-slate-600">Oportunidades publicadas e revisadas pela equipe Promo Oeiras.</p>
        {/* Formulário GET: a busca funciona sem JavaScript e a URL pode ser compartilhada. */}
        <form className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4" role="search">
          <div className="sm:col-span-2"><label className={label} htmlFor="q">Palavra-chave</label><input className={control} defaultValue={filters.q} id="q" maxLength={100} name="q" placeholder="Cargo, empresa ou área" type="search" /></div>
          <div><label className={label} htmlFor="cidade">Cidade</label><input className={control} defaultValue={filters.city} id="cidade" maxLength={100} name="cidade" placeholder="Ex.: Oeiras" /></div>
          <div><label className={label} htmlFor="uf">UF</label><select className={control} defaultValue={filters.state ?? ""} id="uf" name="uf"><option value="">Todas</option>{BRAZILIAN_STATES.map((uf) => <option key={uf}>{uf}</option>)}</select></div>
          <div><label className={label} htmlFor="modalidade">Modalidade</label><select className={control} defaultValue={filters.workMode ?? ""} id="modalidade" name="modalidade"><option value="">Todas</option>{WORK_MODES.map((mode) => <option key={mode} value={mode}>{workModeLabels[mode]}</option>)}</select></div>
          <div><label className={label} htmlFor="tipo">Contratação</label><select className={control} defaultValue={filters.employmentType ?? ""} id="tipo" name="tipo"><option value="">Todas</option>{EMPLOYMENT_TYPES.map((type) => <option key={type}>{type}</option>)}</select></div>
          <div><label className={label} htmlFor="area">Área</label><select className={control} defaultValue={filters.area ?? ""} id="area" name="area"><option value="">Todas</option>{areas.map((area) => <option key={area}>{area}</option>)}</select></div>
          <div className="flex items-end"><label className="flex items-center gap-2 pb-2 text-sm text-slate-700"><input className="size-4 accent-blue-600" defaultChecked={filters.includeClosed} name="encerradas" type="checkbox" value="1" />Incluir inscrições encerradas</label></div>
          <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
            <button className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700" type="submit">Buscar</button>
            {hasFilters && <Link className="rounded-lg px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100" href="/vagas">Limpar filtros</Link>}
          </div>
        </form>

        <p aria-live="polite" className="mt-6 text-sm text-slate-600">{total === 1 ? "1 vaga encontrada" : `${total} vagas encontradas`}</p>
        {jobs.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-semibold text-slate-900">{hasFilters ? "Nenhuma vaga encontrada com esses filtros." : "Ainda não há vagas publicadas."}</p>
            <p className="mt-2 text-sm text-slate-600">{hasFilters ? "Tente remover alguns filtros ou buscar por outro termo." : "Volte em breve: novas oportunidades são publicadas com frequência."}</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">{jobs.map((job) => <JobCard job={job} key={job.id} now={now} />)}</div>
        )}
        {pages > 1 && (
          <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-4 text-sm font-semibold">
            {filters.page > 1 && <Link className="text-blue-700" href={`/vagas${jobFiltersToQuery(filters, { page: filters.page - 1 })}`}>← Anteriores</Link>}
            <span className="text-slate-600">Página {Math.min(filters.page, pages)} de {pages}</span>
            {filters.page < pages && <Link className="text-blue-700" href={`/vagas${jobFiltersToQuery(filters, { page: filters.page + 1 })}`}>Próximas →</Link>}
          </nav>
        )}
      </main>
    </div>
  );
}
