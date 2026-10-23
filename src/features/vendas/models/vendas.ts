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
  eventId: string;
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
  eventId?: string;
  statuses?: string;
  from?: string;
  to?: string;
}

export type RespostaVendas = Paginado<Venda>;

export interface CriarVendaPayload {
  eventId: string;
  items: ItemVendaPayload[];
}

export type ParametrosVendasEvento = Omit<ParametrosVendas, "eventId"> & {
  eventId: string;
};
