# Kaikan Cachoeira - Web

Interface web do sistema de gestão da associação. Veja a visão geral do projeto no [README da organização](https://github.com/kaikan-cachoeira).

## Stack

- React 19
- TypeScript (decisão ainda sujeita a revisão pelo time)
- Vite
- Axios
- React Router

## Como rodar

### Pré-requisitos

- Node.js 18+

### 1. Configurar variáveis de ambiente

```bash
cp .env.exemplo .env
```

### 2. Instalar e rodar

```bash
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173` (porta padrão do Vite) e consome a API do [`kaikan-cachoeira-api`](https://github.com/kaikan-cachoeira/kaikan-cachoeira-api) rodando em `http://localhost:8080`.

## Padrões

Este repo segue os padrões de commit e branching definidos em [`kaikan-cachoeira-docs`](https://github.com/kaikan-cachoeira/kaikan-cachoeira-docs):

- Commits: [`PADRONIZACAO_COMMITS.md`](https://github.com/kaikan-cachoeira/kaikan-cachoeira-docs/blob/main/PADRONIZACAO_COMMITS.md)
- Branches: [`FLUXO_DE_DESENVOLVIMENTO.md`](https://github.com/kaikan-cachoeira/kaikan-cachoeira-docs/blob/main/FLUXO_DE_DESENVOLVIMENTO.md) (`feat/nome-da-feature → dev → main`)

Todas as chamadas de API seguem o contrato documentado em `kaikan-cachoeira-docs/ENDPOINTS.md`.
