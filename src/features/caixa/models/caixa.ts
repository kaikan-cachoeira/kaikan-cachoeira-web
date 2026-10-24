import type {
  Paginado,
  ParametrosPaginacao,
} from "@/shared/models/paginacao";

export interface LancamentoCaixa {
  id: string;
  eventId: string;
  type: string;
  value: number;
  payment: string;
  paymentLabel: string;
  debtorName?: string | null;
  note?: string;
  createdAt: string;
}

export interface ResumoCaixa {
  sold: number;
  returned: number;
  openFiados: number;
}

export interface RespostaCaixa extends Paginado<LancamentoCaixa> {
  summary: ResumoCaixa;
  fiadosCount: number;
}

export interface ParametrosCaixa extends ParametrosPaginacao {
  eventId?: string;
  types?: string;
  payments?: string;
}

export interface Fiado {
  id: string;
  eventId: string;
  eventName?: string;
  amount: number;
  paidAmount: number;
  remaining: number;
  status: string;
  situationLabel: string;
  debtorName: string;
  createdAt: string;
}

export interface RespostaFiados extends Paginado<Fiado> {
  pendingCount: number;
  openAmount: number;
}

export interface ParametrosFiados extends ParametrosPaginacao {
  eventId?: string;
  eventIds?: string;
  status?: string;
  search?: string;
}

export interface CriarLancamentoCaixaPayload {
  eventId: string;
  type: string;
  value: number;
  payment: string;
  debtorName?: string | null;
  note?: string;
}

export interface QuitarFiadoPayload {
  value: number;
  paymentMethod: string;
}
