import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { SignupForm } from "@/components/forms/signup-form";
import { roleHome } from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Criar conta" };

export default async function Page({ searchParams }: { searchParams: Promise<{ tipo?: string | string[] }> }) {
  const user = await getCurrentUser();
  if (user) redirect(roleHome[user.role]);
  const { tipo } = await searchParams;
  return (
    <AuthCard description="Escolha como você quer usar a Promo Oeiras." footer={<>Já tem conta? <Link className="font-semibold text-blue-700" href="/entrar">Entrar</Link></>} title="Crie sua conta">
      <SignupForm initialAccountType={tipo === "contratante" ? "EMPLOYER" : "CANDIDATE"} />
    </AuthCard>
  );
}
