import type {
  Paginado,
  ParametrosPaginacao,
} from "@/shared/models/paginacao";

export interface Venda {
  id: number;
  eventId: number;
  criadoEm: string;
  desconto: number;
  precoTotal: number;
  quantidadeItens: number;
  cancelada: boolean;
}

export interface ParametrosVendas extends ParametrosPaginacao {
  eventId?: number;
  from?: string;
  to?: string;
  cancelada?: boolean;
}

export type RespostaVendas = Paginado<Venda>;

export interface ItemVendaPayload {
  produtoEventoId: number;
  quantidade: number;
}

export interface CriarVendaPayload {
  eventId: number;
  itens: ItemVendaPayload[];
  valorFinal?: number;
}

export type ParametrosVendasEvento = Omit<ParametrosVendas, "eventId"> & {
  eventId: number;
};

export interface ItemVendaDetalhe {
  produtoEventoId: number;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  descontoUnitario: number;
}

export interface VendaDetalhe {
  id: number;
  criadoEm: string;
  itens: ItemVendaDetalhe[];
  desconto: number;
  precoTotal: number;
  cancelada: boolean;
  canceladaEm?: string | null;
}
