export const OPCOES_TIPO_DOACAO = [
  { value: "ready", label: "Produto pronto" },
  { value: "money", label: "Dinheiro" },
  { value: "ingredient", label: "Ingrediente" },
];

const ROTULOS_TIPO_DOACAO: Record<string, string> = {
  ready: "Produto pronto",
  money: "Dinheiro",
  ingredient: "Ingrediente",
  DINHEIRO: "Dinheiro",
  PRODUTO: "Produto",
  REABASTECIMENTO: "Reabastecimento",
};

export function rotuloTipoDoacao(tipo: string): string {
  return ROTULOS_TIPO_DOACAO[tipo] || tipo;
}
