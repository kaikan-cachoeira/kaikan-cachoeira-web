# ACAC Kaikan - Web

Interface web do sistema de gestão da associação. Veja a visão geral do projeto no [README da organização](https://github.com/acac-kaikan).

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

O frontend sobe em `http://localhost:5173` (porta padrão do Vite) e consome a API do [`acac-kaikan-api`](https://github.com/acac-kaikan/acac-kaikan-api) rodando em `http://localhost:8080`.

## Padrões

Este repo segue os padrões de commit e branching definidos em [`acac-kaikan-docs`](https://github.com/acac-kaikan/acac-kaikan-docs):

- Commits: `docs/PADRONIZACAO_COMMITS.md`
- Branches: `docs/FLUXO_DE_DESENVOLVIMENTO.md` (`feat/nome-da-feature → dev → main`)

Todas as chamadas de API seguem o contrato documentado em `acac-kaikan-docs/ENDPOINTS.md`.