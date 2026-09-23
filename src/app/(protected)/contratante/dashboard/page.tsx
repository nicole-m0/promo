import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getCompanyProfile } from "@/lib/profiles";

export default async function Page() {
  const user = await requireRole("EMPLOYER");
  const company = await getCompanyProfile(user.id);
  return (
    <section>
      <p className="font-semibold text-blue-700">Visão geral</p>
      <h1 className="mt-2 text-3xl font-bold">{company ? company.name : "Sua área de contratação"}</h1>
      <p className="mt-3 text-slate-600">A gestão de candidaturas será disponibilizada nas próximas etapas.</p>
      <div className="mt-8 grid max-w-3xl gap-4 md:grid-cols-2">
        <Link className="block rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-300" href="/contratante/vagas">
          <p className="font-semibold text-slate-950">Minhas vagas</p>
          <p className="mt-2 text-sm text-slate-600">Publique novas vagas e acompanhe o status de cada uma.</p>
          <span className="mt-4 inline-flex text-sm font-semibold text-blue-700">Gerenciar vagas →</span>
        </Link>
        <Link className="block rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-300" href="/contratante/perfil">
          <p className="font-semibold text-slate-950">Complete o perfil da empresa</p>
          <p className="mt-2 text-sm text-slate-600">Descrição, contatos e presença online ajudam a atrair candidatos.</p>
          <span className="mt-4 inline-flex text-sm font-semibold text-blue-700">Editar perfil →</span>
        </Link>
      </div>
    </section>
  );
}
