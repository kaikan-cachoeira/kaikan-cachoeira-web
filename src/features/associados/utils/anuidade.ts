export function saldoAnuidade(valor: number, totalPago: number): number {
  const valorCentavos = Math.round(valor * 100);
  const pagoCentavos = Math.round(totalPago * 100);
  return Math.max(0, valorCentavos - pagoCentavos) / 100;
}
