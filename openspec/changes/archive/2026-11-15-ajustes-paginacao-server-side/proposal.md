# Proposal

## Why

O frontend ainda mistura paginação server-side com filtragem e resumo locais em pontos importantes, o que gera listas parciais, totais inconsistentes e risco de o usuário tomar decisões com base em dados incompletos. Esta mudança alinha as telas ao contrato real da API para que paginação, filtros e métricas reflitam o conjunto correto de dados.

## What Changes

- **BREAKING**: a listagem de eventos passa a depender da paginação retornada pela API, em vez de paginar e filtrar tudo no cliente.
- **BREAKING**: o cardápio do evento passa a consumir paginação/filtros server-side, preservando fallback para consumidores que precisam da lista integral.
- **BREAKING**: a listagem de produtos do estoque passa a usar paginação server-side e o filtro de situação passa a refletir o conjunto real consultado pela API.
- **BREAKING**: a listagem de fiados por evento passa a ser paginada server-side e os resumos associados deixam de depender apenas da página carregada.
- A UI mantém compatibilidade com seleções e fluxos que precisam de listas completas, carregando todas as páginas quando necessário.
- As telas continuam expondo os mesmos fluxos de consulta e manutenção, mas com dados mais consistentes entre módulos.

## Capabilities

### New Capabilities
- `carregamento-lista-integral`: carregamento completo de coleções paginadas quando uma tela ou modal precisa da lista inteira para seleção ou composição de opções.

### Modified Capabilities
- `eventos`: listagem de eventos passa a consumir paginação server-side e filtros alinhados ao contrato da API.
- `evento-cardapio`: consulta do cardápio passa a usar paginação e filtros server-side, com fallback para consumo integral quando necessário.
- `estoque`: catálogo de produtos passa a usar paginação server-side e filtro de situação alinhado à resposta da API.
- `caixa`: fiados do evento passam a usar paginação server-side e os totais exibidos precisam refletir o conjunto completo, não apenas a página atual.

## Impact

- `src/features/eventos/**`
- `src/features/eventos/pages/EventoCardapioPage.tsx`
- `src/features/inventario/**`
- `src/features/caixa/**`
- `src/features/relatorio/**`
- `src/features/doacoes/**` e `src/features/vendas/**` para consumidores de listas completas em modais e seletores
- Contratos de paginação consumidos pelo frontend (`items/page/pageSize/total/totalPages`)
