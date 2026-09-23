import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { countPendingJobs } from "@/lib/jobs";

export default async function Page() {
  await requireRole("ADMIN");
  const pending = await countPendingJobs();
  return (
    <section>
      <p className="font-semibold text-blue-700">Administração</p>
      <h1 className="mt-2 text-3xl font-bold">Painel Promo Oeiras</h1>
      <p className="mt-3 text-slate-600">Os demais indicadores serão adicionados nas fases administrativas.</p>
      <Link className="mt-8 block max-w-md rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-300" href="/admin/vagas">
        <p className="font-semibold text-slate-950">Moderação de vagas</p>
        <p className="mt-2 text-sm text-slate-600">{pending === 0 ? "Nenhuma vaga aguardando análise." : pending === 1 ? "1 vaga aguardando análise." : `${pending} vagas aguardando análise.`}</p>
        <span className="mt-4 inline-flex text-sm font-semibold text-blue-700">Abrir moderação →</span>
      </Link>
    </section>
  );
}
