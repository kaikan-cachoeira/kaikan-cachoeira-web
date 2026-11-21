import { describe, expect, it } from "vitest";
import { saldoAnuidade } from "./anuidade";

describe("saldoAnuidade", () => {
  it("calcula o saldo de um pagamento parcial", () => {
    expect(saldoAnuidade(150, 40)).toBe(110);
  });

  it("retorna zero quando a anuidade foi paga", () => {
    expect(saldoAnuidade(150, 150)).toBe(0);
  });

  it("nunca retorna saldo negativo", () => {
    expect(saldoAnuidade(150, 175)).toBe(0);
  });

  it("arredonda em centavos sem erro de ponto flutuante", () => {
    expect(saldoAnuidade(150, 149.9)).toBe(0.1);
  });
});
