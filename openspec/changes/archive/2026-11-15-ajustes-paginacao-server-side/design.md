# Design

## Context

Veja `proposal.md` para o motivo da mudança. Hoje o frontend mistura consultas paginadas com filtros e contagens locais em vários módulos: eventos, cardápio, estoque e fiados. Alguns fluxos de seleção ainda precisam da coleção completa, enquanto telas operacionais precisam refletir exatamente a página e os filtros retornados pela API.

## Goals / Non-Goals

**Goals:**
- Tornar as listagens operacionais coerentes com paginação server-side.
- Garantir que seleções e catálogos derivados continuem recebendo listas completas.
- Fazer os totais de fiados refletirem o conjunto completo filtrado, não só a página atual.
- Manter a UX de multi-select nos filtros de eventos.

**Non-Goals:**
- Reorganizar a UI ou alterar o layout das telas.
- Mudar regras de negócio dos módulos além do contrato de paginação/filtro.
- Introduzir novas dependências ou um estado global novo para compartilhamento de listas.

## Decisions

1. **Helper reutilizável para carregamento integral**
   - Consumidores que precisam da lista completa vão carregar todas as páginas e consolidar os itens antes de montar opções.
   - Alternativa considerada: aumentar `pageSize` e assumir “quase tudo”. Rejeitada por ser frágil e cortar dados quando a coleção cresce.

2. **Páginas operacionais continuam paginadas na origem**
   - Eventos, estoque e cardápio passam a depender da resposta paginada da API para refletir o conjunto real consultado.
   - Alternativa considerada: paginar localmente após receber a lista completa. Rejeitada porque volta a custar memória/tráfego e perde a semântica server-side.

3. **Filtros que mudam o conjunto precisam ser server-side**
   - Busca/categoria/origem no cardápio e situação de estoque saem do pós-processamento local e viram parte da consulta.
   - Alternativa considerada: manter filtros locais sobre a página atual. Rejeitada porque produz resultados incompletos em listas maiores.

4. **Fiados precisam de resumo global separado da página**
   - A listagem continua paginada, mas `pendingCount/openAmount` devem refletir o conjunto filtrado completo.
   - Alternativa considerada: derivar o resumo dos itens da página. Rejeitada porque expõe números enganosos.

5. **Multi-select de eventos permanece na UI**
   - O comportamento esperado é preservar várias seleções de status/tipo, então a implementação precisa acomodar isso sem reduzir a experiência para single-select.
   - Alternativa considerada: simplificar a interface para um único valor. Rejeitada por quebrar a expectativa atual do usuário.

## Risks / Trade-offs

- Mais chamadas de rede no carregamento integral -> mitigar usando apenas em seleções/fluxos que realmente precisam da coleção completa.
- Divergência entre contratos atuais e comportamento desejado -> mitigar alinhando os deltas de spec e validando os consumidores dependentes antes de implementar.
- Totais globais de fiados dependem do contrato exposto pelo backend -> mitigar consumindo `pendingCount/openAmount` e não recalculando no cliente.
- Filtros server-side podem exigir adaptação de queries e caches -> mitigar invalidando por chave de consulta e testando navegação entre páginas/filtros.

## Migration Plan

1. Atualizar os consumidores de lista completa para usar o carregamento integral somente onde necessário.
2. Ajustar eventos, cardápio, estoque e fiados para consumirem a paginação/filtros server-side.
3. Validar os totais globais de fiados com filtros e troca de páginas.
4. Testar manualmente as telas afetadas e depois rodar `npm test` e `npm run build`.
5. Se algum fluxo de seleção ficar parcial, reverter o consumidor específico para o fallback de lista integral sem mexer nas telas paginadas.

## Open Questions

Nenhuma.
