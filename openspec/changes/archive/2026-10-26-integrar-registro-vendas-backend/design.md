# Design

## Context

Ver motivação em `proposal.md`.

Estado atual observado:
- `src/features/vendas/services/vendas.ts` ainda usa `/sales` com contrato legado.
- Modelos de vendas usam campos em inglês e IDs `string`, divergindo dos DTOs reais (`/eventos/{eventoId}/vendas`).
- O detalhe atual usa dados da linha do histórico, mas o backend real fornece endpoint dedicado de detalhe.
- Desconto por item no frontend está local ao carrinho/provider; não persiste no cardápio após registrar venda.
- O backend possui endpoints específicos para desconto por item em produto do evento e para cancelamento com `204`.

## Goals / Non-Goals

**Goals:**
- Migrar integração de vendas para contrato real da API por evento.
- Separar claramente desconto por item (persistente no cardápio) de desconto global da venda (`valorFinal`).
- Garantir histórico e detalhe consistentes com endpoint real, com paginação adaptada para UI.
- Tratar cancelamento com sucesso em resposta sem corpo.

**Non-Goals:**
- Alterar regras de negócio do backend de vendas/desconto/cancelamento.
- Redesenhar layout completo das telas de vendas além do necessário para o novo contrato.
- Introduzir novas permissões, novos endpoints ou mudanças de schema backend.

## Decisions

1. **Adapter API-native de vendas no frontend**
   - Decisão: substituir chamadas `/sales` por `/eventos/{eventoId}/vendas*`, com mapeamento explícito de request/response.
   - Racional: reduz acoplamento com contrato legado e elimina conversões implícitas inconsistentes.
   - Alternativa considerada: manter camada legado e converter internamente. Rejeitada por manter dívida técnica e ambiguidade de campos.

2. **Dois níveis de desconto com responsabilidades distintas**
   - Decisão: desconto por item usa PATCH/DELETE de desconto do produto do evento (persistente); desconto da venda usa `valorFinal` no POST da venda (transacional).
   - Racional: alinha com semântica do backend e com comportamento esperado pela operação do PDV.
   - Alternativa considerada: continuar desconto por item apenas local em memória. Rejeitada por perder persistência após venda/refetch.

3. **Campo editável de valor final no resumo**
   - Decisão: incluir `valorFinal` controlado no resumo da venda com validação `0 <= valorFinal <= totalItensComDesconto` e cálculo derivado `descontoVenda = totalItensComDesconto - valorFinal`.
   - Racional: atende regra de desconto global sem quebrar descontos por item já aplicados.
   - Alternativa considerada: manter total sempre calculado sem edição. Rejeitada por não cobrir requisito de desconto na venda.

4. **Detalhe de venda sob demanda**
   - Decisão: ao abrir modal de detalhes, consultar `GET /eventos/{eventoId}/vendas/{vendaId}`.
   - Racional: o histórico não carrega itens por venda; detalhamento vem do endpoint dedicado.
   - Alternativa considerada: embutir itens no histórico localmente. Rejeitada por custo e inconsistência com API.

5. **Cancelamento com 204 e invalidação de cache**
   - Decisão: tratar `204 No Content` como sucesso e atualizar queries relacionadas por invalidação.
   - Racional: segue contrato backend e mantém telas de vendas/evento consistentes.
   - Alternativa considerada: exigir payload de confirmação. Rejeitada por não refletir API real.

## Risks / Trade-offs

- **[Risco] Quebra em componentes que esperam modelo legado** -> **Mitigação:** introduzir tipos API-native com adapters e ajustar usos por etapas (services -> hooks -> UI).
- **[Risco] Inconsistência entre estado local do carrinho e desconto persistido no cardápio** -> **Mitigação:** invalidar e recarregar cardápio após aplicar/remover desconto.
- **[Risco] Erro de borda na conversão de data/fuso para filtros do histórico** -> **Mitigação:** centralizar conversão de datas para ISO no adapter de params.
- **[Trade-off] Mais chamadas de rede ao abrir detalhe** -> **Mitigação:** carregar sob demanda e manter UX com estado de loading no modal.

## Migration Plan

1. Atualizar modelos e serviço de vendas para contrato real, mantendo compilação.
2. Migrar hooks/mutations para novos payloads, respostas e invalidações.
3. Ajustar UI de registro/histórico/detalhe para campos API-native.
4. Integrar ações de aplicar/remover desconto no backend e remover dependência de persistência local para esse comportamento.
5. Introduzir campo de `valorFinal` no resumo e enviar no registro de venda.
6. Validar fluxo ponta a ponta: registrar, listar, detalhar, cancelar e persistir desconto por item.

Rollback:
- Reverter change do frontend para a versão anterior da integração de vendas.
- Como não há migração de dados local persistente, rollback é apenas de código.

## Open Questions

- Nenhuma em aberto que altere escopo, abordagem técnica ou decomposição de tarefas.
