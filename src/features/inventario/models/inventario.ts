import type {
  Paginado,
  ParametrosPaginacao,
} from "@/shared/models/paginacao";

export interface CategoriaResumoProduto {
  id: number;
  nome: string;
}

export interface Produto {
  id: number;
  nome: string;
  descricao?: string | null;
  categoria?: CategoriaResumoProduto | null;
  fotoUrl?: string | null;
  quantidadeAtual: number;
  estoqueMinimo?: number | null;
  lotes?: LoteProduto[];
  movimentacoes?: MovimentacaoProduto[];
}

export interface LoteProduto {
  id: number;
  quantidadeInicial: number;
  quantidadeAtual: number;
  custoTotal: number;
  custoUnitario: number;
  criadoEm: string;
}

export interface MovimentacaoProduto {
  id: number;
  estoqueId: number;
  type: string;
  quantidade: number;
  custoTotal: number;
  custoUnitario: number;
  eventoId?: number | null;
  eventoNome?: string | null;
  observacoes?: string | null;
  criadoEm: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string | null;
  quantidadeProdutos?: number;
}

export interface ParametrosProdutos extends ParametrosPaginacao {
  stock?: string;
  categoryId?: number;
  categoryIds?: string;
}

export type RespostaProdutos = Paginado<Produto>;

export interface RespostaCategorias {
  items: Categoria[];
}

export interface CriarProdutoPayload {
  nome: string;
  descricao?: string;
  categoriaId?: number | null;
  estoqueMinimo?: number | null;
}

export interface CriarMovimentacaoPayload {
  tipoMovimentacaoId: number;
  quantidade: number;
  custoTotal?: number;
  eventoId?: number;
  observacoes?: string;
}

export interface TipoMovimentacao {
  id: number;
  codigo: string;
  descricao: string;
  direcao: "ENTRADA" | "SAIDA";
  exigeCusto: boolean;
}

export interface MovimentacaoResultado {
  movimentacoes: MovimentacaoProduto[];
  quantidadeAtual: number;
}

export interface CriarCategoriaPayload {
  nome: string;
  descricao?: string;
}

export type AtualizarCategoriaPayload = CriarCategoriaPayload;

export interface OpcaoCategoria {
  value: string;
  label: string;
}

export type AtualizarProdutoPayload = CriarProdutoPayload;

export interface PaginaApi<T> {
  itens: T[];
  page: number;
  size: number;
  totalItens: number;
  totalPaginas: number;
}
