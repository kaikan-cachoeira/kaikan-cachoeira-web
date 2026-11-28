import type { createSeed } from "./dadosIniciais";

type BancoDemo = ReturnType<typeof createSeed>;
type EventoDemo = BancoDemo["events"][number];

function statusEvento(evento: EventoDemo) {
  if (evento.status === "Em andamento") {
    return { id: 2, codigo: "EM_ANDAMENTO", descricao: evento.status };
  }
  if (evento.status === "Encerrado") {
    return { id: 3, codigo: "ENCERRADO", descricao: evento.status };
  }
  return { id: 1, codigo: "NAO_INICIADO", descricao: evento.status };
}

function mapearEvento(evento: EventoDemo, indice: number) {
  return {
    id: indice + 1,
    nome: evento.name,
    tipoEvento: evento.type === "Evento" ? "EVENTO" : "REUNIAO",
    status: statusEvento(evento),
    dataHoraInicio: evento.start,
    dataHoraEncerramento: evento.end,
    observacoes: evento.notes,
  };
}

function paginar<T>(itens: T[], parametros: URLSearchParams) {
  const page = Number(parametros.get("page") ?? 0);
  const size = Number(parametros.get("size") ?? 20);
  if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1 || size > 100) {
    return {
      status: 400,
      data: {
        codigo: "VALIDACAO",
        mensagem: "Paginação inválida.",
        campos: [{ campo: page < 0 || !Number.isInteger(page) ? "page" : "size", mensagem: "Confira a paginação informada." }],
      },
    };
  }
  return {
    status: 200,
    data: {
      itens: itens.slice(page * size, (page + 1) * size),
      page,
      size,
      totalItens: itens.length,
      totalPaginas: Math.ceil(itens.length / size),
    },
  };
}

function consultarVendas(db: BancoDemo, evento: EventoDemo) {
  return db.sales
    .map((venda, indice) => ({ venda, id: indice + 1 }))
    .filter(({ venda }) => venda.eventId === evento.id);
}

function montarClimaDemonstrativo(evento: EventoDemo) {
  const temperaturas = [22, 23, 25, 27, 26, 24, 23, 22, 21, 21, 20, 20, 19];
  const chuvas = [0, 0, 0, 0, 0.4, 1.8, 1, 0, 0, 0, 0, 0, 0];
  const ventos = [7, 9, 10, 14, 18, 16, 12, 10, 8, 7, 6, 6, 5];
  const inicio = Math.floor(Date.parse(evento.start) / 3_600_000) * 3_600_000;
  const fim = Math.floor(Date.parse(evento.end) / 3_600_000) * 3_600_000;
  const itens = [];

  if (evento.type === "Evento" && evento.status !== "Não iniciado") {
    for (let instante = inicio, indice = 0; instante <= fim; instante += 3_600_000, indice += 1) {
      const posicao = indice % temperaturas.length;
      const chuvaMm = chuvas[posicao];
      itens.push({
        dataHoraPrevista: new Date(instante).toISOString(),
        temperatura: temperaturas[posicao],
        sensacaoTermica: temperaturas[posicao] + 1,
        chuvaMm,
        probabilidadeChuva: chuvaMm > 0 ? 65 : 15,
        ventoVelocidade: ventos[posicao],
        codigoClima: chuvaMm > 0 ? 61 : 2,
        descricaoClima: chuvaMm > 0 ? "Chuva fraca" : "Parcialmente nublado",
      });
    }
  }

  return {
    resumo: {
      temperaturaMedia: itens.length
        ? itens.reduce((total, item) => total + item.temperatura, 0) / itens.length : 0,
      temperaturaMinima: itens.length ? Math.min(...itens.map((item) => item.temperatura)) : 0,
      temperaturaMaxima: itens.length ? Math.max(...itens.map((item) => item.temperatura)) : 0,
      chuvaAcumulada: itens.reduce((total, item) => total + item.chuvaMm, 0),
      ventoMaximo: Math.max(0, ...itens.map((item) => item.ventoVelocidade)),
    },
    itens,
  };
}

function montarRelatorio(db: BancoDemo, evento: EventoDemo, indice: number) {
  const base = mapearEvento(evento, indice);
  const custosAdicionais = evento.costs.map((custo) => ({
    nome: custo.name,
    descricao: custo.description,
    valor: custo.value,
  }));
  const totalCustosAdicionais = custosAdicionais.reduce((total, custo) => total + custo.valor, 0);
  const vendas = consultarVendas(db, evento)
    .filter(({ venda }) => venda.status !== "cancelled")
    .map(({ venda }) => venda);
  const produtos = db.menu.filter((item) => item.eventId === evento.id).map((item) => {
    const itensVendidos = vendas.flatMap((venda) => venda.items)
      .filter((vendido) => vendido.menuItemId === item.id);
    const quantidadeVendida = itensVendidos.reduce((total, vendido) => total + vendido.quantity, 0);
    const receitaVendas = itensVendidos.reduce((total, vendido) => total + vendido.total, 0);
    return {
      produtoEventoId: db.menu.indexOf(item) + 1,
      nome: item.name,
      origem: item.type === "made" ? "PRODUZIDO" : "ESTOQUE",
      categoria: item.category,
      quantidadePrevista: item.expected,
      quantidadeVendida,
      totalDescontos: itensVendidos.reduce((total, vendido) => total + vendido.discount, 0),
      custoTotal: item.costTotal,
      receitaVendas,
      lucroBruto: receitaVendas - item.costTotal,
      lucroLiquido: receitaVendas - item.costTotal,
      precoVendido: quantidadeVendida ? receitaVendas / quantidadeVendida : item.price,
    };
  });
  const custoCompras = produtos.reduce((total, produto) => total + produto.custoTotal, 0);
  const custoTotal = custoCompras + totalCustosAdicionais;
  const comum = {
    eventoId: base.id,
    nome: base.nome,
    status: base.status,
    parcial: base.status.codigo === "EM_ANDAMENTO",
    custosAdicionais,
  };

  if (base.tipoEvento === "REUNIAO") {
    return {
      ...comum,
      tipoEvento: "REUNIAO",
      resumo: { custoCompras, custoConsumoInterno: 0, totalCustosAdicionais, custoTotal },
      itens: [],
    };
  }

  const receitaTotal = produtos.reduce((total, produto) => total + produto.receitaVendas, 0);
  const contagemPorHora = new Map<number, number>();
  const formatadorHora = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo", hour: "2-digit", hourCycle: "h23",
  });
  for (const venda of vendas) {
    const hora = Number(formatadorHora.format(new Date(venda.createdAt)));
    contagemPorHora.set(hora, (contagemPorHora.get(hora) ?? 0) + 1);
  }

  return {
    ...comum,
    tipoEvento: "EVENTO",
    resumo: {
      receitaVendas: receitaTotal,
      descontosVendas: vendas.reduce((total, venda) => total + venda.discount, 0),
      custoCompras,
      custoFichasAgradecimento: 0,
      custoIngredientes: 0,
      totalCustosAdicionais,
      doacoesEmDinheiro: 0,
      receitaTotal,
      custoTotal,
      lucro: receitaTotal - custoTotal,
      vendas: vendas.length,
    },
    produtos,
    caixa: {
      fichasVendidas: 0, fichasDevolvidas: 0, saldoFichas: 0,
      porFormaPagamento: {}, fiadosEmAberto: 0, quantidadeFiadosEmAberto: 0, totalRecebido: 0,
    },
    doacoes: { itens: [], emDinheiro: [], totalEmDinheiro: 0 },
    movimentacoesEvento: [],
    produtosMaisVendidos: {
      quantidadeVendasTotais: produtos.reduce((total, produto) => total + produto.quantidadeVendida, 0),
      ranking: produtos.filter((produto) => produto.quantidadeVendida > 0)
        .sort((a, b) => b.quantidadeVendida - a.quantidadeVendida),
    },
    vendasPorHora: {
      quantidadeVendasTotais: vendas.length,
      ranking: [...contagemPorHora.entries()].sort(([a], [b]) => a - b)
        .map(([hora, quantidadeVendas]) => ({ hora, quantidadeVendas })),
    },
  };
}

export function consultarEventosDemo(db: BancoDemo, caminho: string, parametros: URLSearchParams) {
  if (caminho === "/eventos") {
    const termo = (parametros.get("q") ?? "").toLocaleLowerCase("pt-BR");
    const status = parametros.get("status")?.split(",");
    const tipos = parametros.get("tipos")?.split(",");
    const inicio = parametros.get("dataInicio");
    const fim = parametros.get("dataFim");
    const eventos = db.events.map(mapearEvento)
      .filter((evento) => evento.nome.toLocaleLowerCase("pt-BR").includes(termo))
      .filter((evento) => !status || status.includes(evento.status.codigo))
      .filter((evento) => !tipos || tipos.includes(evento.tipoEvento))
      .filter((evento) => !inicio || evento.dataHoraInicio >= inicio)
      .filter((evento) => !fim || evento.dataHoraInicio <= fim);
    return paginar(eventos, parametros);
  }

  const rota = caminho.match(/^\/eventos\/(\d+)(?:\/(relatorio|produtos|vendas|climas))?$/);
  if (!rota) return null;
  const indice = Number(rota[1]) - 1;
  const evento = db.events[indice];
  if (!evento) {
    return { status: 404, data: { codigo: "RECURSO_NAO_ENCONTRADO", mensagem: "Evento não encontrado.", campos: [] } };
  }

  if (rota[2] === "relatorio") {
    return { status: 200, data: montarRelatorio(db, evento, indice) };
  }
  if (rota[2] === "climas") {
    return { status: 200, data: montarClimaDemonstrativo(evento) };
  }
  if (rota[2] === "vendas") {
    const cancelada = parametros.get("cancelada");
    const inicio = parametros.get("dataHoraInicio");
    const fim = parametros.get("dataHoraFim");
    const vendas = consultarVendas(db, evento)
      .filter(({ venda }) => cancelada === null || (venda.status === "cancelled") === (cancelada === "true"))
      .filter(({ venda }) => !inicio || venda.createdAt >= inicio)
      .filter(({ venda }) => !fim || venda.createdAt <= fim)
      .sort((a, b) => b.venda.createdAt.localeCompare(a.venda.createdAt))
      .map(({ venda, id }) => ({
        id, criadoEm: venda.createdAt, desconto: venda.discount,
        precoTotal: venda.total,
        quantidadeItens: venda.items.reduce((total, item) => total + item.quantity, 0),
        cancelada: venda.status === "cancelled",
      }));
    return paginar(vendas, parametros);
  }
  if (rota[2] === "produtos") {
    const produtos = db.menu.filter((item) => item.eventId === evento.id).map((item) => ({
      id: db.menu.indexOf(item) + 1,
      origem: item.type === "made" ? "PRODUZIDO" : "ESTOQUE",
      nome: item.name, descricao: item.description, categoria: item.category,
      fotoUrl: item.image, precoVenda: item.price, desconto: 0,
      precoComDesconto: item.price, quantidadePrevista: item.expected,
      quantidadeVendida: item.sold,
      restantePrevisto: item.expected === null ? null : item.expected - item.sold,
      custoTotalIngredientes: item.type === "made" ? item.costTotal : null,
      criadoEm: evento.createdAt, atualizadoEm: evento.createdAt,
    }));
    return paginar(produtos, parametros);
  }

  const relatorio = montarRelatorio(db, evento, indice);
  const resumo = relatorio.resumo;
  return {
    status: 200,
    data: {
      ...mapearEvento(evento, indice),
      resumo: {
        quantidadeProdutos: db.menu.filter((item) => item.eventId === evento.id).length,
        quantidadeVendas: "vendas" in resumo ? resumo.vendas : 0,
        totalVendido: "receitaTotal" in resumo ? resumo.receitaTotal : 0,
        totalCustosAdicionais: resumo.totalCustosAdicionais,
      },
    },
  };
}
