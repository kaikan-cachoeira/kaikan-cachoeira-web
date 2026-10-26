# caixa Specification

## Purpose

Definir a integração do módulo de caixa ao contrato real da API por evento, cobrindo lançamentos, resumo financeiro e fiados no contexto de evento em andamento.

## Requirements

### Requirement: Consulta do caixa por evento no contrato da API
O caixa SHALL consultar `GET /eventos/{eventoId}/caixa` para obter resumo e histórico paginado, com adaptação de paginação 0-based da API para experiência 1-based na UI.

#### Scenario: Resumo e histórico carregados
- **WHEN** a API retorna `CaixaResponse`
- **THEN** a UI exibe resumo financeiro e lançamentos da página no contrato real

#### Scenario: Navegação de páginas
- **WHEN** o usuário troca a página do histórico
- **THEN** a UI mantém paginação 1-based e a requisição envia `page` 0-based

### Requirement: Filtros de tipo e forma de pagamento
Filtros do histórico SHALL mapear seleções da UI para os parâmetros `tipo` e `formaPagamento` aceitos pela API, enviando enums backend e preservando opção sem filtro quando não selecionado.

#### Scenario: Filtro por tipo
- **WHEN** o usuário filtra por venda de ficha ou devolução
- **THEN** a consulta envia `tipo=VENDA_FICHA` ou `tipo=DEVOLUCAO_FICHA`

#### Scenario: Filtro por forma de pagamento
- **WHEN** o usuário filtra por forma de pagamento
- **THEN** a consulta envia `formaPagamento` no enum backend correspondente

### Requirement: Registro de lançamento no caixa
Registro SHALL usar `POST /eventos/{eventoId}/caixa` com payload `tipo`, `valor`, `formaPagamento`, `nomeDevedor` e `observacao` conforme regras da API. O tipo `QUITACAO_FIADO` MUST NOT ser enviado nesse endpoint.

#### Scenario: Venda de ficha registrada
- **WHEN** o usuário confirma um lançamento válido de venda
- **THEN** a API cria o lançamento e a UI atualiza histórico e resumo

#### Scenario: Fiado em venda de ficha
- **WHEN** a forma de pagamento é fiado em venda de ficha
- **THEN** a UI envia `nomeDevedor` e o lançamento/fiado são registrados conforme contrato

### Requirement: Exclusão de lançamento por evento
A exclusão SHALL usar `DELETE /eventos/{eventoId}/caixa/{lancamentoId}` e MUST atualizar o resumo após sucesso com base na resposta do backend.

#### Scenario: Exclusão bem-sucedida
- **WHEN** o usuário confirma exclusão de um lançamento elegível
- **THEN** a API retorna sucesso e a UI reflete o novo resumo e histórico

### Requirement: Listagem de fiados do evento
Fiados do evento atual SHALL ser consultados por `GET /eventos/{eventoId}/fiados`, com filtro opcional de situação e exibição consistente de pendente ou quitado.

#### Scenario: Filtro por situação
- **WHEN** o usuário seleciona pendente ou quitado
- **THEN** a consulta envia `situacao` no formato esperado pela API

### Requirement: Quitação de fiado no contrato real
A quitação SHALL usar `PATCH /eventos/{eventoId}/fiados/{fiadoId}/quitacao` enviando apenas `formaPagamento`. A UI MUST tratar quitação como total no backend e MUST NOT oferecer quitação parcial por valor nesse fluxo.

#### Scenario: Quitar fiado
- **WHEN** o usuário confirma quitação de um fiado pendente com forma de pagamento válida
- **THEN** a API marca o fiado como quitado e a UI atualiza lista, histórico e resumo

#### Scenario: Forma de pagamento inválida na quitação
- **WHEN** a API rejeita a forma de pagamento na quitação
- **THEN** a UI mantém estado atual e exibe a mensagem de erro retornada

### Requirement: Escopo de evento-atual para integração de caixa
Nesta change, a integração SHALL cobrir somente telas do evento atual (`/caixa`, `/caixa/fiado`, `/caixa/fiados`) e MUST NOT alterar o fluxo de fiados gerais em múltiplos eventos.

#### Scenario: Fora de escopo
- **WHEN** o usuário acessa a visão de fiados gerais
- **THEN** nenhum comportamento novo de integração de caixa é aplicado por esta change
