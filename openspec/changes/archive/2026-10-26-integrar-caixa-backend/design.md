# Design

## Context

Ver motivação em `proposal.md`.

Estado atual observado:
- `src/features/caixa/services/caixa.ts` usa endpoints legados (`/cash`).
- `src/features/caixa/services/fiados.ts` usa endpoints legados (`/fiados`, `/settle`, `/unsettle`).
- Tipos frontend de caixa/fiados estão em inglês e com IDs `string`, divergindo do contrato backend (enum API-native e IDs numéricos).
- Backend real expõe contratos por evento (`/eventos/{eventoId}/caixa` e `/eventos/{eventoId}/fiados`).
- Modal de quitação atual aceita valor parcial, mas o backend de quitação aceita apenas `formaPagamento` (quitação total).

## Goals / Non-Goals

**Goals:**
- Migrar integração de caixa e fiados do evento atual para os endpoints reais por evento.
- Alinhar models/services/hooks ao contrato backend (payloads, enums e paginação).
- Garantir consistência entre histórico, resumo, fiados e quitação após mutations.
- Adequar UX de quitação ao contrato real (sem valor parcial).

**Non-Goals:**
- Alterar regras de negócio do backend para caixa/fiados.
- Integrar ou refatorar `FiadosGeraisPage` nesta change.
- Redesenhar UI além dos ajustes necessários para o novo contrato.

## Decisions

1. **Adapter API-native dedicado em `features/caixa`**
   - Decisão: mapear request/response de caixa e fiados no service layer.
   - Racional: manter componentes desacoplados do contrato bruto da API e reduzir impacto em UI.
   - Alternativa considerada: usar payload/response da API direto nos componentes. Rejeitada por aumentar acoplamento e risco de regressão.

2. **Escopo estrito por evento atual**
   - Decisão: integrar apenas `/caixa`, `/caixa/fiado`, `/caixa/fiados` usando `eventoId` do evento em andamento.
   - Racional: decisão de produto já confirmada; reduz risco e acelera entrega.
   - Alternativa considerada: incluir `/relatorio-geral/fiados`. Rejeitada por ser contexto multi-evento fora do escopo aprovado.

3. **Mapeamento explícito de enums UI <-> API**
   - Decisão: traduzir labels amigáveis para enums backend (`VENDA_FICHA`, `DEVOLUCAO_FICHA`, `PIX`, `DEBITO`, etc.) no adapter.
   - Racional: preservar UX atual sem enviar valores inválidos para API.
   - Alternativa considerada: substituir labels da UI por enums brutos. Rejeitada por piorar legibilidade.

4. **Quitação total de fiado no frontend**
   - Decisão: remover/ignorar entrada de valor na quitação e enviar apenas `formaPagamento` em `PATCH /quitacao`.
   - Racional: aderência ao contrato real e eliminação de falsa expectativa de quitação parcial.
   - Alternativa considerada: manter campo valor e adaptar localmente. Rejeitada por incompatibilidade com API.

5. **Invalidação coordenada de queries após mutações**
   - Decisão: após registrar/excluir/quitar, invalidar `caixa`, `fiados`, `eventos` e `vendas` conforme impacto.
   - Racional: garantir atualização consistente de resumo, histórico e contadores.
   - Alternativa considerada: atualização otimista manual por tela. Rejeitada por maior complexidade e risco de inconsistência.

## Risks / Trade-offs

- **[Risco] Divergência de mapeamento de enum entre filtros e payload** -> **Mitigação:** centralizar conversões em funções utilitárias únicas no service layer.
- **[Risco] Regressão visual por mudança em campos (ex.: status de fiado)** -> **Mitigação:** manter contrato interno estável nos componentes através de adapter.
- **[Risco] Quebra por diferenças de paginação (0-based/1-based)** -> **Mitigação:** padronizar adaptação no serviço e validar navegação de páginas em todas as telas de caixa.
- **[Trade-off] Menos flexibilidade imediata na quitação (sem valor parcial)** -> **Mitigação:** mensagem clara na UI e possível proposta futura se backend suportar parcial.

## Migration Plan

1. Atualizar models de caixa/fiados para contrato API-native com tipos e enums alinhados.
2. Reescrever services de caixa/fiados para endpoints por evento e adapters de request/response.
3. Ajustar hooks de queries/mutations e invalidação de cache.
4. Adequar componentes/páginas de caixa e fiados do evento atual aos novos campos/fluxos.
5. Validar comportamento ponta a ponta no escopo aprovado (histórico, filtros, registro, exclusão, quitação).

Rollback:
- Reverter alterações do frontend para os services/models/hooks anteriores.
- Como não há migração de dados local, rollback é apenas de código.

## Open Questions

- Nenhuma em aberto que altere escopo, abordagem técnica ou decomposição de tarefas.
