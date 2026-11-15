# Tasks

## 1. Base de paginação integral

- [x] 1.1 Implementar o helper reutilizável para carregar todas as páginas de uma coleção paginada e verificar que ele retorna todos os itens sem perda de itens das páginas posteriores.
- [x] 1.2 Atualizar os consumidores que precisam de lista completa para usar o helper (eventos, produtos e cardápio quando aplicável) e verificar que os selects exibem opções vindas de mais de uma página.

## 2. Eventos e cardápio server-side

- [x] 2.1 Ajustar a listagem de eventos para depender da paginação e filtros server-side (`status`/`tipos`), preservando multi-select, e verificar visualmente a listagem, filtros e estado vazio na página de eventos.
- [x] 2.2 Ajustar a consulta do cardápio para buscar busca/categoria/origem no servidor e verificar visualmente o cardápio do evento e o registro de vendas com itens vindos de páginas diferentes.
- [x] 2.3 Atualizar os consumidores que usam o cardápio/produtos em modais para carregar a coleção integral quando precisarem de seleção completa e verificar que itens além da primeira página continuam selecionáveis.

## 3. Estoque e fiados com contrato consistente

- [x] 3.1 Ajustar o catálogo de produtos do estoque para usar paginação server-side e filtro de situação (`situacao`) no servidor e verificar visualmente os estados ok/out/low em mais de uma página.
- [x] 3.2 Ajustar a listagem de fiados por evento para paginação server-side com totais globais e verificar visualmente a paginação, os filtros e a consistência de pending/open amount ao trocar de página.
- [x] 3.3 Atualizar os fluxos de fiados gerais e relatório para consumir os totais globais corretos e verificar que os números exibidos não mudam ao navegar na lista paginada.

## 4. Validação final

- [x] 4.1 Executar `npm test` e verificar que a suíte passa.
- [x] 4.2 Executar `npm run build` e verificar que o build conclui sem erros.
- [x] 4.3 Validar manualmente no navegador os fluxos afetados: eventos, cardápio, estoque, caixa/fiados e seleções que dependem de listas completas.
