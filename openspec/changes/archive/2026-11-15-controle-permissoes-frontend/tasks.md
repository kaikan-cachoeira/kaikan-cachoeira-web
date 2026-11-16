# Tasks

## 1. Núcleo de permissões

- [x] 1.1 Criar `src/shared/permissoes/permissoes.ts` com o union `Permissao` (as dez autoridades do backend), o catálogo `PERMISSOES` e a função pura `temPermissao(permissoes, permissao)`; verificar com `npm run typecheck` e com teste unitário cobrindo permissão presente, ausente e lista vazia
- [x] 1.2 Criar `src/shared/permissoes/PermissoesProvider.tsx` com o contexto e `usePermissoes`, que lança erro quando usado fora do provedor, no mesmo padrão de `useAutenticacao`; verificar com `npm run typecheck`
- [x] 1.3 Criar o componente `Permissao` que não renderiza os filhos quando a permissão exigida está ausente e renderiza normalmente quando presente; verificar com `npm run typecheck` e, após a integração da sidebar (5.1), confirmar que um item envolvido some para o OPERADOR
- [x] 1.4 Registrar em `docs/arquitetura.md`, na seção de decisões relevantes, que permissões são publicadas por contexto de `shared` fornecido pelo `AuthProvider` e que a API permanece a autoridade; verificar que o texto não contradiz o DAG documentado

## 2. Tabela de áreas e resolução de rota

- [x] 2.1 Criar `src/shared/navegacao/areas.ts` com as sete áreas, seus prefixos, rótulos, ícones e permissões, mais as entradas sem permissão (`/inicio`, `/em-definicao`); verificar com `npm run typecheck`
- [x] 2.2 Implementar `areaDaRota(pathname)` como função pura, respeitando fronteira de segmento e priorizando prefixos mais longos; verificar com teste unitário cobrindo `/estoque`, `/estoque/1/lotes/2/movimentacoes`, `/estoque-x`, `/caixa/fiado`, `/registro-vendas/historico`, `/inicio`, `/em-definicao/x` e rota desconhecida
- [x] 2.3 Implementar `podeAcessarRota(pathname, permissoes)` sobre `areaDaRota` e `temPermissao`; verificar com teste unitário cobrindo OPERADOR negado em `/estoque`, permitido em `/caixa/fiados`, administrador em todas as áreas e lista vazia permitida apenas em `/inicio` e `/em-definicao/*`
- [x] 2.4 Criar `docs/permissoes.md` com a tabela área → permissão e o catálogo de permissões; verificar que cada linha corresponde exatamente a um item de `areas.ts` e ao seed de permissões da API

## 3. Sessão e permissões

- [x] 3.1 Envolver os filhos do `AuthProvider` com o `PermissoesProvider`, alimentado por `sessao?.usuario.permissoes ?? []`; verificar com `npm run typecheck` e, no `npm run dev`, confirmar que o administrador continua vendo todas as áreas
- [x] 3.2 Extrair a validação de sessão persistida para uma função pura testável que rejeita sessão sem array de permissões e aceita lista vazia; verificar com teste unitário cobrindo campo ausente, `null`, tipo inválido, lista vazia e lista preenchida
- [x] 3.3 Aplicar a validação em `lerSessaoArmazenada`, descartando credenciais inválidas antes de publicar a sessão; verificar com teste unitário e, no navegador, gravando uma sessão sem `permissoes` no `localStorage` e confirmando o redirecionamento ao login

## 4. Guarda de rota

- [x] 4.1 Criar `GuardaDeArea` em `src/app/routes/` usando `useLocation` e `podeAcessarRota`, renderizando `PaginaNaoEncontrada` quando negado e o `Outlet` quando permitido; verificar autenticando como OPERADOR e abrindo `/estoque` diretamente, com 404 exibido dentro do shell e endereço preservado
- [x] 4.2 Inserir a guarda como rota de layout dentro do `AppLayout` em `AppRoutes`, preservando todas as rotas existentes e o catch-all; verificar que `/nao-existe` continua exibindo 404 e que `/inicio` e `/em-definicao/:slug` seguem acessíveis
- [x] 4.3 Confirmar a precedência autenticação → permissão; verificar que um visitante sem sessão em `/estoque` vai para o login e não para o 404

## 5. Navegação principal e painel inicial

- [x] 5.1 Passar a renderizar a sidebar a partir da tabela de áreas, filtrando itens por `temPermissao` e mantendo a ordem atual; verificar com OPERADOR que aparecem apenas Início, Registro de vendas e Caixa
- [x] 5.2 Adicionar permissão aos atalhos do painel inicial, filtrá-los e ocultar a seção quando não sobrar nenhum; verificar com OPERADOR que nenhum dos quatro atalhos aparece e que o título da seção não fica órfão
- [x] 5.3 Envolver os botões do cartão de evento do painel (`Registro de vendas`, `Caixa`, `Ver detalhes`) com a permissão de suas áreas e condicionar o cartão inteiro a `EVENTOS_LEITURA`; verificar removendo `EVENTOS_LEITURA` do array da sessão no `localStorage` e confirmando que o painel não exibe cartão nem estado de erro

## 6. Ações cruzadas, estados vazios e lacunas

- [x] 6.1 Proteger no cartão de evento os botões que levam a Registro de vendas e Caixa; verificar removendo `VENDAS_MENU` e `CAIXA_MENU` da sessão de um administrador e confirmando que os botões somem e os de Eventos permanecem
- [x] 6.2 No relatório geral, remover a navegação dos alertas de estoque e o botão de doações quando faltar permissão, preservando o texto informativo dos alertas; verificar removendo `ESTOQUE_MENU` e `DOACOES_MENU` da sessão de um administrador
- [x] 6.3 Ajustar os estados vazios de Registro de vendas, Histórico de vendas, Caixa e Fiados: ocultar o CTA para `/eventos` e trocar o texto para indicar que o evento depende de quem tem acesso a Eventos; verificar com OPERADOR sem evento em andamento
- [x] 6.4 Ajustar o estado vazio do painel inicial que aponta para `/eventos` da mesma forma; verificar com OPERADOR sem evento em andamento
- [x] 6.5 Registrar em `docs/permissoes.md` as duas lacunas de backend: o histórico de vendas exige `EVENTOS_MENU` mas deveria aceitar `VENDAS_MENU`, e `/relatorio-geral/fiados` consulta endpoint de intenção `CAIXA_MENU`; verificar que o texto cita os paths do `openapi.yaml` da API

## 7. Verificação de integração

- [x] 7.1 Percorrer as sete áreas com uma conta ADMINISTRADOR; verificar ausência de 404 indevido, sidebar completa e ações visíveis
- [x] 7.2 Percorrer a matriz do OPERADOR; verificar Início, Registro de vendas e Caixa acessíveis, Estoque/Eventos/Doações/Relatório em 404, PDV carregando cardápio e histórico de vendas exibindo o erro conhecido da API
- [x] 7.3 Rodar `npm test && npm run typecheck && npm run lint && npm run lint:boundaries && npm run build`; verificar que o gate completo passa sem violação de fronteira nova
- [x] 7.4 Rodar `openspec validate controle-permissoes-frontend --strict`; verificar que a change não reporta erro

## Workflow follow-up

- Arquivar a change depois da revisão do projeto.
- Verificar o resultado arquivado em `openspec/specs/`.
