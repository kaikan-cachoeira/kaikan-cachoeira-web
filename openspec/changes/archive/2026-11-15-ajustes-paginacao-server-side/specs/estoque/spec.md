# Spec Delta

## MODIFIED Requirements

### Requirement: Catálogo de produtos do estoque
O inventário SHALL consultar `GET /produtos` como fonte de verdade e expor filtros de busca, categoria e situação de estoque (`situacao`) na UI. A listagem SHALL consumir paginação server-side e a situação de estoque (`ok`, `out` e `low`) SHALL refletir o conjunto consultado pela API.

#### Scenario: Produtos carregados da API
- **WHEN** a API retorna uma página de produtos
- **THEN** a tela exibe os produtos com nome, categoria, saldo atual e estoque mínimo usando o contrato da API

#### Scenario: Filtros aplicados
- **WHEN** o usuário informa busca, categorias ou situação de estoque
- **THEN** a consulta envia os filtros à API e a lista exibida corresponde à resposta paginada retornada

#### Scenario: Usuário com leitura apenas
- **WHEN** o usuário possui apenas `PRODUTOS_LEITURA`
- **THEN** a consulta de catálogo continua disponível e operações de gestão podem ser rejeitadas pela API com tratamento de erro
