import type { ReactNode } from "react";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import { logout } from "@/actions/auth";
import { Brand } from "@/components/brand";
import { requireRole } from "@/lib/auth/session";
const labels: Record<UserRole, string> = { CANDIDATE: "Área do candidato", EMPLOYER: "Área do contratante", ADMIN: "Administração" };
const navigation: Record<UserRole, { href: string; label: string }[]> = {
  CANDIDATE: [{ href: "/candidato/dashboard", label: "Painel" }, { href: "/candidato/perfil", label: "Meu perfil" }, { href: "/vagas", label: "Buscar vagas" }],
  EMPLOYER: [{ href: "/contratante/dashboard", label: "Painel" }, { href: "/contratante/vagas", label: "Vagas" }, { href: "/contratante/perfil", label: "Perfil da empresa" }],
  ADMIN: [{ href: "/admin", label: "Painel" }, { href: "/admin/vagas", label: "Moderação de vagas" }],
};
// A checagem aqui só controla o layout; cada página e server action valida a sessão novamente.
export async function ProtectedShell({ children, role }: { children: ReactNode; role: UserRole }) {
  const user = await requireRole(role);
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4">
          <Brand />
          <nav className="order-last flex w-full flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-600 sm:order-none sm:w-auto">{navigation[role].map((item) => <Link className="hover:text-blue-700" href={item.href} key={item.href}>{item.label}</Link>)}</nav>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-slate-600 md:inline">{labels[role]} · {user.email}</span>
            <form action={logout}><button className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50" type="submit">Sair</button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
