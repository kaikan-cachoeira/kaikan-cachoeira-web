import type {
  Paginado,
  ParametrosPaginacao,
} from "@/shared/models/paginacao";

export interface Doacao {
  id: string;
  eventId: string;
  eventName: string;
  type: string;
  itemName?: string;
  quantity?: number;
  donor?: string;
  paymentMethod?: string;
  amount?: number;
  ticketValue: number;
  productId?: string | null;
  createdAt: string;
}

export interface ParametrosDoacoes extends ParametrosPaginacao {
  eventIds?: string;
  types?: string;
}

export type RespostaDoacoes = Paginado<Doacao>;

export interface CriarDoacaoPayload {
  eventId: string;
  type: string;
  donor?: string;
  ticketValue: number;
  productId?: string;
  itemName?: string;
  quantity?: number;
  amount?: number;
  paymentMethod?: string;
}

export type AtualizarDoacaoPayload = CriarDoacaoPayload;
