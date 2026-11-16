import { lerJSON, removerChave } from "@/shared/lib/armazenamentoLocal";
import type { Sessao } from "../models";

export const CHAVE_SESSAO = "kaikan-cachoeira-session";

export function sessaoRestauravel(valor: unknown): valor is Sessao {
  if (!valor || typeof valor !== "object") return false;

  const { usuario } = valor as { usuario?: unknown };
  if (!usuario || typeof usuario !== "object") return false;

  const { permissoes } = usuario as { permissoes?: unknown };
  return (
    Array.isArray(permissoes) &&
    permissoes.every((permissao) => typeof permissao === "string")
  );
}

export function lerSessaoPersistida(): Sessao | null {
  const valor = lerJSON<unknown>(CHAVE_SESSAO, null);
  if (sessaoRestauravel(valor)) return valor;

  if (valor) removerChave(CHAVE_SESSAO);
  return null;
}
