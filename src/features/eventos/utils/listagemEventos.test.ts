import { describe, expect, it } from "vitest";
import type { Evento } from "../models";
import {
  filtrarEventos,
  montarRespostaEventos,
  ordenarEventos,
  paginarEventos,
} from "./listagemEventos";

function evento(
  id: number,
  codigo: Evento["status"]["codigo"],
  tipoEvento: Evento["tipoEvento"] = "EVENTO",
): Evento {
  return {
    id,
    nome: `Evento ${id}`,
    tipoEvento,
    status: { id: 1, codigo, descricao: codigo },
    dataHoraInicio: "2026-11-01T09:00:00Z",
    dataHoraEncerramento: "2026-11-01T17:00:00Z",
  };
}

describe("listagemEventos", () => {
  it("pagina uma lista vazia com página 1 e total zero", () => {
    expect(paginarEventos([], 3, 8)).toEqual({
      items: [],
      page: 1,
      pageSize: 8,
      total: 0,
      totalPages: 1,
    });
  });

  it("devolve lista vazia quando o filtro não encontra nada", () => {
    const eventos = [evento(1, "EM_ANDAMENTO")];
    const resposta = montarRespostaEventos(eventos, {
      statuses: "ENCERRADO",
    });

    expect(resposta.items).toEqual([]);
    expect(resposta.total).toBe(0);
    expect(resposta.totalPages).toBe(1);
  });

  it("limita a página ao total de páginas", () => {
    const eventos = [
      evento(1, "NAO_INICIADO"),
      evento(2, "NAO_INICIADO"),
      evento(3, "NAO_INICIADO"),
    ];
    const resposta = paginarEventos(eventos, 9, 2);

    expect(resposta.page).toBe(2);
    expect(resposta.items.map((item) => item.id)).toEqual([3]);
    expect(resposta.totalPages).toBe(2);
  });

  it("coloca o evento em andamento primeiro", () => {
    const eventos = [
      evento(1, "ENCERRADO"),
      evento(2, "NAO_INICIADO"),
      evento(3, "EM_ANDAMENTO"),
    ];
    expect(ordenarEventos(eventos).map((item) => item.id)).toEqual([3, 1, 2]);
  });

  it("filtra por status e tipo ao mesmo tempo", () => {
    const eventos = [
      evento(1, "EM_ANDAMENTO", "EVENTO"),
      evento(2, "EM_ANDAMENTO", "REUNIAO"),
      evento(3, "ENCERRADO", "EVENTO"),
    ];
    const filtrados = filtrarEventos(eventos, {
      statuses: "EM_ANDAMENTO",
      types: "REUNIAO",
    });

    expect(filtrados.map((item) => item.id)).toEqual([2]);
  });
});
