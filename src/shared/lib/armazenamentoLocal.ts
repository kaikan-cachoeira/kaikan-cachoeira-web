export function lerJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function salvarJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // O modo de demonstração segue em memória quando o armazenamento falha.
  }
}

export function removerChave(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignora ambientes sem armazenamento disponível.
  }
}

export function criarId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function agoraISO(): string {
  return new Date().toISOString();
}
