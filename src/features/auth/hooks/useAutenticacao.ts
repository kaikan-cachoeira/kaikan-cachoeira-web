import { useContext } from "react";
import { AutenticacaoContexto } from "../providers/authContexto";

export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContexto);
  if (!contexto) {
    throw new Error(
      "useAutenticacao deve ser usado dentro de AuthProvider.",
    );
  }
  return contexto;
}
