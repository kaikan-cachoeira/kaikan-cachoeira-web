import api from "@/shared/api/cliente";
import type { ClimaEventoResponse } from "../models";

export async function obterClimaEvento(
  id: number,
): Promise<ClimaEventoResponse> {
  const { data } = await api.get<ClimaEventoResponse>(`/eventos/${id}/climas`);
  return data;
}
