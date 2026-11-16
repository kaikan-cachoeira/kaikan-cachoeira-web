import { useContext } from "react";
import type { ListaDePermissoes } from "./permissoes";
import { PermissoesContexto } from "./permissoesContexto";

export function usePermissoes(): ListaDePermissoes {
  const contexto = useContext(PermissoesContexto);
  if (contexto === null) {
    throw new Error(
      "usePermissoes deve ser usado dentro de PermissoesProvider.",
    );
  }
  return contexto;
}
