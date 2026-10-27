import api from "@/shared/api/cliente";
import type {
  AdicionarProdutoCardapioPayload,
  AtualizarCustoEventoPayload,
  AtualizarEventoPayload,
  AtualizarProdutoCardapioPayload,
  CriarCustoEventoPayload,
  CriarEventoPayload,
  CustoEvento,
  Evento,
  EventoDetalhe,
  ItemCardapio,
  ParametrosEventos,
  RelatorioEventoResponse,
  RespostaCardapio,
} from "../models";
import { fimDoDiaISO, inicioDoDiaISO } from "../utils/datas";

export async function listarEventos(
  params: ParametrosEventos,
): Promise<Evento[]> {
  const { data } = await api.get<Evento[]>("/eventos", {
    params: {
      q: params.search || undefined,
      dataInicio: params.from ? inicioDoDiaISO(params.from) : undefined,
      dataFim: params.to ? fimDoDiaISO(params.to) : undefined,
    },
  });
  return data;
}

export async function obterEventoAtual(): Promise<Evento | null> {
  const { data } = await api.get<Evento[]>("/eventos", {
    params: { statusId: 2 },
  });
  return data.find((evento) => evento.tipoEvento === "EVENTO") ?? null;
}

export async function obterEvento(id: number): Promise<EventoDetalhe> {
  const { data } = await api.get<EventoDetalhe>(`/eventos/${id}`);
  return data;
}

export async function criarEvento(
  payload: CriarEventoPayload,
): Promise<Evento> {
  const { data } = await api.post<Evento>("/eventos", payload);
  return data;
}

export async function atualizarEvento(
  id: number,
  payload: AtualizarEventoPayload,
): Promise<Evento> {
  const { data } = await api.put<Evento>(`/eventos/${id}`, payload);
  return data;
}

export async function alterarStatusEvento(
  id: number,
  statusId: number,
): Promise<void> {
  await api.patch(`/eventos/${id}`, { status: statusId });
}

export async function obterRelatorioEvento(
  id: number,
): Promise<RelatorioEventoResponse> {
  const { data } = await api.get<RelatorioEventoResponse>(
    `/eventos/${id}/relatorio`,
  );
  return data;
}

export async function excluirEvento(id: number): Promise<{ ok: boolean }> {
  const { data } = await api.delete<{ ok: boolean }>(`/events/${id}`);
  return data;
}

export async function criarCustoEvento(
  eventoId: number,
  payload: CriarCustoEventoPayload,
): Promise<CustoEvento> {
  const { data } = await api.post<CustoEvento>(`/eventos/${eventoId}/custos`, payload);
  return data;
}

export async function atualizarCustoEvento(
  eventoId: number,
  custoId: string,
  payload: AtualizarCustoEventoPayload,
): Promise<CustoEvento> {
  const { data } = await api.put<CustoEvento>(
    `/eventos/${eventoId}/custos/${custoId}`,
    payload,
  );
  return data;
}

export async function excluirCustoEvento(
  eventoId: number,
  custoId: string,
): Promise<void> {
  await api.delete<void>(`/eventos/${eventoId}/custos/${custoId}`);
}

export async function listarProdutosEvento(
  id: number,
): Promise<ItemCardapio[]> {
  const { data } = await api.get<ItemCardapio[]>(`/eventos/${id}/produtos`);
  return data;
}

export async function obterCardapioEvento(
  id: number,
): Promise<RespostaCardapio> {
  const [produtos, categorias] = await Promise.all([
    listarProdutosEvento(id),
    api.get<string[]>(`/eventos/${id}/produtos/categorias`),
  ]);

  return {
    items: produtos,
    categories: categorias.data,
  };
}

export async function adicionarProdutoCardapio(
  id: number,
  payload: AdicionarProdutoCardapioPayload,
): Promise<ItemCardapio> {
  const { data } = await api.post<ItemCardapio>(
    `/eventos/${id}/produtos`,
    payload,
  );
  return data;
}

export async function atualizarProdutoCardapio(
  eventId: number,
  itemId: number,
  payload: AtualizarProdutoCardapioPayload,
): Promise<ItemCardapio> {
  const { data } = await api.put<ItemCardapio>(
    `/eventos/${eventId}/produtos/${itemId}`,
    payload,
  );
  return data;
}

export async function excluirProdutoCardapio(
  eventId: number,
  itemId: number,
): Promise<void> {
  await api.delete(`/eventos/${eventId}/produtos/${itemId}`);
}

export async function enviarFotoProdutoCardapio(
  eventId: number,
  itemId: number,
  arquivo: File,
): Promise<string> {
  const formData = new FormData();
  formData.append("arquivo", arquivo);

  const { data } = await api.post<{ url: string }>(
    `/eventos/${eventId}/produtos/${itemId}/foto`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.url;
}
