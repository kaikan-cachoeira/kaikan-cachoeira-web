import type { ClimaHora } from "@/features/eventos";
import type { Venda } from "../models";

export interface PontoClimaVendas {
  dataHora: string;
  quantidadeVendas: number;
  clima: ClimaHora | null;
}

const HORA_EM_MS = 60 * 60 * 1000;

export const FUSO_HORARIO_CLIMA = "America/Sao_Paulo";

export function criarEscalasClimaVendas(pontos: readonly PontoClimaVendas[]) {
  const temperaturas = pontos.flatMap((ponto) => {
    const temperatura = ponto.clima?.temperatura;
    return temperatura !== undefined && Number.isFinite(temperatura)
      ? [temperatura]
      : [];
  });
  const maiorVenda = Math.max(0, ...pontos.map((ponto) => ponto.quantidadeVendas));

  return {
    maximoVendas: Math.max(1, Math.ceil(maiorVenda / 4)) * 4,
    temperaturaMinima: temperaturas.length
      ? Math.floor((Math.min(...temperaturas) - 1) / 5) * 5
      : 0,
    temperaturaMaxima: temperaturas.length
      ? Math.ceil((Math.max(...temperaturas) + 1) / 5) * 5
      : 5,
  };
}

export function criarLinhaTemperatura(
  pontos: readonly PontoClimaVendas[],
  largura: number,
  altura: number,
): string {
  const escala = criarEscalasClimaVendas(pontos);
  const amplitude = escala.temperaturaMaxima - escala.temperaturaMinima;
  const trechos: string[] = [];
  let novoTrecho = true;

  pontos.forEach((ponto, indice) => {
    const temperatura = ponto.clima?.temperatura;
    if (temperatura === undefined || !Number.isFinite(temperatura)) {
      novoTrecho = true;
      return;
    }
    const x = ((indice + 0.5) / pontos.length) * largura;
    const y = altura - ((temperatura - escala.temperaturaMinima) / amplitude) * altura;
    trechos.push(`${novoTrecho ? "M" : "L"}${x},${y}`);
    novoTrecho = false;
  });

  return trechos.join(" ");
}

function inicioDaHora(dataHora: string): number | null {
  if (!/(Z|[+-]\d{2}:\d{2})$/i.test(dataHora)) return null;

  const instante = Date.parse(dataHora);
  if (!Number.isFinite(instante)) return null;

  return Math.floor(instante / HORA_EM_MS) * HORA_EM_MS;
}

export function cruzarClimaEVendasPorHora(
  eventoId: number,
  climas: readonly ClimaHora[],
  vendas: readonly Venda[],
): PontoClimaVendas[] {
  const climaPorHora = new Map<number, ClimaHora>();
  const vendasPorHora = new Map<number, number>();
  const vendasContabilizadas = new Set<number>();

  for (const clima of climas) {
    const hora = inicioDaHora(clima.dataHoraPrevista);
    if (hora !== null) climaPorHora.set(hora, clima);
  }

  for (const venda of vendas) {
    if (
      venda.eventId !== eventoId ||
      venda.cancelada ||
      vendasContabilizadas.has(venda.id)
    ) {
      continue;
    }

    const hora = inicioDaHora(venda.criadoEm);
    if (hora === null) continue;

    vendasContabilizadas.add(venda.id);
    vendasPorHora.set(hora, (vendasPorHora.get(hora) ?? 0) + 1);
  }

  const horas = [...climaPorHora.keys(), ...vendasPorHora.keys()].sort(
    (a, b) => a - b,
  );
  if (!horas.length) return [];

  const pontos: PontoClimaVendas[] = [];
  const ultimaHora = horas[horas.length - 1];

  // O Instant preserva data e hora, sem depender do fuso do navegador.
  // Em Brasília, os intervalos horários coincidem com os intervalos em UTC.
  for (let hora = horas[0]; hora <= ultimaHora; hora += HORA_EM_MS) {
    pontos.push({
      dataHora: new Date(hora).toISOString(),
      quantidadeVendas: vendasPorHora.get(hora) ?? 0,
      clima: climaPorHora.get(hora) ?? null,
    });
  }

  return pontos;
}
