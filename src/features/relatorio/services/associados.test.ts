import { beforeEach, describe, expect, it, vi } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/shared/api/cliente", () => ({
  default: { get },
}));

import { listarAssociadosPendentes } from "./relatorio";

describe("listagem de associados pendentes do relatório", () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("consulta todas as páginas com ano e status pendente", async () => {
    const primeiroAssociado = {
      id: 1,
      nome: "Ana Tanaka",
      numeroContato: "11999990001",
      idade: 39,
      dataNascimento: "1987-02-10",
      tipo: "TITULAR",
      titularId: null,
      titularNome: null,
      status: "PENDENTE",
      anuidade: {
        id: 1,
        valor: 180,
        totalPago: 60,
        status: "PENDENTE",
      },
    };
    const segundoAssociado = {
      ...primeiroAssociado,
      id: 2,
      nome: "Kenji Tanaka",
      tipo: "DEPENDENTE",
      titularId: 1,
      titularNome: "Ana Tanaka",
      anuidade: null,
    };
    get
      .mockResolvedValueOnce({
        data: {
          itens: [primeiroAssociado],
          page: 0,
          size: 100,
          totalItens: 2,
          totalPaginas: 2,
        },
      })
      .mockResolvedValueOnce({
        data: {
          itens: [segundoAssociado],
          page: 1,
          size: 100,
          totalItens: 2,
          totalPaginas: 2,
        },
      });

    const resultado = await listarAssociadosPendentes(2026);

    expect(get).toHaveBeenNthCalledWith(1, "/associados", {
      params: { ano: 2026, status: "PENDENTE", page: 0, size: 100 },
    });
    expect(get).toHaveBeenNthCalledWith(2, "/associados", {
      params: { ano: 2026, status: "PENDENTE", page: 1, size: 100 },
    });
    expect(resultado).toEqual([primeiroAssociado, segundoAssociado]);
  });
});
