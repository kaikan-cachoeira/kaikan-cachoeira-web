import { paraEntradaDataHora } from "@/shared/lib/formatacao";

export { paraEntradaDataHora };

/**
 * Converte o valor de um input `datetime-local` (sem fuso) para o Instant
 * ISO 8601 esperado pela API, interpretando o horário no fuso local.
 */
export function paraInstant(valor: string): string {
  if (!valor) return "";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "";
  return data.toISOString();
}

export function inicioDoDiaISO(data: string): string {
  if (!data) return "";
  const inicio = new Date(`${data}T00:00:00`);
  return Number.isNaN(inicio.getTime()) ? "" : inicio.toISOString();
}

export function fimDoDiaISO(data: string): string {
  if (!data) return "";
  const fim = new Date(`${data}T23:59:59.999`);
  return Number.isNaN(fim.getTime()) ? "" : fim.toISOString();
}
