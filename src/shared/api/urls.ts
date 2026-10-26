import api from "./cliente";

/**
 * Resolve uma URL relativa devolvida pela API (por exemplo, a foto de um
 * produto do cardápio) contra a base configurada no cliente HTTP.
 */
export function resolverUrlApi(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;

  const base = (api.defaults.baseURL || "").replace(/\/+$/, "");
  const caminho = url.startsWith("/") ? url : `/${url}`;
  return `${base}${caminho}`;
}
