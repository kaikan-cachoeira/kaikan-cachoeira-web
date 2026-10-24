export { default as InventarioPage } from "./pages/InventarioPage";
export { default as CategoriasModal } from "./widgets/CategoriasModal";
export { default as LoteMovimentacoesPage } from "./pages/LoteMovimentacoesPage";
export {
  useCategoriasQuery,
  useProdutoMutations,
  useProdutosQuery,
} from "./hooks/useInventario";
export type {
  Categoria,
  LoteProduto,
  MovimentacaoProduto,
  ParametrosProdutos,
  Produto,
} from "./models";
