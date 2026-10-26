# Proposal

## Why

O módulo de registro de vendas ainda usa contrato legado (`/sales`) e diverge da API real em rotas, payloads, paginação, cancelamento e detalhes. Isso causa inconsistência funcional (ex.: desconto por item não persiste) e bloqueia a operação confiável do PDV no contrato oficial do backend.

## What Changes

- Migrar o fluxo de registro, histórico, detalhe e cancelamento para os endpoints reais de vendas em `/eventos/{eventoId}/vendas`.
- Alinhar modelos e adapters do frontend ao contrato API-native (IDs numéricos, campos em português, paginação `itens/page/size/totalItens/totalPaginas` com adaptação para UI 1-based).
- Integrar desconto por produto no fluxo de vendas via endpoints de desconto do cardápio, preservando o desconto após concluir uma venda e removendo apenas por ação explícita.
- Incluir no resumo da venda campo editável de valor final para desconto global da venda, enviando `valorFinal` no registro e exibindo desconto calculado como diferença para o total dos itens já descontados.
- Ajustar histórico e modal de detalhe para o contrato real, incluindo consulta de detalhe sob demanda e tratamento de cancelamento com resposta `204 No Content`.

## Capabilities

### New Capabilities
- `vendas`: registro de venda, histórico, detalhe, cancelamento, descontos por item persistentes e desconto global por valor final no contrato real da API.

### Modified Capabilities
- (nenhuma)

## Impact

- Frontend: `src/features/vendas/*` (models, services, hooks, components, pages, provider/domain).
- Frontend compartilhado: possíveis ajustes em helpers de paginação e formatação usados por vendas.
- Integrações API: `POST/GET /eventos/{eventoId}/vendas`, `GET /eventos/{eventoId}/vendas/{vendaId}`, `POST /eventos/{eventoId}/vendas/{vendaId}/cancelamento`, `PATCH/DELETE /eventos/{eventoId}/produtos/{produtoEventoId}/desconto`.
- Compatibilidade: remoção de dependência do contrato legado `/sales` no módulo de vendas.
