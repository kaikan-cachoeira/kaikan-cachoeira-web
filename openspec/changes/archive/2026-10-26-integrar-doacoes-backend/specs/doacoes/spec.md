# Spec Delta

## Purpose

Definir a integração do módulo de doações com a API real para listagem, cadastro e edição no contrato backend, garantindo consistência de tipos, paginação e dados exibidos entre telas.

## ADDED Requirements

### Requirement: Listagem de doações no contrato da API
O módulo de doações SHALL consultar `GET /doacoes` como fonte de verdade, aplicando busca por texto, filtros por tipo e evento, com adaptação de paginação 0-based da API para experiência 1-based na UI.

#### Scenario: Lista carregada da API
- **WHEN** a API retorna `PaginaResponse<DoacaoResponse>`
- **THEN** a tela exibe itens, totais e paginação com os campos do contrato real

#### Scenario: Filtros aplicados
- **WHEN** o usuário informa pesquisa, tipos e eventos
- **THEN** a consulta envia `q`, `tipo` e `eventoId` no formato esperado pela API

#### Scenario: Navegação de páginas
- **WHEN** o usuário muda de página
- **THEN** a UI mantém contagem 1-based e a requisição usa índice 0-based

### Requirement: Registro de doação por tipo no domínio backend
O cadastro SHALL usar `POST /doacoes` com os tipos `DINHEIRO`, `PRODUTO` e `REABASTECIMENTO`, mapeando os campos obrigatórios por tipo e normalizando forma de pagamento para os valores aceitos pela API.

#### Scenario: Doação em dinheiro
- **WHEN** o usuário registra doação em dinheiro com valor válido
- **THEN** o payload envia `tipo=DINHEIRO`, `valor` e `formaPagamento` válidos

#### Scenario: Doação de produto
- **WHEN** o usuário registra doação de produto descritivo
- **THEN** o payload envia `tipo=PRODUTO` com `nome` do item

#### Scenario: Doação de reabastecimento
- **WHEN** o usuário registra reabastecimento com produto e quantidade
- **THEN** o payload envia `tipo=REABASTECIMENTO`, `produtoId` numérico e `quantidade`

### Requirement: Edição com resposta 204
A edição SHALL usar `PUT /doacoes/{id}` e MUST tratar resposta `204 No Content` como sucesso, atualizando a tela por invalidação/refetch sem depender de corpo de resposta.

#### Scenario: Edição bem-sucedida
- **WHEN** a API responde `204` após atualizar uma doação
- **THEN** a UI fecha o formulário e recarrega a listagem com os dados atualizados

#### Scenario: Erro de validação
- **WHEN** a API rejeita os dados com erro de validação
- **THEN** a UI mantém o formulário aberto e exibe a mensagem retornada

### Requirement: Representação de doação API-native
Doações SHALL ser representadas com `id` numérico, `eventoId`, `eventoNome`, `tipo`, `valor`, `formaPagamento`, `produtoId`, `nome`, `quantidade`, `doador`, `valorFicha` e datas em ISO 8601, mantendo compatibilidade de exibição entre telas.

#### Scenario: eventoNome obrigatório na resposta
- **WHEN** uma doação é retornada pela API
- **THEN** o item inclui `eventoNome` para exibição sem consultas adicionais obrigatórias

#### Scenario: Tipos de doação em enum backend
- **WHEN** a UI renderiza o tipo de uma doação
- **THEN** o valor exibido deriva do enum backend retornado e não de códigos legados locais

### Requirement: Ação de exclusão temporariamente indisponível
A ação de excluir doação SHALL permanecer visível e habilitada na UI, mas nesta fase MUST NOT executar chamada de exclusão no backend e SHALL informar indisponibilidade com feedback explícito.

#### Scenario: Clique em excluir
- **WHEN** o usuário aciona a ação de excluir doação
- **THEN** a interface exibe toast de funcionalidade indisponível sem alterar os dados

#### Scenario: Sem endpoint de exclusão
- **WHEN** a funcionalidade é usada nesta change
- **THEN** nenhuma requisição de exclusão é enviada para a API
