import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/forms/login-form";
import { roleHome } from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Entrar" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const user = await getCurrentUser();
  if (user) redirect(roleHome[user.role]);
  const { next } = await searchParams;
  return (
    <AuthCard description="Acesse sua conta para continuar." footer={<>Ainda não tem conta? <Link className="font-semibold text-blue-700" href="/cadastro">Cadastre-se</Link></>} title="Entre na sua conta">
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </AuthCard>
  );
}
