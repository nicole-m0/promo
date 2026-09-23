import { z } from "zod";

export type FormState<F extends string = string> =
  | { errors?: Partial<Record<F, string[]>>; message?: string; success?: boolean; values?: Partial<Record<F, string>> }
  | undefined;

/** Lê os campos como texto; campos ausentes (ex.: checkbox desmarcado) viram "". */
export function readForm<F extends string>(formData: FormData, fields: readonly F[]) {
  return Object.fromEntries(fields.map((field) => { const value = formData.get(field); return [field, typeof value === "string" ? value : ""]; })) as Record<F, string>;
}

export function fieldErrors<F extends string>(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Partial<Record<F, string[]>>;
}

export const optionalText = (max: number) =>
  z.string().trim().max(max, { error: `Use no máximo ${max} caracteres.` }).transform((value) => value || null);

export const optionalUrl = z.string().trim().max(300, { error: "Use no máximo 300 caracteres." }).transform((value, ctx) => {
  if (!value) return null;
  const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try { if (new URL(url).hostname.includes(".")) return url; } catch {}
  ctx.addIssue({ code: "custom", message: "Informe um endereço válido (ex.: https://exemplo.com.br)." });
  return z.NEVER;
});

export const optionalPhone = z.string().trim().max(30, { error: "Telefone inválido." }).refine((value) => !value || (/^\+?[\d\s().-]+$/.test(value) && [10, 11, 12, 13].includes(value.replace(/\D/g, "").length)), { error: "Informe um telefone válido com DDD." }).transform((value) => value || null);

export const optionalEmail = z.string().trim().toLowerCase().refine((value) => !value || z.email().safeParse(value).success, { error: "Informe um e-mail válido." }).transform((value) => value || null);

export const optionalChoice = <T extends readonly [string, ...string[]]>(options: T, message: string) =>
  z.union([z.literal(""), z.enum(options)], { error: message }).transform((value) => (value || null) as T[number] | null);

/** Converte valores digitados em reais ("3500", "3.500,00", "3500.5") para centavos. Retorna undefined se inválido. */
export function parseCurrencyToCents(input: string): number | null | undefined {
  const value = input.replace(/R\$|\s/g, "");
  if (!value) return null;
  let normalized: string;
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(value)) normalized = value.replace(/\./g, "").replace(",", ".");
  else if (/^\d+(,\d{1,2})?$/.test(value)) normalized = value.replace(",", ".");
  else if (/^\d+\.\d{1,2}$/.test(value)) normalized = value;
  else return undefined;
  return Math.round(Number(normalized) * 100);
}

export function formatCentsForInput(cents: number | null | undefined) {
  return cents == null ? "" : (cents / 100).toFixed(2).replace(".", ",");
}
