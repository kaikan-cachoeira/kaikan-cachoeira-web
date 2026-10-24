import api from "@/shared/api/cliente";
import type {
  AdicionarProdutoCardapioPayload,
  AtualizarCustoEventoPayload,
  CriarCustoEventoPayload,
  CriarEventoPayload,
  Evento,
  ItemCardapio,
  ParametrosEventos,
  RespostaCardapio,
  RespostaEventos,
} from "../models";

export async function listarEventos(
  params: ParametrosEventos,
): Promise<RespostaEventos> {
  const { data } = await api.get<RespostaEventos>("/events", { params });
  return data;
}

export async function obterEventoAtual(): Promise<Evento> {
  const { data } = await api.get<{ event: Evento }>("/events/ongoing");
  return data.event;
}

export async function obterEvento(id: string): Promise<Evento> {
  const { data } = await api.get<Evento>(`/events/${id}`);
  return data;
}

export async function criarEvento(
  payload: CriarEventoPayload,
): Promise<Evento> {
  const { data } = await api.post<Evento>("/events", payload);
  return data;
}

export async function atualizarEvento(
  id: string,
  payload: CriarEventoPayload,
): Promise<Evento> {
  const { data } = await api.put<Evento>(`/events/${id}`, payload);
  return data;
}

export async function alterarStatusEvento(
  id: string,
  status: string,
): Promise<Evento> {
  const { data } = await api.patch<Evento>(`/events/${id}/status`, { status });
  return data;
}

export async function excluirEvento(id: string): Promise<{ ok: boolean }> {
  const { data } = await api.delete<{ ok: boolean }>(`/events/${id}`);
  return data;
}

export async function criarCustoEvento(
  id: string,
  payload: CriarCustoEventoPayload,
): Promise<Evento> {
  const { data } = await api.post<Evento>(`/events/${id}/costs`, payload);
  return data;
}

export async function atualizarCustoEvento(
  id: string,
  custoId: string,
  payload: AtualizarCustoEventoPayload,
): Promise<Evento> {
  const { data } = await api.put<Evento>(
    `/events/${id}/costs/${custoId}`,
    payload,
  );
  return data;
}

export async function excluirCustoEvento(
  id: string,
  custoId: string,
): Promise<Evento> {
  const { data } = await api.delete<Evento>(`/events/${id}/costs/${custoId}`);
  return data;
}

export async function obterCardapioEvento(
  id: string,
): Promise<RespostaCardapio> {
  const { data } = await api.get<RespostaCardapio>(`/events/${id}/menu`);
  return data;
}

export async function adicionarProdutoCardapio(
  id: string,
  payload: AdicionarProdutoCardapioPayload,
): Promise<ItemCardapio> {
  const { data } = await api.post<ItemCardapio>(`/events/${id}/menu`, payload);
  return data;
}
