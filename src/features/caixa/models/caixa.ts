import type {
  Paginado,
  ParametrosPaginacao,
} from "@/shared/models/paginacao";

export type TipoLancamentoCaixa =
  | "VENDA_FICHA"
  | "DEVOLUCAO_FICHA"
  | "QUITACAO_FIADO";

export type FormaPagamentoCaixa =
  | "PIX"
  | "DEBITO"
  | "CREDITO"
  | "DINHEIRO"
  | "FIADO";

export interface LancamentoCaixa {
  id: number;
  eventId: number;
  tipo: TipoLancamentoCaixa;
  valor: number;
  formaPagamento: FormaPagamentoCaixa;
  nomeDevedor?: string | null;
  criadoEm: string;
}

export interface ResumoCaixa {
  fichasVendidas: number;
  fichasDevolvidas: number;
  saldoFichas: number;
  porFormaPagamento: Partial<Record<FormaPagamentoCaixa, number>>;
  fiadosEmAberto: number;
  quantidadeFiadosEmAberto: number;
  totalRecebido: number;
}

export interface RespostaCaixa extends Paginado<LancamentoCaixa> {
  summary: ResumoCaixa;
  fiadosCount: number;
}

export interface ParametrosCaixa extends ParametrosPaginacao {
  eventId?: number;
  tipo?: TipoLancamentoCaixa;
  formaPagamento?: FormaPagamentoCaixa;
}

export interface Fiado {
  id: number;
  eventId: number;
  eventName?: string;

  nomeDevedor: string;
  valor: number;
  observacoes?: string | null;
  quitado: boolean;
  quitadoEm?: string | null;
  formaPagamento?: FormaPagamentoCaixa | null;
  criadoEm: string;

  // Compatibilidade com telas legadas / fora de escopo
  amount: number;
  paidAmount: number;
  remaining: number;
  status: "pending" | "settled";
  situationLabel: string;
  debtorName: string;
  createdAt: string;
}

export interface RespostaFiados extends Paginado<Fiado> {
  pendingCount: number;
  openAmount: number;
}

export interface ParametrosFiados extends ParametrosPaginacao {
  eventId?: number;
  eventIds?: string;
  status?: string;
  search?: string;
}

export interface CriarLancamentoCaixaPayload {
  eventId: number;
  tipo: Extract<TipoLancamentoCaixa, "VENDA_FICHA" | "DEVOLUCAO_FICHA">;
  valor: number;
  formaPagamento: FormaPagamentoCaixa;
  nomeDevedor?: string | null;
  observacao?: string;
}

export interface QuitarFiadoPayload {
  formaPagamento: Exclude<FormaPagamentoCaixa, "FIADO">;
}
