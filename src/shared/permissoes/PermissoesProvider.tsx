import type { ReactNode } from "react";
import type { ListaDePermissoes } from "./permissoes";
import { PermissoesContexto } from "./permissoesContexto";

interface PermissoesProviderProps {
  permissoes?: ListaDePermissoes;
  children?: ReactNode;
}

export function PermissoesProvider({
  permissoes = [],
  children,
}: PermissoesProviderProps) {
  return (
    <PermissoesContexto.Provider value={permissoes}>
      {children}
    </PermissoesContexto.Provider>
  );
}
