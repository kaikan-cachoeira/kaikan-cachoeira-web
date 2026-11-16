import type { ReactNode } from "react";
import {
  temPermissao,
  type Permissao as CodigoDePermissao,
} from "./permissoes";
import { usePermissoes } from "./usePermissoes";

interface PermissaoProps {
  precisa: CodigoDePermissao;
  children?: ReactNode;
}

export default function Permissao({ precisa, children }: PermissaoProps) {
  const permissoes = usePermissoes();
  if (!temPermissao(permissoes, precisa)) return null;
  return <>{children}</>;
}
