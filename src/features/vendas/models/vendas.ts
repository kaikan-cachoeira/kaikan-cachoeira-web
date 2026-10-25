import type {
  Paginado,
  ParametrosPaginacao,
} from "@/shared/models/paginacao";

export interface ItemVendaPayload {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
}

export interface ItemVenda extends ItemVendaPayload {
  discount?: number;
  total?: number;
}

export interface Venda {
  id: string;
  eventId: number;
  eventName?: string;
  status: string;
  productsLabel?: string;
  quantity: number;
  discount: number;
  total: number;
  createdAt: string;
  items: ItemVenda[];
}

export interface ParametrosVendas extends ParametrosPaginacao {
  eventId?: number;
  statuses?: string;
  from?: string;
  to?: string;
}

export type RespostaVendas = Paginado<Venda>;

export interface CriarVendaPayload {
  eventId: number;
  items: ItemVendaPayload[];
}

export type ParametrosVendasEvento = Omit<ParametrosVendas, "eventId"> & {
  eventId: number;
};
