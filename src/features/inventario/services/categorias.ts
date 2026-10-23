import api from "@/shared/api/cliente";
import type {
  AtualizarCategoriaPayload,
  Categoria,
  CriarCategoriaPayload,
  RespostaCategorias,
} from "../models";

export async function listarCategorias(
  search = "",
): Promise<RespostaCategorias> {
  const { data } = await api.get<RespostaCategorias>("/categories", {
    params: { search },
  });
  return data;
}

export async function criarCategoria(
  payload: CriarCategoriaPayload,
): Promise<Categoria> {
  const { data } = await api.post<Categoria>("/categories", payload);
  return data;
}

export async function atualizarCategoria(
  id: string,
  payload: AtualizarCategoriaPayload,
): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/categories/${id}`, payload);
  return data;
}

export async function excluirCategoria(id: string): Promise<{ ok: boolean }> {
  const { data } = await api.delete<{ ok: boolean }>(`/categories/${id}`);
  return data;
}
