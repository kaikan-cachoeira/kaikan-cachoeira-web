import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHAVE_SESSAO,
  lerSessaoPersistida,
  sessaoRestauravel,
} from "./sessaoPersistida";

function sessao(permissoes: unknown): unknown {
  return {
    accessToken: "acesso",
    refreshToken: "renovacao",
    usuario: { nome: "Ana", cargo: "OPERADOR", permissoes },
  };
}

function criarArmazenamento(inicial: Record<string, string>) {
  const dados = new Map(Object.entries(inicial));
  return {
    dados,
    getItem: (chave: string) => dados.get(chave) ?? null,
    setItem: (chave: string, valor: string) => {
      dados.set(chave, valor);
    },
    removeItem: (chave: string) => {
      dados.delete(chave);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sessaoRestauravel", () => {
  it("rejeita valor nulo", () => {
    expect(sessaoRestauravel(null)).toBe(false);
  });

  it("rejeita valor que não é objeto", () => {
    expect(sessaoRestauravel("sessao")).toBe(false);
  });

  it("rejeita objeto sem usuário", () => {
    expect(sessaoRestauravel({ accessToken: "a" })).toBe(false);
  });

  it("rejeita usuário sem o campo de permissões", () => {
    expect(
      sessaoRestauravel({
        accessToken: "a",
        usuario: { nome: "Ana", cargo: "OPERADOR" },
      }),
    ).toBe(false);
  });

  it("rejeita permissões nulas", () => {
    expect(sessaoRestauravel(sessao(null))).toBe(false);
  });

  it("rejeita permissões que não são lista", () => {
    expect(sessaoRestauravel(sessao("ESTOQUE_MENU"))).toBe(false);
  });

  it("rejeita lista com item que não é texto", () => {
    expect(sessaoRestauravel(sessao(["CAIXA_MENU", 1]))).toBe(false);
  });

  it("aceita lista vazia", () => {
    expect(sessaoRestauravel(sessao([]))).toBe(true);
  });

  it("aceita lista preenchida", () => {
    expect(sessaoRestauravel(sessao(["CAIXA_MENU"]))).toBe(true);
  });
});

describe("lerSessaoPersistida", () => {
  it("restaura sessão válida e mantém a chave", () => {
    const armazenamento = criarArmazenamento({
      [CHAVE_SESSAO]: JSON.stringify(sessao(["CAIXA_MENU"])),
    });
    vi.stubGlobal("window", { localStorage: armazenamento });

    const restaurada = lerSessaoPersistida();

    expect(restaurada?.usuario.permissoes).toEqual(["CAIXA_MENU"]);
    expect(armazenamento.dados.has(CHAVE_SESSAO)).toBe(true);
  });

  it("descarta sessão sem permissões e remove a chave", () => {
    const armazenamento = criarArmazenamento({
      [CHAVE_SESSAO]: JSON.stringify({
        accessToken: "a",
        refreshToken: "r",
        usuario: { nome: "Ana", cargo: "OPERADOR" },
      }),
    });
    vi.stubGlobal("window", { localStorage: armazenamento });

    expect(lerSessaoPersistida()).toBeNull();
    expect(armazenamento.dados.has(CHAVE_SESSAO)).toBe(false);
  });

  it("retorna nulo quando não há sessão persistida", () => {
    const armazenamento = criarArmazenamento({});
    vi.stubGlobal("window", { localStorage: armazenamento });

    expect(lerSessaoPersistida()).toBeNull();
  });
});
