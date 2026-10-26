# eventos Specification

## Purpose

Define como o frontend consulta, cria, edita e acompanha eventos usando o contrato real da API, incluindo lista filtrável, evento em andamento, ciclo de status e composição do detalhe.

## Requirements

### Requirement: Listagem de eventos

A listagem SHALL consultar `GET /eventos` e apresentar os eventos com o evento em andamento primeiro. Busca textual e período SHALL ser enviados à API como `q`, `dataInicio` e `dataFim`; filtros de status e tipo SHALL ser aplicados no cliente. A resposta SHALL ser paginada no cliente para preservar o contrato `Paginado` consumido por outras features.

#### Scenario: Lista com eventos

- **WHEN** a API devolve um array com eventos
- **THEN** a tela renderiza os cards, destacando o evento em andamento e paginando o restante

#### Scenario: Filtros de status e tipo

- **WHEN** o usuário seleciona um ou mais status ou tipos
- **THEN** apenas os eventos correspondentes são exibidos, sem alterar a paginação além do necessário

#### Scenario: Filtro por período

- **WHEN** o usuário informa data inicial e/ou final
- **THEN** a requisição envia `dataInicio` no início do dia local e `dataFim` no fim do dia local, em ISO 8601

#### Scenario: Lista vazia

- **WHEN** a API devolve um array vazio
- **THEN** a tela exibe o estado vazio, distinguindo "sem eventos" de "nenhum resultado para os filtros"

### Requirement: Evento em andamento

O sistema SHALL obter o evento em andamento a partir de `GET /eventos?statusId=2`, selecionando o primeiro evento do tipo `EVENTO`, e SHALL retornar nulo quando não houver evento nesse estado.

#### Scenario: Evento em andamento existe

- **WHEN** a consulta por `statusId=2` devolve um evento do tipo `EVENTO`
- **THEN** home, caixa e registro de vendas exibem esse evento como contexto ativo

#### Scenario: Nenhum evento em andamento

- **WHEN** a consulta por `statusId=2` devolve lista vazia
- **THEN** as telas que dependem do evento atual exibem o estado "nenhum evento em andamento"

### Requirement: Criação de evento

A criação SHALL enviar `nome`, `tipoEvento`, `observacoes` opcional e as datas de início e encerramento em ISO 8601. O encerramento MUST ser posterior ao início. O formulário SHALL converter `datetime-local` para `Instant` e aceitar os tipos `EVENTO` e `REUNIAO`.

#### Scenario: Evento criado

- **WHEN** o usuário informa nome, tipo e período válidos
- **THEN** a API recebe o payload no contrato de `EventoRequest` e a lista é atualizada

#### Scenario: Período inválido

- **WHEN** o encerramento não é posterior ao início
- **THEN** o formulário impede o envio e exibe a mensagem no campo de período

#### Scenario: Reunião

- **WHEN** o usuário seleciona o tipo `REUNIAO`
- **THEN** o evento é criado sem cardápio e o detalhe não oferece ações de cardápio

### Requirement: Edição de evento

A edição SHALL carregar os dados atuais do evento, incluindo `observacoes`, e enviar o mesmo payload da criação. A resposta da lista MUST incluir `observacoes` para que editar a partir de um card não apague observações existentes.

#### Scenario: Edição a partir da lista

- **WHEN** o usuário abre a edição de um evento listado
- **THEN** o formulário exibe as observações atuais e as preserva ao salvar

#### Scenario: Evento atualizado

- **WHEN** o usuário altera nome, tipo, observações ou período
- **THEN** a API recebe o payload atualizado e a lista e o detalhe refletem a mudança

### Requirement: Mudança de status

A mudança de status SHALL usar `PATCH /eventos/{id}` com o identificador numérico do novo status. As transições permitidas são `NAO_INICIADO` para `EM_ANDAMENTO`, `EM_ANDAMENTO` para `ENCERRADO`, `EM_ANDAMENTO` para `NAO_INICIADO` e `ENCERRADO` para `EM_ANDAMENTO`. A resposta 204 SHALL provocar a atualização das consultas sem esperar corpo.

#### Scenario: Iniciar evento

- **WHEN** o usuário inicia um evento não iniciado
- **THEN** o status passa a `EM_ANDAMENTO` e o evento se torna o evento atual

#### Scenario: Encerrar evento

- **WHEN** o usuário encerra o evento em andamento
- **THEN** o status passa a `ENCERRADO` e o evento deixa de ser o atual

#### Scenario: Desfazer início

- **WHEN** o usuário desfaz o início de um evento sem vendas nem lançamentos de caixa
- **THEN** o status volta a `NAO_INICIADO`

#### Scenario: Reabrir evento

- **WHEN** o usuário reabre um evento encerrado
- **THEN** o status volta a `EM_ANDAMENTO` preservando os dados anteriores

#### Scenario: Transição inválida

- **WHEN** a API rejeita a transição ou informa que já existe outro evento em andamento
- **THEN** a tela exibe a mensagem retornada pela API e mantém o status anterior

### Requirement: Detalhe do evento

O detalhe SHALL exibir cabeçalho e resumo de `GET /eventos/{id}`. Quando o evento já iniciou, o detalhe SHALL usar `GET /eventos/{id}/relatorio` para métricas, produtos, doações, custos adicionais e vendas por hora. Antes de iniciar, SHALL usar `GET /eventos/{id}/produtos` e exibir métricas zeradas. A seção de doações MUST permanecer compatível com o contrato atualizado de doações, incluindo mapeamento consistente de tipo e identificação do evento associado.

#### Scenario: Evento não iniciado

- **WHEN** o evento está em `NAO_INICIADO`
- **THEN** o detalhe mostra o cardápio atual e indicadores zerados, sem chamar o relatório

#### Scenario: Evento em andamento ou encerrado

- **WHEN** o evento está em `EM_ANDAMENTO` ou `ENCERRADO`
- **THEN** o detalhe mostra receita, custos, lucro, vendas, ranking de produtos, doações e custos adicionais a partir do relatório

#### Scenario: Reunião

- **WHEN** o evento é do tipo `REUNIAO`
- **THEN** o detalhe exibe apenas os custos e movimentações previstos para reunião, sem seções de venda ou lucro

#### Scenario: Relatório indisponível

- **WHEN** o relatório responde com erro de permissão ou conflito
- **THEN** o cabeçalho e o resumo do evento continuam visíveis e as seções dependentes exibem estado de erro

### Requirement: Representação de evento

Eventos SHALL ser representados com `id` numérico, `nome`, `tipoEvento`, `status` contendo `id`, `codigo` e `descricao`, datas em ISO 8601, `iniciadoEm` e `encerradoEm` opcionais e `observacoes` opcional. Lógica de comportamento SHALL usar `codigo`; textos exibidos SHALL usar `descricao`.

#### Scenario: Identificador numérico

- **WHEN** um evento é usado em links, parâmetros de rota ou payloads
- **THEN** seu identificador é tratado como número, convertendo a string da rota na borda da página

#### Scenario: Exibição de status

- **WHEN** o status de um evento é exibido
- **THEN** o texto vem de `descricao` e as decisões de interface usam `codigo`
