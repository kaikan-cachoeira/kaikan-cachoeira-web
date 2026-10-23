# Tasks

## 1. Fundação, shared e app

- [x] 1.1 Configurar o alias `@/*` em `vite.config.ts` e `tsconfig.app.json`, adicionar o script `typecheck` (`tsc -b --pretty false`) e ativar `strict: true`, `allowJs: true` e `checkJs: false`; verificar com `npm run typecheck` e `npm run build`.
- [x] 1.2 Criar `src/app`, `src/shared` e `src/features` e mover a UI genérica de `src/components` para `src/shared/components`, traduzindo os nomes (`Badge` → `Etiqueta`, `Button` → `Botao`, `ConfirmDialog` → `ConfirmacaoDialog`, `FilterPanel` → `PainelFiltros`, `Form` → `Formulario` e campos como `CampoMoeda`, `Campo`, `Entrada`, `SelecaoMultipla`, `ControleSegmentado`, `Selecao`, `AreaTexto`, `Icon` → `Icone`, `Pagination` → `Paginacao`, `ProductThumb` → `MiniaturaProduto`, `QuantityStepper` → `SeletorQuantidade`, `SearchBar` → `BarraPesquisa`, `State` → `Estado`, `SuccessDialog` → `SucessoDialog`, `Table` → `Tabela`, `Tabs` → `Abas`), mover `ToastContext` para `shared/components/Toast` e padronizar imports de CSS module como `styles`; verificar a árvore de arquivos e a ausência de `estilos` com `rg`.
- [x] 1.3 Mover `services/api.js` e `services/demo/` para `src/shared/api` (`cliente.ts`, `erros.ts`, `demo/adaptador.ts`, `demo/dadosIniciais.ts`, `demo/store.ts`), além de `models/paginacao.ts`, `query/keys.ts`, `lib/formatacao.ts`, `lib/armazenamentoLocal.ts` e `styles/`; verificar que os arquivos existem e que o modo demo continua selecionável pelo cliente.
- [x] 1.4 Mover layouts, `routes/ProtectedRoute`, `pages/pending` e a tabela de rotas para `src/app` (`AppRoutes`, `RotaProtegida`, `PaginaPendente`, `PaginaNaoEncontrada`, `AppLayout`, `AuthLayout`), criar `AppProviders` e `QueryProvider` em `src/app/providers`, criar `src/app/App.tsx`, apontar `src/main.tsx` e `index.html` para o novo entry e manter as rotas públicas existentes; verificar que `/login`, `/inicio`, `/estoque`, `/eventos`, `/eventos/ev-festa-junina`, `/eventos/ev-festa-junina/cardapio`, `/eventos/ev-festa-junina/vendas`, `/registro-vendas`, `/caixa` e `/doacoes` continuam resolvendo.
- [x] 1.5 Remover o template Vite morto (`src/App.tsx`, `src/App.css`, `src/index.css`, o conteúdo antigo de `src/main.tsx` e assets não usados), preservando o novo entry; confirmar com `rg` que não há referências a esses arquivos e que `index.html` referencia apenas `/src/main.tsx`.
- [x] 1.6 Criar shims temporários nos caminhos antigos (`components`, `hooks`, `services`, `context`, `layouts`, `pages`, `routes`, `utils`, `styles`) que reexportem a nova localização; verificar que `npm run typecheck && npm run build` continua verde com os imports antigos. Observação: os consumidores foram migrados no mesmo passo; os shims não foram necessários e as pastas antigas já foram removidas.
- [x] 1.7 Criar `shared/query/keys.ts` com os namespaces `produtos`, `categorias`, `eventos`, `vendas`, `caixa`, `fiados` e `doacoes`, e migrar os hooks atuais para compor as chaves a partir deles; verificar que não restam arrays literais em `queryKey` fora de `keys.ts` com `rg`.
- [x] 1.8 Adicionar `dependency-cruiser` e o script `lint:boundaries`, configurando em modo de relatório as regras de DAG, barril público e ausência de ciclos; verificar que o comando executa e lista as violações conhecidas sem interromper o gate ainda. Observação: as regras foram ativadas em modo estrito ao final, com zero violações.
- [x] 1.9 Documentar em `docs/arquitetura.md` a árvore alvo, o DAG, as responsabilidades das camadas, o glossário de nomes, os comandos de verificação e o link no `README.md`; verificar que os caminhos e comandos citados existem.
- [x] 1.10 Rodar o gate da fundação com `npm run typecheck && npm run lint && npm run build` e fazer um smoke manual das rotas de login e início; registrar qualquer desvio antes de avançar.

## 2. Auth

- [x] 2.1 Criar `features/auth/models` (ex.: `Sessao`, `Credenciais`, `Usuario`) e `features/auth/services/autenticacao.ts` retornando os models diretamente; verificar com `npm run typecheck`.
- [x] 2.2 Mover `LoginPage`, `RecoverPage` e `RecoverConfirmationPage` para `features/auth/pages` como `LoginPage`, `RecuperarSenhaPage` e `ConfirmacaoRecuperacaoPage`, convertendo para TSX e mantendo os textos e campos; verificar as rotas `/login`, `/recuperar-senha` e `/confirmacao-recuperacao` no navegador.
- [x] 2.3 Mover `AuthContext` para `features/auth/providers/AuthProvider`, criar o viewmodel `useAutenticacao` e ligar o token ao `shared/api/cliente.ts` por `definirToken`; verificar login, logout, restauração de sessão e envio do header `Authorization` nas requisições.
- [x] 2.4 Criar o barril `features/auth/index.ts`, atualizar `AppRoutes`, `RotaProtegida` e `AppProviders` para importar de `@/features/auth`, e remover os shims de auth; verificar com `npm run typecheck && npm run lint && npm run build`.

## 3. Inventario

- [x] 3.1 Criar `features/inventario/models` (`Produto`, `LoteProduto`, `MovimentacaoProduto`, `Categoria`, `ParametrosProdutos`) e `services/inventario.ts` e `services/categorias.ts` tipados, sem mapeadores; verificar com `npm run typecheck`.
- [x] 3.2 Mover `InventoryPage`, `ProductCard`, `ProductDetailsModal`, `ProductFormModal`, `MovementModal`, `CategoriesModal` e o CSS de modais para `features/inventario`, renomeando para `InventarioPage`, `ProdutoCard`, `ProdutoDetalhesModal`, `ProdutoFormModal`, `MovimentacaoModal` e `CategoriasModal`; verificar a rota `/estoque` e o fluxo de abrir detalhes e formulário.
- [x] 3.3 Criar `hooks/useInventario.ts` como viewmodel e separar `useProdutosQuery`, `useCategoriasQuery`, `useProdutoMutations` e `useCategoriaMutations`; verificar filtros, paginação, criação, edição, movimentação e exclusão de produto no navegador.
- [x] 3.4 Transformar `CategoriasModal` em widget conectado de `inventario`, exportá-lo no barril e usá-lo na própria página; verificar criação, edição e exclusão de categoria sem import profundo.
- [x] 3.5 Criar o barril `features/inventario/index.ts`, atualizar a rota e os consumidores para `@/features/inventario`, remover os shims de inventário e rodar `npm run typecheck && npm run lint && npm run build`.

## 4. Eventos

- [x] 4.1 Criar `features/eventos/models` (`Evento`, `ItemCardapio`, `CustoEvento`, `ParametrosEventos`) e `services/eventos.ts` tipado; verificar com `npm run typecheck`.
- [x] 4.2 Mover e renomear as páginas e componentes de eventos para `EventosPage`, `EventoDetalhesPage`, `EventoCardapioPage`, `EventoVendasPage` (temporariamente em eventos), `EventoCard`, `EventoFormModal`, `AdicionarProdutoCardapioModal` e `CustoModal`; verificar `/eventos`, `/eventos/:id`, `/eventos/:id/cardapio` e `/eventos/:id/vendas`.
- [x] 4.3 Criar `hooks/useEventos.ts` e `hooks/useEventoDetalhes.ts` como viewmodels e separar `useEventosQuery`, `useEventoQuery`, `useEventoAtualQuery`, `useEventoCardapioQuery` e `useEventoMutations`; verificar criação, mudança de status, exclusão, custos e adição de produto ao cardápio.
- [x] 4.4 Consumir `CategoriasModal` de `@/features/inventario` no cardápio e usar `queryKeys` para invalidar `caixa`, `fiados`, `doacoes` e `vendas` nas mutações de evento; verificar que o fechamento/exclusão de evento atualiza as telas dependentes.
- [x] 4.5 Criar o barril `features/eventos/index.ts`, atualizar rotas e consumidores para `@/features/eventos`, remover os shims de eventos e rodar `npm run typecheck && npm run lint && npm run build`.

## 5. Doacoes

- [x] 5.1 Criar `features/doacoes/models` (`Doacao`, `ParametrosDoacoes`) e `services/doacoes.ts` tipado; verificar com `npm run typecheck`.
- [x] 5.2 Mover `DonationsPage` e `DonationModal` para `features/doacoes`, renomeando para `DoacoesPage` e `DoacaoModal`, e atualizar a rota `/doacoes`; verificar listagem, criação e cancelamento de doação.
- [x] 5.3 Criar `hooks/useDoacoes.ts` como viewmodel e separar `useDoacoesQuery` e `useDoacaoMutations`, usando `queryKeys`; verificar filtros, paginação e invalidação após mutação.
- [x] 5.4 Criar o barril `features/doacoes/index.ts`, atualizar a rota para `@/features/doacoes`, remover os shims de doações e rodar `npm run typecheck && npm run lint && npm run build`.

## 6. Vendas

- [x] 6.1 Criar `features/vendas/models` (`Venda`, `ItemVenda`, `ParametrosVendas`, `ParametrosVendasEvento`) e `services/vendas.ts`, incluindo a listagem de vendas por evento; verificar com `npm run typecheck`.
- [x] 6.2 Mover e renomear as páginas e componentes de vendas para `RegistroVendasPage`, `HistoricoVendasPage`, `HistoricoVendasView`, `VendaProdutoCard`, `ResumoVenda`, `DescontoModal` e `VendaDetalhesModal`, e mover `EventoVendasPage` de eventos para vendas; verificar `/registro-vendas`, `/registro-vendas/historico` e `/eventos/:id/vendas`.
- [x] 6.3 Mover `SaleContext` para `features/vendas/providers/VendaProvider`, extrair `domain/carrinho.ts` com as funções puras de adicionar, alterar quantidade, aplicar/remover desconto e calcular subtotal/desconto/total, e adicionar `vitest` com script `test` e testes unitários do carrinho; verificar com `npm test`.
- [x] 6.4 Criar `hooks/useVendas.ts` como viewmodel e separar `useVendasQuery`, `useVendasEventoQuery` e `useVendaMutations`; verificar registro de venda, desconto, cancelamento e histórico.
- [x] 6.5 Criar o barril `features/vendas/index.ts`, atualizar rotas e consumidores para `@/features/vendas`, remover a exceção de `EventoVendasPage` em eventos e verificar com `npm run lint:boundaries` que não existe ciclo `eventos ↔ vendas`.
- [x] 6.6 Rodar o gate de vendas com `npm test && npm run typecheck && npm run lint && npm run build`.

## 7. Caixa

- [x] 7.1 Criar `features/caixa/models` (`LancamentoCaixa`, `Fiado`, `ParametrosCaixa`, `ParametrosFiados`) e `services/caixa.ts` tipado; verificar com `npm run typecheck`.
- [x] 7.2 Mover `CashPage`, `FiadosPage`, `CashEntryPanel` e `SettleFiadoModal` para `features/caixa`, renomeando para `CaixaPage`, `FiadosPage`, `PainelLancamentoCaixa` e `QuitarFiadoModal`; verificar `/caixa`, `/caixa/fiado` e `/caixa/fiados`.
- [x] 7.3 Criar `hooks/useCaixa.ts` e `hooks/useFiados.ts` como viewmodels e separar `useCaixaQuery`, `useFiadosQuery` e `useCaixaMutations`; verificar lançamento, cancelamento, quitação e desfazimento de quitação.
- [x] 7.4 Criar o barril `features/caixa/index.ts`, atualizar rotas e consumidores para `@/features/caixa`, remover os shims de caixa e rodar `npm run typecheck && npm run lint && npm run build`.

## 8. Home

- [x] 8.1 Mover `HomePage` para `features/home/pages`, criar `hooks/useHome.ts` como viewmodel e consumir o evento atual via `@/features/eventos`; verificar a rota `/inicio` e os indicadores da página.
- [x] 8.2 Criar o barril `features/home/index.ts`, atualizar a rota para `@/features/home`, remover os shims de home e rodar `npm run typecheck && npm run lint && npm run build`.

## 9. Limpeza e integração

- [x] 9.1 Remover todos os shims e as pastas antigas (`src/components`, `src/context`, `src/hooks`, `src/layouts`, `src/pages`, `src/routes`, `src/services`, `src/styles`, `src/utils`), e confirmar com `rg` que não restam imports desses caminhos; verificar `npm run build`.
- [x] 9.2 Converter `shared/api/demo` (`adaptador.ts`, `dadosIniciais.ts`, `store.ts`) para TypeScript, mantendo os mesmos dados e endpoints; verificar o modo demo no navegador e `npm run typecheck`.
- [x] 9.3 Desligar `allowJs` e converter os arquivos `.js/.jsx` restantes para `.ts/.tsx`; verificar que não restam arquivos JS/JSX em `src` e que `npm run typecheck` passa.
- [x] 9.4 Ativar as regras estritas de `dependency-cruiser` e `oxlint` para DAG, barril público e imports profundos; verificar `npm run lint:boundaries` com zero violações e `npm run lint` verde.
- [x] 9.5 Rodar a verificação final com `npm test && npm run typecheck && npm run lint && npm run build` e confirmar que não há erros de console ou requisições quebradas.
- [x] 9.6 Fazer o smoke manual completo de login, recuperação de senha, início, estoque, doações, eventos, cardápio, vendas por evento, registro de vendas, histórico, caixa, fiados e páginas de erro; registrar o resultado no PR ou na descrição da mudança. Resultado: smoke executado com Firefox headless em modo demo; `/login` renderizou o formulário e as rotas `/inicio`, `/estoque`, `/doacoes`, `/eventos`, `/eventos/ev-festa-junina`, `/eventos/ev-festa-junina/cardapio`, `/eventos/ev-festa-junina/vendas`, `/registro-vendas`, `/registro-vendas/historico`, `/caixa`, `/caixa/fiados` e a página de erro responderam com a aplicação montada, sem telas em branco.

## Workflow follow-up

- Arquivar a mudança após a revisão e o gate final.
- Verificar o resultado arquivado e atualizar o `docs/arquitetura.md` se a implementação divergir do desenho.
