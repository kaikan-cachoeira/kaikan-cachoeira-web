import { describe, expect, it } from "vitest";
import { fimDoDiaISO, inicioDoDiaISO } from "@/features/eventos/utils/datas";
import {
  construirParametrosProdutosMaisVendidos,
  construirParametrosRelatorio,
} from "./useRelatorio";

describe("construir parâmetros do relatório", () => {
  it("converte datas para o início e fim do dia e normaliza os tipos", () => {
    const filtros = {
      from: "2026-11-01",
      to: "2026-11-30",
      types: ["Evento", "Reunião"],
    };

    expect(construirParametrosRelatorio(filtros)).toEqual({
      dataInicio: inicioDoDiaISO(filtros.from),
      dataFim: fimDoDiaISO(filtros.to),
      tipos: "EVENTO,REUNIAO",
    });
  });

  it("omite parâmetros de filtros não selecionados", () => {
    expect(
      construirParametrosRelatorio({ from: "", to: "", types: [] }),
    ).toEqual({
      dataInicio: undefined,
      dataFim: undefined,
      tipos: undefined,
    });
  });

  it("mantém reuniões como filtro e aplica o limite padrão de cinco", () => {
    const filtros = {
      from: "",
      to: "",
      types: ["Reunião"],
    };

    expect(construirParametrosProdutosMaisVendidos(filtros)).toEqual({
      dataInicio: undefined,
      dataFim: undefined,
      tipos: "REUNIAO",
      limite: 5,
    });
  });
});
