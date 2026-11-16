# Design

## Context

Ver `proposal.md` para motivação. O que restringe a solução:

- `Usuario.permissoes: string[]` já chega no login e é persistido junto com a sessão; nada o consome hoje.
- O backend protege cada endpoint por autoridade: sete `*_MENU` e três permissões de leitura (`EVENTOS_LEITURA`, `PRODUTOS_LEITURA`, `CARDAPIO_EVENTO_LEITURA`). Os cargos reais são ADMINISTRADOR (todas) e OPERADOR (cinco, sem nenhuma `*_MENU` além de `VENDAS_MENU` e `CAIXA_MENU`).
- `dependency-cruiser` proíbe `shared -> features/app` e `features -> app`, e verifica o DAG documentado em `docs/arquitetura.md`. `features/auth` é base e não deve ganhar dependências de outras features.
- Não há jsdom nem testing-library no projeto; testes são de funções e serviços com Vitest. Lógica testável precisa ficar fora do JSX.
- O router é declarativo (`BrowserRouter` + `<Routes>`), então `useMatches`/`handle` de data router não estão disponíveis.
- O refresh token devolve apenas tokens; `usuario` (e portanto `permissoes`) permanece o do login. Permissões são uma foto da sessão.
- O modo demo devolve sempre um administrador e fica fora do escopo.

## Goals / Non-Goals

**Goals:**

- Uma única fonte de verdade para "qual área exige qual permissão", consumida por guarda de rota e navegação, sem possibilidade de divergirem.
- Negar rota com a página 404 existente, dentro do shell, sem revelar que o endereço existe.
- Não oferecer nenhum caminho de navegação para área negada, inclusive CTAs de estado vazio.
- Manter a superfície de consumo simples: uma permissão por área, sem combinadores.

**Non-Goals:**

- Modelo de autorização no servidor, novos endpoints ou correção das lacunas de `VENDAS_MENU` e dos endpoints legados de relatório.
- Atualização de permissões durante a sessão além da renovação de token já existente.
- Modo demonstração com perfis distintos.
- Reescrever rotas para data router ou alterar o desenho do shell.

## Decisions

### Gate por área (`*_MENU`), não pela permissão de leitura

Cada área exige exatamente um `*_MENU`, aplicado a todas as rotas do prefixo.

| Área | Prefixo | Permissão |
| --- | --- | --- |
| Início | `/inicio` | nenhuma (apenas autenticação) |
| Estoque | `/estoque` | `ESTOQUE_MENU` |
| Eventos | `/eventos` | `EVENTOS_MENU` |
| Doações | `/doacoes` | `DOACOES_MENU` |
| Registro de vendas | `/registro-vendas` | `VENDAS_MENU` |
| Caixa | `/caixa` | `CAIXA_MENU` |
| Relatório geral | `/relatorio-geral` | `RELATORIOS_MENU` |
| Conteúdo pendente | `/em-definicao` | nenhuma (apenas autenticação) |

Consequências aceitas:

- `PRODUTOS_LEITURA` e `CARDAPIO_EVENTO_LEITURA` deixam de influenciar a interface. Continuam necessárias para a API permitir que o registro de vendas carregue produto e cardápio sem `ESTOQUE_MENU`/`EVENTOS_MENU`.
- O OPERADOR perde Estoque, Eventos, Doações e Relatório, mesmo tendo leitura de produtos e eventos.

**Alternativa descartada:** liberar a rota pela permissão que a página consulta (`ESTOQUE_MENU | PRODUTOS_LEITURA`, `EVENTOS_LEITURA`). Mantém o operador em mais telas, mas exige combinadores "qualquer uma de", separa o gate da navegação e expõe telas onde quase todo botão desaparece. O custo de suporte é maior que o ganho.

### Permissões como contexto React em `shared`, fornecido pelo `AuthProvider`

`features/auth` envolve os filhos com um provedor de `shared/permissoes`. Qualquer componente usa `usePermissoes`/`temPermissao`/`<Permissao>` sem criar aresta nova entre features.

**Por que contexto e não o padrão `definirToken`:** tokens são um canal de módulo porque o axios vive fora do React. Permissões são lidas apenas por componentes, e o contexto entrega o valor já no primeiro render. Um store de módulo, publicado por efeito, deixaria as permissões vazias no primeiro render após reload — a guarda responderia 404 antes do efeito corrigir, produzindo um piscar de tela errada.

**Alternativas descartadas:** expor `permissoes` no `AutenticacaoContexto` de `features/auth` (toda feature passaria a importar `auth`); passar permissões por props (prop drilling em cards, links e estados vazios).

### Catálogo tipado

Um union type `Permissao` com as dez strings do contrato e um objeto `PERMISSOES` para uso em JSX. String inválida em `<Permissao precisa="...">` passa a ser erro de compilação em vez de falha silenciosa em runtime.

### Tabela de áreas em `shared/navegacao/areas.ts`

Fonte única para guarda, sidebar e atalhos do painel. A `HomePage` é feature e não pode importar `app`, então a configuração precisa morar em `shared`; é configuração de navegação transversal, não regra de feature.

O array preserva a ordem da navegação e cada item carrega `path`, `permissao`, `label` e `icon`. A resolução da rota é uma função pura que respeita fronteira de segmento: igualdade com o prefixo ou `prefixo + "/"`, comparando prefixos mais longos primeiro.

### Guarda de área como layout route dentro do `AppLayout`

```
<Route element={<RotaProtegida />}>        autenticação
  <Route element={<AppLayout />}>          shell + sidebar filtrada
    <Route element={<GuardaDeArea />}>     permissão da área
      ...rotas existentes (inclui o catch-all *)
```

A guarda renderiza o filho quando permitida e `PaginaNaoEncontrada` quando negada. Ficar dentro do `AppLayout` garante o 404 com navegação e cabeçalho, e não exige uma rota `/404`. Renderizar no lugar, em vez de `Navigate`, preserva o endereço digitado, não cria entrada no histórico e não expõe a existência da rota. A ordem autenticação → permissão é obrigatória: visitante segue para o login, não para o 404.

Rotas sem área (painel inicial, conteúdo pendente, catch-all) retornam permissão nula e seguem para o `Outlet`.

### Ocultação de navegação e ações cruzadas

A tabela de áreas filtra a sidebar. Onde o elemento é a única informação disponível (alertas do relatório, por exemplo), a informação permanece e apenas o destino é removido — o requisito é não oferecer navegação para área negada, não apagar dado.

Inventário de pontos que atravessam áreas:

| Origem | Destino | Permissão |
| --- | --- | --- |
| Painel, cartão do evento | `/registro-vendas` | `VENDAS_MENU` |
| Painel, cartão do evento | `/caixa` | `CAIXA_MENU` |
| Painel, cartão do evento | `/eventos/:id` | `EVENTOS_MENU` |
| Painel, atalhos | quatro áreas | permissão de cada área |
| Painel, estado vazio | `/eventos` | `EVENTOS_MENU` |
| Cartão de evento em andamento | `/registro-vendas`, `/caixa` | `VENDAS_MENU`, `CAIXA_MENU` |
| Registro de vendas e histórico, estado vazio | `/eventos` | `EVENTOS_MENU` |
| Caixa e fiados, estado vazio | `/eventos` | `EVENTOS_MENU` |
| Relatório geral, alertas de estoque | `/estoque` | `ESTOQUE_MENU` |
| Relatório geral, seção de doações | `/doacoes` | `DOACOES_MENU` |

As abas existentes (`registro-vendas`/`historico`, `caixa`/`caixa/fiados`) ficam sempre dentro da mesma área e não precisam de filtro.

### Estados vazios com texto alternativo

Esconder o CTA deixa o texto original instruindo uma ação impossível ("Inicie um evento..."). Onde o CTA é removido, a mensagem passa a indicar que a ação depende de quem tem acesso à área de Eventos.

### Sessão legada sem permissões

A restauração lê a sessão persistida de forma síncrona. Se `usuario.permissoes` não for um array, a sessão é descartada e o usuário vai ao login. Lista vazia é válida. Isso evita o estado em que o usuário está autenticado, sem menu e com 404 em quase tudo, sem explicação.

### Histórico de vendas permanece em `VENDAS_MENU`

`GET /eventos/{id}/vendas` exige `EVENTOS_MENU`, mas a intenção do serviço é `VENDAS_MENU`. O frontend não contorna: a área usa `VENDAS_MENU`, a aba continua visível e a rota é permitida. Até a correção no backend, o OPERADOR vê erro de carregamento no histórico. Esconder a aba codificaria o defeito no cliente e ninguém o encontraria depois.

Lacuna secundária, de mesma natureza: `/relatorio-geral/fiados` pertence à área de relatório (`RELATORIOS_MENU`), mas consulta `/fiados`, de intenção `CAIXA_MENU`. Hoje nenhum cargo tem uma sem a outra; fica registrado, sem override.

## Risks / Trade-offs

- **Permissões congeladas no login** → mudança de cargo só vale em novo login; a interface pode mostrar ação que a API nega. Mitigação: a spec declara a API como autoridade e o `403` continua virando erro de operação.
- **404 para rota que existe** → suporte mais difícil de diagnosticar. Mitigação: o 404 é intencional (não revelar existência) e a tabela de áreas fica documentada em `docs/permissoes.md`.
- **CTA escondido deixa beco sem saída** → mitigação: copy alternativa nos seis estados vazios.
- **Divergência entre navegação e guarda** → mitigação: sidebar, guarda e atalhos leem o mesmo array; a ordem da sidebar também vem dele.
- **Piscar de 404 no reload** → mitigação: contexto fornecido no mesmo render da sessão, sem publicação assíncrona.
- **Lista de permissões desconhecida pelo frontend** (novo `*_MENU` no backend) → aparece como texto no type e não como área; sem impacto até existir tela correspondente.
- **`/relatorio-geral` já usa endpoints legados inexistentes no `openapi.yaml`** → problema anterior, fora do escopo; o gate não o agrava.

## Migration Plan

- Mudança apenas de cliente; sem migração de dados ou de API.
- No primeiro carregamento após o deploy, sessões persistidas sem lista de permissões são descartadas; afetados fazem login novamente. Comunicar no release.
- Rollback: reverter o commit. Nenhum dado persistido muda de formato — o campo já existia.
- Validação manual requer uma conta de OPERADOR real, já que o modo demo está fora de escopo.

## Open Questions

- `DASHBOARD_MENU` continua sem uso no frontend. Uma change futura pode usá-la para gating de conteúdo do painel, sem alterar a política de rota.
- A integração real de `/relatorio-geral` (hoje em endpoints legados) segue pendente e independente desta change.
