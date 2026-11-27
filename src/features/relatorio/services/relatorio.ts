import api from "@/shared/api/cliente";
import type {
  AssociadoPendente,
  ParametrosProdutosMaisVendidos,
  RespostaProdutosMaisVendidos,
} from "../models";
import { carregarTodasPaginas } from "@/shared/lib/carregarTodasPaginas";
import type { Paginado } from "@/shared/models/paginacao";

interface PaginaAssociadosApi {
  itens: AssociadoPendente[];
  page: number;
  size: number;
  totalItens: number;
  totalPaginas: number;
}

export async function listarProdutosMaisVendidos(
  params: ParametrosProdutosMaisVendidos,
): Promise<RespostaProdutosMaisVendidos> {
  const { data } = await api.get<RespostaProdutosMaisVendidos>(
    "/reports/top-products",
    { params },
  );
  return data;
}

async function listarAssociadosPendentesPagina(
  ano: number,
  page: number,
): Promise<Paginado<AssociadoPendente>> {
  const { data } = await api.get<PaginaAssociadosApi>("/associados", {
    params: {
      ano,
      status: "PENDENTE",
      page: Math.max(0, page - 1),
      size: 100,
    },
  });

  return {
    items: data.itens,
    page: data.page + 1,
    pageSize: data.size,
    total: data.totalItens,
    totalPages: data.totalPaginas,
  };
}

export function listarAssociadosPendentes(
  ano: number,
): Promise<AssociadoPendente[]> {
  return carregarTodasPaginas((page) =>
    listarAssociadosPendentesPagina(ano, page),
  );
}
