# Spec Delta

## MODIFIED Requirements

### Requirement: Listagem de eventos
A listagem SHALL consultar `GET /eventos` e apresentar os eventos com o evento em andamento primeiro. Busca textual, período, `status` e `tipos` SHALL ser enviados à API; a resposta SHALL ser consumida como paginação server-side, preservando seleções múltiplas de status e tipo no contrato da consulta.

#### Scenario: Lista com eventos
- **WHEN** a API devolve uma página com eventos
- **THEN** a tela renderiza os cards a partir da resposta paginada e destaca o evento em andamento quando ele estiver na página retornada

#### Scenario: Filtros de status e tipo
- **WHEN** o usuário seleciona um ou mais status ou tipos
- **THEN** a consulta reflete todas as seleções e a lista exibida corresponde ao conjunto filtrado retornado pela API

#### Scenario: Filtro por período
- **WHEN** o usuário informa data inicial e/ou final
- **THEN** a requisição envia `dataInicio` no início do dia local e `dataFim` no fim do dia local, em ISO 8601

#### Scenario: Lista vazia
- **WHEN** a API devolve uma página vazia
- **THEN** a tela exibe o estado vazio, distinguindo "sem eventos" de "nenhum resultado para os filtros"
