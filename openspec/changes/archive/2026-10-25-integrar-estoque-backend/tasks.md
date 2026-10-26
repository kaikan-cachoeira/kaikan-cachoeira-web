# Tasks

## 1. Pré-requisito da API para movimentações

- [x] 1.1 Atualizar `MovimentacaoResponse` na API para incluir `eventoNome` e ajustar o mapeamento em `MovimentacaoService`, verificando com `./mvnw -q -DskipTests compile` no repositório `../kaikan-cachoeira-api`.
- [x] 1.2 Garantir que os endpoints de histórico (`/produtos/{id}/movimentacoes` e `/estoques/{id}/movimentacoes`) devolvem `eventoNome` quando houver `eventoId`, verificando com chamada manual (curl/Postman) e resposta JSON.

## 2. Modelo e serviços de estoque API-native

- [x] 2.1 Reescrever `src/features/inventario/models/inventario.ts` para contrato API-native com `id: number`, verificando com `npm run typecheck` que os erros se concentram nos consumidores ainda não adaptados.
- [x] 2.2 Migrar `src/features/inventario/services/inventario.ts` para rotas reais (`/produtos`, `/produtos/{id}/estoques`, `/produtos/{id}/movimentacoes`, `/estoques/{id}/movimentacoes`) com adaptação de paginação 0-based/1-based, verificando com teste manual de paginação e histórico.
- [x] 2.3 Migrar `src/features/inventario/services/categorias.ts` para `/categorias` e preservar mensagens de conflito do backend, verificando exclusão bloqueada por categoria vinculada.
- [x] 2.4 Implementar fluxo de foto multipart em duas etapas (dados + `POST /produtos/{id}/foto`) e tratamento de `PUT 204`, verificando criação/edição com imagem e atualização visual após salvar.

## 3. Hooks e telas do inventário

- [x] 3.1 Atualizar `useInventario` e mutations para novo contrato (incluindo exclusão e invalidação de cache), verificando por `typecheck` e comportamento de refresh da listagem.
- [x] 3.2 Adaptar `InventarioPage`, `ProdutoCard` e `ProdutoFormModal` para campos API-native, mantendo exclusão com confirmação no menu de ações, verificando criar/editar/excluir em fluxo manual.
- [x] 3.3 Adaptar `ProdutoDetalhesModal` e `LoteMovimentacoesPage` para detalhe composto (produto + lotes + movimentações reais), verificando renderização de lotes e histórico sem payload embutido.
- [x] 3.4 Adaptar `MovimentacaoModal` para `tipoMovimentacaoId` vindo de `GET /tipos-movimentacao`, custo condicional por `exigeCusto` e reunião obrigatória em `CONSUMO_INTERNO`, verificando validações de formulário e criação bem-sucedida.
- [x] 3.5 Adaptar `CategoriasModal` para contrato real de categorias e mensagens de erro da API, verificando criação, edição e conflito de exclusão.

## 4. Consumidores de catálogo e integração transversal

- [x] 4.1 Adaptar `AdicionarProdutoCardapioModal` para novo contrato de produto do estoque (IDs numéricos e campos API-native), verificando seleção e envio de item de estoque no cardápio.
- [x] 4.2 Adaptar `DoacaoModal` para novo contrato de produto, verificando criação/edição de doação de produto com seleção válida.
- [x] 4.3 Adaptar `useRelatorio` para contagens de estoque com campos novos, verificando métricas de estoque baixo/sem estoque no relatório geral.

## 5. Verificação integrada

- [x] 5.1 Rodar `npm run typecheck` e confirmar zero erros.
- [x] 5.2 Rodar `npm run lint` e `npm run lint:boundaries` e confirmar ausência de erros bloqueantes.
- [x] 5.3 Rodar `npm test` e confirmar que testes existentes e novos do inventário passam.
- [x] 5.4 Executar smoke manual com `VITE_DEMO_MODE=false`: listar produtos, filtrar, abrir detalhe, movimentar (incluindo consumo interno com reunião), CRUD de categorias, CRUD de produtos com foto e exclusão.

## Workflow follow-up

- Validar a change com `openspec validate --change "integrar-estoque-backend" --strict` antes de iniciar implementação.
- Após implementação concluída, executar `/opsx-apply` para conduzir a fase de execução desta change.
