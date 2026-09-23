import { describe, expect, it } from "vitest";
import { postLoginPath } from "@/lib/auth/constants";
import { slugify } from "@/lib/slug";

describe("postLoginPath", () => {
  it("usa o painel da role quando não há destino", () => {
    expect(postLoginPath("CANDIDATE")).toBe("/candidato/dashboard");
    expect(postLoginPath("EMPLOYER", null)).toBe("/contratante/dashboard");
  });

  it("aceita destino interno da própria área", () => {
    expect(postLoginPath("CANDIDATE", "/candidato/perfil")).toBe("/candidato/perfil");
  });

  it.each(["//evil.com", "/\\evil.com", "https://evil.com", "/contratante/perfil", "/candidato-falso", "/candidato/../admin"])("ignora destino %s", (next) => {
    expect(postLoginPath("CANDIDATE", next)).toBe("/candidato/dashboard");
  });
});

describe("slugify", () => {
  it("remove acentos e caracteres especiais", () => {
    expect(slugify("  Padaria São João & Cia.  ")).toBe("padaria-sao-joao-cia");
  });
});
