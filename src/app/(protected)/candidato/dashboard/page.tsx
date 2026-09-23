import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getCandidateProfile } from "@/lib/profiles";

export default async function Page() {
  const user = await requireRole("CANDIDATE");
  const profile = await getCandidateProfile(user.id);
  const firstName = profile?.fullName.split(" ")[0];
  return (
    <section>
      <p className="font-semibold text-blue-700">Visão geral</p>
      <h1 className="mt-2 text-3xl font-bold">{firstName ? `Olá, ${firstName}!` : "Seu espaço profissional"}</h1>
      <p className="mt-3 text-slate-600">Seu painel de candidaturas será disponibilizado nas próximas etapas.</p>
      <Link className="mt-8 block max-w-md rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-300" href="/candidato/perfil">
        <p className="font-semibold text-slate-950">Complete seu perfil profissional</p>
        <p className="mt-2 text-sm text-slate-600">Informe seus dados, área de atuação e preferências de trabalho.</p>
        <span className="mt-4 inline-flex text-sm font-semibold text-blue-700">Editar perfil →</span>
      </Link>
    </section>
  );
}
