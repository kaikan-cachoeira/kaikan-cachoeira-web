# Tasks

## 1. Pré-requisito da API

- [x] 1.1 Adicionar `observacoes` ao record `EventoResponse` e ao método `de()` em `../kaikan-cachoeira-api/src/main/java/com/kaikancachoeira/api/evento/dto/EventoResponse.java`, verificando com `./mvnw -q -DskipTests compile` no repo da API.
- [x] 1.2 Recompilar e reiniciar a API local e confirmar com `GET /eventos` que cada item traz `observacoes` e com `GET /eventos/{id}/relatorio` de um evento iniciado que a rota responde 200.

## 2. Modelo, status e datas

- [x] 2.1 Reescrever `Evento`, `Status` e `EventoDetalhe` em `src/features/eventos/models/eventos.ts` com `id: number`, `nome`, `tipoEvento`, `status { id, codigo, descricao }`, datas ISO, `observacoes?` e `resumo?`; verificar com `npm run typecheck` que os erros restantes são apenas os consumidores ainda não adaptados.
- [x] 2.2 Reescrever `ItemCardapio` e os payloads de cardápio (`origem`, `produtoId`, `precoVenda`, `desconto`, `quantidadePrevista`, `quantidadeVendida`, `restantePrevisto`, `custoTotalIngredientes`, `fotoUrl`) e confirmar que `npm run typecheck` não acusa mais erros no model.
- [x] 2.3 Criar `src/features/eventos/utils/statusEvento.ts` com o mapa `codigo → id` (`NAO_INICIADO`, `EM_ANDAMENTO`, `ENCERRADO`), rótulos e transições, e cobrir os quatro caminhos permitidos com um teste Vitest colocalizado.
- [x] 2.4 Criar `src/features/eventos/utils/datas.ts` com conversão `datetime-local ↔ ISO 8601` (incluindo o recorte do ISO para o input) e cobrir ida e volta, inclusive horário local, em teste Vitest colocalizado.
- [x] 2.5 Extrair para uma função pura a filtragem por status/tipo, a ordenação do evento em andamento e a montagem de `Paginado<Evento>`, e cobrir com teste Vitest lista vazia, filtro sem resultado e página além do total.

## 3. Serviços e hooks

- [x] 3.1 Reescrever `src/features/eventos/services/eventos.ts`: lista em `GET /eventos` com `q/dataInicio/dataFim`, atual em `statusId=2`, detalhe em `GET /eventos/{id}`, criação/edição, `PATCH /eventos/{id}` 204 e endpoints de produtos/categorias/foto; verificar com `grep -n "/events" src/features/eventos/services/eventos.ts` que só restam as rotas de custos e exclusão intocadas.
- [x] 3.2 Ajustar `useEventosQuery`, `useEventoAtualQuery`, `useEventoQuery` e adicionar a query de relatório com `enabled` por status/ID e `retry: false`; verificar com `npm run typecheck` que os hooks expõem os tipos novos.
- [x] 3.3 Ajustar as mutations de criar, atualizar e alterar status para o payload/rota reais, garantindo invalidação da raiz `eventos` e das chaves dependentes; verificar em teste manual que um `PATCH` 204 atualiza lista e detalhe.
- [x] 3.4 Ajustar as mutations de cardápio (adicionar, atualizar, remover) e implementar o upload multipart no campo `arquivo` após obter o `id`, invalidando detalhe e cardápio; verificar que o `FormData` montado contém a chave `arquivo` e o tipo do arquivo.
- [x] 3.5 Documentar em `docs/eventos-api.md` os endpoints usados, as permissões exigidas e as lacunas conhecidas (custos, exclusão, demo), conferindo que cada path citado existe em `../kaikan-cachoeira-api/openapi.yaml`.

## 4. Lista e formulário

- [x] 4.1 Atualizar `EventosPage.tsx` para opções de status/tipo por `codigo`/`tipoEvento`, detecção do evento em andamento por `status.codigo` e estados vazios distintos para “sem eventos” e “sem resultado”; verificar na tela com e sem filtros ativos.
- [x] 4.2 Atualizar `EventoCard.tsx` e `confirmacaoStatus` para exibir `status.descricao`, usar `codigo` nas ações e navegar com `evento.id` numérico; verificar que os cards mostram o texto da API e que iniciar/encerrar/reabrir pedem a confirmação correta.
- [x] 4.3 Atualizar `EventoFormModal.tsx` para os campos `nome`, `tipoEvento`, `observacoes`, início e encerramento, convertendo as datas na borda e validando encerramento posterior ao início; verificar que criar e editar enviam o payload de `EventoRequest` e que período inválido bloqueia o envio.
- [x] 4.4 Hidratar a edição com `GET /eventos/{id}` quando o item da lista não trouxer `observacoes`, garantindo que salvar a partir do card preserve as observações; verificar editando um evento com observações e relendo o detalhe.

## 5. Detalhe do evento

- [x] 5.1 Atualizar `useEventoDetalhes` para receber `id: number` convertido da rota, buscar detalhe, buscar relatório apenas quando `status.codigo !== "NAO_INICIADO"` e buscar produtos quando não iniciado; verificar que o número de requisições muda conforme o status.
- [x] 5.2 Atualizar `EventoDetalhesPage` para renderizar cabeçalho/resumo do detalhe e derivar métricas, produtos, doações, custos adicionais e vendas por hora do relatório de `EVENTO`; verificar em evento iniciado que receita, custo, lucro e vendas batem com o relatório.
- [x] 5.3 Implementar o ramo `REUNIAO` do detalhe com custos e movimentações do relatório de reunião, sem seções de receita/lucro; verificar abrindo um evento do tipo reunião.
- [x] 5.4 Tratar 409/403 do relatório como erro parcial, mantendo cabeçalho e resumo visíveis e exibindo estado de erro nas seções dependentes; verificar com um usuário sem `RELATORIOS_MENU`.
- [x] 5.5 Exibir `custosAdicionais` do relatório como lista somente leitura e manter os modais de lançamento de custo chamando as rotas antigas, sem alterar `POST/PUT/DELETE`; verificar que os custos do relatório aparecem sem ações de edição.

## 6. Cardápio

- [x] 6.1 Atualizar `useEventoCardapio` para consumir `GET /eventos/{id}/produtos` e `GET /eventos/{id}/produtos/categorias`, com categorias `string[]` e filtros locais por nome, categoria e origem; verificar que os filtros reduzem a lista sem nova requisição.
- [x] 6.2 Atualizar `EventoCardapioPage` para os campos do contrato (`origem`, previsto, vendido, restante, preço, desconto, custo, foto) e para esconder manutenção quando o evento não for `EVENTO` ou não estiver `NAO_INICIADO`; verificar nos três status e em uma reunião.
- [x] 6.3 Atualizar `AdicionarProdutoCardapioModal` para montar `ProdutoEventoRequest` conforme a origem, impedir troca de origem na edição e validar produto de estoque/quantidade/preço; verificar criando um item `ESTOQUE` e um `PRODUZIDO` e editando ambos.
- [x] 6.4 Implementar a seleção de arquivo com validação de MIME e envio da foto depois de criar/editar o item, resolvendo a URL relativa contra a base da API; verificar que a foto aparece no cardápio após recarregar a página.
- [x] 6.5 Ajustar a remoção de item para `DELETE /eventos/{id}/produtos/{itemId}` com resposta 204 e exibir a mensagem de conflito quando houver vendas; verificar removendo um item não vendido e tentando remover um vendido.

## 7. Features dependentes

- [x] 7.1 Adaptar home, vendas, caixa e doações aos IDs numéricos de evento e ao novo status, sem mudar queries ou fluxos; verificar com `npm run typecheck` que essas features compilam e que home/caixa continuam encontrando o evento atual.
- [x] 7.2 Ajustar os usos de `Selecao`/`SelecaoMultipla` que recebem eventos para `String(evento.id)` nas opções e `Number(valor)` no `onChange`; verificar que os filtros de doações e fiados continuam filtrando o evento correto.
- [x] 7.3 Ajustar `RelatorioGeralPage` somente para os tipos novos (`id` numérico e `status.codigo/descricao`), mantendo `metrics` opcional e a exibição de zeros; verificar que a página compila e abre sem chamar o relatório de evento.

## 8. Verificação integrada

- [x] 8.1 Rodar `npm run typecheck` e confirmar zero erros.
- [x] 8.2 Rodar `npm run lint` e `npm run lint:boundaries` e confirmar zero erros; em especial, que `eventos` não importa `relatorio`.
- [x] 8.3 Rodar `npm test` e confirmar que os testes novos de status, datas e paginação passam junto com os existentes.
- [x] 8.4 Rodar `npm run build` e confirmar que o bundle de produção é gerado sem erro.
- [x] 8.5 Com a API reiniciada, validar manualmente: listar e filtrar, criar evento, editar preservando observações, iniciar/encerrar/reabrir, abrir detalhe antes e depois do início, abrir detalhe de reunião e manter o cardápio com foto.
- [x] 8.6 Confirmar que `excluirEvento` continua em `/events/{id}` esperando `{ok}` e que os modais de custo continuam nas rotas antigas, registrando as duas lacunas como pendências para changes futuras.

## Workflow follow-up

- Revisar os artefatos e, quando a implementação estiver concluída, arquivar a change.
- Abrir changes futuras para custos, exclusão de eventos, `RelatorioGeralPage` e adapter de demonstração.
