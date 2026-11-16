import { Outlet, useLocation } from "react-router-dom";
import PaginaNaoEncontrada from "@/app/pages/PaginaNaoEncontrada";
import { podeAcessarRota } from "@/shared/navegacao/areas";
import { usePermissoes } from "@/shared/permissoes/usePermissoes";

export default function GuardaDeArea() {
  const location = useLocation();
  const permissoes = usePermissoes();

  if (!podeAcessarRota(location.pathname, permissoes)) {
    return <PaginaNaoEncontrada />;
  }

  return <Outlet />;
}
