import type { Paginado } from "@/shared/models/paginacao";

export async function carregarTodasPaginas<T>(
  carregarPagina: (page: number) => Promise<Paginado<T>>,
): Promise<T[]> {
  const primeiraPagina = await carregarPagina(1);
  const itens = [...primeiraPagina.items];
  const totalPaginas = Math.max(1, primeiraPagina.totalPages || 1);

  for (let page = 2; page <= totalPaginas; page += 1) {
    const pagina = await carregarPagina(page);
    itens.push(...pagina.items);
  }

  return itens;
}
