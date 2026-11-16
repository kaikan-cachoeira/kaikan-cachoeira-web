# Proposal

## Why

O backend já devolve `usuario.permissoes` no login e protege cada endpoint por uma autoridade `*_MENU`, mas o frontend ignora esse dado: a sidebar exibe as sete áreas para todos, as rotas só verificam autenticação e todas as ações ficam sempre visíveis. Na prática, o cargo OPERADOR — que possui 5 das 10 permissões — vê o menu inteiro e recebe `403` em Estoque, Doações, Relatórios e detalhe de evento. Duas changes anteriores adiaram explicitamente um helper de permissões, então a lacuna é conhecida e agora impede o perfil de operador de ser utilizável.

## What Changes

- Camada transversal de permissões: as permissões da sessão passam a ser publicadas em estado compartilhado e consumidas por um hook e por um componente de ocultação.
- Gate de rota por área: cada prefixo de área mapeia para exatamente um `*_MENU`. Rota negada renderiza a página 404 existente **dentro** do shell da aplicação, sem revelar que o endereço existe. `/inicio` e `/em-definicao/*` permanecem acessíveis a qualquer usuário autenticado.
- Sidebar, atalhos da home, abas e links que atravessam áreas passam a ser filtrados pela mesma tabela de áreas, para não oferecer caminhos que terminam em 404.
- Estados vazios cujo CTA aponta para uma área negada ganham texto alternativo, para não instruir o usuário a executar algo que ele não pode.
- **BREAKING** (de interface): o OPERADOR deixa de acessar Estoque, Eventos, Doações e Relatório geral, passando a ver apenas Início, Registro de vendas e Caixa.
- Sessão persistida sem o campo de permissões é descartada na restauração, forçando novo login.
- Lacuna de backend registrada, não contornada: `GET /eventos/{id}/vendas` exige `EVENTOS_MENU`, mas deveria aceitar `VENDAS_MENU`. O frontend mantém `VENDAS_MENU` para todo `/registro-vendas/*`; até a correção, o OPERADOR vê erro de carregamento no histórico de vendas.
- Modo de demonstração fica fora de escopo.

## Capabilities

### New Capabilities

- `permissoes`: controle de acesso por permissão no frontend — publicação das permissões da sessão, resolução de área a partir da rota, resposta 404 para rota negada e ocultação de navegação e ações pertencentes a áreas sem permissão.

### Modified Capabilities

- `autenticacao`: a sessão passa a expor as permissões do usuário à interface, a limpá-las no encerramento e a descartar sessão restaurada que não as contenha.

## Impact

- `src/shared/permissoes/` (novo): catálogo, funções puras de verificação, store e componente de ocultação.
- `src/shared/navegacao/areas.ts` (novo): tabela de áreas com prefixo, rótulo, ícone e permissão.
- `src/features/auth/providers/AuthProvider.tsx`: publica e limpa permissões junto com a sessão; guarda de sessão legada.
- `src/app/routes/`: nova guarda de área aplicada dentro do `AppLayout`; rotas existentes preservadas.
- `src/app/layouts/AppLayout/Sidebar.tsx`: itens filtrados pela tabela de áreas.
- `src/features/home/pages/HomePage.tsx`, `src/features/eventos/components/EventoCard.tsx`, abas de vendas e CTAs de estado vazio em vendas, caixa, eventos e relatório.
- `docs/`: nota sobre a lacuna de `VENDAS_MENU` no histórico de vendas.
- Sem alteração de API, dependências ou backend. A API continua sendo a autoridade de autorização; o gate é de interface.
