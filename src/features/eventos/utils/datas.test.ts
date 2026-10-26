import { describe, expect, it } from "vitest";
import { paraEntradaDataHora } from "@/shared/lib/formatacao";
import {
  fimDoDiaISO,
  inicioDoDiaISO,
  paraInstant,
} from "./datas";

describe("datas de evento", () => {
  it("converte datetime-local para Instant ISO 8601", () => {
    const local = "2026-11-01T09:30";
    const iso = paraInstant(local);

    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(new Date(iso).getTime()).toBe(new Date(local).getTime());
  });

  it("faz a ida e volta entre Instant e datetime-local", () => {
    const local = "2026-11-01T09:30";
    expect(paraEntradaDataHora(paraInstant(local))).toBe(local);
  });

  it("devolve string vazia para valor vazio ou inválido", () => {
    expect(paraInstant("")).toBe("");
    expect(paraInstant("valor-invalido")).toBe("");
  });

  it("monta o início e o fim do dia local em ISO", () => {
    const inicio = new Date(inicioDoDiaISO("2026-11-01"));
    const fim = new Date(fimDoDiaISO("2026-11-01"));

    expect(inicio.getFullYear()).toBe(2026);
    expect(inicio.getMonth()).toBe(10);
    expect(inicio.getDate()).toBe(1);
    expect(inicio.getHours()).toBe(0);
    expect(inicio.getMinutes()).toBe(0);
    expect(fim.getDate()).toBe(1);
    expect(fim.getHours()).toBe(23);
    expect(fim.getMinutes()).toBe(59);
  });
});
