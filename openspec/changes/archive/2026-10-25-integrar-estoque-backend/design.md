# Design

## Context

Ver `proposal.md` - Why. Restrições relevantes:

- O frontend de inventário ainda usa contrato legado (`/products`, IDs string, campos em inglês e detalhe embutido), enquanto a API real usa `/produtos`, `/categorias`, `/tipos-movimentacao`, `/produtos/{id}/estoques` e movimentações paginadas.
- `GET /produtos` retorna array sem paginação; filtros de status de estoque não cobrem todo o comportamento atual da tela.
- `PUT /produtos/{id}` responde `204`, e foto de produto é endpoint separado em multipart.
- `GET /tipos-movimentacao` devolve somente tipos manuais; `CONSUMO_INTERNO` exige `eventoId` de `REUNIAO`.
- `MovimentacaoController` e `CategoriaController` exigem `ESTOQUE_MENU`; leitura de produtos aceita `PRODUTOS_LEITURA`.
- O modo demo (`VITE_DEMO_MODE=true`) usa adapter legado e ficará fora de escopo.

## Goals / Non-Goals

**Goals:**

- Alinhar modelos, serviços e fluxos de inventário ao contrato da API real.
- Padronizar IDs como `number` no módulo e consumidores de catálogo.
- Integrar CRUD de produto, foto, categorias, lotes e movimentações com regras de negócio reais.
- Expor `eventoNome` em movimentações para manter contexto de histórico.

**Non-Goals:**

- Atualizar adapter demo para o novo contrato.
- Criar helper genérico de permissões.
- Expandir escopo funcional de eventos, doações, vendas, caixa ou relatório além da adaptação de contrato para produtos.

## Decisions

### 1. Modelo API-native no padrão de Eventos

`src/features/inventario/models` passa a refletir DTOs da API (`nome`, `descricao`, `quantidadeAtual`, `estoqueMinimo`, `categoria`, `fotoUrl`), com `id: number`.

Alternativa descartada: manter modelo legado com mapeamento interno. Aumentaria manutenção e repetiria problema já resolvido na integração de eventos.

### 2. Listagem de produtos com paginação/filtros no cliente

`listarProdutos` consulta `GET /produtos` e a UI mantém paginação local para preservar UX atual e evitar quebra transversal.

Alternativa descartada: remover paginação da UI. Alteraria experiência e exigiria mudanças maiores em telas consumidoras.

### 3. Detalhe composto por três fontes

Detalhe de produto é montado com:
- `GET /produtos/{id}` (dados do produto),
- `GET /produtos/{id}/estoques` (lotes),
- `GET /produtos/{id}/movimentacoes` (histórico).

Alternativa descartada: depender de payload único embutido. O backend não oferece esse contrato.

### 4. Mutações de produto em duas etapas para foto

Fluxo de criação/edição:
1) `POST`/`PUT` de dados de produto,
2) `POST /produtos/{id}/foto` quando houver arquivo.

`PUT 204` é tratado como sucesso e seguido de refetch.

Alternativa descartada: enviar base64 no payload principal. Incompatível com contrato real.

### 5. Movimentações orientadas por tipo do backend

Tipos vêm de `GET /tipos-movimentacao` e form determinístico por metadados (`direcao`, `exigeCusto`). `CONSUMO_INTERNO` exige reunião selecionada.

Alternativa descartada: lista fixa local de tipos. Risco de divergência de regras e IDs.

### 6. `eventoNome` resolvido no serviço da API sem migration

`MovimentacaoResponse` ganha `eventoNome` e a camada de serviço/repositório resolve o nome do evento por `eventoId`.

Alternativa descartada: adicionar coluna persistida. Desnecessária para a necessidade de leitura atual.

### 7. Permissões sem helper dedicado

Sem helper novo. O módulo trata `403` com feedback e, quando necessário, usa checagens locais já disponíveis de permissões para ocultar ações de gestão.

Alternativa descartada: introduzir camada nova de autorização nesta change.

## Risks / Trade-offs

- [Demo não compatível com contrato novo] -> Mitigação: validar integração em ambiente real (`VITE_DEMO_MODE=false`) e registrar limitação.
- [Usuários com `PRODUTOS_LEITURA` recebem `403` em gestão] -> Mitigação: tratamento explícito de erro e indisponibilização de ações de escrita quando aplicável.
- [Impacto de IDs numéricos em consumidores] -> Mitigação: adaptação coordenada de eventos/doações/relatório na mesma change com typecheck completo.
- [`GET /produtos` sem paginação server-side] -> Mitigação: paginação/filtros locais e revisão futura se volume crescer.
- [`eventoNome` depende de lookup adicional] -> Mitigação: resolução no backend com consulta otimizada e cobertura de casos sem evento.

## Migration Plan

1. Pré-requisito API: adicionar `eventoNome` em DTO/serviço de movimentações e validar compilação.
2. Atualizar modelos e tipos do inventário para contrato API-native com IDs numéricos.
3. Reescrever serviços e hooks de inventário/categorias/movimentações para rotas reais.
4. Adaptar páginas e componentes do inventário (lista, detalhe, modais, lotes, exclusão).
5. Adaptar consumidores de catálogo em eventos, doações e relatório.
6. Validar com `typecheck`, `lint`, `lint:boundaries`, testes e smoke manual contra backend.

Rollback: reverter arquivos de frontend e alteração de `MovimentacaoResponse`/serviço na API; sem migration de banco para desfazer.

## Open Questions

Nenhuma pendente para iniciar implementação.
