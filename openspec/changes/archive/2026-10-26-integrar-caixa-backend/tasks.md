# Tasks

## 1. Contrato API-native de caixa e fiados (models + services)

- [x] 1.1 Atualizar `src/features/caixa/models/caixa.ts` para contratos backend (IDs numéricos, enums de tipo/forma, resumo e fiado API-native) e verificar com `npm run build` sem erros de tipo.
- [x] 1.2 Reescrever `src/features/caixa/services/caixa.ts` para `GET/POST/DELETE /eventos/{eventoId}/caixa`, com adaptação de paginação (`itens/page/size/totalItens/totalPaginas` -> `items/page/pageSize/total/totalPages`) e validar chamadas no DevTools/network.
- [x] 1.3 Reescrever `src/features/caixa/services/fiados.ts` para `GET /eventos/{eventoId}/fiados` e `PATCH /eventos/{eventoId}/fiados/{fiadoId}/quitacao`, verificando payload de quitação com apenas `formaPagamento`.

## 2. Fluxos de caixa no evento atual

- [x] 2.1 Ajustar `useCaixa` e mutations para usar `eventoId` obrigatório do evento em andamento e validar atualização de histórico e resumo após registrar e excluir lançamento.
- [x] 2.2 Ajustar filtros de `CaixaPage` para mapear labels UI em enums backend (`tipo` e `formaPagamento`) e validar filtros ativos no request da listagem.
- [x] 2.3 Atualizar renderização de histórico/resumo em `CaixaPage` para os novos campos adaptados e validar paginação 1-based na UI com `page` 0-based na API.

## 3. Fluxos de fiados no evento atual

- [x] 3.1 Ajustar `useFiados` e `FiadosPage` para listagem por evento no contrato real, incluindo filtro de situação, e validar troca de estados pendente/quitado.
- [x] 3.2 Atualizar `QuitarFiadoModal` para quitação total sem campo de valor, enviando somente forma de pagamento, e validar sucesso/erro com mensagens da API.
- [x] 3.3 Ajustar cancelamento de quitação e demais ações de fiado para contratos reais e validar invalidação/refetch de `caixa`, `fiados`, `eventos` e `vendas`.

## 4. Verificação e regressão no escopo aprovado

- [x] 4.1 Executar validação manual ponta a ponta no escopo de evento-atual (`/caixa`, `/caixa/fiado`, `/caixa/fiados`) e registrar evidências no PR/checklist da change.
- [x] 4.2 Confirmar que `/relatorio-geral/fiados` permaneceu inalterado nesta change e registrar o check explícito no PR/checklist.
- [x] 4.3 Rodar `npm run build` e `npm test` após a migração e verificar ausência de regressões de compilação e testes.

## Evidências desta execução

- `npm run build` ✅
- `npm test` ✅
- `/relatorio-geral/fiados` sem alterações nesta implementação ✅

## Workflow follow-up

- Revisar os artifacts com o time antes de iniciar implementação.
- Quando aprovado, executar `/opsx-apply` para implementar a change.
