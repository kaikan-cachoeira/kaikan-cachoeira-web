# vendas Specification

## Purpose

Definir o contrato do registro de vendas no frontend usando os endpoints reais de vendas por evento, com consistência entre PDV, histórico, detalhe, cancelamento e regras de desconto.

## Requirements

### Requirement: Registro de venda no contrato da API
O registro SHALL enviar `POST /eventos/{eventoId}/vendas` com `itens` no formato `{ produtoEventoId, quantidade }` e `valorFinal` opcional. A origem dos itens SHALL ser o carrinho atual do evento em andamento, convertendo identificadores para numérico na borda da requisição.

#### Scenario: Venda registrada com desconto global
- **WHEN** o usuário confirma a venda com itens válidos e `valorFinal` informado
- **THEN** a API recebe `valorFinal` e os itens no contrato backend e retorna criação bem-sucedida

#### Scenario: Venda registrada sem valor final explícito
- **WHEN** o usuário confirma a venda sem editar o valor final
- **THEN** a API recebe apenas os itens e calcula o total conforme contrato

### Requirement: Resumo da venda com valor final editável
O resumo SHALL exibir e permitir edição do campo `valorFinal` antes da confirmação. O desconto da venda MUST ser calculado como `totalComDescontoDosItens - valorFinal` e exibido em tempo real, respeitando validação de faixa entre zero e o total dos itens já descontados.

#### Scenario: Cálculo do desconto da venda
- **WHEN** o usuário altera o valor final para um valor menor que o total dos itens
- **THEN** o desconto exibido reflete exatamente a diferença entre total dos itens e valor final

#### Scenario: Valor final inválido
- **WHEN** o usuário informa valor final negativo ou maior que o total dos itens
- **THEN** a interface bloqueia confirmação e apresenta validação do campo

### Requirement: Desconto por item persistente no cardápio
Aplicar ou remover desconto por item SHALL usar os endpoints de desconto do produto do evento. O desconto aplicado MUST permanecer após registrar vendas futuras e só pode ser removido por ação explícita de remoção de desconto.

#### Scenario: Aplicar desconto no item
- **WHEN** o usuário aplica novo preço para um produto do cardápio no registro de vendas
- **THEN** a interface chama o endpoint de aplicação de desconto e recarrega os dados do cardápio com o preço descontado persistido

#### Scenario: Persistência após concluir venda
- **WHEN** uma venda é concluída com produto que recebeu desconto
- **THEN** o produto permanece com desconto aplicado no cardápio para vendas seguintes

#### Scenario: Remover desconto no item
- **WHEN** o usuário aciona "Remover desconto"
- **THEN** a interface chama o endpoint de remoção e o item volta ao preço sem desconto

### Requirement: Histórico de vendas por evento no contrato real
O histórico SHALL consultar `GET /eventos/{eventoId}/vendas` com filtros `q`, `dataHoraInicio`, `dataHoraFim`, `cancelada`, `page` e `size`, adaptando paginação 0-based da API para exibição 1-based na UI.

#### Scenario: Filtro de status convertido para cancelada
- **WHEN** o usuário filtra por ativas ou canceladas
- **THEN** a consulta envia `cancelada=false` para ativas e `cancelada=true` para canceladas

#### Scenario: Filtro de período no histórico
- **WHEN** o usuário informa datas de início e fim
- **THEN** a consulta envia intervalo em ISO 8601 compatível com o backend

#### Scenario: Navegação de páginas
- **WHEN** o usuário muda de página no histórico
- **THEN** a UI mantém contagem 1-based e a requisição usa índice 0-based

### Requirement: Detalhe de venda sob demanda
Os detalhes de uma venda SHALL ser obtidos via `GET /eventos/{eventoId}/vendas/{vendaId}` ao abrir a visualização de detalhes, exibindo itens, desconto, total e estado de cancelamento conforme o contrato backend.

#### Scenario: Abrir detalhes da venda
- **WHEN** o usuário clica em "Ver detalhes" no histórico
- **THEN** a interface consulta o endpoint de detalhe e renderiza itens e totais retornados

### Requirement: Cancelamento de venda com resposta sem corpo
Cancelar venda SHALL usar `POST /eventos/{eventoId}/vendas/{vendaId}/cancelamento` e MUST tratar `204 No Content` como sucesso, atualizando histórico e estados relacionados sem depender de payload de resposta.

#### Scenario: Cancelamento realizado
- **WHEN** o backend responde `204` para o cancelamento
- **THEN** a venda aparece como cancelada no histórico após refetch e com feedback de sucesso

#### Scenario: Cancelamento rejeitado
- **WHEN** o backend responde conflito por venda já cancelada ou evento encerrado
- **THEN** a interface mantém o estado atual e exibe a mensagem de erro da API
