import api from "@/shared/api/cliente";
import { carregarTodasPaginas } from "@/shared/lib/carregarTodasPaginas";
import type { Paginado } from "@/shared/models/paginacao";
import type {
  Fiado,
  FormaPagamentoCaixa,
  ParametrosFiados,
  QuitarFiadoPayload,
  RespostaFiados,
} from "../models";

interface PaginaApi<T> {
  itens: T[];
  page: number;
  size: number;
  totalItens: number;
  totalPaginas: number;
}

interface FiadoListagemApi extends PaginaApi<FiadoApi> {
  pendingCount: number;
  openAmount: number;
}

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

function paraPaginadoFiados(
  pagina: FiadoListagemApi,
  eventId: number,
): RespostaFiados {
  return {
    items: pagina.itens.map((item) => paraFiadoEvento(item, eventId)),
    page: pagina.page + 1,
    pageSize: pagina.size,
    total: pagina.totalItens,
    totalPages: pagina.totalPaginas,
    pendingCount: Number(pagina.pendingCount) || 0,
    openAmount: Number(pagina.openAmount) || 0,
  };
}

function parseListaNumerosCsv(valor?: string): number[] {
  if (!valor) return [];

  return valor
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
}

function normalizarTexto(valor?: string): string {
  return (valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function filtrarPorBusca(items: Fiado[], search?: string): Fiado[] {
  const termo = normalizarTexto(search);
  if (!termo) return items;

  return items.filter((item) =>
    normalizarTexto(item.nomeDevedor).includes(termo),
  );
}

function paginarFiados(items: Fiado[], page = 1, pageSize = 8): Paginado<Fiado> {
  const tamanhoPagina = Math.max(1, pageSize);
  const total = items.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / tamanhoPagina);
  const paginaAtual = Math.min(Math.max(1, page), totalPages);
  const inicio = (paginaAtual - 1) * tamanhoPagina;
  const fim = inicio + tamanhoPagina;

  return {
    items: items.slice(inicio, fim),
    page: paginaAtual,
    pageSize: tamanhoPagina,
    total,
    totalPages,
  };
}

export async function obterResumoFiados(
  params: Pick<ParametrosFiados, "eventIds" | "status">,
): Promise<Pick<RespostaFiados, "pendingCount" | "openAmount">> {
  const eventIds = parseListaNumerosCsv(params.eventIds);
  if (eventIds.length === 0) {
    return {
      pendingCount: 0,
      openAmount: 0,
    };
  }

  const situacao = mapearSituacaoApi(params.status);
  const resumos = await Promise.all(
    eventIds.map(async (eventId) => {
      const { data } = await api.get<FiadoListagemApi>(
        `/eventos/${eventId}/fiados`,
        {
          params: {
            situacao,
            page: 0,
            size: 1,
          },
        },
      );

      return {
        pendingCount: Number(data.pendingCount) || 0,
        openAmount: Number(data.openAmount) || 0,
      };
    }),
  );

  return resumos.reduce(
    (total, resumo) => ({
      pendingCount: total.pendingCount + resumo.pendingCount,
      openAmount: total.openAmount + resumo.openAmount,
    }),
    { pendingCount: 0, openAmount: 0 },
  );
}

export async function listarFiados(
  params: ParametrosFiados,
): Promise<RespostaFiados> {
  if (params.eventId) {
    const { data } = await api.get<FiadoListagemApi>(
      `/eventos/${params.eventId}/fiados`,
      {
        params: {
          situacao: mapearSituacaoApi(params.status),
          page: Math.max(0, (params.page || 1) - 1),
          size: params.pageSize || 6,
        },
      },
    );

    return paraPaginadoFiados(data, params.eventId);
  }

  const eventIds = parseListaNumerosCsv(params.eventIds);
  if (eventIds.length === 0) {
    return {
      items: [],
      page: 1,
      pageSize: params.pageSize || 8,
      total: 0,
      totalPages: 1,
      pendingCount: 0,
      openAmount: 0,
    };
  }

  const situacao = mapearSituacaoApi(params.status);
  const listasPorEvento = await Promise.all(
    eventIds.map((eventId) => listarFiadosEvento(eventId, situacao)),
  );

  const filtrados = filtrarPorBusca(listasPorEvento.flat(), params.search).sort(
    (a, b) => Date.parse(b.criadoEm) - Date.parse(a.criadoEm),
  );
  const pendentes = filtrados.filter((fiado) => fiado.status === "pending");
  const paginado = paginarFiados(filtrados, params.page, params.pageSize || 8);

  return {
    ...paginado,
    pendingCount: pendentes.length,
    openAmount: pendentes.reduce((total, fiado) => total + fiado.remaining, 0),
  };
}

export async function listarFiadosEvento(
  eventId: number,
  situacao?: string,
): Promise<Fiado[]> {
  return carregarTodasPaginas(async (page) => {
    const { data } = await api.get<FiadoListagemApi>(
      `/eventos/${eventId}/fiados`,
      {
        params: {
          situacao: situacao || undefined,
          page: Math.max(0, page - 1),
          size: 100,
        },
      },
    );

    return paraPaginadoFiados(data, eventId);
  });
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
