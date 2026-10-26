# Spec Delta

## MODIFIED Requirements

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
