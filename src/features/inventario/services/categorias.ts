import api from "@/shared/api/cliente";
import type {
  AtualizarCategoriaPayload,
  Categoria,
  CriarCategoriaPayload,
  RespostaCategorias,
} from "../models";
import { normalizarCategoriaApi } from "./inventario";

interface CategoriaApi {
  id: number;
  nome: string;
  descricao?: string | null;
}

export async function listarCategorias(
  search = "",
): Promise<RespostaCategorias> {
  const { data } = await api.get<CategoriaApi[]>("/categorias");

  const termo = search.trim().toLowerCase();
  const items = data
    .map(normalizarCategoriaApi)
    .filter((categoria) =>
      termo
        ? categoria.nome.toLowerCase().includes(termo) ||
          String(categoria.descricao || "").toLowerCase().includes(termo)
        : true,
    );

  return { items };
}

export async function criarCategoria(
  payload: CriarCategoriaPayload,
): Promise<Categoria> {
  const { data } = await api.post<CategoriaApi>("/categorias", payload);
  return normalizarCategoriaApi(data);
}

export async function atualizarCategoria(
  id: number,
  payload: AtualizarCategoriaPayload,
): Promise<Categoria> {
  const { data } = await api.put<CategoriaApi>(`/categorias/${id}`, payload);
  return normalizarCategoriaApi(data);
}

export async function excluirCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}
