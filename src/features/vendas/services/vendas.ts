import api from "@/shared/api/cliente";
import type {
  CriarVendaPayload,
  ParametrosVendas,
  RespostaVendas,
  Venda,
} from "../models";

export async function listarVendas(
  params: ParametrosVendas,
): Promise<RespostaVendas> {
  const { data } = await api.get<RespostaVendas>("/sales", { params });
  return data;
}

export async function criarVenda(payload: CriarVendaPayload): Promise<Venda> {
  const { data } = await api.post<Venda>("/sales", payload);
  return data;
}

export async function cancelarVenda(id: string): Promise<Venda> {
  const { data } = await api.patch<Venda>(`/sales/${id}/cancel`);
  return data;
}
