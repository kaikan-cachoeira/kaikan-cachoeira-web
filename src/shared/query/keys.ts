export const queryKeys = {
  produtos: ["produtos"],
  categorias: ["categorias"],
  eventos: ["eventos"],
  vendas: ["vendas"],
  caixa: ["caixa"],
  fiados: ["fiados"],
  doacoes: ["doacoes"],
} as const;

export function comporChave(
  base: readonly unknown[],
  ...partes: unknown[]
): unknown[] {
  return [...base, ...partes];
}
