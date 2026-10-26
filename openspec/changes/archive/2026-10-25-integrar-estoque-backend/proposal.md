# Proposal

## Why

O módulo de estoque/inventário do frontend ainda usa contrato legado de demonstração (`/products`, IDs string, campos em inglês e detalhe embutido), enquanto a API real já expõe o domínio completo em `/produtos`, `/categorias`, `/tipos-movimentacao`, `/produtos/{id}/estoques` e históricos paginados. Essa divergência impede integração fim a fim com o backend Spring Boot e mantém comportamentos inconsistentes entre ambientes.

## What Changes

- **BREAKING** Inventário passa a usar modelos alinhados ao contrato da API (`id: number`, `nome`, `quantidadeAtual`, `estoqueMinimo`, `categoria`, `fotoUrl`, etc.), seguindo o mesmo padrão adotado em eventos.
- Listagem e detalhe de produtos passam a consumir rotas reais (`GET /produtos`, `GET /produtos/{id}`), com composição de detalhe por múltiplas consultas (produto + lotes + movimentações).
- CRUD de produto passa a usar as rotas reais, incluindo foto em fluxo multipart separado (`POST /produtos/{id}/foto`) e exclusão em `DELETE /produtos/{id}`.
- Categorias passam a consumir `GET/POST/PUT/DELETE /categorias` com tratamento de conflitos de exclusão.
- Movimentações passam a usar tipos vindos de `GET /tipos-movimentacao`, criação por `tipoMovimentacaoId` e históricos paginados reais (`/produtos/{id}/movimentacoes`, `/estoques/{id}/movimentacoes`) com adaptação de paginação 0-based para a UI 1-based.
- `CONSUMO_INTERNO` passa a exigir seleção de reunião, buscando eventos via módulo de eventos.
- Pré-requisito na API: incluir `eventoNome` na resposta de movimentações sem migration, resolvendo o nome no serviço.
- Consumidores de catálogo (cardápio de eventos, doações e relatório geral) são adaptados para o novo contrato de produto sem expandir escopo funcional dessas features.
- O adapter demo permanece intocado nesta change.
- Não será criado helper de permissões nesta change.

## Capabilities

### New Capabilities
- `estoque`: integração completa do estoque no frontend com produtos, categorias, lotes, movimentações, foto e exclusão, refletindo o contrato da API real.

### Modified Capabilities
- `evento-cardapio`: atualização do consumo do catálogo de produtos para o novo contrato de estoque (IDs numéricos e campos API-native), sem alterar o comportamento funcional do cardápio.

## Impact

- Frontend inventário: `src/features/inventario/**` (models, services, hooks, páginas, componentes e widgets).
- Consumidores de produtos em outras features: `src/features/eventos/components/AdicionarProdutoCardapioModal.tsx`, `src/features/doacoes/components/DoacaoModal.tsx`, `src/features/relatorio/hooks/useRelatorio.ts`.
- Infra compartilhada: possíveis ajustes de tipagem/chaves de query em `src/shared/**` para suportar o novo contrato.
- API (`../kaikan-cachoeira-api`): DTO e serviço de movimentações para expor `eventoNome` em `MovimentacaoResponse`.
- Operação em runtime: modo `VITE_DEMO_MODE=true` continua sem suporte para o inventário integrado; validação ocorre contra backend real.
