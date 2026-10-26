# Spec Delta

## MODIFIED Requirements

### Requirement: Adicionar item de estoque

A adição de item de estoque SHALL enviar `origem: ESTOQUE`, `produtoId`, `quantidadePrevista` e `precoVenda`. O item MUST referenciar um produto ativo e não pode repetir um produto já presente no cardápio do evento. A seleção de produtos MUST consumir o catálogo integrado de estoque com IDs numéricos e saldo atual compatível com `quantidadeAtual`.

#### Scenario: Item de estoque adicionado

- **WHEN** o usuário seleciona um produto do estoque, quantidade e preço válidos
- **THEN** a API cria o item e o cardápio é atualizado com o snapshot do produto

#### Scenario: Produto duplicado

- **WHEN** o produto selecionado já está no cardápio do evento
- **THEN** a tela exibe a mensagem de conflito retornada pela API e não cria duplicata

#### Scenario: Estoque insuficiente

- **WHEN** a quantidade prevista excede o saldo disponível do produto
- **THEN** a tela impede o envio ou exibe o erro retornado pela API
