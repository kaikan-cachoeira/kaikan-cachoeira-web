import { createContext } from "react";
import type { ListaDePermissoes } from "./permissoes";

export const PermissoesContexto =
  createContext<ListaDePermissoes | null>(null);
