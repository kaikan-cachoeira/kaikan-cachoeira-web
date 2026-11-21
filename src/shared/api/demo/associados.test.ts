import { describe, expect, it } from "vitest";
import { demoAdapter } from "./adaptador";
import {
  excluirConfiguracaoDoBanco,
  filtrarAssociados,
  montarPaginaAssociados,
} from "./associados";
import { criarSeedAssociados } from "./dadosAssociados";

describe("demo associados", () => {
  const db = criarSeedAssociados();
  let pagamentoCompletoId: number;

  it("monta páginas com total de itens e páginas", () => {
    const pagina = montarPaginaAssociados(db, { page: 1, size: 5 });

    expect(pagina.page).toBe(1);
    expect(pagina.size).toBe(5);
    expect(pagina.totalItens).toBe(12);
    expect(pagina.totalPaginas).toBe(3);
    expect(pagina.itens).toHaveLength(5);
  });

  it("busca por nome sem diferenciar acentos", () => {
    const associados = filtrarAssociados(db, { q: "Joao" });

    expect(associados.map((associado) => associado.id)).toEqual([8, 12]);
  });

  it("busca pelo nome do titular sem diferenciar acentos", () => {
    const associados = filtrarAssociados(db, {
      q: "joao watanabe",
      tipo: "DEPENDENTE",
    });

    expect(associados.map((associado) => associado.id)).toEqual([12]);
  });

  it("filtra associados por tipo", () => {
    const associados = filtrarAssociados(db, { tipo: "DEPENDENTE" });

    expect(associados).toHaveLength(4);
    expect(associados.every((associado) => associado.tipo === "DEPENDENTE"))
      .toBe(true);
  });

  it("filtra pelo status da anuidade do ano consultado", () => {
    const associados = filtrarAssociados(db, {
      ano: 2026,
      status: "PENDENTE",
    });

    expect(associados.map((associado) => associado.id)).toEqual([3, 7, 4]);
    expect(associados.every((associado) => associado.anuidade?.status === "PENDENTE"))
      .toBe(true);
    expect(
      associados.find((associado) => associado.id === 4)?.anuidade?.totalPago,
    ).toBe(50);
  });

  it("filtra por faixa de idade", () => {
    const associados = filtrarAssociados(db, { idadeMin: 10, idadeMax: 15 });

    expect(associados.map((associado) => associado.id)).toEqual([9, 12]);
  });

  it("deixa a anuidade nula para dependentes", () => {
    const dependentes = filtrarAssociados(db, { tipo: "DEPENDENTE" });

    expect(dependentes.every((associado) => associado.anuidade === null)).toBe(
      true,
    );
  });

  it("roteia as chamadas GET para associados e configurações", async () => {
    const pagina = await demoAdapter({
      url: "/associados",
      method: "get",
      params: { page: 0, size: 2 },
    });
    const configuracoes = await demoAdapter({
      url: "/anuidades/configuracoes",
      method: "get",
    });

    expect(pagina.data).toMatchObject({
      page: 0,
      size: 2,
      totalItens: 12,
      totalPaginas: 6,
    });
    expect(configuracoes.data.map((item: { ano: number }) => item.ano)).toEqual([
      2026,
      2025,
    ]);
  });

  it("cria um dependente válido e retorna o vínculo ao titular", async () => {
    const resposta = await demoAdapter({
      url: "/associados",
      method: "post",
      data: JSON.stringify({
        nome: "Mika Teste",
        numeroContato: "(11) 91234-5678",
        dataNascimento: "2010-03-20",
        tipo: "DEPENDENTE",
        titularId: 2,
      }),
    });

    expect(resposta.status).toBe(201);
    expect(resposta.data).toMatchObject({
      nome: "Mika Teste",
      tipo: "DEPENDENTE",
      titularId: 2,
      titularNome: "Maria Sato",
      anuidade: null,
    });
  });

  it("rejeita dependente sem titular", async () => {
    await expect(
      demoAdapter({
        url: "/associados",
        method: "post",
        data: JSON.stringify({
          nome: "Dependente Sem Titular",
          numeroContato: "(11) 91234-5678",
          dataNascimento: "2010-03-20",
          tipo: "DEPENDENTE",
        }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: { mensagem: "Selecione o titular responsável." },
      },
    });
  });

  it("rejeita titular inválido para dependente", async () => {
    await expect(
      demoAdapter({
        url: "/associados",
        method: "post",
        data: JSON.stringify({
          nome: "Dependente de Dependente",
          numeroContato: "(11) 91234-5678",
          dataNascimento: "2010-03-20",
          tipo: "DEPENDENTE",
          titularId: 9,
        }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: { mensagem: "Selecione o titular responsável." },
      },
    });
  });

  it("rejeita nome duplicado sem diferenciar caixa e acentos", async () => {
    await expect(
      demoAdapter({
        url: "/associados",
        method: "post",
        data: JSON.stringify({
          nome: "HÍROSHI TANAKA",
          numeroContato: "(11) 91234-5678",
          dataNascimento: "1952-03-14",
          tipo: "TITULAR",
        }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 409,
        data: { mensagem: "Já existe um associado com esse nome." },
      },
    });
  });

  it("impede titular com dependentes de virar dependente", async () => {
    await expect(
      demoAdapter({
        url: "/associados/1",
        method: "put",
        data: JSON.stringify({
          nome: "Hiroshi Tanaka",
          numeroContato: "(11) 91234-5601",
          dataNascimento: "1952-03-14",
          tipo: "DEPENDENTE",
          titularId: 2,
        }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          mensagem:
            "Este titular possui dependentes. Reatribua-os antes de alterar o tipo.",
        },
      },
    });
  });

  it("cria anuidade pendente para novo titular", async () => {
    const resposta = await demoAdapter({
      url: "/associados",
      method: "post",
      data: JSON.stringify({
        nome: "Aiko Nova",
        numeroContato: "(11) 91234-5679",
        dataNascimento: "1998-06-18",
        tipo: "TITULAR",
        titularId: 1,
      }),
    });

    expect(resposta.status).toBe(201);
    expect(resposta.data.anuidade).toMatchObject({
      valor: 150,
      totalPago: 0,
      status: "PENDENTE",
    });
  });

  it("cria configuração e anuidades pendentes somente para titulares", async () => {
    const resposta = await demoAdapter({
      url: "/anuidades/configuracoes",
      method: "post",
      data: JSON.stringify({ ano: 2027, valor: 175 }),
    });
    const pagina = await demoAdapter({
      url: "/associados",
      method: "get",
      params: { ano: 2027, size: 100 },
    });
    const titulares = pagina.data.itens.filter(
      (associado: { tipo: string }) => associado.tipo === "TITULAR",
    );
    const dependentes = pagina.data.itens.filter(
      (associado: { tipo: string }) => associado.tipo === "DEPENDENTE",
    );

    expect(resposta.status).toBe(201);
    expect(resposta.data).toMatchObject({ ano: 2027, valor: 175 });
    expect(titulares.length).toBeGreaterThan(0);
    expect(
      titulares.every(
        (associado: { anuidade: { valor: number; totalPago: number; status: string } }) =>
          associado.anuidade.valor === 175 &&
          associado.anuidade.totalPago === 0 &&
          associado.anuidade.status === "PENDENTE",
      ),
    ).toBe(true);
    expect(dependentes.every((associado: { anuidade: unknown }) => associado.anuidade === null))
      .toBe(true);
  });

  it("rejeita configuração com ano duplicado", async () => {
    await expect(
      demoAdapter({
        url: "/anuidades/configuracoes",
        method: "post",
        data: JSON.stringify({ ano: 2027, valor: 200 }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 409,
        data: { mensagem: "Já existe uma anuidade configurada para este ano." },
      },
    });
  });

  it("edita a configuração sem alterar anuidades já geradas", async () => {
    const resposta = await demoAdapter({
      url: "/anuidades/configuracoes/3",
      method: "put",
      data: JSON.stringify({ ano: 2028, valor: 210 }),
    });
    const paginaAnoAnterior = await demoAdapter({
      url: "/associados",
      method: "get",
      params: { ano: 2027, size: 100 },
    });
    const paginaAnoNovo = await demoAdapter({
      url: "/associados",
      method: "get",
      params: { ano: 2028, size: 100 },
    });

    expect(resposta.data).toMatchObject({ id: 3, ano: 2028, valor: 210 });
    expect(
      paginaAnoAnterior.data.itens.find(
        (associado: { id: number }) => associado.id === 1,
      ).anuidade,
    ).toMatchObject({ valor: 175, status: "PENDENTE" });
    expect(
      paginaAnoNovo.data.itens.every(
        (associado: { anuidade: unknown }) => associado.anuidade === null,
      ),
    ).toBe(true);
  });

  it("rejeita ano inválido na configuração", async () => {
    await expect(
      demoAdapter({
        url: "/anuidades/configuracoes",
        method: "post",
        data: JSON.stringify({ ano: 1999, valor: 100 }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: { mensagem: "Informe um ano e um valor válidos." },
      },
    });
  });

  it("exclui cobranças e pagamentos junto com a configuração", async () => {
    const banco = criarSeedAssociados();
    const idsAnuidades = new Set(
      banco.anuidades
        .filter((anuidade) => anuidade.ano === 2025)
        .map((anuidade) => anuidade.id),
    );
    expect(
      banco.pagamentos.some((pagamento) =>
        idsAnuidades.has(pagamento.anuidadeId),
      ),
    ).toBe(true);

    excluirConfiguracaoDoBanco(banco, 1);
    expect(banco.anuidades.some((anuidade) => anuidade.ano === 2025)).toBe(
      false,
    );
    expect(
      banco.pagamentos.some((pagamento) =>
        idsAnuidades.has(pagamento.anuidadeId),
      ),
    ).toBe(false);

    const resposta = await demoAdapter({
      url: "/anuidades/configuracoes/1",
      method: "delete",
    });
    const pagina = await demoAdapter({
      url: "/associados",
      method: "get",
      params: { ano: 2025, size: 100 },
    });
    expect(resposta.status).toBe(200);
    expect(
      pagina.data.itens.every(
        (associado: { anuidade: unknown }) => associado.anuidade === null,
      ),
    ).toBe(true);
  });

  it("devolve o histórico ordenado do mais recente para o mais antigo", async () => {
    const resposta = await demoAdapter({
      url: "/associados/4/pagamentos",
      method: "get",
      params: { ano: 2026 },
    });

    expect(resposta.data.anuidade).toMatchObject({
      id: 204,
      valor: 150,
      totalPago: 50,
      status: "PENDENTE",
    });
    expect(
      resposta.data.pagamentos.map((pagamento: { id: number }) => pagamento.id),
    ).toEqual([2004, 2003]);
  });

  it("retorna 404 ao consultar o histórico de associado inexistente", async () => {
    await expect(
      demoAdapter({
        url: "/associados/999/pagamentos",
        method: "get",
        params: { ano: 2026 },
      }),
    ).rejects.toMatchObject({
      response: {
        status: 404,
        data: {
          codigo: "ASSOCIADO_NAO_ENCONTRADO",
          mensagem: "Associado não encontrado.",
        },
      },
    });
  });

  it("usa o maior ano configurado quando o histórico não recebe ano", async () => {
    const resposta = await demoAdapter({
      url: "/associados/1/pagamentos",
      method: "get",
    });

    expect(resposta.data).toEqual({ anuidade: null, pagamentos: [] });
  });

  it("registra pagamento parcial e mantém a anuidade pendente", async () => {
    const pagamento = await demoAdapter({
      url: "/anuidades/pagamentos",
      method: "post",
      data: JSON.stringify({ associadoId: 3, configuracaoId: 2, valor: 25 }),
    });
    const historico = await demoAdapter({
      url: "/associados/3/pagamentos",
      method: "get",
      params: { ano: 2026 },
    });

    expect(pagamento.status).toBe(201);
    expect(pagamento.data).toMatchObject({
      anuidadeId: 203,
      valor: 25,
    });
    expect(historico.data.anuidade).toMatchObject({
      totalPago: 25,
      status: "PENDENTE",
    });
  });

  it("marca a anuidade como paga quando o saldo é completado", async () => {
    const pagamento = await demoAdapter({
      url: "/anuidades/pagamentos",
      method: "post",
      data: JSON.stringify({ associadoId: 3, configuracaoId: 2, valor: 125 }),
    });
    const historico = await demoAdapter({
      url: "/associados/3/pagamentos",
      method: "get",
      params: { ano: 2026 },
    });
    pagamentoCompletoId = pagamento.data.id;

    expect(historico.data.anuidade).toMatchObject({
      totalPago: 150,
      status: "PAGO",
    });
  });

  it("recusa pagamento acima do saldo restante", async () => {
    await expect(
      demoAdapter({
        url: "/anuidades/pagamentos",
        method: "post",
        data: JSON.stringify({
          associadoId: 7,
          configuracaoId: 2,
          valor: 150.01,
        }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          codigo: "SALDO_INSUFICIENTE",
          mensagem:
            "O valor não pode ultrapassar o saldo restante de R$\u00a0150,00.",
        },
      },
    });
  });

  it("recusa valor de pagamento inválido", async () => {
    await expect(
      demoAdapter({
        url: "/anuidades/pagamentos",
        method: "post",
        data: JSON.stringify({
          associadoId: 7,
          configuracaoId: 2,
          valor: 0,
        }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          codigo: "PAGAMENTO_INVALIDO",
          mensagem: "Informe um valor de pagamento válido.",
        },
      },
    });
  });

  it("recusa pagamento para dependente", async () => {
    await expect(
      demoAdapter({
        url: "/anuidades/pagamentos",
        method: "post",
        data: JSON.stringify({
          associadoId: 9,
          configuracaoId: 2,
          valor: 10,
        }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          codigo: "PAGAMENTO_DEPENDENTE",
          mensagem: "Dependentes são cobertos pela anuidade do titular.",
        },
      },
    });
  });

  it("recusa pagamentos para anuidades pagas ou isentas", async () => {
    await expect(
      demoAdapter({
        url: "/anuidades/pagamentos",
        method: "post",
        data: JSON.stringify({
          associadoId: 1,
          configuracaoId: 2,
          valor: 10,
        }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 409,
        data: { mensagem: "Esta anuidade já está paga." },
      },
    });
    await expect(
      demoAdapter({
        url: "/anuidades/pagamentos",
        method: "post",
        data: JSON.stringify({
          associadoId: 5,
          configuracaoId: 2,
          valor: 10,
        }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: { mensagem: "Não é possível pagar uma anuidade isenta." },
      },
    });
  });

  it("cria a cobrança individual quando o primeiro pagamento é registrado", async () => {
    const pagamento = await demoAdapter({
      url: "/anuidades/pagamentos",
      method: "post",
      data: JSON.stringify({ associadoId: 1, configuracaoId: 3, valor: 60 }),
    });
    const historico = await demoAdapter({
      url: "/associados/1/pagamentos",
      method: "get",
      params: { ano: 2028 },
    });

    expect(pagamento.data).toMatchObject({ valor: 60 });
    expect(historico.data.anuidade).toMatchObject({
      valor: 210,
      totalPago: 60,
      status: "PENDENTE",
    });
  });

  it("recalcula para pendente ao excluir um pagamento de anuidade paga", async () => {
    const antes = await demoAdapter({
      url: "/associados/3/pagamentos",
      method: "get",
      params: { ano: 2026 },
    });
    expect(antes.data.anuidade.status).toBe("PAGO");

    await demoAdapter({
      url: `/anuidades/pagamentos/${pagamentoCompletoId}`,
      method: "delete",
    });
    const depois = await demoAdapter({
      url: "/associados/3/pagamentos",
      method: "get",
      params: { ano: 2026 },
    });

    expect(depois.data.anuidade).toMatchObject({
      totalPago: 25,
      status: "PENDENTE",
    });
    expect(depois.data.pagamentos).toHaveLength(1);
  });

  it("isenta uma anuidade existente sem pagamentos", async () => {
    const resposta = await demoAdapter({
      url: "/associados/7/anuidades/2/isencao",
      method: "put",
      data: JSON.stringify({ isento: true }),
    });

    expect(resposta.data).toMatchObject({
      id: 207,
      valor: 150,
      totalPago: 0,
      status: "ISENTO",
    });
    await expect(
      demoAdapter({
        url: "/anuidades/pagamentos",
        method: "post",
        data: JSON.stringify({
          associadoId: 7,
          configuracaoId: 2,
          valor: 10,
        }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: { mensagem: "Não é possível pagar uma anuidade isenta." },
      },
    });
  });

  it("cria uma anuidade já isenta quando a cobrança ainda não existe", async () => {
    const resposta = await demoAdapter({
      url: "/associados/2/anuidades/3/isencao",
      method: "put",
      data: JSON.stringify({ isento: true }),
    });
    const historico = await demoAdapter({
      url: "/associados/2/pagamentos",
      method: "get",
      params: { ano: 2028 },
    });

    expect(resposta.data).toMatchObject({
      valor: 210,
      totalPago: 0,
      status: "ISENTO",
    });
    expect(historico.data.anuidade).toMatchObject(resposta.data);
  });

  it("recusa isentar anuidade que possui pagamentos", async () => {
    await expect(
      demoAdapter({
        url: "/associados/4/anuidades/2/isencao",
        method: "put",
        data: JSON.stringify({ isento: true }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 409,
        data: {
          codigo: "ANUIDADE_COM_PAGAMENTOS",
          mensagem:
            "Esta anuidade possui pagamentos. Exclua os pagamentos antes de isentar.",
        },
      },
    });
  });

  it("recusa isentar dependente", async () => {
    await expect(
      demoAdapter({
        url: "/associados/9/anuidades/2/isencao",
        method: "put",
        data: JSON.stringify({ isento: true }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: {
          mensagem: "Dependentes são cobertos pela anuidade do titular.",
        },
      },
    });
  });

  it("remove a isenção e recalcula a anuidade para pendente", async () => {
    const resposta = await demoAdapter({
      url: "/associados/7/anuidades/2/isencao",
      method: "put",
      data: JSON.stringify({ isento: false }),
    });

    expect(resposta.data).toMatchObject({
      id: 207,
      valor: 150,
      totalPago: 0,
      status: "PENDENTE",
    });
  });

  it("torna a isenção idempotente", async () => {
    const primeira = await demoAdapter({
      url: "/associados/2/anuidades/3/isencao",
      method: "put",
      data: JSON.stringify({ isento: true }),
    });
    const segunda = await demoAdapter({
      url: "/associados/2/anuidades/3/isencao",
      method: "put",
      data: JSON.stringify({ isento: true }),
    });

    expect(segunda.data).toEqual(primeira.data);
  });

  it("retorna 404 se o associado ou a configuração não existem", async () => {
    await expect(
      demoAdapter({
        url: "/associados/999/anuidades/2/isencao",
        method: "put",
        data: JSON.stringify({ isento: true }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 404,
        data: { codigo: "ASSOCIADO_NAO_ENCONTRADO" },
      },
    });
    await expect(
      demoAdapter({
        url: "/associados/1/anuidades/999/isencao",
        method: "put",
        data: JSON.stringify({ isento: true }),
      }),
    ).rejects.toMatchObject({
      response: {
        status: 404,
        data: { codigo: "CONFIGURACAO_NAO_ENCONTRADA" },
      },
    });
  });
});
