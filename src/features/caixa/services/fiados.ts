import api from "@/shared/api/cliente";
import type {
  Fiado,
  FormaPagamentoCaixa,
  ParametrosFiados,
  QuitarFiadoPayload,
  RespostaFiados,
} from "../models";

interface FiadoApi {
  id: number;
  nomeDevedor: string;
  valor: number;
  observacoes?: string | null;
  quitado: boolean;
  quitadoEm?: string | null;
  formaPagamento?: FormaPagamentoCaixa | null;
  criadoEm: string;
}

interface QuitacaoApi {
  fiado: FiadoApi;
}

function mapearSituacaoApi(status?: string): string | undefined {
  if (!status) return undefined;
  if (status === "pending") return "pendente";
  if (status === "settled") return "quitado";
  return status;
}

function paraFiadoEvento(item: FiadoApi, eventId: number): Fiado {
  const quitado = item.quitado;
  const paidAmount = quitado ? item.valor : 0;
  const remaining = quitado ? 0 : item.valor;

  return {
    id: item.id,
    eventId,
    nomeDevedor: item.nomeDevedor,
    valor: item.valor,
    observacoes: item.observacoes ?? null,
    quitado,
    quitadoEm: item.quitadoEm ?? null,
    formaPagamento: item.formaPagamento ?? null,
    criadoEm: item.criadoEm,

    // Compatibilidade
    amount: item.valor,
    paidAmount,
    remaining,
    status: quitado ? "settled" : "pending",
    situationLabel: quitado ? "Quitado" : "Pendente",
    debtorName: item.nomeDevedor,
    createdAt: item.criadoEm,
  };
}

export async function listarFiados(
  params: ParametrosFiados,
): Promise<RespostaFiados> {
  if (params.eventId) {
    const fiados = await listarFiadosEvento(
      params.eventId,
      mapearSituacaoApi(params.status),
    );

    const pageSize = params.pageSize || 6;
    const page = params.page || 1;
    const total = fiados.length;
    const totalPages = Math.ceil(total / pageSize);
    const inicio = Math.max(0, (page - 1) * pageSize);

    return {
      items: fiados.slice(inicio, inicio + pageSize),
      page,
      pageSize,
      total,
      totalPages,
      pendingCount: fiados.filter((fiado) => fiado.status === "pending").length,
      openAmount: fiados
        .filter((fiado) => fiado.status === "pending")
        .reduce((acc, fiado) => acc + fiado.remaining, 0),
    };
  }

  // Fluxo legado (fiados gerais / relatórios)
  const { data } = await api.get<RespostaFiados>("/fiados", { params });
  return data;
}

export async function listarFiadosEvento(
  eventId: number,
  situacao?: string,
): Promise<Fiado[]> {
  const { data } = await api.get<FiadoApi[]>(`/eventos/${eventId}/fiados`, {
    params: { situacao: situacao || undefined },
  });
  return data.map((item) => paraFiadoEvento(item, eventId));
}

export async function quitarFiado(
  id: string,
  payload: QuitarFiadoPayload,
): Promise<Fiado> {
  // Fluxo legado fora do escopo da integração de evento-atual.
  const { data } = await api.post<Fiado>(`/fiados/${id}/settle`, payload);
  return data;
}

export async function quitarFiadoEvento(
  eventId: number,
  id: number,
  payload: QuitarFiadoPayload,
): Promise<Fiado> {
  const { data } = await api.patch<QuitacaoApi>(
    `/eventos/${eventId}/fiados/${id}/quitacao`,
    {
      formaPagamento: payload.formaPagamento,
    },
  );

  return paraFiadoEvento(data.fiado, eventId);
}

export async function desquitarFiado(id: string): Promise<Fiado> {
  // Fluxo legado fora do escopo da integração de evento-atual.
  const { data } = await api.patch<Fiado>(`/fiados/${id}/unsettle`);
  return data;
}
