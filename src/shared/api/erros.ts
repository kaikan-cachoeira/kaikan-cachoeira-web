import { AxiosError } from "axios";

interface RespostaErro {
  message?: string;
  error?: string;
}

export function mensagemErro(
  error: unknown,
  fallback = "Não foi possível concluir a operação. Tente novamente.",
): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as RespostaErro | undefined;
    return data?.message || data?.error || error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
