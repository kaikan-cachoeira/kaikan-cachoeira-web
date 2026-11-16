# Permissões e áreas no frontend

O cliente recebe `usuario.permissoes` no login e usa esse conjunto para decidir
quais áreas e ações exibir. A autorização continua sendo da API: o gate do
frontend é decisão de interface, e um `403` do servidor é apresentado como erro
da operação.

A fonte de verdade da tabela de áreas é
`src/shared/navegacao/areas.ts`; o catálogo de permissões é
`src/shared/permissoes/permissoes.ts`.

## Catálogo de permissões

| Permissão | Uso |
| --- | --- |
| `EVENTOS_MENU` | Área de Eventos: detalhe, cardápio, status e exclusão |
| `ESTOQUE_MENU` | Área de Estoque: produtos, categorias, lotes e movimentações |
| `DOACOES_MENU` | Área de Doações |
| `VENDAS_MENU` | Área de Registro de vendas |
| `CAIXA_MENU` | Área de Caixa e fiados por evento |
| `RELATORIOS_MENU` | Área de Relatório geral |
| `DASHBOARD_MENU` | Sem uso no frontend no momento |
| `EVENTOS_LEITURA` | Listagem de eventos consumida pelo painel e pelo PDV |
| `PRODUTOS_LEITURA` | Leitura de produtos consumida pelo PDV |
| `CARDAPIO_EVENTO_LEITURA` | Leitura de cardápio consumida pelo PDV |

As três permissões de leitura não liberam área: são usadas pela API para
permitir que o painel e o PDV consultem dados sem as permissões de menu.

## Áreas e permissões

| Área | Prefixo | Permissão exigida | Item de menu |
| --- | --- | --- | --- |
| Início | `/inicio` | nenhuma (apenas autenticação) | sim |
| Estoque | `/estoque` | `ESTOQUE_MENU` | sim |
| Eventos | `/eventos` | `EVENTOS_MENU` | sim |
| Doações | `/doacoes` | `DOACOES_MENU` | sim |
| Relatório geral | `/relatorio-geral` | `RELATORIOS_MENU` | sim |
| Registro de vendas | `/registro-vendas` | `VENDAS_MENU` | sim |
| Caixa | `/caixa` | `CAIXA_MENU` | sim |
| Conteúdo pendente | `/em-definicao` | nenhuma (apenas autenticação) | não |

Todas as rotas sob o prefixo herdam a permissão da área, inclusive rotas com
parâmetros. Rota de área negada renderiza a página de não encontrada dentro do
shell, preservando o endereço: o frontend não revela que a rota existe.

## Perfis de referência

- `ADMINISTRADOR`: possui as dez permissões e acessa todas as áreas.
- `OPERADOR`: possui `VENDAS_MENU`, `CAIXA_MENU`, `EVENTOS_LEITURA`,
  `PRODUTOS_LEITURA` e `CARDAPIO_EVENTO_LEITURA`; acessa Início, Registro de
  vendas e Caixa.

## Lacunas conhecidas da API

Os pontos abaixo foram deliberadamente não contornados no cliente. O frontend
mantém a navegação prevista pela área, e a resposta da API continua sendo
apresentada como erro da operação.

- **Histórico de vendas.** `GET /eventos/{eventoId}/vendas` (operação
  `listarHistorico`) exige `EVENTOS_MENU`, mas a rota
  `/registro-vendas/historico` pertence à área de Registro de vendas
  (`VENDAS_MENU`). O endpoint deveria aceitar `VENDAS_MENU`. Enquanto isso, um
  OPERADOR que abre a aba Histórico recebe `403` e vê o erro da consulta; a aba
  permanece visível porque pertence à mesma área do PDV.
- **Fiados do relatório.** A rota `/relatorio-geral/fiados` pertence à área de
  Relatório geral (`RELATORIOS_MENU`), mas, ao filtrar por evento, consulta
  `GET /eventos/{eventoId}/fiados`, que exige `CAIXA_MENU`. Sem esse filtro, o
  cliente ainda usa `GET /fiados`, que não consta no `openapi.yaml`. Quem tem
  apenas `RELATORIOS_MENU` recebe `403` nos fiados filtrados por evento. O
  endpoint deveria aceitar `RELATORIOS_MENU` ou o relatório deveria publicar
  uma leitura própria.

## Como alterar

Para criar uma área, acrescente uma entrada em `AREAS` com `path`, `label`,
`icon`, `permissao` e `menu`, registre a rota em `AppRoutes` e atualize a tabela
acima. Guarda de rota, sidebar e atalhos derivam da mesma entrada.
