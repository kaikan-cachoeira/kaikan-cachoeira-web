# carregamento-lista-integral Specification

## Purpose

Permite que telas e modais que precisam de uma coleção completa obtenham todos os itens de uma resposta paginada antes de montar opções, seleções ou catálogos derivados. Isso evita listas incompletas quando a fonte tem mais itens do que uma única página.

## Requirements

### Requirement: Carregamento completo de coleção paginada
Consumidores que dependem da lista integral SHALL carregar todas as páginas disponíveis e expor o conjunto completo de itens antes de renderizar opções ou seleções derivadas.

#### Scenario: Lista atravessa múltiplas páginas
- **WHEN** a fonte paginada contém itens em mais de uma página
- **THEN** o consumidor disponibiliza todos os itens ao usuário e nenhuma opção das páginas posteriores fica ausente

#### Scenario: Falha em página intermediária
- **WHEN** uma das páginas necessárias para completar a coleção falha ao carregar
- **THEN** o consumidor exibe erro e não apresenta um conjunto parcial como se estivesse completo
