import api from "@/shared/api/cliente";
import type {
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
