import api from "@/shared/api/cliente";
import type { Credenciais, RedefinirSenhaPayload, Sessao } from "../models";

export async function entrar(credenciais: Credenciais): Promise<Sessao> {
  const { data } = await api.post<Sessao>("/auth/login", credenciais);
  return data;
}

export async function solicitarRecuperacaoSenha(
  email: string,
): Promise<{ message?: string }> {
  const { data } = await api.post<{ message?: string }>("/auth/recover", {
    email,
  });
  return data;
}

export async function redefinirSenha(
  payload: RedefinirSenhaPayload,
): Promise<void> {
  const { data } = await api.post<void>(
    "/auth/redefinicao-senha",
    payload,
  );
  return data;
}
