import type { Categoria } from "@/features/inventario";
import type {
  Paginado,
  ParametrosPaginacao,
} from "@/shared/models/paginacao";

export interface MetricasEvento {
  revenue: number;
  costs: number;
  profit: number;
  sales: number;
}

export interface ItemCardapio {
  id: string;
  eventId: string;
  productId?: string | null;
  name: string;
  description?: string;
  category: string;
  type: "ready" | "made";
  expected?: number | null;
  price: number;
  unitCost: number;
  costTotal: number;
  sold: number;
  discounts: number;
  image?: string | null;
  availableQuantity?: number | null;
}

export interface CustoEvento {
  id: string;
  name: string;
  value: number;
  description?: string;
  createdAt: string;
}

export interface DoacaoEvento {
  id: string;
  type: string;
  itemName?: string;
  quantity?: number;
  donor?: string;
  paymentMethod?: string;
  ticketValue?: number;
  createdAt?: string;
}

export interface Evento {
  id: string;
  name: string;
  type?: string;
  status: string;
  start: string;
  end: string;
  notes?: string;
  salesCount?: number;
  createdAt?: string;
  ongoing?: boolean;
  metrics?: MetricasEvento;
  menu?: ItemCardapio[];
  donations?: DoacaoEvento[];
  costs?: CustoEvento[];
}

export interface ParametrosEventos extends ParametrosPaginacao {
  statuses?: string;
  types?: string;
  from?: string;
  to?: string;
}

export type RespostaEventos = Paginado<Evento>;

export interface RespostaCardapio {
  items: ItemCardapio[];
  categories: Categoria[];
  event: Evento;
}

export interface CriarEventoPayload {
  name: string;
  type: string;
  notes?: string;
  start: string;
  end: string;
}

export interface CriarCustoEventoPayload {
  name: string;
  value: number;
  description?: string;
}

export type AtualizarCustoEventoPayload = CriarCustoEventoPayload;

export interface AdicionarProdutoCardapioPayload {
  type: "ready" | "made";
  productId?: string;
  name: string;
  description?: string;
  category: string;
  quantity?: number;
  price: number;
  unitCost?: number;
  ingredientCost?: number;
  image?: string | null;
}

export interface AtualizarProdutoCardapioPayload {
  type: "ready" | "made";
  productId?: string;
  name?: string;
  description?: string;
  category?: string;
  quantity?: number;
  price: number;
  unitCost?: number;
  ingredientCost?: number;
  image?: string | null;
}
