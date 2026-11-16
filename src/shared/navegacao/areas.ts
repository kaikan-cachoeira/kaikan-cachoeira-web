import {
  PERMISSOES,
  temPermissao,
  type ListaDePermissoes,
  type Permissao,
} from "@/shared/permissoes/permissoes";

export interface Area {
  id: string;
  path: string;
  label: string;
  icon: string;
  permissao: Permissao | null;
  menu: boolean;
}

export const AREAS: readonly Area[] = [
  {
    id: "inicio",
    path: "/inicio",
    label: "Início",
    icon: "home",
    permissao: null,
    menu: true,
  },
  {
    id: "estoque",
    path: "/estoque",
    label: "Estoque",
    icon: "box",
    permissao: PERMISSOES.estoqueMenu,
    menu: true,
  },
  {
    id: "eventos",
    path: "/eventos",
    label: "Eventos",
    icon: "ticket",
    permissao: PERMISSOES.eventosMenu,
    menu: true,
  },
  {
    id: "doacoes",
    path: "/doacoes",
    label: "Doações",
    icon: "gift",
    permissao: PERMISSOES.doacoesMenu,
    menu: true,
  },
  {
    id: "relatorio",
    path: "/relatorio-geral",
    label: "Relatório geral",
    icon: "chart",
    permissao: PERMISSOES.relatoriosMenu,
    menu: true,
  },
  {
    id: "vendas",
    path: "/registro-vendas",
    label: "Registro de vendas",
    icon: "bag",
    permissao: PERMISSOES.vendasMenu,
    menu: true,
  },
  {
    id: "caixa",
    path: "/caixa",
    label: "Caixa",
    icon: "cash",
    permissao: PERMISSOES.caixaMenu,
    menu: true,
  },
  {
    id: "pendente",
    path: "/em-definicao",
    label: "Conteúdo pendente",
    icon: "info",
    permissao: null,
    menu: false,
  },
];

const AREAS_POR_PREFIXO = [...AREAS].sort(
  (a, b) => b.path.length - a.path.length,
);

function normalizarCaminho(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const semBarraFinal = pathname.replace(/\/+$/, "");
  return semBarraFinal || "/";
}

export function areaDaRota(pathname: string): Area | null {
  const caminho = normalizarCaminho(pathname);
  return (
    AREAS_POR_PREFIXO.find(
      (area) => caminho === area.path || caminho.startsWith(`${area.path}/`),
    ) ?? null
  );
}

export function podeAcessarRota(
  pathname: string,
  permissoes: ListaDePermissoes,
): boolean {
  const area = areaDaRota(pathname);
  if (!area?.permissao) return true;
  return temPermissao(permissoes, area.permissao);
}

export function areasDoMenu(
  permissoes: ListaDePermissoes,
): readonly Area[] {
  return AREAS.filter(
    (area) =>
      area.menu &&
      (area.permissao === null || temPermissao(permissoes, area.permissao)),
  );
}
