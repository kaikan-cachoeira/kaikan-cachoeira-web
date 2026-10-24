import type { Paginado, ParametrosPaginacao } from "@/shared/models/paginacao";
import api from "@/shared/api/cliente";
import type {
  CriarMovimentacaoPayload,
  CriarProdutoPayload,
  ParametrosProdutos,
  Produto,
  RespostaProdutos,
  AtualizarProdutoPayload,
  MovimentacaoProduto,
} from "../models";

export async function listarProdutos(
  params: ParametrosProdutos,
): Promise<RespostaProdutos> {
  const { data } = await api.get<RespostaProdutos>("/products", { params });
  return data;
}

export async function obterProduto(id: string): Promise<Produto> {
  const { data } = await api.get<Produto>(`/products/${id}`);
  return data;
}

export async function criarProduto(
  payload: CriarProdutoPayload,
): Promise<Produto> {
  const { data } = await api.post<Produto>("/products", payload);
  return data;
}

export async function criarMovimentacao(
  productId: string,
  payload: CriarMovimentacaoPayload,
): Promise<Produto> {
  const { data } = await api.post<Produto>(
    `/products/${productId}/movements`,
    payload,
  );
  return data;
}

export async function atualizarProduto(
  id: string,
  payload: AtualizarProdutoPayload,
): Promise<Produto> {
  const { data } = await api.put<Produto>(`/products/${id}`, payload);
  return data;
}

export async function listarMovimentacoesLote(
  lotId: string,
  params: ParametrosPaginacao,
): Promise<Paginado<MovimentacaoProduto>> {
  const { data } = await api.get<Paginado<MovimentacaoProduto>>(
    `/lots/${lotId}/movements`,
    { params },
  );
  return data;
}
