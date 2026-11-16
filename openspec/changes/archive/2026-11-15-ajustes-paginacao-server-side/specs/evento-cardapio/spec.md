# Spec Delta

## MODIFIED Requirements

### Requirement: Consulta do cardápio
O cardápio SHALL consultar `GET /eventos/{id}/produtos` e `GET /eventos/{id}/produtos/categorias` e exibir nome, categoria, origem, quantidade prevista, quantidade vendida, preço de venda, desconto e custo. Busca, categoria e origem SHALL ser enviados à API e a interface SHALL consumir a resposta como paginação server-side.

#### Scenario: Cardápio com itens
- **WHEN** a API devolve uma página com itens do evento
- **THEN** a tela exibe a lista com previsto, vendido, preço, custo e indicadores de lucro por item

#### Scenario: Filtros do cardápio
- **WHEN** o usuário pesquisa por nome ou seleciona categoria ou origem
- **THEN** a consulta envia os filtros à API e apenas os itens correspondentes à resposta paginada são exibidos

#### Scenario: Cardápio vazio
- **WHEN** a API devolve lista vazia
- **THEN** a tela exibe o estado vazio com a ação de adicionar produto
