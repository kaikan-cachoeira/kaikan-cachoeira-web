# Integração do módulo de eventos com a API

Este documento registra os endpoints consumidos pelo frontend no módulo de
eventos, as permissões exigidas pela API e as lacunas conhecidas desta change.
Os paths foram conferidos em `../kaikan-cachoeira-api/openapi.yaml`.

## Endpoints usados

### Eventos

| Operação | Método e path | Permissão | Resposta |
| --- | --- | --- | --- |
| Listar eventos | `GET /eventos` | `EVENTOS_LEITURA` | `200` com `EventoResponse[]` |
| Evento em andamento | `GET /eventos?statusId=2` | `EVENTOS_LEITURA` | `200` com `EventoResponse[]`; o front escolhe o primeiro `EVENTO` |
| Detalhe | `GET /eventos/{id}` | `EVENTOS_MENU` | `200` com `EventoDetalheResponse` |
| Criar | `POST /eventos` | `EVENTOS_MENU` | `201` com `EventoResponse` |
| Atualizar | `PUT /eventos/{id}` | `EVENTOS_MENU` | `200` com `EventoResponse` |
| Alterar status | `PATCH /eventos/{id}` | `EVENTOS_MENU` | `204` sem corpo; payload `{ "status": <id> }` |
| Relatório | `GET /eventos/{id}/relatorio` | `RELATORIOS_MENU` | `200` com `RelatorioResponse`; `409` antes do início |

Parâmetros aceitos por `GET /eventos`: `q`, `statusId`, `tipoEvento`,
`dataInicio` e `dataFim`. O frontend envia `q`, `dataInicio` e `dataFim`; os
filtros de status e tipo são aplicados no cliente.

IDs de status usados no `PATCH`: `1 = NAO_INICIADO`, `2 = EM_ANDAMENTO`,
`3 = ENCERRADO`. A lógica de interface usa `status.codigo`; os textos exibidos
usam `status.descricao`.

O relatório tem dois formatos, discriminados por `tipoEvento`:

- `EVENTO`: resumo financeiro, produtos, custos adicionais, caixa, doações,
  movimentações, ranking de produtos e vendas por hora.
- `REUNIAO`: resumo de custos, itens/movimentações e custos adicionais.

### Cardápio do evento

| Operação | Método e path | Permissão | Resposta |
| --- | --- | --- | --- |
| Listar produtos | `GET /eventos/{eventoId}/produtos` | `EVENTOS_MENU` ou `CARDAPIO_EVENTO_LEITURA` | `200` com `ProdutoEventoResponse[]` |
| Listar categorias | `GET /eventos/{eventoId}/produtos/categorias` | `EVENTOS_MENU` ou `CARDAPIO_EVENTO_LEITURA` | `200` com `string[]` |
| Adicionar produto | `POST /eventos/{eventoId}/produtos` | `EVENTOS_MENU` | `201` com `ProdutoEventoResponse` |
| Atualizar produto | `PUT /eventos/{eventoId}/produtos/{produtoEventoId}` | `EVENTOS_MENU` | `200` com `ProdutoEventoResponse` |
| Remover produto | `DELETE /eventos/{eventoId}/produtos/{produtoEventoId}` | `EVENTOS_MENU` | `204` sem corpo |
| Enviar foto | `POST /eventos/{eventoId}/produtos/{produtoEventoId}/foto` | `EVENTOS_MENU` | `200` com `{ "url": "..." }` |

O upload de foto é `multipart/form-data` com o campo `arquivo`. A resposta traz
uma URL relativa, resolvida contra a base configurada no cliente HTTP.

## Lacunas conhecidas

- **Custos adicionais**: o relatório expõe `custosAdicionais` somente para
  leitura (sem `id`). Os modais de lançamento/edição continuam chamando as rotas
  antigas `POST/PUT/DELETE /events/{id}/costs`, que não existem no backend real.
  A integração de custos fica para uma change futura.
- **Exclusão de evento**: `excluirEvento` continua em `DELETE /events/{id}`
  esperando `{ ok: boolean }`. A API real expõe `DELETE /eventos/{id}` com `204`;
  a troca fica para uma change futura.
- **Adapter de demonstração**: não foi alterado. Com `VITE_DEMO_MODE=true`, as
  novas rotas de eventos não são atendidas pelo adapter antigo. No modo real, o
  modal de produto de estoque ainda depende das rotas antigas `/products`, que
  continuam no demo; a integração do inventário fica para uma change futura.
- **Vendas, caixa e doações**: receberam apenas `eventId` numérico e leitura do
  novo `status`, sem troca de endpoints. Essas features continuam usando as
  rotas de demonstração (`/sales`, `/cash`, `/donations`, `/reports/...`).
- **Permissões**: não há helper de permissões no frontend. O operador sem
  `RELATORIOS_MENU` recebe `403` no relatório e a tela trata como erro parcial,
  mantendo o cabeçalho e o resumo do evento. Sem `EVENTOS_MENU`, o próprio
  detalhe responde `403` e a página inteira exibe erro.
