# Tasks

## 1. Contrato API-native de vendas (models + service)

- [x] 1.1 Atualizar `src/features/vendas/models/vendas.ts` para tipos alinhados ao backend (`id` numérico, payload `itens` com `produtoEventoId`, respostas de histórico/detalhe) e verificar com `npm run build` sem erros de tipo.
- [x] 1.2 Reescrever `src/features/vendas/services/vendas.ts` para usar `/eventos/{eventoId}/vendas`, incluindo mapeamento de paginação (`itens/page/size/totalItens/totalPaginas` -> `items/page/pageSize/total/totalPages`) e validar via inspeção de requests no fluxo de histórico.
- [x] 1.3 Adaptar parsing de filtros (`q`, `dataHoraInicio`, `dataHoraFim`, `cancelada`) com conversão de datas para ISO e verificar que ativas/canceladas enviam `cancelada=false/true` corretamente.

## 2. Registro de venda com valor final editável

- [x] 2.1 Atualizar hooks de registro (`useVendas`) para enviar `valorFinal` opcional e itens no formato backend, verificando criação bem-sucedida com toast de sucesso.
- [x] 2.2 Evoluir `ResumoVenda` para expor campo editável de valor final e validar faixa `0 <= valorFinal <= totalComDescontoDosItens`, verificando bloqueio de confirmação em valor inválido.
- [x] 2.3 Exibir desconto global calculado por `totalComDescontoDosItens - valorFinal` e verificar em tela que o valor muda em tempo real ao editar o campo.

## 3. Desconto por item persistente no backend

- [x] 3.1 Implementar chamadas de aplicar/remover desconto por item nos endpoints `/eventos/{eventoId}/produtos/{produtoEventoId}/desconto` e verificar respostas de sucesso/erro com mensagens da API.
- [x] 3.2 Conectar `VendaProdutoCard` e fluxo de desconto para usar backend (em vez de persistência apenas local) e verificar que após confirmar venda o desconto continua aplicado no cardápio.
- [x] 3.3 Garantir invalidação/refetch de queries de cardápio/evento após aplicar ou remover desconto e verificar que “Remover desconto” retorna o preço original na UI.

## 4. Histórico, detalhe e cancelamento no contrato real

- [x] 4.1 Migrar `useHistoricoVendas` e `HistoricoVendasView` para o novo modelo de histórico (sem dependência de campos legados) e verificar listagem paginada com page 1-based na UI.
- [x] 4.2 Alterar `VendaDetalhesModal` para carregar detalhes sob demanda via `GET /eventos/{eventoId}/vendas/{vendaId}` e verificar renderização de itens e totais do backend.
- [x] 4.3 Migrar cancelamento para `POST /eventos/{eventoId}/vendas/{vendaId}/cancelamento` tratando `204` como sucesso e verificar atualização do status para cancelada após refetch.

## 5. Verificação integrada do fluxo de vendas

- [x] 5.1 Executar validação manual ponta a ponta (aplicar desconto, editar valor final, registrar, listar, detalhar e cancelar venda) e registrar evidências no PR/checklist da change.
- [x] 5.2 Rodar `npm run build` (e testes existentes de vendas, se houver) após a migração e verificar ausência de regressões de compilação no módulo.

## Workflow follow-up

- Revisar os artifacts com o time antes de iniciar implementação.
- Quando aprovado, executar `/opsx-apply` para implementar a change.
