# Design

## Context

Ver `proposal.md` - Why. Restrições técnicas observadas no estado atual:

- Frontend de doações ainda usa contrato legado (`/donations`, tipos locais `ready|money|ingredient`, IDs string).
- Backend real expõe doações em `/doacoes`, com paginação 0-based (`itens/page/size/totalItens/totalPaginas`) e `PUT` retornando `204` sem corpo.
- Backend não expõe endpoint de exclusão de doação nesta fase.
- A tela de doações depende de nome do evento para renderização da tabela (`eventName`), mas o `DoacaoResponse` atual não retorna esse campo.

## Goals / Non-Goals

**Goals:**

- Alinhar models/services/hooks/UI de doações ao contrato real da API.
- Incluir `eventoNome` em `DoacaoResponse` para exibição consistente no frontend.
- Garantir edição com `PUT 204` e sincronização correta de cache/listagem.
- Manter ação de excluir visível e habilitada, com feedback explícito de indisponibilidade.

**Non-Goals:**

- Criar endpoint backend de exclusão de doação.
- Redesenhar UX completa da tela de doações além dos ajustes de integração.
- Alterar regras de negócio de doação no backend além de enriquecer resposta com `eventoNome`.

## Decisions

1. **Contrato API-native no frontend de doações**
   - Decisão: migrar `Doacao` para IDs numéricos, enums de backend e campos em português do domínio (`eventoId`, `eventoNome`, `valorFicha`, etc.).
   - Racional: reduz adapters implícitos espalhados e evita erros de tipagem/mapeamento em listagem, modal e filtros.
   - Alternativa considerada: manter contrato legado com adapters por chamada. Rejeitada por manter alta complexidade acidental e inconsistências futuras.

2. **Adapter explícito no service para paginação e enums**
   - Decisão: concentrar mapeamento request/response no layer `services/doacoes.ts` (0-based↔1-based, tipo e forma de pagamento).
   - Racional: preserva componentes focados em apresentação e simplifica testes.
   - Alternativa considerada: mapear direto em hooks/componentes. Rejeitada por duplicação e maior risco de divergência.

3. **`eventoNome` obrigatório no payload de resposta com resiliência operacional**
   - Decisão: enriquecer `DoacaoResponse` com `eventoNome` resolvido no backend; em inconsistências legadas, tratar registro problemático sem derrubar listagem completa.
   - Racional: mantém contrato de UI e reduz necessidade de N+1 chamadas de eventos no frontend.
   - Alternativa considerada: resolver nome do evento no frontend via cache de eventos. Rejeitada por acoplamento adicional e menor confiabilidade em telas com filtros.

4. **Excluir sem backend nesta fase**
   - Decisão: manter ação de excluir habilitada, interceptar fluxo no frontend e exibir toast "Exclusão de doação ainda não disponível" sem requisição DELETE.
   - Racional: atende decisão de produto sem introduzir endpoint novo agora.
   - Alternativa considerada: remover ou desabilitar botão. Rejeitada por decisão explícita de manter botão habilitado.

## Risks / Trade-offs

- **[Risco]** Divergência entre rótulos UI e enums backend (ex.: `Débito` vs `DEBITO`) → **Mitigação:** normalização centralizada no service + validação com testes manuais de criação/edição.
- **[Risco]** Regressão no detalhamento de evento ao alterar contrato de doações → **Mitigação:** incluir validação de smoke em `EventoDetalhesPage` para seções de doações.
- **[Risco]** Botão excluir habilitado pode sugerir funcionalidade completa → **Mitigação:** toast claro e imediato informando indisponibilidade temporária.
- **[Trade-off]** `eventoNome` obrigatório com tratamento resiliente aumenta complexidade no service backend → **Mitigação:** resolver nome em lote e isolar tratamento de inconsistência ao item.

## Migration Plan

1. Atualizar DTO/serviço no backend para retorno de `eventoNome` e ajuste de documentação OpenAPI.
2. Migrar models/services/hooks do frontend de doações para contrato `/doacoes`.
3. Adaptar `DoacaoModal` e `DoacoesPage` para tipos/enums novos e `PUT 204`.
4. Ajustar ação de excluir para comportamento de toast sem chamada backend.
5. Executar validações (`typecheck`, lint, testes existentes) e smoke manual de fluxos de doação e detalhe de evento.

Rollback:
- Frontend: reverter para serviço legado anterior de doações.
- Backend: remover `eventoNome` do DTO e mapeamento adicional, mantendo endpoints existentes.

## Open Questions

- Nenhuma. As decisões de contrato (`eventoNome` obrigatório) e UX transitória de exclusão (toast com botão habilitado) foram fechadas nesta exploração.
