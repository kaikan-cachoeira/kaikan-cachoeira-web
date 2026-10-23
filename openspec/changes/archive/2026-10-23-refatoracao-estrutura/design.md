# Design

## Context

O frontend é uma SPA React 19 + Vite + TanStack Query + React Router, atualmente com ~10,8 mil linhas em JS/JSX e organização por tipo técnico: `pages/`, `components/`, `hooks/`, `services/` e `context/`. O entry real é `src/main.jsx`; `App.tsx`, `main.tsx`, `App.css` e `index.css` são resquícios do template Vite e não participam do bundle.

O domínio não é verticalmente limpo. `events` consome `inventory` (`useProducts`, `useCategories`, `CategoriesModal`), `donations` consome `inventory` e `events`, `sales`, `cash` e `home` consomem `events`, e `events` importa UI de `sales`. Além disso, `useEvents` invalida queries de cash, fiados, donations e sales, criando acoplamento de cache entre domínios.

Restrições:

- Nenhuma mudança de comportamento observável, contrato de API ou dependência de runtime.
- O backend e o adaptador demo continuam com os mesmos campos e endpoints.
- A migração precisa manter `typecheck`, `lint` e `build` verdes ao fim de cada fase.
- O código autoral passa a ser em português; termos estruturais e campos de contrato permanecem em inglês.

## Goals / Non-Goals

**Goals:**

- Criar fatias verticais por feature com fronteiras explícitas e importação apenas por barril público.
- Separar apresentação (view burra), viewmodel (hooks), acesso a dados (services) e contratos (models).
- Eliminar o ciclo `events <-> sales` e reduzir o acoplamento de cache entre features.
- Migrar para TypeScript de forma incremental, sem big bang.
- Deixar a base pronta para novas features seguirem o mesmo padrão.

**Non-Goals:**

- Alterar telas, textos, rotas públicas, regras de negócio ou respostas da API.
- Introduzir validação de runtime (Zod) ou testes de integração nesta mudança.
- Redesenhar componentes visuais ou tokens.
- Trocar TanStack Query, axios, React Router ou o adaptador demo.
- Corrigir comportamentos existentes fora do escopo estrutural.

## Decisions

### 1. `app` / `shared` / `features`

`app/` vira o composition root: `App.tsx`, rotas, layouts e providers. `shared/` concentra UI genérica, cliente HTTP, adaptador demo, modelos de paginação, chaves de cache, utilitários e estilos. `features/` concentra o domínio.

Alternativa considerada: manter `pages/`, `hooks/` e `services/` e apenas agrupar por subpastas de domínio. Rejeitada porque preserva a dispersão e não cria fronteira de importação.

### 2. Barris públicos e DAG

Cada feature expõe somente `index.ts`. Importações entre features usam `@/features/<nome>`; imports profundos são proibidos. O DAG permitido é:

```
auth        -> (nenhuma)
inventario  -> (nenhuma)
eventos     -> inventario
doacoes     -> inventario, eventos
vendas      -> eventos
caixa       -> eventos
home        -> eventos
```

`app` pode importar qualquer feature e `shared`. `shared` não importa `features` nem `app`. Features não importam `app`.

`EventSalesPage` (`EventoVendasPage`) passa para `vendas`, porque é uma tela de vendas e não de eventos. Isso remove o ciclo `eventos -> vendas`.

`CategoriasModal` permanece como widget conectado de `inventario` e é exportado no barril, pois `eventos` precisa gerenciar categorias ao montar o cardápio. É a única UI conectada que atravessa feature.

### 3. Responsabilidades das camadas

| Pasta | Responsabilidade | Pode usar |
|---|---|---|
| `pages/` | Container de rota; compõe viewmodel, widgets e view | hooks, widgets, components, models da própria feature |
| `components/` | View burra; só props e estado local de UI | `useState`, `useRef`, `useForm`; não usa hooks de dados/contexto |
| `widgets/` | UI conectada reutilizável, dona dos próprios hooks | hooks da própria feature; exportada pelo barril |
| `hooks/` | Viewmodels (`useX`) e hooks de dados (`useXQuery`, `useXMutations`) | services, models, TanStack Query |
| `services/` | Acesso ao backend, funções tipadas e sem estado React | `shared/api/cliente`, models |
| `models/` | Contratos de resposta e payloads | nada além de tipos |
| `domain/` | Regras puras testáveis (ex.: carrinho) | models e funções puras |

Alternativa considerada: permitir que componentes conectados usem hooks livremente. Rejeitada porque mantém o padrão atual de páginas e modais “inteligentes” e dificulta testar a view.

### 4. Convenção de nomes

Código autoral em português, com tradução termo a termo e preservação de termos estruturais.

Mantidos em inglês: `App`, `Page`, `Query`, `Mutations`, `Header`, `Sidebar`, `Layout`, `keys`, `Card`, `Modal`, `Toast`, `Provider`, `View`, `Thumb`/`Stepper` quando já consagrados.

Exemplos:

| Antes | Depois |
|---|---|
| `SearchBar` | `BarraPesquisa` |
| `ProductCard` | `ProdutoCard` |
| `CategoriesModal` | `CategoriasModal` |
| `InventoryPage` | `InventarioPage` |
| `EventDetailsPage` | `EventoDetalhesPage` |
| `CashEntryPanel` | `PainelLancamentoCaixa` |
| `AddMenuProductModal` | `AdicionarProdutoCardapioModal` |
| `AppRoutes` | `AppRoutes` |
| `NotFoundPage` | `PaginaNaoEncontrada` |
| `PendingPage` | `PaginaPendente` |
| `HomePage` | `HomePage` |

Features traduzidas: `inventario`, `eventos`, `vendas`, `caixa`, `doacoes`. Mantidas: `auth`, `home`.

Imports de CSS module usam sempre `styles`:

```ts
import styles from "./ProdutoCard.module.css";
```

### 5. Models em português, campos em inglês, sem mapeamento

Arquivos e interfaces em português; campos espelham o backend em inglês. Não existe `*Resposta` nem `mapeadores.ts`.

Exemplo:

```ts
export interface Produto {
  id: string;
  name: string;
  description: string;
  categoryId: string | null;
  category: string;
  quantity: number;
  minStock: number;
  image: string | null;
  createdAt: string;
  lots: LoteProduto[];
  movements: MovimentacaoProduto[];
  lowStock: boolean;
}
```

Services retornam essas interfaces diretamente. A única tradução admitida é a montagem de parâmetros de consulta no viewmodel (ex.: `situacaoEstoque: "baixo"` -> `stock: "low"`), sem camada de mapeamento de modelos.

Alternativa considerada: DTO em inglês + modelo de domínio em português + mapeadores. Rejeitada pelo usuário; adiciona boilerplate e o contrato pode ser adaptado depois.

### 6. Hooks: viewmodel, `Query` e `Mutations`

- Viewmodel da página: `use<Feature>` — `useInventario`, `useEventos`, `useEventoDetalhes`, `useVendas`, `useCaixa`, `useDoacoes`, `useHome`, `useAutenticacao`.
- Consultas: `use<Entidade>Query` — `useProdutosQuery`, `useCategoriasQuery`, `useEventoAtualQuery`.
- Mutações agrupadas por entidade: `use<Entidade>Mutations.ts` — `useProdutoMutations`, `useCategoriaMutations`, `useEventoMutations`, `useVendaMutations`, `useCaixaMutations`, `useDoacaoMutations`.

O viewmodel concentra estado de UI, filtros, modais, derivações e ações. A página não faz fetch, não chama service e não conhece axios.

### 7. Cache entre features

`shared/query/keys.ts` guarda apenas namespaces:

```ts
export const queryKeys = {
  produtos: ["produtos"],
  categorias: ["categorias"],
  eventos: ["eventos"],
  vendas: ["vendas"],
  caixa: ["caixa"],
  fiados: ["fiados"],
  doacoes: ["doacoes"],
} as const;
```

Features compõem chaves a partir do namespace. `useEventoMutations` pode invalidar `caixa`, `fiados`, `doacoes` e `vendas` sem importar essas features. É um registry de cache, não uma dependência de domínio.

Alternativa considerada: cada feature exportar helpers de invalidação e importá-los entre features. Rejeitada porque cria dependências runtime entre features que não existem no DAG.

### 8. TypeScript incremental

- `strict: true` desde a fase 0.
- `allowJs: true` e `checkJs: false` durante a migração.
- `verbatimModuleSyntax` mantido; usar `import type` e `export type`.
- Script `typecheck`: `tsc -b --pretty false`.
- No fim: `allowJs: false`, todos os arquivos `.ts/.tsx`.
- `noUncheckedIndexedAccess` fica como melhoria futura, não bloqueia esta mudança.

### 9. Aliases e fronteiras

- `@/*` -> `src/*` em `vite.config.ts` e `tsconfig.app.json`.
- Verificação de fronteiras com `dependency-cruiser` (regras de DAG, barril público, `shared` sem features e ausência de ciclos).
- `oxlint` continua com regras de hooks e pode ganhar `no-restricted-imports` para imports profundos.

Alternativa considerada: apenas convenção e code review. Rejeitada porque a mudança depende de fronteiras duráveis.

### 10. Autenticação e token

`shared/api/cliente.ts` mantém o token em memória e expõe `definirToken`. O `AuthProvider` lê a sessão do armazenamento local e chama `definirToken`; o cliente não conhece a chave de storage nem importa `features/auth`. Isso remove o acoplamento atual por string mágica.

### 11. Carrinho

O cálculo de subtotal, desconto e total sai do `SaleContext` e vira função pura em `features/vendas/domain/carrinho.ts`. O `VendaProvider` fica apenas com estado e ações; o viewmodel usa as funções puras. A regra ganha teste unitário com Vitest, sem teste de integração ou de componente.

### 12. Estrutura alvo

```
src/
+-- app/
|   +-- App.tsx
|   +-- routes/AppRoutes.tsx, RotaProtegida.tsx
|   +-- providers/AppProviders.tsx, QueryProvider.tsx
|   +-- layouts/AppLayout, AuthLayout
|   +-- pages/PaginaNaoEncontrada.tsx, PaginaPendente.tsx
+-- shared/
|   +-- api/cliente.ts, erros.ts, demo/
|   +-- models/paginacao.ts
|   +-- query/keys.ts
|   +-- components/Abas, BarraPesquisa, Botao, Card, ConfirmacaoDialog,
|   |   Estado, Etiqueta, Filtros, Formulario, Icone, Logo,
|   |   MiniaturaProduto, Modal, PageHeader, Paginacao, SucessoDialog,
|   |   Tabela, Toast
|   +-- lib/formatacao.ts, armazenamentoLocal.ts
|   +-- styles/global.css, tokens.css
+-- features/
    +-- auth/        (pages, providers, hooks, services, models)
    +-- inventario/  (pages, components, widgets, hooks, services, models)
    +-- eventos/     (pages, components, hooks, services, models)
    +-- vendas/      (pages, components, providers, hooks, services, models, domain)
    +-- caixa/       (pages, components, hooks, services, models)
    +-- doacoes/     (pages, components, hooks, services, models)
    +-- home/        (pages, hooks)
```

## Risks / Trade-offs

- [Grande volume de imports quebrados durante a migração] → aliases, migração por feature e shims temporários nos caminhos antigos; remoção dos shims apenas na fase final.
- [Fronteiras ignoradas na prática] → `dependency-cruiser` no CI e barrel público obrigatório.
- [Barril criando ciclos] → DAG explícito e proibição de import entre features fora do barril; `EventoVendasPage` movida para `vendas`.
- [Conversão de JSX para TS revelar erros escondidos] → `allowJs` durante a transição e gate `typecheck` por fase; correções limitadas a tipagem, sem mudar comportamento.
- [Widget `CategoriasModal` acoplar `eventos` a UI de `inventario`] → exceção documentada e exportada pelo barril; se crescer, vira feature `categorias` ou rota própria.
- [Mistura de inglês e português] → glossário no design e nos artefatos; campos de contrato permanecem em inglês por definição.
- [Conversão do adaptador demo (~981 linhas) para TS] → deixar para a fase de limpeza, quando o restante já estiver tipado.

## Migration Plan

1. **Fase 0 — Fundação**: criar `app/` e `shared/`; mover UI para `shared/components`; mover cliente HTTP, demo, utils, estilos, layouts, rotas e providers; configurar aliases, `strict`, `allowJs`, `typecheck`; remover template Vite morto; criar shims temporários.
2. **Fase 1 — auth**: piloto com `LoginPage`, `RecuperarSenhaPage`, `ConfirmacaoRecuperacaoPage`, `AuthProvider`, `useAutenticacao`, models e service.
3. **Fase 2 — inventario**: mover página, componentes, `CategoriasModal`, services, models, `useInventario`, queries e mutations; atualizar consumidores para `@/features/inventario`.
4. **Fase 3 — eventos**: mover páginas, componentes, services, models e hooks; manter `EventoVendasPage` temporariamente em `eventos` com exceção registrada.
5. **Fase 4 — doacoes**: mover página, modal, hooks, service e models.
6. **Fase 5 — vendas**: mover páginas, componentes, provider e hooks; mover `EventoVendasPage` para `vendas`; extrair `domain/carrinho.ts`; adicionar teste unitário do carrinho com Vitest; remover a exceção de UI conectada entre `eventos` e `vendas`.
7. **Fase 6 — caixa**: mover páginas, componentes, hooks, service e models.
8. **Fase 7 — home**: mover `HomePage` e `useHome`.
9. **Fase 8 — limpeza**: remover shims e pastas antigas; converter `shared/api/demo` para TS; desligar `allowJs`; ativar regras de fronteira; rodar gate final.

Rollback: cada fase é um commit isolado. Em caso de falha, reverter apenas a fase; como não há mudança de contrato ou comportamento, o rollback não exige migração de dados.

Gate por fase:

```bash
npm run typecheck && npm run lint && npm run build
```

## Open Questions

- `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes` entram em uma mudança futura de endurecimento de tipos? Ficam fora desta refatoração e não alteram as tasks atuais.
