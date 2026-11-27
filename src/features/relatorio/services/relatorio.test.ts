import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  RespostaProdutosMaisVendidos,
  RespostaRelatorioGeral,
} from "../models";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/shared/api/cliente", () => ({
  default: { get },
}));

import { listarProdutosMaisVendidos, obterRelatorioGeral } from "./relatorio";

describe("relatório geral", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consulta o endpoint com os filtros e devolve o DTO recebido", async () => {
    const resposta: RespostaRelatorioGeral = {
      quantidadeEventos: 1,
      quantidadeReunioes: 0,
      quantidadeVendas: 2,
      receitaVendas: 20,
      doacoesEmDinheiro: 5,
      receitaTotal: 25,
      custoFichasAgradecimento: 0,
      custosTotais: 10,
      lucroTotal: 15,
      itens: [],
    };
    const params = {
      dataInicio: "2026-11-01T03:00:00.000Z",
      dataFim: "2026-11-02T02:59:59.999Z",
      tipos: "EVENTO,REUNIAO",
    };
    get.mockResolvedValueOnce({ data: resposta });

    await expect(obterRelatorioGeral(params)).resolves.toEqual(resposta);
    expect(get).toHaveBeenCalledWith("/relatorios/geral", { params });
  });

  it("consulta o ranking no endpoint novo e devolve a resposta da API", async () => {
    const params = {
      dataInicio: "2026-11-01T03:00:00.000Z",
      dataFim: "2026-11-02T02:59:59.999Z",
      tipos: "EVENTO,REUNIAO",
      limite: 5,
    };
    const resposta: RespostaProdutosMaisVendidos = {
      items: [{ name: "Coxinha", sold: 10, revenue: 150 }],
    };
    get.mockResolvedValueOnce({ data: resposta });

    await expect(listarProdutosMaisVendidos(params)).resolves.toEqual(resposta);
    expect(get).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledWith(
      "/relatorios/produtos-mais-vendidos",
      { params },
    );
  });

  it("preserva uma lista vazia e propaga erros da API", async () => {
    const resposta: RespostaProdutosMaisVendidos = { items: [] };
    const erro = new Error("Falha na API");
    get.mockResolvedValueOnce({ data: resposta });
    await expect(listarProdutosMaisVendidos({ limite: 5 })).resolves.toEqual(
      resposta,
    );

    get.mockRejectedValueOnce(erro);
    await expect(listarProdutosMaisVendidos({ limite: 5 })).rejects.toBe(erro);
  });
});
