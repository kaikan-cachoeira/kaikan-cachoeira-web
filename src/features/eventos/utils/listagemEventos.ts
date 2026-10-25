import type {
  Evento,
  ParametrosEventos,
  RespostaEventos,
} from "../models";

function separar(valor?: string): string[] {
  return valor
    ? valor
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

export function filtrarEventos(
  eventos: Evento[],
  params: Pick<ParametrosEventos, "statuses" | "types">,
): Evento[] {
  const statuses = separar(params.statuses);
  const types = separar(params.types);

  return eventos.filter((evento) => {
    const combinaStatus =
      statuses.length === 0 || statuses.includes(evento.status.codigo);
    const combinaTipo =
      types.length === 0 || types.includes(evento.tipoEvento);
    return combinaStatus && combinaTipo;
  });
}

export function ordenarEventos(eventos: Evento[]): Evento[] {
  return [...eventos].sort((a, b) => {
    const aEmAndamento = a.status.codigo === "EM_ANDAMENTO" ? 1 : 0;
    const bEmAndamento = b.status.codigo === "EM_ANDAMENTO" ? 1 : 0;
    return bEmAndamento - aEmAndamento;
  });
}

export function paginarEventos(
  eventos: Evento[],
  page = 1,
  pageSize = 8,
): RespostaEventos {
  const tamanhoPagina = Math.max(1, pageSize);
  const total = eventos.length;
  const totalPages = Math.max(1, Math.ceil(total / tamanhoPagina));
  const pagina = Math.min(Math.max(1, page), totalPages);
  const inicio = (pagina - 1) * tamanhoPagina;

  return {
    items: eventos.slice(inicio, inicio + tamanhoPagina),
    page: pagina,
    pageSize: tamanhoPagina,
    total,
    totalPages,
  };
}

export function montarRespostaEventos(
  eventos: Evento[],
  params: ParametrosEventos,
): RespostaEventos {
  const filtrados = filtrarEventos(eventos, params);
  return paginarEventos(
    ordenarEventos(filtrados),
    params.page ?? 1,
    params.pageSize ?? 8,
  );
}
