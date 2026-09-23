"use server";

import { Prisma, type UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { postLoginPath, roleHome } from "@/lib/auth/constants";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { companySlug } from "@/lib/slug";
import { LOGIN_FIELDS, loginSchema, SIGNUP_FIELDS, signupSchema } from "@/lib/validation/auth";
import { fieldErrors, readForm, type FormState } from "@/lib/validation/form";

type SignupState = FormState<(typeof SIGNUP_FIELDS)[number]>;
type LoginState = FormState<(typeof LOGIN_FIELDS)[number]>;

// Não registra o erro completo: mensagens do Prisma podem conter os dados da query.
const logError = (context: string, error: unknown) =>
  console.error(`[auth] ${context}:`, error instanceof Prisma.PrismaClientKnownRequestError ? error.code : error instanceof Error ? error.name : "unknown");

export async function signup(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const raw = readForm(formData, SIGNUP_FIELDS);
  const values = { accountType: raw.accountType, name: raw.name, email: raw.email, acceptTerms: raw.acceptTerms };
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { accountType, name, email, password } = parsed.data;
  const now = new Date();
  let user: { id: string; role: UserRole };
  try {
    // Escrita aninhada: User e perfil são criados na mesma transação.
    user = await db.user.create({
      data: {
        email, passwordHash: await hashPassword(password), role: accountType, acceptedTermsAt: now, acceptedPrivacyAt: now,
        ...(accountType === "CANDIDATE" ? { candidateProfile: { create: { fullName: name } } } : { companyProfile: { create: { name, slug: companySlug(name) } } }),
      },
      select: { id: true, role: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" && String(error.meta?.target).includes("email"))
      return { errors: { email: ["Este e-mail já está cadastrado. Tente entrar na sua conta."] }, values };
    logError("signup failed", error);
    return { message: "Não foi possível criar sua conta agora. Tente novamente em instantes.", values };
  }
  try {
    await createSession(user.id);
  } catch (error) {
    // A conta já existe; a pessoa pode concluir entrando normalmente.
    logError("signup session failed", error);
    redirect("/entrar");
  }
  redirect(roleHome[user.role]);
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = readForm(formData, LOGIN_FIELDS);
  const values = { email: raw.email };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { email, password, next } = parsed.data;
  let destination: string;
  try {
    const user = await db.user.findUnique({ where: { email }, select: { id: true, role: true, status: true, passwordHash: true } });
    // Mesma mensagem para e-mail inexistente e senha errada, evitando enumeração de contas.
    if (!(await verifyPassword(password, user?.passwordHash)) || !user) return { message: "E-mail ou senha inválidos.", values };
    // Só é informado a quem já provou conhecer a senha.
    if (user.status !== "ACTIVE") return { message: "Esta conta está indisponível. Entre em contato com o suporte.", values };
    await destroySession();
    await createSession(user.id);
    destination = postLoginPath(user.role, next);
  } catch (error) {
    logError("login failed", error);
    return { message: "Não foi possível entrar agora. Tente novamente em instantes.", values };
  }
  redirect(destination);
}

export async function logout() {
  await destroySession();
  redirect("/");
}
