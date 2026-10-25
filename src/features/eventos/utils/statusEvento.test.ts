import { describe, expect, it } from "vitest";
import {
  codigoDoStatus,
  idDoStatus,
  podeTransicionar,
  rotuloStatus,
  STATUS_EVENTO,
} from "./statusEvento";

describe("statusEvento", () => {
  it("mapeia código para o id do contrato da API", () => {
    expect(idDoStatus("NAO_INICIADO")).toBe(1);
    expect(idDoStatus("EM_ANDAMENTO")).toBe(2);
    expect(idDoStatus("ENCERRADO")).toBe(3);
  });

  it("mapeia o id de volta para o código", () => {
    expect(codigoDoStatus(1)).toBe("NAO_INICIADO");
    expect(codigoDoStatus(2)).toBe("EM_ANDAMENTO");
    expect(codigoDoStatus(3)).toBe("ENCERRADO");
    expect(codigoDoStatus(99)).toBeNull();
  });

  it("expõe os rótulos de exibição", () => {
    expect(rotuloStatus("NAO_INICIADO")).toBe("Não iniciado");
    expect(rotuloStatus("EM_ANDAMENTO")).toBe("Em andamento");
    expect(rotuloStatus("ENCERRADO")).toBe("Encerrado");
  });

  it("permite os quatro caminhos de transição do contrato", () => {
    expect(podeTransicionar("NAO_INICIADO", "EM_ANDAMENTO")).toBe(true);
    expect(podeTransicionar("EM_ANDAMENTO", "ENCERRADO")).toBe(true);
    expect(podeTransicionar("EM_ANDAMENTO", "NAO_INICIADO")).toBe(true);
    expect(podeTransicionar("ENCERRADO", "EM_ANDAMENTO")).toBe(true);
  });

  it("rejeita transições fora do contrato", () => {
    expect(podeTransicionar("NAO_INICIADO", "ENCERRADO")).toBe(false);
    expect(podeTransicionar("ENCERRADO", "NAO_INICIADO")).toBe(false);
    expect(podeTransicionar("ENCERRADO", "ENCERRADO")).toBe(false);
  });

  it("mantém os ids alinhados ao schema de StatusResumo", () => {
    expect(STATUS_EVENTO.NAO_INICIADO.id).toBe(1);
    expect(STATUS_EVENTO.EM_ANDAMENTO.id).toBe(2);
    expect(STATUS_EVENTO.ENCERRADO.id).toBe(3);
  });
});
