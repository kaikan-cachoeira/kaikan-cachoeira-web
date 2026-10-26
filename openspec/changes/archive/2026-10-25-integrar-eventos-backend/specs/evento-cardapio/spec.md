# Spec Delta

## Purpose

Define como o frontend consulta e mantém o cardápio de um evento contra a API real, cobrindo itens de estoque e produzidos, categorias, quantidades, preços, custos e foto.

## ADDED Requirements

### Requirement: Consulta do cardápio

O cardápio SHALL consultar `GET /eventos/{id}/produtos` e `GET /eventos/{id}/produtos/categorias` e exibir nome, categoria, origem, quantidade prevista, quantidade vendida, preço de venda, desconto e custo. Busca, categoria e tipo SHALL ser filtrados no cliente.

#### Scenario: Cardápio com itens

- **WHEN** a API devolve itens para o evento
- **THEN** a tela exibe a lista com previsto, vendido, preço, custo e indicadores de lucro por item

#### Scenario: Filtros do cardápio

- **WHEN** o usuário pesquisa por nome ou seleciona categoria ou tipo
- **THEN** apenas os itens correspondentes são exibidos

#### Scenario: Cardápio vazio

- **WHEN** a API devolve lista vazia
- **THEN** a tela exibe o estado vazio com a ação de adicionar produto

### Requirement: Adicionar item de estoque

A adição de item de estoque SHALL enviar `origem: ESTOQUE`, `produtoId`, `quantidadePrevista` e `precoVenda`. O item MUST referenciar um produto ativo e não pode repetir um produto já presente no cardápio do evento.

#### Scenario: Item de estoque adicionado

- **WHEN** o usuário seleciona um produto do estoque, quantidade e preço válidos
- **THEN** a API cria o item e o cardápio é atualizado com o snapshot do produto

#### Scenario: Produto duplicado

- **WHEN** o produto selecionado já está no cardápio do evento
- **THEN** a tela exibe a mensagem de conflito retornada pela API e não cria duplicata

#### Scenario: Estoque insuficiente

- **WHEN** a quantidade prevista excede o saldo disponível do produto
- **THEN** a tela impede o envio ou exibe o erro retornado pela API

### Requirement: Adicionar item produzido

A adição de item produzido SHALL enviar `origem: PRODUZIDO`, `nome`, `precoVenda` e `custoTotalIngredientes`, com categoria e descrição opcionais. O item produzido MUST NOT gerar movimentação de estoque.

#### Scenario: Item produzido adicionado

- **WHEN** o usuário informa nome, preço e custo de ingredientes válidos
- **THEN** a API cria o item como produzido e o cardápio o exibe sem quantidade prevista de estoque

#### Scenario: Nome duplicado

- **WHEN** já existe item produzido com o mesmo nome no evento
- **THEN** a tela exibe o conflito retornado pela API

### Requirement: Editar item do cardápio

A edição SHALL ocorrer somente com o evento em `NAO_INICIADO` e MUST preservar a origem do item. Itens de estoque SHALL permitir alterar preço e quantidade prevista; itens produzidos SHALL permitir alterar nome, descrição, categoria, preço e custo de ingredientes.

#### Scenario: Editar item de estoque

- **WHEN** o usuário altera preço ou quantidade de um item de estoque
- **THEN** a API recebe o payload atualizado e o cardápio reflete os novos valores

#### Scenario: Editar item produzido

- **WHEN** o usuário altera dados de um item produzido
- **THEN** a API recebe o payload atualizado e o custo total de ingredientes é recalculado

#### Scenario: Origem imutável

- **WHEN** o usuário abre a edição de um item
- **THEN** o tipo do item não pode ser trocado entre estoque e produzido

### Requirement: Remover item do cardápio

A remoção SHALL usar `DELETE /eventos/{id}/produtos/{itemId}` e só é permitida com o evento em `NAO_INICIADO` e para itens nunca vendidos. A resposta 204 SHALL atualizar o cardápio sem esperar corpo.

#### Scenario: Item removido

- **WHEN** o usuário remove um item não vendido de um evento não iniciado
- **THEN** o item desaparece do cardápio

#### Scenario: Item já vendido

- **WHEN** o item possui vendas registradas
- **THEN** a tela exibe a mensagem de conflito e mantém o item

### Requirement: Foto do item do cardápio

O envio de foto SHALL usar `POST /eventos/{id}/produtos/{itemId}/foto` com `multipart/form-data` no campo `arquivo`. A URL relativa devolvida SHALL ser resolvida contra a base da API para exibição.

#### Scenario: Foto enviada

- **WHEN** o usuário seleciona uma imagem JPG, PNG ou WEBP
- **THEN** a imagem é enviada após salvar o item e passa a aparecer no cardápio

#### Scenario: Arquivo inválido

- **WHEN** o arquivo não é uma imagem aceita
- **THEN** a tela exibe erro e não envia a requisição

### Requirement: Disponibilidade de manutenção do cardápio

As ações de adicionar, editar, remover e enviar foto SHALL estar disponíveis apenas para eventos do tipo `EVENTO` e no status `NAO_INICIADO`. Reuniões MUST NOT oferecer cardápio.

#### Scenario: Evento já iniciado

- **WHEN** o evento está em `EM_ANDAMENTO` ou `ENCERRADO`
- **THEN** as ações de manutenção ficam indisponíveis e a API rejeita tentativas com a mensagem de conflito

#### Scenario: Reunião

- **WHEN** o evento é do tipo `REUNIAO`
- **THEN** a interface não oferece acesso ao cardápio

### Requirement: Representação do item do cardápio

Itens SHALL ser representados com `id` e `produtoId` numéricos, `origem` (`ESTOQUE` ou `PRODUZIDO`), nome, descrição, categoria, `precoVenda`, `desconto`, `quantidadePrevista`, `quantidadeVendida`, `restantePrevisto`, `custoTotalIngredientes` e `fotoUrl`.

#### Scenario: Identificador numérico

- **WHEN** o item é usado em chamadas de edição, remoção, foto ou venda
- **THEN** seu identificador é tratado como número

#### Scenario: Item de estoque versus produzido

- **WHEN** o item é exibido
- **THEN** a origem determina se quantidade prevista e restante são mostrados ou se apenas o custo de ingredientes aparece
