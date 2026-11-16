import { describe, expect, it } from "vitest";
import { PERMISSOES, temPermissao } from "./permissoes";

describe("temPermissao", () => {
  it("permite quando a permissão está presente", () => {
    expect(temPermissao(["CAIXA_MENU", "VENDAS_MENU"], PERMISSOES.caixaMenu)).toBe(
      true,
    );
  });

  it("nega quando a permissão está ausente", () => {
    expect(
      temPermissao(["PRODUTOS_LEITURA"], PERMISSOES.estoqueMenu),
    ).toBe(false);
  });

  it("nega com lista vazia", () => {
    expect(temPermissao([], PERMISSOES.eventosMenu)).toBe(false);
  });

  it("mantém o catálogo alinhado às dez autoridades do backend", () => {
    expect(Object.values(PERMISSOES)).toHaveLength(10);
    expect(Object.values(PERMISSOES)).toContain("EVENTOS_MENU");
    expect(Object.values(PERMISSOES)).toContain("DASHBOARD_MENU");
  });
});
