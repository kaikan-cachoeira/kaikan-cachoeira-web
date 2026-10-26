import api from "@/shared/api/cliente";
import type {
  CriarLancamentoCaixaPayload,
  LancamentoCaixa,
  ParametrosCaixa,
  RespostaCaixa,
  ResumoCaixa,
  TipoLancamentoCaixa,
  FormaPagamentoCaixa,
} from "../models";

interface PaginaApi<T> {
  itens: T[];
  page: number;
  size: number;
  totalItens: number;
  totalPaginas: number;
}

interface LancamentoApi {
  id: number;
  tipo: TipoLancamentoCaixa;
  valor: number;
  formaPagamento: FormaPagamentoCaixa;
  nomeDevedor?: string | null;
  criadoEm: string;
}

interface ResumoApi {
  fichasVendidas: number;
  fichasDevolvidas: number;
  saldoFichas: number;
  porFormaPagamento: Partial<Record<FormaPagamentoCaixa, number>>;
  fiadosEmAberto: number;
  quantidadeFiadosEmAberto: number;
  totalRecebido: number;
}

interface CaixaApi {
  resumo: ResumoApi;
  lancamentos: PaginaApi<LancamentoApi>;
}

interface RegistroCaixaApi {
  lancamento: LancamentoApi;
  resumo: ResumoApi;
}

function paraResumo(resumo: ResumoApi): ResumoCaixa {
  return {
    fichasVendidas: resumo.fichasVendidas,
    fichasDevolvidas: resumo.fichasDevolvidas,
    saldoFichas: resumo.saldoFichas,
    porFormaPagamento: resumo.porFormaPagamento || {},
    fiadosEmAberto: resumo.fiadosEmAberto,
    quantidadeFiadosEmAberto: resumo.quantidadeFiadosEmAberto,
    totalRecebido: resumo.totalRecebido,
  };
}

function paraLancamento(item: LancamentoApi, eventId: number): LancamentoCaixa {
  return {
    id: item.id,
    eventId,
    tipo: item.tipo,
    valor: item.valor,
    formaPagamento: item.formaPagamento,
    nomeDevedor: item.nomeDevedor ?? null,
    criadoEm: item.criadoEm,
  };
}

export async function listarCaixa(
  params: ParametrosCaixa,
): Promise<RespostaCaixa> {
  if (!params.eventId) {
    return {
      items: [],
      page: 1,
      pageSize: params.pageSize || 6,
      total: 0,
      totalPages: 0,
      summary: {
        fichasVendidas: 0,
        fichasDevolvidas: 0,
        saldoFichas: 0,
        porFormaPagamento: {},
        fiadosEmAberto: 0,
        quantidadeFiadosEmAberto: 0,
        totalRecebido: 0,
      },
      fiadosCount: 0,
    };
  }

  const { data } = await api.get<CaixaApi>(`/eventos/${params.eventId}/caixa`, {
    params: {
      tipo: params.tipo,
      formaPagamento: params.formaPagamento,
      page: Math.max(0, (params.page || 1) - 1),
      size: params.pageSize || 6,
    },
  });

  return {
    items: data.lancamentos.itens.map((item) => paraLancamento(item, params.eventId as number)),
    page: data.lancamentos.page + 1,
    pageSize: data.lancamentos.size,
    total: data.lancamentos.totalItens,
    totalPages: data.lancamentos.totalPaginas,
    summary: paraResumo(data.resumo),
    fiadosCount: data.resumo.quantidadeFiadosEmAberto,
  };
}

export async function criarLancamentoCaixa(
  payload: CriarLancamentoCaixaPayload,
): Promise<LancamentoCaixa> {
  const { data } = await api.post<RegistroCaixaApi>(
    `/eventos/${payload.eventId}/caixa`,
    {
      tipo: payload.tipo,
      valor: payload.valor,
      formaPagamento: payload.formaPagamento,
      nomeDevedor: payload.nomeDevedor,
      observacao: payload.observacao,
    },
  );

  return paraLancamento(data.lancamento, payload.eventId);
}

export async function cancelarLancamentoCaixa(
  eventId: number,
  id: number,
): Promise<void> {
  await api.delete(`/eventos/${eventId}/caixa/${id}`);
}
