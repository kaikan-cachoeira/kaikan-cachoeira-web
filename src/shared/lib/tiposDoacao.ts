export const OPCOES_TIPO_DOACAO = [
  { value: "REABASTECIMENTO", label: "Produto pronto" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "PRODUTO", label: "Ingrediente" },
];

const ROTULOS_TIPO_DOACAO: Record<string, string> = {
  DINHEIRO: "Dinheiro",
  PRODUTO: "Ingrediente",
  REABASTECIMENTO: "Produto pronto",
};

export function rotuloTipoDoacao(tipo: string): string {
  return ROTULOS_TIPO_DOACAO[tipo] || tipo;
}
