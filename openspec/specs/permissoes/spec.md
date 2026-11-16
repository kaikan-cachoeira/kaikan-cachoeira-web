# permissoes Specification

## Purpose

Define como o cliente web decide o que um usuário autenticado pode acessar e visualizar a partir das permissões devolvidas pela API, mantendo a autorização do servidor como autoridade final.

## Requirements

### Requirement: Permissão verificada a partir da sessão ativa

O cliente SHALL considerar que um usuário possui uma permissão somente quando ela estiver presente no conjunto publicado pela sessão ativa. Na ausência da permissão, a verificação SHALL resultar em negado, sem inferência por cargo ou por permissões semelhantes.

#### Scenario: Permissão presente

- **WHEN** o conjunto da sessão contém `CAIXA_MENU`
- **THEN** a verificação de `CAIXA_MENU` resulta em permitido

#### Scenario: Permissão ausente

- **WHEN** o conjunto da sessão não contém `ESTOQUE_MENU`
- **THEN** a verificação de `ESTOQUE_MENU` resulta em negado

#### Scenario: Sessão sem usuário

- **WHEN** não existe sessão ativa
- **THEN** qualquer verificação de permissão resulta em negado

### Requirement: Permissão de cada área

O cliente SHALL associar cada área de navegação a exatamente uma permissão de menu: Estoque a `ESTOQUE_MENU`, Eventos a `EVENTOS_MENU`, Doações a `DOACOES_MENU`, Registro de vendas a `VENDAS_MENU`, Caixa a `CAIXA_MENU` e Relatório geral a `RELATORIOS_MENU`.

#### Scenario: Administrador

- **WHEN** o usuário possui as sete permissões de menu
- **THEN** todas as áreas são acessíveis

#### Scenario: Operador

- **WHEN** o usuário possui apenas `VENDAS_MENU`, `CAIXA_MENU`, `EVENTOS_LEITURA`, `PRODUTOS_LEITURA` e `CARDAPIO_EVENTO_LEITURA`
- **THEN** Registro de vendas e Caixa são acessíveis
- **AND** Estoque, Eventos, Doações e Relatório geral são negados

#### Scenario: Permissões de leitura não liberam a área

- **WHEN** o usuário possui `PRODUTOS_LEITURA` e não possui `ESTOQUE_MENU`
- **THEN** a área de Estoque é negada

### Requirement: Sub-rotas herdam a permissão da área

Toda rota sob o prefixo de uma área SHALL exigir a permissão dessa área, incluindo rotas com parâmetros e rotas filhas.

#### Scenario: Rota filha de estoque

- **WHEN** o usuário sem `ESTOQUE_MENU` acessa a rota de movimentações de um lote
- **THEN** o acesso é negado, ainda que a rota tenha parâmetros de produto e lote

#### Scenario: Rota filha de vendas

- **WHEN** o usuário possui `VENDAS_MENU` e acessa o histórico de vendas
- **THEN** o acesso à área é permitido

### Requirement: Rota de área negada responde 404

Usuário autenticado sem a permissão da área SHALL receber a página de não encontrada dentro do shell da aplicação, preservando o endereço acessado e sem indicar que a rota existe. A verificação de permissão SHALL ocorrer somente depois da verificação de autenticação.

#### Scenario: Operador acessa área negada

- **WHEN** um operador abre o endereço de Estoque diretamente pela barra do navegador
- **THEN** a página de não encontrada é exibida com a navegação principal visível
- **AND** o endereço digitado permanece na barra do navegador

#### Scenario: Usuário não autenticado

- **WHEN** um visitante sem sessão acessa o endereço de Estoque
- **THEN** o cliente o encaminha ao login
- **AND** não exibe a página de não encontrada

#### Scenario: Endereço inexistente

- **WHEN** um usuário autenticado acessa um endereço que não corresponde a nenhuma rota
- **THEN** a página de não encontrada é exibida como antes

### Requirement: Navegação omite áreas sem permissão

A navegação principal SHALL exibir somente as áreas permitidas. Atalhos, cartões, abas e botões que levam a uma área sem permissão MUST NOT ser renderizados.

#### Scenario: Navegação do operador

- **WHEN** um operador está autenticado
- **THEN** a navegação principal exibe apenas Início, Registro de vendas e Caixa

#### Scenario: Atalhos do painel inicial

- **WHEN** um operador abre o painel inicial
- **THEN** os atalhos de Estoque, Eventos, Doações e Relatório geral não são exibidos

#### Scenario: Ação que atravessa áreas

- **WHEN** um usuário com `EVENTOS_MENU` e sem `CAIXA_MENU` visualiza um evento em andamento
- **THEN** o botão que leva ao Caixa não é exibido
- **AND** os botões da própria área de Eventos continuam disponíveis

#### Scenario: Links de relatório

- **WHEN** um usuário com `RELATORIOS_MENU` e sem `DOACOES_MENU` abre o relatório geral
- **THEN** o link para a área de Doações não é exibido

### Requirement: Estado vazio não instrui ação sem permissão

Quando o CTA de um estado vazio pertence a uma área sem permissão, o cliente SHALL omitir o CTA e SHALL apresentar texto que não instrua o usuário a executar a ação.

#### Scenario: PDV sem evento em andamento

- **WHEN** um operador abre o registro de vendas e não há evento em andamento
- **THEN** o botão que leva à área de Eventos não é exibido
- **AND** o texto informa que o evento precisa ser iniciado por quem tem acesso a Eventos

#### Scenario: Caixa sem evento em andamento

- **WHEN** um operador abre o Caixa e não há evento em andamento
- **THEN** o botão que leva à área de Eventos não é exibido
- **AND** o texto não orienta o operador a iniciar o evento

### Requirement: Painel inicial acessível a qualquer usuário autenticado

A rota inicial SHALL permanecer acessível a todo usuário autenticado, independentemente de permissões. O conteúdo do painel SHALL ser filtrado por permissão, e a falta de permissão para os dados de uma seção não SHALL produzir estado de erro.

#### Scenario: Entrada do operador

- **WHEN** um operador conclui o login
- **THEN** o cliente o mantém no painel inicial ou o redireciona para ele
- **AND** o painel não exibe a página de não encontrada

#### Scenario: Raiz da aplicação

- **WHEN** qualquer usuário autenticado acessa a raiz
- **THEN** o cliente o redireciona ao painel inicial

#### Scenario: Sem permissão para os dados do painel

- **WHEN** o usuário não possui `EVENTOS_LEITURA`
- **THEN** o cartão de evento em andamento não é exibido
- **AND** o painel não apresenta erro de carregamento por causa disso

### Requirement: Rotas de infraestrutura exigem apenas autenticação

Rotas de conteúdo pendente e redirecionamentos de infraestrutura SHALL exigir apenas autenticação, sem permissão de área.

#### Scenario: Conteúdo pendente

- **WHEN** um usuário autenticado acessa um endereço de conteúdo pendente
- **THEN** a página de conteúdo pendente é exibida
- **AND** nenhuma permissão de área é exigida

### Requirement: Interface não substitui a autorização do servidor

A verificação de permissão no cliente SHALL ser tratada como decisão de interface. Resposta `403` da API SHALL continuar sendo apresentada como erro da operação e MUST NOT ser convertida em sucesso, em conteúdo vazio ou em página de não encontrada.

#### Scenario: Permissão revogada durante a sessão

- **WHEN** o usuário perde uma permissão no servidor e a sessão local ainda a contém
- **THEN** a interface pode exibir a ação
- **AND** a resposta `403` da API é apresentada como erro da operação
