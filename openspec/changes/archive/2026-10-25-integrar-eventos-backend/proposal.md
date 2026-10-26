# Proposal

## Why

O módulo de eventos está em uma migração parcial: a lista já chama `GET /eventos`, mas espera um envelope paginado que a API não devolve; detalhe, mudança de status e cardápio ainda usam rotas `/events` que não existem no backend. O resultado é uma tela que mostra "nenhum evento" com o banco cheio, páginas de detalhe em 404 e `typecheck` vermelho em seis features que compartilham o tipo `Evento`.

Alinhar o frontend ao contrato real agora evita empilhar mais telas sobre um modelo que não corresponde à API e libera o uso do módulo contra o backend em execução.

## What Changes

- **BREAKING** `Evento` passa a usar o vocabulário e os tipos da API: `id: number`, `nome`, `tipoEvento` (`EVENTO | REUNIAO`), `status: { id, codigo, descricao }`, datas ISO e `observacoes`. Lógica de status usa `codigo`; exibição usa `descricao`.
- Lista de eventos passa a consumir `GET /eventos` (array), traduz os filtros da UI para `q`, `dataInicio` e `dataFim`, filtra status/tipo no cliente e monta a paginação no cliente para preservar a interface `Paginado` usada por doações, caixa e relatório.
- "Evento atual" deixa de chamar `/events/ongoing` e passa a derivar de `GET /eventos?statusId=2`.
- Criação e edição enviam `{ nome, observacoes, tipoEvento, dataHoraInicio, dataHoraEncerramento }`, convertendo `datetime-local` para ISO/Instant.
- Mudança de status usa `PATCH /eventos/{id}` com `{ status: <id numérico> }`; a resposta 204 não traz corpo. As confirmações passam a ser indexadas por código de status.
- Detalhe do evento é composto por `GET /eventos/{id}` (cabeçalho e resumo) e `GET /eventos/{id}/relatorio` quando o evento já iniciou; antes de iniciar, usa `GET /eventos/{id}/produtos`. O relatório é usado apenas no detalhe do evento, não na página de relatório geral.
- Cardápio passa a consumir `GET/POST/PUT/DELETE /eventos/{id}/produtos`, `GET /eventos/{id}/produtos/categorias` e o upload multipart de foto. Payloads e respostas são mapeados para `origem`, `precoVenda`, `quantidadePrevista`, `quantidadeVendida`, `fotoUrl`, etc.
- **Pré-requisito externo**: adicionar `observacoes` ao `EventoResponse` da API para que a edição a partir da lista não apague observações existentes.
- Features dependentes (home, vendas, caixa, doações, relatório) são adaptadas ao `id` numérico e ao objeto de status. `RelatorioGeralPage` recebe apenas ajuste de tipos; suas métricas continuam sem integração.
- Custos adicionais mantêm a UI de lançamento durante o evento, mas `POST/PUT/DELETE` de custos não são integrados nesta change. A exibição de custos no detalhe vem do relatório quando disponível.
- O adapter de demonstração não é alterado nesta change. Com `VITE_DEMO_MODE=true`, o módulo de eventos continuará indisponível até a change específica do demo.
- Sem helper de permissões e sem mudanças no fluxo de exclusão de eventos.

## Capabilities

### New Capabilities

- `eventos`: ciclo de vida e consulta de eventos no frontend — lista filtrável e paginada, evento atual, criação, edição, mudança de status e composição do detalhe.
- `evento-cardapio`: leitura e manutenção do cardápio de um evento, incluindo itens de estoque e produzidos, categorias e foto.

### Modified Capabilities

Nenhuma. O projeto ainda não possui specs em `openspec/specs/`.

## Impact

- `src/features/eventos/**`: models, services, hooks, páginas, componentes e utilitários.
- Features que consomem `Evento` ou IDs de evento: `src/features/home`, `src/features/vendas`, `src/features/caixa`, `src/features/doacoes`, `src/features/relatorio`.
- `src/shared/components/Formulario` (uso de `Selecao` com IDs numéricos convertidos para string nas opções).
- API (`../kaikan-cachoeira-api`): `EventoResponse` e `EventoResponse.de()` para incluir `observacoes`.
- O backend em execução precisa ser recompilado/reiniciado para expor `GET /eventos/{id}/relatorio` e `DELETE /eventos/{id}`; sem isso, o detalhe de eventos iniciados não funciona.
- `typecheck`, `lint` e `lint:boundaries` passam a ser critério de aceite do módulo.
