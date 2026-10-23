import { describe, expect, it } from "vitest";
import {
  adicionarItemAoCarrinho,
  aplicarDescontoNoCarrinho,
  calcularResumoCarrinho,
  definirQuantidadeNoCarrinho,
  removerDescontoDoCarrinho,
  type ItemCarrinho,
} from "./carrinho";

const produto = {
  id: "produto-1",
  name: "Refrigerante",
  price: 6,
  availableQuantity: 10,
};

function carrinhoComUmItem(): ItemCarrinho[] {
  return adicionarItemAoCarrinho([], produto);
}

describe("carrinho", () => {
  it("adiciona um produto novo com quantidade 1", () => {
    const carrinho = carrinhoComUmItem();

    expect(carrinho).toEqual([
      {
        menuItemId: "produto-1",
        name: "Refrigerante",
        basePrice: 6,
        availableQuantity: 10,
        quantity: 1,
      },
    ]);
  });

  it("incrementa a quantidade ao adicionar o mesmo produto", () => {
    const carrinho = adicionarItemAoCarrinho(carrinhoComUmItem(), produto);

    expect(carrinho[0].quantity).toBe(2);
  });

  it("remove o produto quando a quantidade chega a zero", () => {
    const carrinho = definirQuantidadeNoCarrinho(
      carrinhoComUmItem(),
      "produto-1",
      0,
    );

    expect(carrinho).toEqual([]);
  });

  it("aplica e remove desconto por produto", () => {
    const comDesconto = aplicarDescontoNoCarrinho({}, "produto-1", 4);

    expect(comDesconto).toEqual({ "produto-1": 4 });
    expect(removerDescontoDoCarrinho(comDesconto, "produto-1")).toEqual({});
  });

  it("calcula subtotal, desconto e total", () => {
    const itens = adicionarItemAoCarrinho(carrinhoComUmItem(), produto);
    const resumo = calcularResumoCarrinho(itens, { "produto-1": 4 });

    expect(resumo.count).toBe(2);
    expect(resumo.subtotal).toBe(12);
    expect(resumo.discount).toBe(4);
    expect(resumo.total).toBe(8);
    expect(resumo.items[0]).toMatchObject({
      unitPrice: 4,
      originalPrice: 6,
      total: 8,
      totalDiscount: 4,
    });
  });

  it("mantém o total igual ao subtotal sem descontos", () => {
    const resumo = calcularResumoCarrinho(carrinhoComUmItem(), {});

    expect(resumo.subtotal).toBe(6);
    expect(resumo.discount).toBe(0);
    expect(resumo.total).toBe(6);
  });
});
