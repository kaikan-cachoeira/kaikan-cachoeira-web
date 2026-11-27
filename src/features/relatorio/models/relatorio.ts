export interface ParametrosProdutosMaisVendidos {
  dataInicio?: string;
  dataFim?: string;
  tipos?: string;
  limite?: number;
}

export interface ProdutoMaisVendido {
  name: string;
  sold: number;
  revenue: number;
}

export interface RespostaProdutosMaisVendidos {
  items: ProdutoMaisVendido[];
}

export interface ParametrosRelatorioGeral {
  dataInicio?: string;
  dataFim?: string;
  tipos?: string;
}

export interface ItemRelatorioGeral {
  eventoId: number;
  nome: string;
  tipoEvento: "EVENTO" | "REUNIAO";
  status: {
    id: number;
    codigo: "NAO_INICIADO" | "EM_ANDAMENTO" | "ENCERRADO";
    descricao: string;
  };
  dataHoraInicio: string;
  parcial: boolean;
  quantidadeVendas: number;
  receitaVendas: number;
  doacoesEmDinheiro: number;
  receitaTotal: number;
  custoFichasAgradecimento: number;
  custoTotal: number;
  lucro: number;
}

export interface RespostaRelatorioGeral {
  quantidadeEventos: number;
  quantidadeReunioes: number;
  quantidadeVendas: number;
  receitaVendas: number;
  doacoesEmDinheiro: number;
  receitaTotal: number;
  custoFichasAgradecimento: number;
  custosTotais: number;
  lucroTotal: number;
  itens: ItemRelatorioGeral[];
}
