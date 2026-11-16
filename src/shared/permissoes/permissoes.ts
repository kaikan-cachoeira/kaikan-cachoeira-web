export const PERMISSOES = {
  eventosMenu: "EVENTOS_MENU",
  estoqueMenu: "ESTOQUE_MENU",
  doacoesMenu: "DOACOES_MENU",
  vendasMenu: "VENDAS_MENU",
  caixaMenu: "CAIXA_MENU",
  relatoriosMenu: "RELATORIOS_MENU",
  dashboardMenu: "DASHBOARD_MENU",
  eventosLeitura: "EVENTOS_LEITURA",
  produtosLeitura: "PRODUTOS_LEITURA",
  cardapioEventoLeitura: "CARDAPIO_EVENTO_LEITURA",
} as const;

export type Permissao = (typeof PERMISSOES)[keyof typeof PERMISSOES];

export type ListaDePermissoes = readonly string[];

export function temPermissao(
  permissoes: ListaDePermissoes,
  permissao: Permissao,
): boolean {
  return permissoes.includes(permissao);
}
