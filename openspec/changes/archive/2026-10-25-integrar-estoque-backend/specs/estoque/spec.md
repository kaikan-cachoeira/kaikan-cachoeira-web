# Spec Delta

## Purpose

Define a integração do módulo de estoque com a API real para cadastro, consulta e movimentação de produtos por lotes, mantendo consistência com permissões e regras de negócio do backend.

## ADDED Requirements

### Requirement: Catálogo de produtos do estoque
O inventário SHALL consultar `GET /produtos` como fonte de verdade e expor filtros de busca, categoria e situação de estoque na UI. A listagem SHALL manter paginação no cliente e usar IDs numéricos em navegação, seleção e ações.

#### Scenario: Produtos carregados da API
- **WHEN** a API retorna `ProdutoResponse[]`
- **THEN** a tela exibe os produtos com nome, categoria, saldo atual e estoque mínimo usando o contrato da API

#### Scenario: Filtros aplicados
- **WHEN** o usuário informa busca, categorias ou situação de estoque
- **THEN** a lista exibida reflete os filtros sem alterar o contrato de resposta da API

#### Scenario: Usuário com leitura apenas
- **WHEN** o usuário possui apenas `PRODUTOS_LEITURA`
- **THEN** a consulta de catálogo continua disponível e operações de gestão podem ser rejeitadas pela API com tratamento de erro

### Requirement: Detalhe de produto composto por consultas reais
O detalhe SHALL ser composto por `GET /produtos/{id}`, `GET /produtos/{id}/estoques` e `GET /produtos/{id}/movimentacoes`, sem depender de payload embutido. A paginação de movimentações SHALL adaptar `page` 0-based da API para experiência 1-based na UI.

#### Scenario: Abertura do detalhe
- **WHEN** o usuário abre um produto
- **THEN** o sistema mostra dados gerais, lotes e histórico carregados das rotas reais

#### Scenario: Histórico paginado
- **WHEN** o usuário navega entre páginas do histórico
- **THEN** a requisição usa índice 0-based na API e a interface mantém numeração 1-based

### Requirement: CRUD de produtos com foto multipart
O módulo SHALL criar, editar e excluir produtos nas rotas `/produtos` e SHALL enviar foto em etapa separada com `POST /produtos/{id}/foto` usando `multipart/form-data` no campo `arquivo`. O `PUT /produtos/{id}` com resposta `204` MUST resultar em atualização do estado exibido.

#### Scenario: Criação com foto
- **WHEN** o usuário cria um produto com imagem válida
- **THEN** o sistema cria o produto, envia a foto na rota multipart e atualiza o catálogo

#### Scenario: Edição com retorno 204
- **WHEN** o usuário salva alterações de um produto existente
- **THEN** o sistema considera sucesso com `204` e recarrega os dados do produto para refletir a edição

#### Scenario: Exclusão confirmada
- **WHEN** o usuário confirma a exclusão de um produto
- **THEN** o sistema chama `DELETE /produtos/{id}` e atualiza lista e detalhes conforme o resultado

### Requirement: Gestão de categorias pelo contrato da API
Categorias SHALL usar `GET/POST/PUT/DELETE /categorias`, com mensagens de erro do backend preservadas para conflitos. A UI MUST tratar a rejeição de exclusão por vínculos de produtos sem mascarar a causa.

#### Scenario: Listagem de categorias
- **WHEN** o usuário abre o menu de categorias
- **THEN** o sistema exibe a lista retornada por `GET /categorias`

#### Scenario: Conflito ao excluir categoria
- **WHEN** a API responde conflito de categoria com produtos vinculados
- **THEN** a interface mantém a categoria e exibe a mensagem de conflito ao usuário

### Requirement: Movimentação manual com tipos e regras do backend
Movimentações manuais SHALL consultar `GET /tipos-movimentacao` e criar entradas/saídas com `POST /produtos/{id}/movimentacoes` usando `tipoMovimentacaoId`. A UI MUST respeitar `exigeCusto` e a obrigatoriedade de reunião em `CONSUMO_INTERNO`.

#### Scenario: Reabastecimento com custo obrigatório
- **WHEN** o tipo selecionado exige custo
- **THEN** o envio só ocorre com `custoTotal` válido e maior que zero

#### Scenario: Consumo interno com reunião
- **WHEN** o tipo selecionado é `CONSUMO_INTERNO`
- **THEN** o sistema exige `eventoId` de um evento do tipo `REUNIAO` antes de enviar

#### Scenario: Histórico com contexto de evento
- **WHEN** uma movimentação possui vínculo de evento
- **THEN** o histórico exibe `eventoNome` retornado pela API de movimentações

### Requirement: Compatibilidade com consumidores de catálogo
O catálogo de produtos integrado SHALL manter compatibilidade funcional com os consumidores de eventos, doações e relatório geral, convertendo-os para IDs numéricos e campos API-native sem ampliar escopo dessas features.

#### Scenario: Seleção de produto no cardápio e doações
- **WHEN** os modais de eventos e doações consultam produtos
- **THEN** as opções exibem o novo contrato de produto e continuam permitindo seleção e envio válidos

#### Scenario: Contagens do relatório geral
- **WHEN** o relatório geral calcula métricas derivadas do estoque
- **THEN** os totais usam os campos do contrato novo e permanecem consistentes com o inventário
