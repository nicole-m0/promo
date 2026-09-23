import { z } from "zod";

export const ACCOUNT_TYPES = ["CANDIDATE", "EMPLOYER"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

const email = z.string().trim().toLowerCase().pipe(z.email({ error: "Informe um e-mail válido." }).max(254, { error: "Informe um e-mail válido." }));

export const passwordSchema = z.string()
  .min(8, { error: "A senha deve ter pelo menos 8 caracteres." })
  .regex(/\p{L}/u, { error: "A senha deve conter pelo menos uma letra." })
  .regex(/\d/, { error: "A senha deve conter pelo menos um número." })
  // bcrypt considera apenas os primeiros 72 bytes.
  .refine((value) => new TextEncoder().encode(value).length <= 72, { error: "A senha deve ter no máximo 72 caracteres." });

export const SIGNUP_FIELDS = ["accountType", "name", "email", "password", "confirmPassword", "acceptTerms"] as const;
export const signupSchema = z.object({
  accountType: z.enum(ACCOUNT_TYPES, { error: "Escolha o tipo de conta." }),
  name: z.string().trim().min(2, { error: "Informe um nome com pelo menos 2 caracteres." }).max(120, { error: "Use no máximo 120 caracteres." }),
  email,
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.literal("on", { error: "Você precisa aceitar os Termos de Uso e a Política de Privacidade." }),
}).refine((data) => data.password === data.confirmPassword, { error: "As senhas não coincidem.", path: ["confirmPassword"] });

export const LOGIN_FIELDS = ["email", "password", "next"] as const;
export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Informe sua senha." }).max(200, { error: "E-mail ou senha inválidos." }),
  next: z.string().max(200).optional(),
});
