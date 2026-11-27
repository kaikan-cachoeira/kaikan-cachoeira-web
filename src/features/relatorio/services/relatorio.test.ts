import { describe, expect, it, vi } from "vitest";
import type { RespostaRelatorioGeral } from "../models";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/shared/api/cliente", () => ({
  default: { get },
}));

import { obterRelatorioGeral } from "./relatorio";

describe("relatório geral", () => {
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
});
