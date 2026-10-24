import api from "@/shared/api/cliente";
import type {
  ParametrosProdutosMaisVendidos,
  RespostaProdutosMaisVendidos,
} from "../models";

export async function listarProdutosMaisVendidos(
  params: ParametrosProdutosMaisVendidos,
): Promise<RespostaProdutosMaisVendidos> {
  const { data } = await api.get<RespostaProdutosMaisVendidos>(
    "/reports/top-products",
    { params },
  );
  return data;
}
