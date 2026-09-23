import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { roleHome } from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Acesso não autorizado" };

export default async function Page() {
  const user = await getCurrentUser();
  return (
    <AuthCard description="Sua conta não tem permissão para acessar esta página." footer={<Link className="font-semibold text-blue-700" href="/">Voltar ao início</Link>} title="Acesso não autorizado">
      <Link className="inline-flex rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700" href={user ? roleHome[user.role] : "/entrar"}>{user ? "Ir para o meu painel" : "Entrar"}</Link>
    </AuthCard>
  );
}
