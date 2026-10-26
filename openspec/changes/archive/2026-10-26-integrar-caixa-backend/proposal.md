# Proposal

## Why

O módulo de Caixa ainda consome contratos legados (`/cash` e `/fiados`) e diverge da API real por evento, gerando inconsistências de tipos, filtros e regras de quitação. Integrar ao backend real é necessário para garantir comportamento confiável no evento em andamento.

## What Changes

- Migrar o fluxo de histórico, registro e exclusão de lançamentos para `GET/POST/DELETE /eventos/{eventoId}/caixa`.
- Migrar o fluxo de fiados do evento para `GET /eventos/{eventoId}/fiados` e `PATCH /eventos/{eventoId}/fiados/{fiadoId}/quitacao`.
- Alinhar modelos frontend ao contrato API-native (IDs numéricos, enums backend, paginação `itens/page/size/totalItens/totalPaginas`).
- Ajustar filtros de caixa para `tipo` e `formaPagamento` com mapeamento entre labels da UI e enums da API.
- Ajustar quitação de fiado para semântica do backend (quitação total com `formaPagamento`, sem valor parcial).
- Escopo explícito desta change: somente telas de evento-atual (`/caixa`, `/caixa/fiado`, `/caixa/fiados`).

## Capabilities

### New Capabilities
- `caixa`: gestão de lançamentos e fiados no evento em andamento usando contrato real da API, incluindo filtros, resumo, quitação e exclusão.

### Modified Capabilities
- (nenhuma)

## Impact

- Frontend: `src/features/caixa/*` (models, services, hooks, pages e componentes de lançamento/quitação).
- Integração com evento atual: consumo de `useEventoAtualQuery` para `eventoId` obrigatório nas chamadas de caixa/fiados.
- API consumida: `/eventos/{eventoId}/caixa`, `/eventos/{eventoId}/caixa/{lancamentoId}`, `/eventos/{eventoId}/fiados`, `/eventos/{eventoId}/fiados/{fiadoId}/quitacao`.
- Fora de escopo nesta change: `/relatorio-geral/fiados` (visão geral de múltiplos eventos).
