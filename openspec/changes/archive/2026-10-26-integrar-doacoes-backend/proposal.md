# Proposal

## Why

O módulo de doações no frontend ainda usa contrato legado (`/donations`, tipos e campos em inglês, IDs string e expectativa de retorno no `PUT`) que diverge da API real em `/doacoes`. Essa divergência gera inconsistências funcionais e impede integração estável fim a fim com regras de negócio atuais do backend.

## What Changes

- **BREAKING** Doações passa a usar contrato API-native (`id` numérico, tipos `DINHEIRO|PRODUTO|REABASTECIMENTO`, paginação 0-based na API com adaptação para UI 1-based).
- Frontend de doações migra de `/donations` para `/doacoes` em listagem, criação e edição, com adaptação de payload e response para o domínio real.
- Fluxo de edição passa a respeitar `PUT /doacoes/{id}` com resposta `204` sem corpo, recarregando estado via invalidação/refetch.
- `DoacaoResponse` na API passa a incluir `eventoNome` como campo obrigatório de resposta, com tratamento resiliente de inconsistências legadas sem quebrar listagens completas.
- A ação de excluir doação permanece visível e habilitada no frontend, mas sem chamada de exclusão no backend nesta fase; ao acionar, exibe toast de indisponibilidade temporária.
- Normalização de forma de pagamento e tipo de doação no frontend para valores aceitos pelo backend (`DEBITO`, `CREDITO`, etc.).

## Capabilities

### New Capabilities
- `doacoes`: integração completa do módulo de doações com contrato da API real, incluindo listagem, filtros, criação, edição, apresentação de evento associado e comportamento temporário da ação de exclusão.

### Modified Capabilities
- `eventos`: o detalhe do evento passa a consumir doações no contrato atualizado com `eventoNome` para exibição consistente entre páginas de evento e doações.

## Impact

- Frontend web:
  - `src/features/doacoes/models/*`
  - `src/features/doacoes/services/*`
  - `src/features/doacoes/hooks/*`
  - `src/features/doacoes/components/DoacaoModal.tsx`
  - `src/features/doacoes/pages/DoacoesPage.tsx`
  - Ajustes pontuais em consumidores relacionados (ex.: detalhe de evento/relatórios, se necessário)
- Backend API:
  - `src/main/java/com/kaikancachoeira/api/doacao/dto/DoacaoResponse.java`
  - `src/main/java/com/kaikancachoeira/api/doacao/service/DoacaoService.java`
  - Possíveis ajustes em `openapi.yaml` para refletir contrato atualizado
- Compatibilidade:
  - Mudança de contrato de dados no frontend (tipos e mapeamentos)
  - Sem introdução de endpoint de exclusão nesta change
