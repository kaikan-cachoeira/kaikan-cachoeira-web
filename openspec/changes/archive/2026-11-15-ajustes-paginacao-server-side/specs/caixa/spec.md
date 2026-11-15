# Spec Delta

## MODIFIED Requirements

### Requirement: Listagem de fiados do evento
Fiados do evento atual SHALL ser consultados por `GET /eventos/{eventoId}/fiados`, com filtro opcional de situação, paginação server-side e exibição consistente de pendente ou quitado.

#### Scenario: Filtro por situação
- **WHEN** o usuário seleciona pendente ou quitado
- **THEN** a consulta envia `situacao` no formato esperado pela API e a lista exibe apenas os itens correspondentes

#### Scenario: Navegação de páginas
- **WHEN** o usuário troca de página na lista de fiados
- **THEN** a consulta mantém a paginação server-side e a UI exibe os itens da página retornada pela API

## ADDED Requirements

### Requirement: Resumo global de fiados do evento
O sistema SHALL exibir os totais de fiados em aberto com base no conjunto completo de fiados do evento e não apenas nos itens da página atual.

#### Scenario: Totais persistem entre páginas
- **WHEN** o usuário navega entre páginas da listagem de fiados
- **THEN** os totais exibidos de pendentes e valor em aberto permanecem consistentes com o conjunto filtrado completo

#### Scenario: Totais refletem filtros
- **WHEN** o usuário altera a situação filtrada
- **THEN** os totais exibidos são recalculados para o conjunto correspondente ao filtro selecionado
