import api from "@/shared/api/cliente";
import type {
  Fiado,
  ParametrosFiados,
  QuitarFiadoPayload,
  RespostaFiados,
} from "../models";

export async function listarFiados(
  params: ParametrosFiados,
): Promise<RespostaFiados> {
  const { data } = await api.get<RespostaFiados>("/fiados", { params });
  return data;
}

export async function quitarFiado(
  id: string,
  payload: QuitarFiadoPayload,
): Promise<Fiado> {
  const { data } = await api.post<Fiado>(`/fiados/${id}/settle`, payload);
  return data;
}

export async function desquitarFiado(id: string): Promise<Fiado> {
  const { data } = await api.patch<Fiado>(`/fiados/${id}/unsettle`);
  return data;
}
