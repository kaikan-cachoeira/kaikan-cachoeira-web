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

export type TipoAssociado = "TITULAR" | "DEPENDENTE";
export type StatusAnuidade = "PENDENTE" | "PAGO" | "ISENTO";

export interface AnuidadeAssociado {
  id: number;
  valor: number;
  totalPago: number;
  status: StatusAnuidade;
}

export interface AssociadoPendente {
  id: number;
  nome: string;
  numeroContato: string | null;
  idade: number | null;
  dataNascimento: string | null;
  tipo: TipoAssociado;
  titularId: number | null;
  titularNome: string | null;
  status: StatusAnuidade;
  anuidade: AnuidadeAssociado | null;
}
