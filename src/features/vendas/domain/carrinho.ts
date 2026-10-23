export interface ItemCarrinho {
  menuItemId: string;
  name: string;
  basePrice: number;
  availableQuantity: number | null;
  quantity: number;
}

export interface ItemAdicionavel {
  id: string;
  name: string;
  price: number;
  availableQuantity?: number | null;
}

export interface ItemCarrinhoResumo extends ItemCarrinho {
  unitPrice: number;
  originalPrice: number;
  discount: number;
  total: number;
  totalDiscount: number;
}

export interface ResumoCarrinho {
  items: ItemCarrinhoResumo[];
  subtotal: number;
  discount: number;
  total: number;
  count: number;
}

export type DescontosCarrinho = Record<string, number>;

export function adicionarItemAoCarrinho(
  itens: ItemCarrinho[],
  menuItem: ItemAdicionavel,
): ItemCarrinho[] {
  const existente = itens.find((item) => item.menuItemId === menuItem.id);
  if (existente) {
    return itens.map((item) =>
      item.menuItemId === menuItem.id
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  }
  return [
    ...itens,
    {
      menuItemId: menuItem.id,
      name: menuItem.name,
      basePrice: menuItem.price,
      availableQuantity: menuItem.availableQuantity ?? null,
      quantity: 1,
    },
  ];
}

export function definirQuantidadeNoCarrinho(
  itens: ItemCarrinho[],
  menuItemId: string,
  quantity: number,
): ItemCarrinho[] {
  if (quantity <= 0) {
    return itens.filter((item) => item.menuItemId !== menuItemId);
  }
  return itens.map((item) =>
    item.menuItemId === menuItemId ? { ...item, quantity } : item,
  );
}

export function aplicarDescontoNoCarrinho(
  descontos: DescontosCarrinho,
  menuItemId: string,
  finalPrice: number,
): DescontosCarrinho {
  return { ...descontos, [menuItemId]: finalPrice };
}

export function removerDescontoDoCarrinho(
  descontos: DescontosCarrinho,
  menuItemId: string,
): DescontosCarrinho {
  const proximo = { ...descontos };
  delete proximo[menuItemId];
  return proximo;
}

export function calcularResumoCarrinho(
  itens: ItemCarrinho[],
  descontos: DescontosCarrinho,
): ResumoCarrinho {
  const items = itens.map((item) => {
    const unitPrice = descontos[item.menuItemId] ?? item.basePrice;
    const originalPrice = item.basePrice;
    const discount = Math.max(0, originalPrice - unitPrice);
    return {
      ...item,
      unitPrice,
      originalPrice,
      discount,
      total: unitPrice * item.quantity,
      totalDiscount: discount * item.quantity,
    };
  });
  const total = items.reduce((soma, item) => soma + item.total, 0);
  const discount = items.reduce(
    (soma, item) => soma + item.totalDiscount,
    0,
  );
  return {
    items,
    subtotal: total + discount,
    discount,
    total,
    count: items.reduce((soma, item) => soma + item.quantity, 0),
  };
}
