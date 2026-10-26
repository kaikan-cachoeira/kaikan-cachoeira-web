# Tasks

## 1. Backend de doações com `eventoNome`

- [x] 1.1 Atualizar `DoacaoResponse` na API para incluir `eventoNome` obrigatório e ajustar o mapeamento em `DoacaoService`, verificando com `./mvnw -q -DskipTests compile` no repositório `../kaikan-cachoeira-api`.
- [x] 1.2 Garantir resposta resiliente na listagem de doações quando houver inconsistência legada de evento, verificando com chamada manual (`GET /doacoes`) que a listagem continua respondendo sem queda global.
- [x] 1.3 Atualizar documentação da API (OpenAPI) para refletir `eventoNome` no contrato de `DoacaoResponse`, verificando presença do campo em `openapi.yaml`.

## 2. Contrato API-native no frontend de doações

- [x] 2.1 Reescrever `src/features/doacoes/models/doacoes.ts` para contrato API-native (`id:number`, enums backend, `eventoNome`), verificando com `npm run typecheck` que os erros se concentram nos consumidores ainda não adaptados.
- [x] 2.2 Migrar `src/features/doacoes/services/doacoes.ts` para `/doacoes` com adaptação de paginação 0-based/1-based e normalização de tipos/forma de pagamento, verificando por teste manual de filtros e paginação na tela de doações.
- [x] 2.3 Ajustar `useDoacoes` para novo contrato e invalidação de cache consistente em criação/edição, verificando refresh da listagem após salvar.

## 3. UI de doações alinhada ao backend

- [x] 3.1 Adaptar `DoacaoModal` para enums backend (`DINHEIRO|PRODUTO|REABASTECIMENTO` e `PIX|DEBITO|CREDITO|DINHEIRO`) e `PUT 204`, verificando criação/edição bem-sucedidas para cada tipo de doação.
- [x] 3.2 Adaptar `DoacoesPage` para renderização com `eventoNome` e campos API-native, verificando tabela, filtros e paginação sem campos legados.
- [x] 3.3 Manter ação de excluir habilitada sem chamada backend, exibindo toast de indisponibilidade temporária ao acionar, verificando que nenhuma requisição DELETE é enviada.

## 4. Compatibilidade com detalhe de eventos e validações finais

- [x] 4.1 Ajustar pontos de consumo em eventos/relatório relacionados a doações para contrato atualizado, verificando exibição de doações no detalhe de evento sem regressão.
- [x] 4.2 Rodar `npm run typecheck`, `npm run lint`, `npm run lint:boundaries` e `npm test`, verificando ausência de erros bloqueantes.
- [x] 4.3 Executar smoke manual com `VITE_DEMO_MODE=false` cobrindo listagem, filtros, criação, edição e ação de excluir com toast, registrando evidência dos cenários validados.

## Workflow follow-up

- Arquivar a change após revisão e validação final do time.
