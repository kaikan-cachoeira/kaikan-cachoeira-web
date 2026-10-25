# Design

## Context

Ver `proposal.md` — Why. O que molda a solução:

- `GET /eventos` devolve `EventoResponse[]` sem envelope, e a API não expõe endpoint de status. Os IDs de status são fixos no schema (`1 = NAO_INICIADO`, `2 = EM_ANDAMENTO`, `3 = ENCERRADO`) e cada evento carrega `status: { id, codigo, descricao }`.
- `GET /eventos/{id}` devolve `EventoDetalheResponse` (com `observacoes` e `resumo`) e exige `EVENTOS_MENU`. `GET /eventos` exige apenas `EVENTOS_LEITURA`.
- `GET /eventos/{id}/relatorio` responde 409 antes do início, exige `RELATORIOS_MENU` e tem dois shapes: `RelatorioEventoResponse` para `EVENTO` e `RelatorioReuniaoResponse` para `REUNIAO`. `RelatorioResponse` é a união discriminada por `tipoEvento`.
- `PATCH /eventos/{id}` recebe `{ status: <id numérico>, custos? }` e responde 204. `POST`/`PUT` respondem `EventoResponse`.
- Cardápio usa `/eventos/{id}/produtos`, com `ProdutoEventoRequest`/`ProdutoEventoResponse`, categorias como `string[]` e upload de foto em endpoint multipart separado.
- O front está em migração parcial: modelos com nomes antigos (`name`, `type`, `notes`, `start`, `end`), IDs `string`, status textual e paths `/events`. O adapter de demonstração continua atendendo os paths antigos.
- `Evento` é consumido por home, vendas, caixa, doações e relatório; mudar o tipo propaga erros de compilação nessas features.

## Goals / Non-Goals

**Goals:**

- Um único modelo de evento alinhado ao contrato, com IDs numéricos e status por `codigo`.
- Lista, evento atual, CRUD, mudança de status, detalhe e cardápio funcionando contra a API real.
- Dependentes compilando com o novo tipo sem mudança de comportamento.

**Non-Goals:**

- Integrar `POST/PUT/DELETE` de custos, exclusão de eventos, `RelatorioGeralPage` ou o adapter de demonstração.
- Criar helper de permissões ou esconder ações por permissão.
- Introduzir biblioteca de datas, estado global de eventos ou paginação server-side de eventos.

## Decisions

### 1. Modelo espelha a API, sem camada de renomeação

`Evento` passa a ser o formato de `EventoResponse` (`id`, `nome`, `tipoEvento`, `status`, datas, `iniciadoEm`, `encerradoEm`, `observacoes`). `EventoDetalhe` estende `Evento` com `resumo`. `ItemCardapio` espelha `ProdutoEventoResponse` (`origem`, `precoVenda`, `quantidadePrevista`, `quantidadeVendida`, `restantePrevisto`, `custoTotalIngredientes`, `fotoUrl`).

Alternativa descartada: manter o modelo antigo e traduzir na camada de serviço. Duplicaria nomes e deixaria o resto do app falando um vocabulário que a API não usa, prolongando a migração.

### 2. IDs `number`, convertidos na borda

`Evento.id`, `ItemCardapio.id/produtoId`, `eventId` em payloads e em features dependentes viram `number`. As conversões ficam em três pontos:

- Rota: `useParams()` devolve `string`; a página faz `const id = Number(param)` e só habilita a query quando `Number.isFinite(id)`.
- Componentes de seleção: `Selecao`/`SelecaoMultipla` continuam com `value: string`; opções usam `String(evento.id)` e o `onChange` converte de volta com `Number`.
- Campos de texto que carregam ID (por exemplo filtros de doações) convertem para número antes de entrar no estado tipado.

Onde o ID ainda vem do demo e não há rota real (custos, vendas detalhadas, doações), o tipo não muda nesta change.

### 3. Status: lógica por `codigo`, persistência por `id`

Comparações e condicionais usam `evento.status.codigo` (`NAO_INICIADO`, `EM_ANDAMENTO`, `ENCERRADO`); textos usam `status.descricao`. Como o `PATCH` exige o ID numérico e não existe endpoint de status, um mapa constante `STATUS_EVENTO` centraliza `codigo → id` e os rótulos de confirmação. O `id` recebido no evento é usado para exibição/estado; o mapa é usado para montar o alvo da transição.

Alternativa descartada: descobrir o ID do status alvo a partir da lista de eventos. Seria frágil (dependeria de existir um evento em cada status) e não funciona para `NAO_INICIADO` quando todos estão iniciados.

### 4. Lista busca o array e pagina no cliente

`listarEventos` envia somente `q`, `dataInicio` e `dataFim` à API e recebe `Evento[]`. O hook aplica filtros de `status`/`tipo` no cliente, ordena o evento em andamento primeiro e monta `Paginado<Evento>` (`items`, `page`, `pageSize`, `total`, `totalPages`) para preservar os consumidores existentes. `page` e `pageSize` continuam no estado da UI; não são enviados como query params.

Alternativa descartada: mudar os consumidores para array. O contrato `Paginado` é usado por doações, caixa e relatório e não é o objeto desta change.

Consequência aceita: com muitos eventos e filtro de status, uma página pode ficar incompleta. O volume atual e o `pageSize` de 8 tornam isso irrelevante; se crescer, migra-se para paginação server-side em outra change.

### 5. Evento atual deriva de `GET /eventos?statusId=2`

`obterEventoAtual` chama a lista com `statusId: 2`, escolhe o primeiro item com `tipoEvento === "EVENTO"` e retorna `null` quando não há. Usa `EVENTOS_LEITURA`, então continua acessível ao operador, diferente de `GET /eventos/{id}`.

Alternativa descartada: `/events/ongoing`, que não existe no backend.

### 6. Detalhe composto, com relatório condicional

`useEventoQuery` busca `GET /eventos/{id}` para cabeçalho e `resumo`. Em paralelo:

- `codigo === "NAO_INICIADO"`: `GET /eventos/{id}/produtos` alimenta o cardápio e as métricas ficam zeradas.
- `codigo` diferente de `NAO_INICIADO`: `GET /eventos/{id}/relatorio` alimenta métricas, produtos, doações, custos adicionais e vendas por hora. O shape é escolhido por `tipoEvento`: `RelatorioEventoResponse` para `EVENTO`, `RelatorioReuniaoResponse` para `REUNIAO`.

A query do relatório usa `retry: false` e `enabled` apenas quando há ID e o status permite. Erro 409/403 não derruba a página: cabeçalho e resumo continuam visíveis e as seções derivadas mostram estado de erro/vazio. As métricas do front (`revenue`, `costs`, `profit`, `sales`) são derivadas de `resumo` do relatório (`receitaTotal`, `custoTotal`, `lucro`, `vendas`).

Alternativa descartada: usar o relatório em todas as fases. Antes do início ele responde 409 por contrato; o detalhe precisa funcionar para planejamento.

### 7. Custos: leitura pelo relatório, escrita legada mantida

A lista de custos do detalhe vem de `custosAdicionais` do relatório, que não traz `id`; esses itens são somente leitura. Os modais de lançamento/edição continuam chamando as rotas antigas (`/events/{id}/costs`) e, portanto, não persistem contra a API real. Nenhuma mutation de custo é alterada nesta change.

Alternativa descartada: remover os botões. O lançamento durante o evento é requisito de produto e será religado na change de custos.

### 8. Cardápio: mapeamento direto e foto em duas etapas

`obterCardapioEvento` busca produtos e categorias em paralelo, mas devolve `{ items, categories }` sem `event` — o evento vem de `useEventoQuery`. `AdicionarProdutoCardapioPayload` vira `ProdutoEventoRequest`:

- `ESTOQUE`: `origem`, `produtoId`, `precoVenda`, `quantidadePrevista`.
- `PRODUZIDO`: `origem`, `nome`, `descricao`, `categoria`, `precoVenda`, `custoTotalIngredientes`.

Na edição, a origem é preservada e os campos específicos são enviados sem trocar o tipo. A foto é enviada depois do `POST`/`PUT`, com o `id` retornado, via `FormData` no campo `arquivo`; a resposta `{ url }` é usada para atualizar o cache. O modal guarda o `File` selecionado (não apenas o data URL) e valida o MIME antes de enviar.

Alternativa descartada: continuar enviando imagem como data URL no JSON. O backend só aceita multipart e o payload atual ignora/armazena errado.

### 9. Datas convertidas na borda do formulário

`datetime-local` produz `YYYY-MM-DDTHH:mm` sem fuso. A saída usa `new Date(valor).toISOString()`, que interpreta no fuso local e gera o `Instant` ISO 8601 esperado. A entrada usa um helper que converte o ISO para o formato local do input. A validação de “encerramento depois do início” ocorre sobre os valores locais antes da conversão. Nenhuma conversão de data é feita em modelos ou serviços.

### 10. `observacoes` na lista e hidratação defensiva

O pré-requisito é incluir `observacoes` em `EventoResponse` na API. Enquanto isso não estiver no backend em execução, a edição a partir da lista hidrata o formulário com `GET /eventos/{id}` (que já traz `observacoes`) antes de abrir, em vez de enviar `undefined` e apagar o valor. Depois do pré-requisito, a hidratação pode ser removida sem mudar o contrato do formulário.

Alternativa descartada: confiar apenas na mudança da API. O backend em execução fica defasado e o bug de apagar observações apareceria no primeiro teste manual.

### 11. Dependentes: adaptação mínima de tipos

Home, vendas, caixa, doações e relatório recebem `number` nos IDs e `status.codigo`/`status.descricao` onde liam texto. Nenhuma query, rota ou fluxo dessas features é migrado nesta change. `RelatorioGeralPage` mantém `metrics` opcional e exibe zeros; a única mudança é a forma de ler o status e o ID.

### 12. Cache e invalidação

As queries de eventos continuam sob `queryKeys.eventos`; a chave inclui os parâmetros da lista. Mutações de evento invalidam a raiz `eventos` e as chaves de vendas, caixa, fiados e doações que dependem do evento atual, como já ocorre hoje. Cardápio invalida `eventos` (detalhe e lista). O `PATCH` 204 invalida sem esperar corpo.

### 13. Demo permanece intocado

O adapter antigo não é alterado. Com `VITE_DEMO_MODE=true`, as novas rotas caem no adapter e respondem erro; o módulo de eventos fica indisponível até a change do demo. O restante do app continua funcionando no modo demo como hoje.

## Risks / Trade-offs

- **Backend em execução desatualizado** (sem `/relatorio` e sem `DELETE /eventos/{id}`) → recompilar e reiniciar antes do teste runtime; a implementação não depende disso para compilar, mas o detalhe de eventos iniciados só funciona após o restart.
- **`GET /eventos/{id}` e o relatório exigem `EVENTOS_MENU`/`RELATORIOS_MENU`** → operador recebe 403 no detalhe. A página trata como erro parcial e mantém o cabeçalho; resolver permissões fica fora desta change.
- **IDs de status fixos (1/2/3)** → centralizados em uma constante e cobertos pelo contrato; se o backend mudar, a correção é local.
- **Filtro/paginação no cliente** → páginas incompletas com muitos eventos filtrados; aceitável no volume atual.
- **Custos não persistem** → botões continuam visíveis e falham contra a API real. O risco é confundir o usuário; a limitação fica registrada no `tasks.md` e na change de custos.
- **Exclusão de eventos intocada** → continua chamando `/events/{id}` e esperando `{ok}`; não funciona contra o backend real até a change futura. Isso é intencional.
- **Demo quebrado para eventos** → aceito; evita manter dois contratos vivos.
- **Superfície de typecheck ampla** → a mudança de `id` propaga por cinco features; a ordem das tasks começa pelo modelo e pelos serviços para reduzir o vermelho intermediário.

## Migration Plan

1. Pré-requisito na API: adicionar `observacoes` a `EventoResponse` e `de()`.
2. Modelos e utilitários de data/status.
3. Serviços e hooks de eventos (lista, atual, detalhe, relatório, cardápio, foto).
4. Lista e formulário de evento.
5. Detalhe e cardápio.
6. Ajustes de compilação nos dependentes.
7. `typecheck`, `lint`, `lint:boundaries` e teste manual contra o backend reiniciado.

Rollback: reverter os arquivos do módulo e da API; não há migração de banco nem alteração de dados. O backend pode continuar com o campo extra `observacoes` sem quebrar clientes antigos.

## Open Questions

Nenhuma pendente. As dúvidas de produto e contrato foram resolvidas antes da criação desta change.
