import { describe, expect, it } from "vitest";
import { PERMISSOES } from "@/shared/permissoes/permissoes";
import { areaDaRota, areasDoMenu, podeAcessarRota } from "./areas";

const OPERADOR = [
  PERMISSOES.vendasMenu,
  PERMISSOES.caixaMenu,
  PERMISSOES.eventosLeitura,
  PERMISSOES.produtosLeitura,
  PERMISSOES.cardapioEventoLeitura,
];

const ADMINISTRADOR = Object.values(PERMISSOES);

describe("areaDaRota", () => {
  it("resolve a área pelo prefixo exato", () => {
    expect(areaDaRota("/estoque")?.id).toBe("estoque");
  });

  it("resolve sub-rotas com parâmetros", () => {
    expect(areaDaRota("/estoque/1/lotes/2/movimentacoes")?.id).toBe("estoque");
  });

  it("aceita barra final", () => {
    expect(areaDaRota("/estoque/")?.id).toBe("estoque");
  });

  it("não confunde prefixo com segmento vizinho", () => {
    expect(areaDaRota("/estoque-x")).toBeNull();
  });

  it("resolve alias dentro da mesma área", () => {
    expect(areaDaRota("/caixa/fiado")?.id).toBe("caixa");
  });

  it("resolve rota filha de vendas", () => {
    expect(areaDaRota("/registro-vendas/historico")?.id).toBe("vendas");
  });

  it("trata o painel inicial como área sem permissão", () => {
    const inicio = areaDaRota("/inicio");
    expect(inicio?.id).toBe("inicio");
    expect(inicio?.permissao).toBeNull();
  });

  it("trata conteúdo pendente como área sem permissão e fora do menu", () => {
    const pendente = areaDaRota("/em-definicao/qualquer-coisa");
    expect(pendente?.id).toBe("pendente");
    expect(pendente?.permissao).toBeNull();
    expect(pendente?.menu).toBe(false);
  });

  it("retorna nulo para rota desconhecida", () => {
    expect(areaDaRota("/desconhecida")).toBeNull();
  });
});

describe("podeAcessarRota", () => {
  it("nega área de menu ao OPERADOR", () => {
    expect(podeAcessarRota("/estoque", OPERADOR)).toBe(false);
    expect(podeAcessarRota("/estoque/1/lotes/2/movimentacoes", OPERADOR)).toBe(
      false,
    );
  });

  it("permite área de menu que o OPERADOR possui", () => {
    expect(podeAcessarRota("/caixa/fiados", OPERADOR)).toBe(true);
    expect(podeAcessarRota("/registro-vendas/historico", OPERADOR)).toBe(true);
  });

  it("nega eventos ao OPERADOR, que só tem leitura", () => {
    expect(podeAcessarRota("/eventos", OPERADOR)).toBe(false);
    expect(podeAcessarRota("/eventos/3/cardapio", OPERADOR)).toBe(false);
  });

  it("permite todas as áreas ao administrador", () => {
    for (const area of ["/estoque", "/eventos", "/doacoes", "/relatorio-geral"]) {
      expect(podeAcessarRota(area, ADMINISTRADOR)).toBe(true);
    }
    expect(podeAcessarRota("/registro-vendas", ADMINISTRADOR)).toBe(true);
    expect(podeAcessarRota("/caixa", ADMINISTRADOR)).toBe(true);
  });

  it("mantém painel e conteúdo pendente abertos com lista vazia", () => {
    expect(podeAcessarRota("/inicio", [])).toBe(true);
    expect(podeAcessarRota("/em-definicao/x", [])).toBe(true);
  });

  it("nega áreas com lista vazia", () => {
    expect(podeAcessarRota("/estoque", [])).toBe(false);
    expect(podeAcessarRota("/caixa", [])).toBe(false);
  });

  it("libera rota sem área para o catch-all responder 404", () => {
    expect(podeAcessarRota("/desconhecida", [])).toBe(true);
  });

  it("ignora permissões de leitura na área de estoque", () => {
    expect(podeAcessarRota("/estoque", [PERMISSOES.produtosLeitura])).toBe(false);
  });
});

describe("areasDoMenu", () => {
  it("exibe apenas Início, Registro de vendas e Caixa para o OPERADOR", () => {
    expect(areasDoMenu(OPERADOR).map((area) => area.id)).toEqual([
      "inicio",
      "vendas",
      "caixa",
    ]);
  });

  it("exibe as sete áreas para o administrador", () => {
    expect(areasDoMenu(ADMINISTRADOR)).toHaveLength(7);
  });

  it("mantém apenas Início sem permissões", () => {
    expect(areasDoMenu([]).map((area) => area.id)).toEqual(["inicio"]);
  });
});
