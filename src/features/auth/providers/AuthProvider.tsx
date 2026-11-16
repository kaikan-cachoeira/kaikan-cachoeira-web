import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  definirRenovadorDeToken,
  definirToken,
} from "@/shared/api/cliente";
import { removerChave, salvarJSON } from "@/shared/lib/armazenamentoLocal";
import { PermissoesProvider } from "@/shared/permissoes/PermissoesProvider";
import type { Credenciais, Sessao } from "../models";
import {
  entrar as entrarNaApi,
  renovarTokens,
  sair as sairNaApi,
} from "../services/autenticacao";
import type { MotivoEncerramento } from "../services/renovacaoSessao";
import { renovarSessao } from "../services/renovacaoSessao";
import {
  CHAVE_SESSAO,
  lerSessaoPersistida,
} from "../services/sessaoPersistida";
import { AutenticacaoContexto } from "./authContexto";

interface AuthProviderProps {
  children?: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [sessao, setSessao] = useState<Sessao | null>(() => {
    const inicial = lerSessaoPersistida();
    definirToken(inicial?.accessToken ?? null);
    return inicial;
  });
  const [sessaoExpirada, setSessaoExpirada] = useState(false);

  useEffect(() => {
    const aoAlterarArmazenamento = (event: StorageEvent) => {
      if (event.key === CHAVE_SESSAO) {
        const proxima = lerSessaoPersistida();
        setSessao(proxima);
        definirToken(proxima?.accessToken ?? null);
        if (proxima) setSessaoExpirada(false);
      }
    };
    window.addEventListener("storage", aoAlterarArmazenamento);
    return () => window.removeEventListener("storage", aoAlterarArmazenamento);
  }, []);

  const encerrarSessao = useCallback((motivo: MotivoEncerramento) => {
    removerChave(CHAVE_SESSAO);
    definirToken(null);
    setSessao(null);
    setSessaoExpirada(motivo === "expirada");
  }, []);

  useEffect(() => {
    definirRenovadorDeToken((tokenUsado) =>
      renovarSessao(tokenUsado, {
        lerSessao: lerSessaoPersistida,
        salvarSessao: (renovada) => {
          salvarJSON(CHAVE_SESSAO, renovada);
          setSessao(renovada);
        },
        renovarTokens,
        definirToken,
        encerrarSessao,
      }),
    );

    return () => definirRenovadorDeToken(null);
  }, [encerrarSessao]);

  const entrar = useCallback(async (credenciais: Credenciais) => {
    const data = await entrarNaApi(credenciais);
    salvarJSON(CHAVE_SESSAO, data);
    definirToken(data.accessToken);
    setSessao(data);
    setSessaoExpirada(false);
    return data;
  }, []);

  const sair = useCallback(() => {
    const atual = lerSessaoPersistida() ?? sessao;
    if (atual?.refreshToken) {
      void sairNaApi(atual.refreshToken).catch(() => {});
    }
    encerrarSessao("manual");
  }, [encerrarSessao, sessao]);

  const valor = useMemo(
    () => ({
      usuario: sessao?.usuario || null,
      estaAutenticado: Boolean(sessao?.accessToken),
      sessaoExpirada,
      entrar,
      sair,
    }),
    [sessao, sessaoExpirada, entrar, sair],
  );

  const permissoes = useMemo(
    () => sessao?.usuario.permissoes ?? [],
    [sessao],
  );

  return (
    <AutenticacaoContexto.Provider value={valor}>
      <PermissoesProvider permissoes={permissoes}>
        {children}
      </PermissoesProvider>
    </AutenticacaoContexto.Provider>
  );
}
