/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "shared-nao-importa-features-nem-app",
      severity: "error",
      from: { path: "^src/shared" },
      to: { path: "^src/(features|app)" },
    },
    {
      name: "features-nao-importam-app",
      severity: "error",
      from: { path: "^src/features" },
      to: { path: "^src/app" },
    },
    {
      name: "auth-e-base",
      severity: "error",
      from: { path: "^src/features/auth" },
      to: { path: "^src/features/(?!auth)" },
    },
    {
      name: "inventario-e-base",
      severity: "error",
      from: { path: "^src/features/inventario" },
      to: { path: "^src/features/(?!inventario)" },
    },
    {
      name: "eventos-so-depende-de-inventario",
      severity: "error",
      from: { path: "^src/features/eventos" },
      to: { path: "^src/features/(?!eventos|inventario)" },
    },
    {
      name: "doacoes-depende-de-eventos-e-inventario",
      severity: "error",
      from: { path: "^src/features/doacoes" },
      to: { path: "^src/features/(?!doacoes|eventos|inventario)" },
    },
    {
      name: "vendas-depende-de-eventos-e-inventario",
      severity: "error",
      from: { path: "^src/features/vendas" },
      to: { path: "^src/features/(?!vendas|eventos|inventario)" },
    },
    {
      name: "caixa-depende-de-eventos",
      severity: "error",
      from: { path: "^src/features/caixa" },
      to: { path: "^src/features/(?!caixa|eventos)" },
    },
    {
      name: "home-depende-de-eventos",
      severity: "error",
      from: { path: "^src/features/home" },
      to: { path: "^src/features/(?!home|eventos)" },
    },
    {
      name: "eventos-consome-inventario-pelo-barril",
      severity: "error",
      from: { path: "^src/features/eventos" },
      to: { path: "^src/features/inventario/(?!index\\.ts$)" },
    },
    {
      name: "doacoes-consome-eventos-e-inventario-pelo-barril",
      severity: "error",
      from: { path: "^src/features/doacoes" },
      to: { path: "^src/features/(eventos|inventario)/(?!index\\.ts$)" },
    },
    {
      name: "vendas-consome-eventos-e-inventario-pelo-barril",
      severity: "error",
      from: { path: "^src/features/vendas" },
      to: { path: "^src/features/(eventos|inventario)/(?!index\\.ts$)" },
    },
    {
      name: "caixa-consome-eventos-pelo-barril",
      severity: "error",
      from: { path: "^src/features/caixa" },
      to: { path: "^src/features/eventos/(?!index\\.ts$)" },
    },
    {
      name: "home-consome-eventos-pelo-barril",
      severity: "error",
      from: { path: "^src/features/home" },
      to: { path: "^src/features/eventos/(?!index\\.ts$)" },
    },
    {
      name: "app-e-shared-usam-barril-publico",
      severity: "error",
      from: { path: "^src/(app|shared)" },
      to: { path: "^src/features/[^/]+/(?!index\\.ts$)" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    includeOnly: "^src",
    tsConfig: { fileName: "tsconfig.app.json" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
    reporterOptions: {
      dot: { collapsePattern: "node_modules/[^/]+" },
    },
  },
};
