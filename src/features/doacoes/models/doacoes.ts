import type {
  Paginado,
  ParametrosPaginacao,
} from "@/shared/models/paginacao";

export type TipoDoacao = "DINHEIRO" | "PRODUTO" | "REABASTECIMENTO";
export type FormaPagamentoDoacao = "PIX" | "DEBITO" | "CREDITO" | "DINHEIRO";

export interface Doacao {
  id: number;
  eventoId: number;
  eventoNome: string;
  tipo: TipoDoacao;
  valor?: number | null;
  formaPagamento?: FormaPagamentoDoacao | null;
  produtoId?: number | null;
  nome?: string | null;
  quantidade?: number | null;
  doador: string;
  valorFicha?: number | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ParametrosDoacoes extends ParametrosPaginacao {
  eventIds?: string;
  types?: string;
}

export type RespostaDoacoes = Paginado<Doacao>;

export interface CriarDoacaoPayload {
  eventoId: number;
  tipo: TipoDoacao;
  valor?: number;
  formaPagamento?: FormaPagamentoDoacao;
  produtoId?: number;
  nome?: string;
  quantidade?: number;
  doador: string;
  valorFicha?: number;
}

export type AtualizarDoacaoPayload = CriarDoacaoPayload;
