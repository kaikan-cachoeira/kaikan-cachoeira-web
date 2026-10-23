import api from "@/shared/api/cliente";
import type {
  CriarLancamentoCaixaPayload,
  LancamentoCaixa,
  ParametrosCaixa,
  RespostaCaixa,
} from "../models";

export async function listarCaixa(
  params: ParametrosCaixa,
): Promise<RespostaCaixa> {
  const { data } = await api.get<RespostaCaixa>("/cash", { params });
  return data;
}

export async function criarLancamentoCaixa(
  payload: CriarLancamentoCaixaPayload,
): Promise<LancamentoCaixa> {
  const { data } = await api.post<LancamentoCaixa>("/cash", payload);
  return data;
}

export async function cancelarLancamentoCaixa(
  id: string,
): Promise<{ ok: boolean }> {
  const { data } = await api.delete<{ ok: boolean }>(`/cash/${id}`);
  return data;
}
