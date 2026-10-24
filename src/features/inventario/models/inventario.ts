import type {
  Paginado,
  ParametrosPaginacao,
} from "@/shared/models/paginacao";

export interface Produto {
  id: string;
  name: string;
  description?: string;
  image?: string | null;
  categoryId?: string | null;
  category?: string;
  quantity: number;
  minStock: number;
  lowStock?: boolean;
  createdAt?: string;
  lots?: LoteProduto[];
  movements?: MovimentacaoProduto[];
}

export interface LoteProduto {
  id: string;
  entryQty: number;
  balance: number;
  totalCost: number;
  unitCost: number;
  createdAt: string;
}

export interface MovimentacaoProduto {
  id: string;
  type: string;
  quantity: number;
  totalCost: number;
  unitCost: number;
  notes?: string;
  eventName?: string;
  createdAt: string;
}

export interface Categoria {
  id: string;
  name: string;
  description?: string;
  productCount?: number;
  createdAt?: string;
}

export interface ParametrosProdutos extends ParametrosPaginacao {
  stock?: string;
  categoryId?: string;
  categoryIds?: string;
}

export type RespostaProdutos = Paginado<Produto>;

export interface RespostaCategorias {
  items: Categoria[];
}

export interface CriarProdutoPayload {
  name: string;
  description?: string;
  categoryId: string;
  minStock: number;
  image?: string | null;
}

export interface CriarMovimentacaoPayload {
  type: string;
  quantity: number;
  totalCost: number;
  notes?: string;
}

export interface CriarCategoriaPayload {
  name: string;
  description?: string;
}

export type AtualizarCategoriaPayload = CriarCategoriaPayload;

export interface OpcaoCategoria {
  value: string;
  label: string;
}

export type AtualizarProdutoPayload = CriarProdutoPayload;
