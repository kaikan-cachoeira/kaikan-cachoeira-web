# Proposal

## Why

O frontend está organizado por tipo técnico (`pages`, `components`, `hooks`, `services`, `context`), o que espalha cada domínio por várias pastas e esconde o acoplamento entre features. Isso dificulta localizar responsabilidades, manter contratos tipados e evoluir o sistema sem quebrar telas vizinhas. A refatoração cria uma base por features antes que o projeto cresça e acumule mais dependências cruzadas.

## What Changes

- Reorganizar `src/` em `app/`, `shared/` e `features/`, com `app` como composition root, `shared` como infraestrutura reutilizável e `features` como fatias verticais de domínio.
- Traduzir as pastas das features para `inventario`, `eventos`, `vendas`, `caixa` e `doacoes`; manter `auth` e `home`.
- Mover a UI genérica para `shared/components` (renomeando `shared/ui` para `shared/components`) e manter na feature apenas componentes específicos do domínio.
- Estruturar cada feature em `pages` (containers), `components` (view burra), `widgets` (UI conectada reutilizável), `hooks` (viewmodels e consultas), `services` (acesso ao backend), `models` (contratos) e `domain` (regras puras, quando houver).
- Adotar barris públicos (`index.ts`) por feature e permitir importação entre features somente por `@/features/<nome>`.
- Definir um DAG explícito de dependências entre features, eliminando o ciclo atual entre eventos e vendas.
- Traduzir nomes de arquivos, interfaces, funções, hooks e variáveis para português, mantendo termos estruturais como `App`, `Page`, `Query`, `Mutations`, `Header`, `Sidebar`, `Layout`, `keys`, `Card`, `Modal`, `Toast`, `Provider` e `View`.
- Manter nomes de campos das models em inglês, seguindo o contrato do backend, e remover qualquer camada de mapeamento entre DTO e modelo de UI.
- Converter o código para TypeScript de forma incremental, feature por feature, com `strict: true` e `allowJs` temporário durante a migração.
- Introduzir aliases de importação (`@/*`), script de typecheck e verificação de fronteiras entre features.
- Centralizar namespaces de cache em `shared/query/keys.ts` para permitir invalidação entre features sem imports cruzados.
- Remover o template Vite não utilizado (`App.tsx`, `main.tsx`, `App.css`, `index.css` antigos).
- **BREAKING**: todos os caminhos de importação internos mudam. Não há mudança de contrato de API, comportamento visível ou dependências de runtime.

## Capabilities

### New Capabilities

Nenhuma. Esta mudança é um refactor estrutural sem alteração de comportamento observável; por isso o change declara `skip_specs: true`.

### Modified Capabilities

Nenhuma. Não há specs existentes no projeto e nenhum requisito de comportamento muda.

## Impact

- Afetado: todo o código em `src/`, imports, `vite.config.ts`, `tsconfig.app.json`, `.oxlintrc.json` e configuração de verificação de fronteiras.
- Não afetado: contrato da API, backend, dependências de runtime, textos, fluxos de tela e comportamento funcional.
- Ferramentas de desenvolvimento: podem ser adicionados `dependency-cruiser` (fronteiras entre features) e `vitest` (teste unitário do carrinho), sem impacto no bundle.
- Risco principal: quebra temporária de imports durante a migração; mitigado por aliases, shims temporários e gate de `typecheck`, `lint` e `build` ao fim de cada fase.
