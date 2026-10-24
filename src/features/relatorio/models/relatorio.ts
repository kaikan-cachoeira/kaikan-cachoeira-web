export interface ParametrosProdutosMaisVendidos {
  from?: string;
  to?: string;
  types?: string;
  limit?: number;
}

export interface ProdutoMaisVendido {
  name: string;
  sold: number;
  revenue: number;
}

export interface RespostaProdutosMaisVendidos {
  items: ProdutoMaisVendido[];
}
