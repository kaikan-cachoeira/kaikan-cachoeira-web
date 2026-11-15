import { describe, expect, it, vi } from "vitest";
import type { Paginado } from "@/shared/models/paginacao";
import { carregarTodasPaginas } from "./carregarTodasPaginas";

describe("carregarTodasPaginas", () => {
  it("retorna todos os itens de uma coleção paginada", async () => {
    const paginas: Paginado<number>[] = [
      {
        items: [1, 2],
        page: 1,
        pageSize: 2,
        total: 5,
        totalPages: 3,
      },
      {
        items: [3, 4],
        page: 2,
        pageSize: 2,
        total: 5,
        totalPages: 3,
      },
      {
        items: [5],
        page: 3,
        pageSize: 2,
        total: 5,
        totalPages: 3,
      },
    ];

    const carregarPagina = vi.fn(async (page: number) => paginas[page - 1]);

    await expect(carregarTodasPaginas(carregarPagina)).resolves.toEqual([
      1,
      2,
      3,
      4,
      5,
    ]);
    expect(carregarPagina).toHaveBeenCalledTimes(3);
    expect(carregarPagina).toHaveBeenNthCalledWith(1, 1);
    expect(carregarPagina).toHaveBeenNthCalledWith(2, 2);
    expect(carregarPagina).toHaveBeenNthCalledWith(3, 3);
  });

  it("propaga erro sem devolver coleção parcial", async () => {
    const carregarPagina = vi.fn(async (page: number) => {
      if (page === 2) {
        throw new Error("Falha na página 2");
      }

      return {
        items: [1],
        page,
        pageSize: 1,
        total: 2,
        totalPages: 2,
      } satisfies Paginado<number>;
    });

    await expect(carregarTodasPaginas(carregarPagina)).rejects.toThrow(
      "Falha na página 2",
    );
  });
});
