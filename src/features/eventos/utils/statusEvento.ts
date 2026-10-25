import type { StatusEventoCodigo, TipoEvento } from "../models";

interface DefinicaoStatus {
  id: number;
  rotulo: string;
  descricaoPadrao: string;
}

export const STATUS_EVENTO: Record<StatusEventoCodigo, DefinicaoStatus> = {
  NAO_INICIADO: {
    id: 1,
    rotulo: "Não iniciado",
    descricaoPadrao: "Evento não iniciado",
  },
  EM_ANDAMENTO: {
    id: 2,
    rotulo: "Em andamento",
    descricaoPadrao: "Evento em andamento",
  },
  ENCERRADO: {
    id: 3,
    rotulo: "Encerrado",
    descricaoPadrao: "Evento encerrado",
  },
};

export const STATUS_OPTIONS = (
  Object.keys(STATUS_EVENTO) as StatusEventoCodigo[]
).map((codigo) => ({
  value: codigo,
  label: STATUS_EVENTO[codigo].rotulo,
}));

export const TIPO_EVENTO_OPTIONS: { value: TipoEvento; label: string }[] = [
  { value: "EVENTO", label: "Evento" },
  { value: "REUNIAO", label: "Reunião" },
];

export function rotuloTipoEvento(tipo: TipoEvento): string {
  return tipo === "REUNIAO" ? "Reunião" : "Evento";
}

export const TRANSICOES_STATUS: Record<
  StatusEventoCodigo,
  StatusEventoCodigo[]
> = {
  NAO_INICIADO: ["EM_ANDAMENTO"],
  EM_ANDAMENTO: ["ENCERRADO", "NAO_INICIADO"],
  ENCERRADO: ["EM_ANDAMENTO"],
};

export function idDoStatus(codigo: StatusEventoCodigo): number {
  return STATUS_EVENTO[codigo].id;
}

export function codigoDoStatus(id: number): StatusEventoCodigo | null {
  const entrada = (
    Object.entries(STATUS_EVENTO) as [StatusEventoCodigo, DefinicaoStatus][]
  ).find(([, definicao]) => definicao.id === id);

  return entrada?.[0] ?? null;
}

export function rotuloStatus(codigo: StatusEventoCodigo): string {
  return STATUS_EVENTO[codigo].rotulo;
}

export function podeTransicionar(
  atual: StatusEventoCodigo,
  proximo: StatusEventoCodigo,
): boolean {
  return TRANSICOES_STATUS[atual]?.includes(proximo) ?? false;
}

export function varianteStatus(
  codigo: StatusEventoCodigo,
): "success" | "warning" | "muted" {
  if (codigo === "EM_ANDAMENTO") return "success";
  if (codigo === "NAO_INICIADO") return "warning";
  return "muted";
}
