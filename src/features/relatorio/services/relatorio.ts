import api from "@/shared/api/cliente";
import type {
  ParametrosRelatorioGeral,
  ParametrosProdutosMaisVendidos,
  RespostaRelatorioGeral,
  RespostaProdutosMaisVendidos,
} from "../models";

export async function obterRelatorioGeral(
  params: ParametrosRelatorioGeral,
): Promise<RespostaRelatorioGeral> {
  const { data } = await api.get<RespostaRelatorioGeral>("/relatorios/geral", {
    params,
  });
  return data;
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
