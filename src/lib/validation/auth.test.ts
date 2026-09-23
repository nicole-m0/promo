import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "@/lib/validation/auth";

const valid = { accountType: "CANDIDATE", name: "Maria Silva", email: "  Maria@Exemplo.com ", password: "senhaForte1", confirmPassword: "senhaForte1", acceptTerms: "on" };

describe("signupSchema", () => {
  it("aceita dados válidos e normaliza o e-mail", () => {
    const result = signupSchema.safeParse(valid);
    expect(result.success && result.data.email).toBe("maria@exemplo.com");
  });

  it.each([
    ["senha curta", { password: "abc1", confirmPassword: "abc1" }, "password"],
    ["senha sem número", { password: "somenteletras", confirmPassword: "somenteletras" }, "password"],
    ["senha sem letra", { password: "12345678", confirmPassword: "12345678" }, "password"],
    ["confirmação diferente", { confirmPassword: "outraSenha1" }, "confirmPassword"],
    ["e-mail inválido", { email: "maria@" }, "email"],
    ["termos não aceitos", { acceptTerms: "" }, "acceptTerms"],
    ["tipo de conta inválido", { accountType: "ADMIN" }, "accountType"],
  ])("rejeita %s", (_label, override, field) => {
    const result = signupSchema.safeParse({ ...valid, ...override });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path[0] === field)).toBe(true);
  });

  it("rejeita senha acima de 72 bytes (limite do bcrypt)", () => {
    const password = "a1".repeat(37);
    expect(signupSchema.safeParse({ ...valid, password, confirmPassword: password }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("exige senha", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});
