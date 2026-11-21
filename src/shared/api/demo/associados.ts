import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { lerJSON, salvarJSON } from "@/shared/lib/armazenamentoLocal";
import { formatarMoeda } from "@/shared/lib/formatacao";
import {
  criarSeedAssociados,
  type AssociadoDemo,
  type ConfiguracaoAnuidadeDemo,
  type DadosAssociadosDemo,
  type PagamentoAnuidadeDemo,
  type StatusAnuidadeDemo,
  type TipoAssociadoDemo,
} from "./dadosAssociados";

const STORAGE_KEY = "kaikan-cachoeira-demo-associados";

export interface ParametrosAssociadosDemo {
  q?: string;
  page?: number;
  size?: number;
  ano?: number;
  tipo?: TipoAssociadoDemo;
  status?: StatusAnuidadeDemo;
  idadeMin?: number;
  idadeMax?: number;
}

interface AnuidadeAssociadoDemo {
  id: number;
  valor: number;
  totalPago: number;
  status: StatusAnuidadeDemo;
}

interface AssociadoComAnuidadeDemo extends AssociadoDemo {
  anuidade: AnuidadeAssociadoDemo | null;
}

interface PaginaAssociadosDemo {
  itens: AssociadoComAnuidadeDemo[];
  page: number;
  size: number;
  totalItens: number;
  totalPaginas: number;
}

class FalhaAssociadoDemo extends Error {
  readonly status: number;
  readonly codigo: string;

  constructor(
    status: number,
    codigo: string,
    mensagem: string,
  ) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
  }
}

let bancoMemoria: DadosAssociadosDemo | null = null;

function obterBanco(): DadosAssociadosDemo {
  if (bancoMemoria) return bancoMemoria;

  const persistido = lerJSON<DadosAssociadosDemo | null>(STORAGE_KEY, null);
  if (persistido) {
    const pagamentos = persistido.pagamentos.map((pagamento, index) => {
      if (pagamento.criadoEm) return pagamento;
      const ano =
        persistido.anuidades.find(
          (anuidade) => anuidade.id === pagamento.anuidadeId,
        )?.ano ?? new Date().getUTCFullYear();
      return {
        ...pagamento,
        criadoEm: new Date(Date.UTC(ano, 0, 1, 0, 0, index)).toISOString(),
      };
    });
    bancoMemoria = { ...persistido, pagamentos };
    if (pagamentos.some((_, index) => !persistido.pagamentos[index]?.criadoEm)) {
      salvarJSON(STORAGE_KEY, bancoMemoria);
    }
  } else {
    bancoMemoria = criarSeedAssociados();
    salvarJSON(STORAGE_KEY, bancoMemoria);
  }
  return bancoMemoria;
}

function normalizarBusca(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function calcularIdade(dataNascimento: string): number {
  const [anoNascimento, mesNascimento, diaNascimento] = dataNascimento
    .split("-")
    .map(Number);
  const hoje = new Date();
  const anoAtual = hoje.getUTCFullYear();
  const mesAtual = hoje.getUTCMonth() + 1;
  const diaAtual = hoje.getUTCDate();
  const aniversarioAindaNaoOcorreu =
    mesAtual < mesNascimento ||
    (mesAtual === mesNascimento && diaAtual < diaNascimento);

  return (
    anoAtual -
    anoNascimento -
    (aniversarioAindaNaoOcorreu ? 1 : 0)
  );
}

function paraAssociadoDoAno(
  associado: AssociadoDemo,
  db: DadosAssociadosDemo,
  ano: number | undefined,
): AssociadoComAnuidadeDemo {
  const anuidade = db.anuidades.find(
    (item) => item.associadoId === associado.id && item.ano === ano,
  );

  if (!anuidade) return { ...associado, anuidade: null };

  const totalPago = db.pagamentos
    .filter((pagamento) => pagamento.anuidadeId === anuidade.id)
    .reduce((total, pagamento) => total + Math.round(pagamento.valor * 100), 0);

  return {
    ...associado,
    anuidade: {
      id: anuidade.id,
      valor: anuidade.valor,
      totalPago: totalPago / 100,
      status: anuidade.status,
    },
  };
}

function totalPagoCentavos(
  db: DadosAssociadosDemo,
  anuidadeId: number,
): number {
  return db.pagamentos
    .filter((pagamento) => pagamento.anuidadeId === anuidadeId)
    .reduce((total, pagamento) => total + Math.round(pagamento.valor * 100), 0);
}

function recalcularStatusAnuidade(
  db: DadosAssociadosDemo,
  anuidade: DadosAssociadosDemo["anuidades"][number],
): void {
  if (anuidade.status === "ISENTO") return;
  anuidade.status =
    totalPagoCentavos(db, anuidade.id) >= Math.round(anuidade.valor * 100)
      ? "PAGO"
      : "PENDENTE";
}

function maiorAnoConfigurado(
  db: DadosAssociadosDemo,
): number | undefined {
  if (!db.configuracoes.length) return undefined;
  return Math.max(...db.configuracoes.map((configuracao) => configuracao.ano));
}

function salvarConfiguracaoAnuidade(
  db: DadosAssociadosDemo,
  corpo: unknown,
  id?: number,
): ConfiguracaoAnuidadeDemo {
  const atual =
    id === undefined
      ? undefined
      : db.configuracoes.find((configuracao) => configuracao.id === id);
  if (id !== undefined && !atual) {
    throw new FalhaAssociadoDemo(
      404,
      "CONFIGURACAO_NAO_ENCONTRADA",
      "Configuração de anuidade não encontrada.",
    );
  }
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    throw new FalhaAssociadoDemo(
      400,
      "CONFIGURACAO_INVALIDA",
      "Informe um ano e um valor válidos.",
    );
  }

  const payload = corpo as Record<string, unknown>;
  const ano = payload.ano;
  const valor = payload.valor;
  if (
    typeof ano !== "number" ||
    !Number.isInteger(ano) ||
    ano < 2000 ||
    ano > 2100 ||
    typeof valor !== "number" ||
    !Number.isFinite(valor) ||
    valor < 0
  ) {
    throw new FalhaAssociadoDemo(
      400,
      "CONFIGURACAO_INVALIDA",
      "Informe um ano e um valor válidos.",
    );
  }
  if (
    db.configuracoes.some(
      (configuracao) => configuracao.ano === ano && configuracao.id !== id,
    )
  ) {
    throw new FalhaAssociadoDemo(
      409,
      "ANO_ANUIDADE_DUPLICADO",
      "Já existe uma anuidade configurada para este ano.",
    );
  }

  const configuracao: ConfiguracaoAnuidadeDemo = {
    id: atual?.id ?? Math.max(0, ...db.configuracoes.map((item) => item.id)) + 1,
    ano,
    valor,
  };
  if (atual) {
    const indice = db.configuracoes.findIndex((item) => item.id === id);
    db.configuracoes[indice] = configuracao;
    return configuracao;
  }

  db.configuracoes.push(configuracao);
  const titulares = db.associados.filter(
    (associado) => associado.tipo === "TITULAR",
  );
  for (const titular of titulares) {
    if (
      db.anuidades.some(
        (anuidade) =>
          anuidade.associadoId === titular.id && anuidade.ano === ano,
      )
    ) {
      continue;
    }
    db.anuidades.push({
      id: Math.max(0, ...db.anuidades.map((item) => item.id)) + 1,
      associadoId: titular.id,
      ano,
      valor,
      status: "PENDENTE",
    });
  }
  return configuracao;
}

function consultarHistoricoPagamentos(
  db: DadosAssociadosDemo,
  associadoId: number,
  params: URLSearchParams,
) {
  const associado = db.associados.find((item) => item.id === associadoId);
  if (!associado) {
    throw new FalhaAssociadoDemo(
      404,
      "ASSOCIADO_NAO_ENCONTRADO",
      "Associado não encontrado.",
    );
  }

  const ano = params.has("ano")
    ? numeroParametro(params, "ano")
    : maiorAnoConfigurado(db);
  const anuidade = db.anuidades.find(
    (item) => item.associadoId === associadoId && item.ano === ano,
  );
  if (!anuidade) return { anuidade: null, pagamentos: [] };

  const pagamentos = db.pagamentos
    .filter((pagamento) => pagamento.anuidadeId === anuidade.id)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    .map((pagamento) => ({ ...pagamento }));

  return {
    anuidade: {
      id: anuidade.id,
      valor: anuidade.valor,
      totalPago: totalPagoCentavos(db, anuidade.id) / 100,
      status: anuidade.status,
    },
    pagamentos,
  };
}

function registrarPagamento(
  db: DadosAssociadosDemo,
  corpo: unknown,
): PagamentoAnuidadeDemo {
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    throw new FalhaAssociadoDemo(
      400,
      "PAGAMENTO_INVALIDO",
      "Informe um valor de pagamento válido.",
    );
  }

  const payload = corpo as Record<string, unknown>;
  const valor = payload.valor;
  if (
    typeof valor !== "number" ||
    !Number.isFinite(valor) ||
    valor <= 0
  ) {
    throw new FalhaAssociadoDemo(
      400,
      "PAGAMENTO_INVALIDO",
      "Informe um valor de pagamento válido.",
    );
  }

  const associado = db.associados.find(
    (item) => item.id === payload.associadoId,
  );
  if (!associado) {
    throw new FalhaAssociadoDemo(
      404,
      "ASSOCIADO_NAO_ENCONTRADO",
      "Associado não encontrado.",
    );
  }

  const configuracao = db.configuracoes.find(
    (item) => item.id === payload.configuracaoId,
  );
  if (!configuracao) {
    throw new FalhaAssociadoDemo(
      404,
      "CONFIGURACAO_NAO_ENCONTRADA",
      "Configuração de anuidade não encontrada.",
    );
  }

  if (associado.tipo === "DEPENDENTE") {
    throw new FalhaAssociadoDemo(
      400,
      "PAGAMENTO_DEPENDENTE",
      "Dependentes são cobertos pela anuidade do titular.",
    );
  }

  const existente = db.anuidades.find(
    (item) =>
      item.associadoId === associado.id && item.ano === configuracao.ano,
  );
  if (existente?.status === "ISENTO") {
    throw new FalhaAssociadoDemo(
      400,
      "ANUIDADE_ISENTA",
      "Não é possível pagar uma anuidade isenta.",
    );
  }
  if (existente?.status === "PAGO") {
    throw new FalhaAssociadoDemo(
      409,
      "ANUIDADE_PAGA",
      "Esta anuidade já está paga.",
    );
  }

  const anuidade =
    existente ??
    ({
      id: Math.max(0, ...db.anuidades.map((item) => item.id)) + 1,
      associadoId: associado.id,
      ano: configuracao.ano,
      valor: configuracao.valor,
      status: "PENDENTE",
    } satisfies DadosAssociadosDemo["anuidades"][number]);
  const saldoCentavos = Math.max(
    0,
    Math.round(anuidade.valor * 100) - totalPagoCentavos(db, anuidade.id),
  );
  const valorCentavos = Math.round(valor * 100);
  const saldo = saldoCentavos / 100;
  if (
    valorCentavos <= 0 ||
    valor > saldo + 0.005 ||
    valorCentavos > saldoCentavos
  ) {
    throw new FalhaAssociadoDemo(
      400,
      "SALDO_INSUFICIENTE",
      `O valor não pode ultrapassar o saldo restante de ${formatarMoeda(saldo)}.`,
    );
  }

  if (!existente) db.anuidades.push(anuidade);
  const pagamento: PagamentoAnuidadeDemo = {
    id: Math.max(0, ...db.pagamentos.map((item) => item.id)) + 1,
    anuidadeId: anuidade.id,
    valor: valorCentavos / 100,
    criadoEm: new Date().toISOString(),
  };
  db.pagamentos.push(pagamento);
  recalcularStatusAnuidade(db, anuidade);
  return pagamento;
}

function excluirPagamento(db: DadosAssociadosDemo, id: number): void {
  const indice = db.pagamentos.findIndex((pagamento) => pagamento.id === id);
  if (indice < 0) {
    throw new FalhaAssociadoDemo(
      404,
      "PAGAMENTO_NAO_ENCONTRADO",
      "Pagamento não encontrado.",
    );
  }

  const pagamento = db.pagamentos[indice];
  if (!pagamento) {
    throw new FalhaAssociadoDemo(
      404,
      "PAGAMENTO_NAO_ENCONTRADO",
      "Pagamento não encontrado.",
    );
  }
  db.pagamentos.splice(indice, 1);
  const anuidade = db.anuidades.find(
    (item) => item.id === pagamento.anuidadeId,
  );
  if (anuidade) recalcularStatusAnuidade(db, anuidade);
}

function alterarIsencaoAnuidadeDemo(
  db: DadosAssociadosDemo,
  associadoId: number,
  configuracaoId: number,
  corpo: unknown,
): AnuidadeAssociadoDemo {
  const associado = db.associados.find((item) => item.id === associadoId);
  if (!associado) {
    throw new FalhaAssociadoDemo(
      404,
      "ASSOCIADO_NAO_ENCONTRADO",
      "Associado não encontrado.",
    );
  }

  const configuracao = db.configuracoes.find(
    (item) => item.id === configuracaoId,
  );
  if (!configuracao) {
    throw new FalhaAssociadoDemo(
      404,
      "CONFIGURACAO_NAO_ENCONTRADA",
      "Configuração de anuidade não encontrada.",
    );
  }

  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    throw new FalhaAssociadoDemo(
      400,
      "ISENCAO_INVALIDA",
      "Informe se a anuidade deve ser isenta.",
    );
  }

  const isento = (corpo as Record<string, unknown>).isento;
  if (typeof isento !== "boolean") {
    throw new FalhaAssociadoDemo(
      400,
      "ISENCAO_INVALIDA",
      "Informe se a anuidade deve ser isenta.",
    );
  }

  if (associado.tipo === "DEPENDENTE") {
    throw new FalhaAssociadoDemo(
      400,
      "PAGAMENTO_DEPENDENTE",
      "Dependentes são cobertos pela anuidade do titular.",
    );
  }

  let anuidade = db.anuidades.find(
    (item) =>
      item.associadoId === associado.id && item.ano === configuracao.ano,
  );

  if (isento && anuidade) {
    const anuidadeId = anuidade.id;
    const possuiPagamentos = db.pagamentos.some(
      (pagamento) => pagamento.anuidadeId === anuidadeId,
    );
    if (possuiPagamentos) {
      throw new FalhaAssociadoDemo(
        409,
        "ANUIDADE_COM_PAGAMENTOS",
        "Esta anuidade possui pagamentos. Exclua os pagamentos antes de isentar.",
      );
    }
  }

  if (!anuidade) {
    anuidade = {
      id: Math.max(0, ...db.anuidades.map((item) => item.id)) + 1,
      associadoId: associado.id,
      ano: configuracao.ano,
      valor: configuracao.valor,
      status: isento ? "ISENTO" : "PENDENTE",
    };
    db.anuidades.push(anuidade);
  } else if (isento) {
    anuidade.status = "ISENTO";
  } else if (anuidade.status === "ISENTO") {
    anuidade.status = "PENDENTE";
    recalcularStatusAnuidade(db, anuidade);
  }

  return {
    id: anuidade.id,
    valor: anuidade.valor,
    totalPago: totalPagoCentavos(db, anuidade.id) / 100,
    status: anuidade.status,
  };
}

export function excluirConfiguracaoDoBanco(
  db: DadosAssociadosDemo,
  id: number,
): ConfiguracaoAnuidadeDemo {
  const indice = db.configuracoes.findIndex(
    (configuracao) => configuracao.id === id,
  );
  if (indice < 0) {
    throw new FalhaAssociadoDemo(
      404,
      "CONFIGURACAO_NAO_ENCONTRADA",
      "Configuração de anuidade não encontrada.",
    );
  }

  const [configuracao] = db.configuracoes.splice(indice, 1);
  const idsAnuidades = new Set(
    db.anuidades
      .filter((anuidade) => anuidade.ano === configuracao.ano)
      .map((anuidade) => anuidade.id),
  );
  db.anuidades = db.anuidades.filter(
    (anuidade) => anuidade.ano !== configuracao.ano,
  );
  db.pagamentos = db.pagamentos.filter(
    (pagamento) => !idsAnuidades.has(pagamento.anuidadeId),
  );
  return configuracao;
}

function lerCorpo(config: InternalAxiosRequestConfig): unknown {
  if (typeof config.data !== "string") return config.data;
  try {
    return JSON.parse(config.data);
  } catch {
    throw new FalhaAssociadoDemo(
      400,
      "ASSOCIADO_INVALIDO",
      "Informe os dados do associado.",
    );
  }
}

function salvarAssociado(
  db: DadosAssociadosDemo,
  corpo: unknown,
  id?: number,
): AssociadoComAnuidadeDemo {
  const atual =
    id === undefined ? undefined : db.associados.find((item) => item.id === id);
  if (id !== undefined && !atual) {
    throw new FalhaAssociadoDemo(
      404,
      "ASSOCIADO_NAO_ENCONTRADO",
      "Associado não encontrado.",
    );
  }
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    throw new FalhaAssociadoDemo(
      400,
      "ASSOCIADO_INVALIDO",
      "Informe os dados do associado.",
    );
  }

  const payload = corpo as Record<string, unknown>;
  const nome = typeof payload.nome === "string" ? payload.nome.trim() : "";
  const numeroContato =
    typeof payload.numeroContato === "string"
      ? payload.numeroContato.trim()
      : "";
  const dataNascimento =
    typeof payload.dataNascimento === "string"
      ? payload.dataNascimento.trim()
      : "";

  if (!nome) {
    throw new FalhaAssociadoDemo(
      400,
      "NOME_OBRIGATORIO",
      "Informe o nome completo.",
    );
  }
  if (!numeroContato) {
    throw new FalhaAssociadoDemo(
      400,
      "CONTATO_OBRIGATORIO",
      "Informe o número de contato.",
    );
  }
  if (!dataNascimento) {
    throw new FalhaAssociadoDemo(
      400,
      "DATA_NASCIMENTO_OBRIGATORIA",
      "Informe a data de nascimento.",
    );
  }
  if (payload.tipo !== "TITULAR" && payload.tipo !== "DEPENDENTE") {
    throw new FalhaAssociadoDemo(
      400,
      "TIPO_ASSOCIADO_INVALIDO",
      "Selecione o tipo de associado.",
    );
  }

  if (
    atual?.tipo === "TITULAR" &&
    payload.tipo === "DEPENDENTE" &&
    db.associados.some(
      (associado) =>
        associado.tipo === "DEPENDENTE" && associado.titularId === atual.id,
    )
  ) {
    throw new FalhaAssociadoDemo(
      400,
      "TITULAR_POSSUI_DEPENDENTES",
      "Este titular possui dependentes. Reatribua-os antes de alterar o tipo.",
    );
  }

  let titular: AssociadoDemo | undefined;
  if (payload.tipo === "DEPENDENTE") {
    if (
      typeof payload.titularId !== "number" ||
      !Number.isInteger(payload.titularId)
    ) {
      throw new FalhaAssociadoDemo(
        400,
        "TITULAR_INVALIDO",
        "Selecione o titular responsável.",
      );
    }
    if (payload.titularId === id) {
      throw new FalhaAssociadoDemo(
        400,
        "TITULAR_PROPRIO",
        "Um associado não pode ser seu próprio titular.",
      );
    }
    titular = db.associados.find(
      (associado) => associado.id === payload.titularId,
    );
    if (!titular || titular.tipo !== "TITULAR") {
      throw new FalhaAssociadoDemo(
        400,
        "TITULAR_INVALIDO",
        "Selecione o titular responsável.",
      );
    }
  }

  const nomeNormalizado = normalizarBusca(nome);
  const nomeDuplicado = db.associados.some(
    (associado) =>
      associado.id !== id &&
      normalizarBusca(associado.nome) === nomeNormalizado,
  );
  if (nomeDuplicado) {
    throw new FalhaAssociadoDemo(
      409,
      "NOME_ASSOCIADO_DUPLICADO",
      "Já existe um associado com esse nome.",
    );
  }

  const associadoSalvo: AssociadoDemo = {
    id: atual?.id ?? Math.max(0, ...db.associados.map((item) => item.id)) + 1,
    nome,
    numeroContato,
    dataNascimento,
    tipo: payload.tipo,
    titularId: payload.tipo === "DEPENDENTE" ? (titular?.id ?? null) : null,
    titularNome:
      payload.tipo === "DEPENDENTE" ? (titular?.nome ?? null) : null,
  };

  if (atual) {
    const indice = db.associados.findIndex((associado) => associado.id === id);
    db.associados[indice] = associadoSalvo;
    if (associadoSalvo.tipo === "TITULAR") {
      db.associados.forEach((associado) => {
        if (
          associado.tipo === "DEPENDENTE" &&
          associado.titularId === associadoSalvo.id
        ) {
          associado.titularNome = associadoSalvo.nome;
        }
      });
    }
  } else {
    db.associados.push(associadoSalvo);
  }

  const ano = maiorAnoConfigurado(db);
  if (!atual && associadoSalvo.tipo === "TITULAR" && ano !== undefined) {
    const configuracao = db.configuracoes.find((item) => item.ano === ano);
    if (configuracao) {
      db.anuidades.push({
        id: Math.max(0, ...db.anuidades.map((item) => item.id)) + 1,
        associadoId: associadoSalvo.id,
        ano,
        valor: configuracao.valor,
        status: "PENDENTE",
      });
    }
  }

  return paraAssociadoDoAno(associadoSalvo, db, ano);
}

export function filtrarAssociados(
  db: DadosAssociadosDemo,
  params: ParametrosAssociadosDemo,
): AssociadoComAnuidadeDemo[] {
  const ano =
    params.ano ??
    (db.configuracoes.length
      ? Math.max(...db.configuracoes.map((configuracao) => configuracao.ano))
      : undefined);
  const busca = params.q ? normalizarBusca(params.q.trim()) : "";

  return db.associados
    .map((associado) => paraAssociadoDoAno(associado, db, ano))
    .filter(
      (associado) =>
        !busca ||
        normalizarBusca(associado.nome).includes(busca) ||
        normalizarBusca(associado.titularNome || "").includes(busca),
    )
    .filter((associado) => !params.tipo || associado.tipo === params.tipo)
    .filter(
      (associado) =>
        !params.status || associado.anuidade?.status === params.status,
    )
    .filter((associado) => {
      if (params.idadeMin === undefined && params.idadeMax === undefined) {
        return true;
      }
      const idade = calcularIdade(associado.dataNascimento);
      return (
        (params.idadeMin === undefined || idade >= params.idadeMin) &&
        (params.idadeMax === undefined || idade <= params.idadeMax)
      );
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function montarPaginaAssociados(
  db: DadosAssociadosDemo,
  params: ParametrosAssociadosDemo,
): PaginaAssociadosDemo {
  const associados = filtrarAssociados(db, params);
  const sizeInformado = params.size ?? 10;
  const size =
    Number.isFinite(sizeInformado) && sizeInformado > 0
      ? Math.trunc(sizeInformado)
      : 10;
  const totalItens = associados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItens / size));
  const pageSolicitada = Math.max(0, Math.trunc(params.page ?? 0));
  const page = Math.min(pageSolicitada, totalPaginas - 1);
  const inicio = page * size;

  return {
    itens: associados.slice(inicio, inicio + size),
    page,
    size,
    totalItens,
    totalPaginas,
  };
}

function respostaOk(
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200,
): Promise<AxiosResponse> {
  return Promise.resolve({
    data: JSON.parse(JSON.stringify(data)),
    status,
    statusText: status === 201 ? "Created" : "OK",
    headers: {},
    config,
    request: {},
  });
}

function respostaErro(
  config: InternalAxiosRequestConfig,
  status: number,
  codigo: string,
  mensagem: string,
): Promise<never> {
  const response: AxiosResponse = {
    status,
    statusText: "Erro",
    headers: {},
    config,
    data: { codigo, mensagem },
  };
  return Promise.reject(
    new AxiosError(mensagem, "ERR_DEMO_REQUEST", config, null, response),
  );
}

function numeroParametro(
  params: URLSearchParams,
  chave: string,
): number | undefined {
  const valor = params.get(chave);
  if (valor === null || valor.trim() === "") return undefined;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : undefined;
}

function tipoParametro(params: URLSearchParams): TipoAssociadoDemo | undefined {
  const tipo = params.get("tipo");
  return tipo === "TITULAR" || tipo === "DEPENDENTE" ? tipo : undefined;
}

function statusParametro(
  params: URLSearchParams,
): StatusAnuidadeDemo | undefined {
  const status = params.get("status");
  return status === "PAGO" || status === "PENDENTE" || status === "ISENTO"
    ? status
    : undefined;
}

export function rotearAssociadosDemo({
  config,
  path,
  params,
  method,
}: {
  config: InternalAxiosRequestConfig;
  path: string;
  params: URLSearchParams;
  method: string;
}): Promise<AxiosResponse> | null {
  const rotaAssociados = method === "get" && path === "/associados";
  const rotaConfiguracoes =
    method === "get" && path === "/anuidades/configuracoes";
  const rotaCriarConfiguracao =
    method === "post" && path === "/anuidades/configuracoes";
  const rotaAtualizarConfiguracao =
    method === "put" && /^\/anuidades\/configuracoes\/\d+$/.test(path);
  const rotaExcluirConfiguracao =
    method === "delete" && /^\/anuidades\/configuracoes\/\d+$/.test(path);
  const rotaCriarAssociado = method === "post" && path === "/associados";
  const rotaAtualizarAssociado = method === "put" && /^\/associados\/\d+$/.test(path);
  const rotaHistoricoPagamentos =
    method === "get" && /^\/associados\/\d+\/pagamentos$/.test(path);
  const rotaAlterarIsencao =
    method === "put" &&
    /^\/associados\/\d+\/anuidades\/\d+\/isencao$/.test(path);
  const rotaRegistrarPagamento =
    method === "post" && path === "/anuidades/pagamentos";
  const rotaExcluirPagamento =
    method === "delete" && /^\/anuidades\/pagamentos\/\d+$/.test(path);

  if (
    !rotaAssociados &&
    !rotaConfiguracoes &&
    !rotaCriarConfiguracao &&
    !rotaAtualizarConfiguracao &&
    !rotaExcluirConfiguracao &&
    !rotaCriarAssociado &&
    !rotaAtualizarAssociado &&
    !rotaHistoricoPagamentos &&
    !rotaAlterarIsencao &&
    !rotaRegistrarPagamento &&
    !rotaExcluirPagamento
  ) {
    return null;
  }

  return Promise.resolve()
    .then(() => {
      const db = obterBanco();
      if (rotaAlterarIsencao) {
        const ids = path.match(
          /^\/associados\/(\d+)\/anuidades\/(\d+)\/isencao$/,
        );
        const associadoId = ids ? Number(ids[1]) : undefined;
        const configuracaoId = ids ? Number(ids[2]) : undefined;
        if (associadoId === undefined || configuracaoId === undefined) {
          throw new FalhaAssociadoDemo(
            404,
            "ANUIDADE_NAO_ENCONTRADA",
            "Anuidade não encontrada.",
          );
        }
        const anuidade = alterarIsencaoAnuidadeDemo(
          db,
          associadoId,
          configuracaoId,
          lerCorpo(config),
        );
        salvarJSON(STORAGE_KEY, db);
        return { data: anuidade, status: 200 };
      }

      if (rotaHistoricoPagamentos) {
        const idMatch = path.match(/^\/associados\/(\d+)\/pagamentos$/);
        const associadoId = idMatch ? Number(idMatch[1]) : undefined;
        if (associadoId === undefined) {
          throw new FalhaAssociadoDemo(
            404,
            "ASSOCIADO_NAO_ENCONTRADO",
            "Associado não encontrado.",
          );
        }
        return {
          data: consultarHistoricoPagamentos(db, associadoId, params),
          status: 200,
        };
      }

      if (rotaRegistrarPagamento) {
        const pagamento = registrarPagamento(db, lerCorpo(config));
        salvarJSON(STORAGE_KEY, db);
        return { data: pagamento, status: 201 };
      }

      if (rotaExcluirPagamento) {
        const idMatch = path.match(/^\/anuidades\/pagamentos\/(\d+)$/);
        const id = idMatch ? Number(idMatch[1]) : undefined;
        if (id === undefined) {
          throw new FalhaAssociadoDemo(
            404,
            "PAGAMENTO_NAO_ENCONTRADO",
            "Pagamento não encontrado.",
          );
        }
        excluirPagamento(db, id);
        salvarJSON(STORAGE_KEY, db);
        return { data: { ok: true }, status: 200 };
      }

      if (rotaConfiguracoes) {
        return {
          data: [...db.configuracoes]
            .sort((a, b) => b.ano - a.ano)
            .map((configuracao) => ({ ...configuracao })),
          status: 200,
        };
      }
      if (rotaAssociados) {
        return {
          data: montarPaginaAssociados(db, {
            q: params.get("q") || undefined,
            page: numeroParametro(params, "page"),
            size: numeroParametro(params, "size"),
            ano: numeroParametro(params, "ano"),
            tipo: tipoParametro(params),
            status: statusParametro(params),
            idadeMin: numeroParametro(params, "idadeMin"),
            idadeMax: numeroParametro(params, "idadeMax"),
          }),
          status: 200,
        };
      }

      if (rotaCriarConfiguracao || rotaAtualizarConfiguracao) {
        const idMatch = path.match(/^\/anuidades\/configuracoes\/(\d+)$/);
        const id = idMatch ? Number(idMatch[1]) : undefined;
        const configuracao = salvarConfiguracaoAnuidade(
          db,
          lerCorpo(config),
          id,
        );
        salvarJSON(STORAGE_KEY, db);
        return {
          data: configuracao,
          status: rotaCriarConfiguracao ? 201 : 200,
        };
      }

      if (rotaExcluirConfiguracao) {
        const idMatch = path.match(/^\/anuidades\/configuracoes\/(\d+)$/);
        const id = idMatch ? Number(idMatch[1]) : undefined;
        if (id === undefined) {
          throw new FalhaAssociadoDemo(
            404,
            "CONFIGURACAO_NAO_ENCONTRADA",
            "Configuração de anuidade não encontrada.",
          );
        }
        excluirConfiguracaoDoBanco(db, id);
        salvarJSON(STORAGE_KEY, db);
        return { data: { ok: true }, status: 200 };
      }

      const idMatch = path.match(/^\/associados\/(\d+)$/);
      const id = idMatch ? Number(idMatch[1]) : undefined;
      const associado = salvarAssociado(db, lerCorpo(config), id);
      salvarJSON(STORAGE_KEY, db);
      return {
        data: associado,
        status: rotaCriarAssociado ? 201 : 200,
      };
    })
    .then(({ data, status }) => respostaOk(config, data, status))
    .catch((erro: unknown) => {
      if (erro instanceof AxiosError) return Promise.reject(erro);
      if (erro instanceof FalhaAssociadoDemo) {
        return respostaErro(config, erro.status, erro.codigo, erro.message);
      }
      const mensagem =
        erro instanceof Error
          ? erro.message
          : "Não foi possível concluir a operação.";
      return respostaErro(config, 500, "ERRO_DEMO", mensagem);
    });
}
