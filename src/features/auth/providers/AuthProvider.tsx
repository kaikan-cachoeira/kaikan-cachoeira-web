import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { definirToken } from "@/shared/api/cliente";
import {
  lerJSON,
  removerChave,
  salvarJSON,
} from "@/shared/lib/armazenamentoLocal";
import type { Credenciais, Sessao } from "../models";
import { entrar as entrarNaApi, sair as sairNaApi } from "../services/autenticacao";
import { AutenticacaoContexto } from "./authContexto";

const CHAVE_SESSAO = "kaikan-cachoeira-session";

interface AuthProviderProps {
  children?: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [sessao, setSessao] = useState<Sessao | null>(() => {
    const inicial = lerJSON<Sessao | null>(CHAVE_SESSAO, null);
    definirToken(inicial?.accessToken ?? null);
    return inicial;
  });

  useEffect(() => {
    const aoAlterarArmazenamento = (event: StorageEvent) => {
      if (event.key === CHAVE_SESSAO) {
        const proxima = lerJSON<Sessao | null>(CHAVE_SESSAO, null);
        setSessao(proxima);
        definirToken(proxima?.accessToken ?? null);
      }
    };
    window.addEventListener("storage", aoAlterarArmazenamento);
    return () => window.removeEventListener("storage", aoAlterarArmazenamento);
  }, []);

  const entrar = useCallback(async (credenciais: Credenciais) => {
    const data = await entrarNaApi(credenciais);
    salvarJSON(CHAVE_SESSAO, data);
    definirToken(data.accessToken);
    setSessao(data);
    return data;
  }, []);

  const sair = useCallback(() => {
    if(sessao?.refreshToken) {
      void sairNaApi(sessao.refreshToken).catch(() => {})
    }
    removerChave(CHAVE_SESSAO);
    definirToken(null);
    setSessao(null);
  }, [sessao?.refreshToken]);

  const valor = useMemo(
    () => ({
      usuario: sessao?.usuario || null,
      estaAutenticado: Boolean(sessao?.accessToken),
      entrar,
      sair,
    }),
    [sessao, entrar, sair],
  );

  return (
    <AutenticacaoContexto.Provider value={valor}>
      {children}
    </AutenticacaoContexto.Provider>
  );
}
