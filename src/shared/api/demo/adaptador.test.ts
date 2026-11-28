import { beforeEach, describe, expect, it } from "vitest";
import { demoAdapter } from "./adaptador";
import { resetDb } from "./store";

interface OpcoesRequisicao {
  body?: unknown;
  token?: string;
}

function requisitar(
  metodo: string,
  url: string,
  opcoes: OpcoesRequisicao = {},
) {
  return demoAdapter({
    method: metodo,
    url,
    baseURL: "",
    data: opcoes.body === undefined ? undefined : JSON.stringify(opcoes.body),
    headers: opcoes.token ? { Authorization: `Bearer ${opcoes.token}` } : {},
  });
}

async function entrar(email = "demo@teste.com") {
  const resposta = await requisitar("post", "/auth/login", {
    body: { email, senha: "senha-segura" },
  });
  return resposta.data;
}

beforeEach(() => {
  resetDb();
});

describe("adaptador de demonstração", () => {
  it("retorna clima demonstrativo por hora no contrato da integração", async () => {
    const sessao = await entrar();
    const resposta = await requisitar("get", "/eventos/1/climas", { token: sessao.accessToken });

    expect(resposta.data.itens.length).toBeGreaterThan(0);
    expect(resposta.data.resumo.chuvaAcumulada).toBeCloseTo(3.2);
    expect(resposta.data.resumo.ventoMaximo).toBe(18);
    expect(resposta.data.itens[0]).toMatchObject({ temperatura: 22, codigoClima: 2 });
    expect(Date.parse(resposta.data.itens[1].dataHoraPrevista)
      - Date.parse(resposta.data.itens[0].dataHoraPrevista)).toBe(3_600_000);
  });

  it("mantém vazio o clima de um evento de demonstração não iniciado", async () => {
    const sessao = await entrar();
    const resposta = await requisitar("get", "/eventos/2/climas", { token: sessao.accessToken });
    expect(resposta.data.itens).toEqual([]);
  });

  it("lista eventos com IDs numéricos e paginação no contrato atual", async () => {
    const sessao = await entrar();
    const resposta = await requisitar("get", "/eventos?page=0&size=1", {
      token: sessao.accessToken,
    });

    expect(resposta.data.itens).toHaveLength(1);
    expect(resposta.data.itens[0]).toMatchObject({
      id: 1,
      nome: "Festa Junina 2026",
      tipoEvento: "EVENTO",
      status: { codigo: "EM_ANDAMENTO" },
    });
    expect(resposta.data.totalPaginas).toBeGreaterThan(1);
  });

  it("abre os detalhes e o relatório do evento sem servidor", async () => {
    const sessao = await entrar();
    const opcoes = { token: sessao.accessToken };
    const detalhe = await requisitar("get", "/eventos/1", opcoes);
    const relatorio = await requisitar("get", "/eventos/1/relatorio", opcoes);

    expect(detalhe.data.id).toBe(1);
    expect(detalhe.data.resumo.quantidadeProdutos).toBeGreaterThan(0);
    expect(relatorio.data.tipoEvento).toBe("EVENTO");
    expect(relatorio.data.vendasPorHora.quantidadeVendasTotais).toBe(2);
    expect(relatorio.data.vendasPorHora.ranking.reduce(
      (total: number, hora: { quantidadeVendas: number }) => total + hora.quantidadeVendas,
      0,
    )).toBe(2);
  });

  it("pagina as vendas ativas usadas no cruzamento com o clima", async () => {
    const sessao = await entrar();
    const opcoes = { token: sessao.accessToken };
    const primeira = await requisitar("get", "/eventos/1/vendas?cancelada=false&page=0&size=1", opcoes);
    const segunda = await requisitar("get", "/eventos/1/vendas?cancelada=false&page=1&size=1", opcoes);

    expect(primeira.data.totalItens).toBe(2);
    expect(primeira.data.totalPaginas).toBe(2);
    expect(primeira.data.itens[0].id).not.toBe(segunda.data.itens[0].id);
    expect(primeira.data.itens[0].cancelada).toBe(false);
    expect(segunda.data.itens[0].cancelada).toBe(false);
  });

  it("mantém as novas consultas protegidas pelo login de demonstração", async () => {
    await expect(requisitar("get", "/eventos/1")).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  it("responde com 404 para um ID de evento inexistente", async () => {
    const sessao = await entrar();
    await expect(requisitar("get", "/eventos/99999", {
      token: sessao.accessToken,
    })).rejects.toMatchObject({
      response: {
        status: 404,
        data: { codigo: "RECURSO_NAO_ENCONTRADO" },
      },
    });
  });

  it("responde ao login no contrato atual da API", async () => {
    const sessao = await entrar();

    expect(sessao.accessToken).toMatch(/^demo-access-/);
    expect(sessao.refreshToken).toMatch(/^demo-refresh-/);
    expect(sessao.usuario).toEqual({
      nome: "Administrador",
      cargo: "ADMINISTRADOR",
      permissoes: expect.arrayContaining(["EVENTOS_MENU", "CAIXA_MENU"]),
    });
  });

  it("exige um access token válido nas rotas protegidas", async () => {
    const sessao = await entrar();

    await expect(requisitar("get", "/products")).rejects.toMatchObject({
      response: { status: 401 },
    });

    const resposta = await requisitar("get", "/products", {
      token: sessao.accessToken,
    });
    expect(resposta.status).toBe(200);
  });

  it("renova o par de tokens quando o access token expirou", async () => {
    const sessao = await entrar();
    const tokenExpirado = sessao.accessToken.replace(
      /-\d+-\d+$/,
      `-${Date.now() - 1000}-0`,
    );

    await expect(
      requisitar("get", "/products", { token: tokenExpirado }),
    ).rejects.toMatchObject({ response: { status: 401 } });

    const renovacao = await requisitar("post", "/auth/refresh", {
      body: { refreshToken: sessao.refreshToken },
    });

    expect(renovacao.data.accessToken).not.toBe(sessao.accessToken);
    expect(renovacao.data.refreshToken).not.toBe(sessao.refreshToken);

    const resposta = await requisitar("get", "/products", {
      token: renovacao.data.accessToken,
    });
    expect(resposta.status).toBe(200);
  });

  it("recusa refresh token inválido", async () => {
    await expect(
      requisitar("post", "/auth/refresh", {
        body: { refreshToken: "token-invalido" },
      }),
    ).rejects.toMatchObject({ response: { status: 401 } });
  });

  it("responde ao logout com 204", async () => {
    const sessao = await entrar();

    const resposta = await requisitar("post", "/auth/logout", {
      body: { refreshToken: sessao.refreshToken },
    });

    expect(resposta.status).toBe(204);
  });
});
