import api from "@/shared/api/cliente";
import type {
  AtualizarDoacaoPayload,
  CriarDoacaoPayload,
  Doacao,
  ParametrosDoacoes,
  RespostaDoacoes,
} from "../models";

export async function listarDoacoes(
  params: ParametrosDoacoes,
): Promise<RespostaDoacoes> {
  const { data } = await api.get<RespostaDoacoes>("/donations", { params });
  return data;
}

export async function criarDoacao(
  payload: CriarDoacaoPayload,
): Promise<Doacao> {
  const { data } = await api.post<Doacao>("/donations", payload);
  return data;
}

export async function atualizarDoacao(
  id: string,
  payload: AtualizarDoacaoPayload,
): Promise<Doacao> {
  const { data } = await api.put<Doacao>(`/donations/${id}`, payload);
  return data;
}

export async function excluirDoacao(id: string): Promise<{ ok: boolean }> {
  const { data } = await api.delete<{ ok: boolean }>(`/donations/${id}`);
  return data;
}
