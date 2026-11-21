import type {
  Paginado,
  ParametrosPaginacao,
} from "@/shared/models/paginacao";

export type TipoAssociado = "TITULAR" | "DEPENDENTE";
export type StatusAnuidade = "PAGO" | "PENDENTE" | "ISENTO";

export interface AnuidadeAssociado {
  id: number;
  valor: number;
  totalPago: number;
  status: StatusAnuidade;
}

export interface PagamentoAnuidade {
  id: number;
  anuidadeId: number;
  valor: number;
  criadoEm: string;
}

export interface HistoricoPagamentos {
  anuidade: AnuidadeAssociado | null;
  pagamentos: PagamentoAnuidade[];
}

export interface RegistrarPagamentoPayload {
  associadoId: number;
  configuracaoId: number;
  valor: number;
}

export interface AlterarIsencaoPayload {
  associadoId: number;
  configuracaoId: number;
  isento: boolean;
}

export interface Associado {
  id: number;
  nome: string;
  numeroContato: string;
  dataNascimento: string;
  tipo: TipoAssociado;
  titularId: number | null;
  titularNome: string | null;
  anuidade: AnuidadeAssociado | null;
}

export interface ParametrosAssociados extends ParametrosPaginacao {
  ano?: number;
  tipo?: TipoAssociado;
  status?: StatusAnuidade;
  idadeMin?: number;
  idadeMax?: number;
}

export interface SalvarAssociadoPayload {
  nome: string;
  numeroContato: string;
  dataNascimento: string;
  tipo: TipoAssociado;
  titularId?: number | null;
}

export type RespostaAssociados = Paginado<Associado>;

export interface ConfiguracaoAnuidade {
  id: number;
  ano: number;
  valor: number;
}

export interface SalvarConfiguracaoAnuidadePayload {
  ano: number;
  valor: number;
}
