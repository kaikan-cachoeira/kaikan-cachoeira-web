import api from "@/shared/api/cliente";
import type {
  AtualizarDoacaoPayload,
  CriarDoacaoPayload,
  Doacao,
  FormaPagamentoDoacao,
  ParametrosDoacoes,
  RespostaDoacoes,
  TipoDoacao,
} from "../models";

interface PaginaApi<T> {
  itens: T[];
  page: number;
  size: number;
  totalItens: number;
  totalPaginas: number;
}

interface DoacaoApi {
  id: number;
  eventoId: number;
  eventoNome: string;
  tipo: TipoDoacao;
  valor?: number | null;
  formaPagamento?: FormaPagamentoDoacao | null;
  produtoId?: number | null;
  nome?: string | null;
  quantidade?: number | null;
  doador: string;
  valorFicha?: number | null;
  criadoEm: string;
  atualizadoEm: string;
}

function paraDoacao(item: DoacaoApi): Doacao {
  return {
    id: item.id,
    eventoId: item.eventoId,
    eventoNome: item.eventoNome,
    tipo: item.tipo,
    valor: item.valor ?? null,
    formaPagamento: item.formaPagamento ?? null,
    produtoId: item.produtoId ?? null,
    nome: item.nome ?? null,
    quantidade: item.quantidade ?? null,
    doador: item.doador,
    valorFicha: item.valorFicha ?? null,
    criadoEm: item.criadoEm,
    atualizadoEm: item.atualizadoEm,
  };
}

function paraPaginado(pagina: PaginaApi<DoacaoApi>): RespostaDoacoes {
  return {
    items: pagina.itens.map(paraDoacao),
    page: pagina.page + 1,
    pageSize: pagina.size,
    total: pagina.totalItens,
    totalPages: pagina.totalPaginas,
  };
}

function parseListaCsv(valor?: string) {
  if (!valor) return undefined;
  const itens = valor
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return itens.length ? itens : undefined;
}

function parseListaNumerosCsv(valor?: string) {
  const itens = parseListaCsv(valor)
    ?.map((item) => Number(item))
    .filter(Number.isFinite);
  return itens?.length ? itens : undefined;
}

export async function listarDoacoes(
  params: ParametrosDoacoes,
): Promise<RespostaDoacoes> {
  const { data } = await api.get<PaginaApi<DoacaoApi>>("/doacoes", {
    params: {
      q: params.search || undefined,
      page: Math.max(0, (params.page || 1) - 1),
      size: params.pageSize || 6,
      tipo: parseListaCsv(params.types),
      eventoId: parseListaNumerosCsv(params.eventIds),
    },
  });
  return paraPaginado(data);
}

export async function criarDoacao(
  payload: CriarDoacaoPayload,
): Promise<Doacao> {
  const { data } = await api.post<DoacaoApi>("/doacoes", payload);
  return paraDoacao(data);
}

export async function atualizarDoacao(
  id: number,
  payload: AtualizarDoacaoPayload,
): Promise<void> {
  await api.put(`/doacoes/${id}`, payload);
}
