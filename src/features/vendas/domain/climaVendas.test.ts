import { describe, expect, it } from "vitest";
import type { ClimaHora } from "@/features/eventos";
import type { Venda } from "../models";
import { criarEscalasClimaVendas, criarLinhaTemperatura, cruzarClimaEVendasPorHora } from "./climaVendas";

function clima(dataHoraPrevista: string): ClimaHora {
  return {
    dataHoraPrevista,
    temperatura: 26,
    sensacaoTermica: 27,
    chuvaMm: 0.4,
    probabilidadeChuva: 65,
    ventoVelocidade: 18,
    codigoClima: 61,
    descricaoClima: "Chuva fraca",
  };
}

function venda(id: number, criadoEm: string, ajustes: Partial<Venda> = {}): Venda {
  return {
    id,
    eventId: 1,
    criadoEm,
    desconto: 0,
    precoTotal: 50,
    quantidadeItens: 5,
    cancelada: false,
    ...ajustes,
  };
}

describe("cruzamento entre clima e vendas por hora", () => {
  it("mantém escalas válidas com temperatura zero e nenhuma venda", () => {
    const pontos = cruzarClimaEVendasPorHora(1, [
      { ...clima("2026-11-21T17:00:00Z"), temperatura: 0 },
    ], []);
    const escala = criarEscalasClimaVendas(pontos);

    expect(escala.maximoVendas).toBeGreaterThan(0);
    expect(escala.temperaturaMinima).toBeLessThan(0);
    expect(escala.temperaturaMaxima).toBeGreaterThan(0);
    expect(criarLinhaTemperatura(pontos, 300, 220)).toMatch(/^M/);
  });

  it("acomoda temperaturas negativas sem inverter o eixo", () => {
    const pontos = cruzarClimaEVendasPorHora(1, [
      { ...clima("2026-11-21T17:00:00Z"), temperatura: -12 },
      { ...clima("2026-11-21T18:00:00Z"), temperatura: -8 },
    ], []);
    const escala = criarEscalasClimaVendas(pontos);

    expect(escala.temperaturaMinima).toBeLessThan(-12);
    expect(escala.temperaturaMaxima).toBeGreaterThan(-8);
    expect(criarLinhaTemperatura(pontos, 300, 220)).not.toMatch(/NaN|Infinity/);
  });

  it("interrompe a linha quando falta previsão no meio do período", () => {
    const pontos = cruzarClimaEVendasPorHora(1, [
      clima("2026-11-21T17:00:00Z"),
      clima("2026-11-21T19:00:00Z"),
    ], []);
    const linha = criarLinhaTemperatura(pontos, 300, 220);

    expect(linha.match(/M/g)).toHaveLength(2);
    expect(linha).not.toContain("L");
  });

  it("não gera coordenadas inválidas para uma série sem clima", () => {
    const pontos = cruzarClimaEVendasPorHora(1, [], [venda(1, "2026-11-21T17:10:00Z")]);
    expect(criarLinhaTemperatura(pontos, 300, 220)).toBe("");
    expect(criarLinhaTemperatura([], 300, 220)).toBe("");
  });

  it("conta transações, sem somar produtos, unidades ou valores", () => {
    const previsao = clima("2026-11-21T17:00:00Z");
    const pontos = cruzarClimaEVendasPorHora(1, [previsao], [
      venda(1, "2026-11-21T17:10:00Z"),
      venda(2, "2026-11-21T17:59:59Z", { quantidadeItens: 20 }),
    ]);

    expect(pontos).toEqual([
      {
        dataHora: "2026-11-21T17:00:00.000Z",
        quantidadeVendas: 2,
        clima: previsao,
      },
    ]);
  });

  it("mantém separadas as mesmas horas de dias diferentes", () => {
    const pontos = cruzarClimaEVendasPorHora(
      1,
      [clima("2026-11-22T17:00:00Z"), clima("2026-11-21T17:00:00Z")],
      [
        venda(1, "2026-11-21T17:20:00Z"),
        venda(2, "2026-11-22T17:10:00Z"),
        venda(3, "2026-11-22T17:40:00Z"),
      ],
    );

    expect(pontos).toHaveLength(25);
    expect(pontos[0].quantidadeVendas).toBe(1);
    expect(pontos[24].quantidadeVendas).toBe(2);
    expect(pontos[0].dataHora).toBe("2026-11-21T17:00:00.000Z");
    expect(pontos[24].dataHora).toBe("2026-11-22T17:00:00.000Z");
  });

  it("cruza o mesmo instante em UTC e no fuso de Brasília", () => {
    const pontos = cruzarClimaEVendasPorHora(
      1,
      [clima("2026-11-21T23:00:00-03:00")],
      [venda(1, "2026-11-22T02:30:00Z")],
    );

    expect(pontos).toHaveLength(1);
    expect(pontos[0].dataHora).toBe("2026-11-22T02:00:00.000Z");
    expect(pontos[0].quantidadeVendas).toBe(1);
  });

  it("ignora canceladas e vendas de outros eventos", () => {
    const pontos = cruzarClimaEVendasPorHora(
      1,
      [clima("2026-11-21T17:00:00Z")],
      [
        venda(1, "2026-11-21T17:10:00Z", { cancelada: true }),
        venda(2, "2026-11-21T17:20:00Z", { eventId: 2 }),
        venda(3, "2026-11-21T17:30:00Z"),
      ],
    );

    expect(pontos[0].quantidadeVendas).toBe(1);
  });

  it("não conta duas vezes uma venda repetida entre páginas", () => {
    const registro = venda(1, "2026-11-21T17:10:00Z");
    const pontos = cruzarClimaEVendasPorHora(1, [], [registro, { ...registro }]);

    expect(pontos[0].quantidadeVendas).toBe(1);
  });

  it("preserva a lacuna climática sem inventar temperatura zero", () => {
    const pontos = cruzarClimaEVendasPorHora(
      1,
      [clima("2026-11-21T17:00:00Z"), clima("2026-11-21T19:00:00Z")],
      [],
    );

    expect(pontos[1]).toEqual({
      dataHora: "2026-11-21T18:00:00.000Z",
      quantidadeVendas: 0,
      clima: null,
    });
  });

  it("mantém vendas nas horas sem previsão persistida", () => {
    const pontos = cruzarClimaEVendasPorHora(
      1,
      [clima("2026-11-21T17:00:00Z")],
      [venda(1, "2026-11-21T18:05:00Z")],
    );

    expect(pontos[0].quantidadeVendas).toBe(0);
    expect(pontos[1].quantidadeVendas).toBe(1);
    expect(pontos[1].clima).toBeNull();
  });

  it("coloca a venda na próxima hora quando muda o intervalo", () => {
    const pontos = cruzarClimaEVendasPorHora(1, [], [
      venda(1, "2026-11-21T17:59:59.999Z"),
      venda(2, "2026-11-21T18:00:00Z"),
    ]);

    expect(pontos.map((ponto) => ponto.quantidadeVendas)).toEqual([1, 1]);
  });

  it("ignora datas inválidas e horários sem fuso explícito", () => {
    expect(
      cruzarClimaEVendasPorHora(
        1,
        [clima("inválido")],
        [venda(1, "2026-11-21T14:30:00"), venda(2, "inválido")],
      ),
    ).toEqual([]);
  });

  it("retorna vazio quando não há registros", () => {
    expect(cruzarClimaEVendasPorHora(1, [], [])).toEqual([]);
  });

  it("não altera os registros recebidos", () => {
    const previsao = Object.freeze(clima("2026-11-21T17:00:00Z"));
    const registro = Object.freeze(venda(1, "2026-11-21T17:10:00Z"));

    expect(
      cruzarClimaEVendasPorHora(1, Object.freeze([previsao]), Object.freeze([registro])),
    ).toHaveLength(1);
    expect(previsao.dataHoraPrevista).toBe("2026-11-21T17:00:00Z");
    expect(registro.criadoEm).toBe("2026-11-21T17:10:00Z");
  });
});
