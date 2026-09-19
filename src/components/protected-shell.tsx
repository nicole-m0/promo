import type { ReactNode } from "react";
import { UserRole } from "@prisma/client";
import { Brand } from "@/components/brand";
import { requireRole } from "@/lib/auth/session";
const labels: Record<UserRole, string> = { CANDIDATE: "Área do candidato", EMPLOYER: "Área do contratante", ADMIN: "Administração" };
export async function ProtectedShell({ children, role }: { children: ReactNode; role: UserRole }) { const user = await requireRole(role); return <div className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><Brand /><span className="text-sm text-slate-600">{labels[role]} · {user.email}</span></div></header><main className="mx-auto max-w-6xl px-5 py-10">{children}</main></div>; }
