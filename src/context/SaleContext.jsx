import { createContext, useContext, useMemo, useState } from "react";

const SaleContext = createContext(null);

export function SaleProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [discounts, setDiscounts] = useState({});

  function addItem(menuItem) {
    setCart((current) => {
      const existing = current.find((item) => item.menuItemId === menuItem.id);
      if (existing) {
        return current.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...current,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          basePrice: menuItem.price,
          availableQuantity: menuItem.availableQuantity,
          quantity: 1,
        },
      ];
    });
  }

  function setQuantity(menuItemId, quantity) {
    if (quantity <= 0) {
      setCart((current) =>
        current.filter((item) => item.menuItemId !== menuItemId),
      );
      setDiscounts((current) => {
        const next = { ...current };
        delete next[menuItemId];
        return next;
      });
      return;
    }
    setCart((current) =>
      current.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item,
      ),
    );
  }

  function removeItem(menuItemId) {
    setQuantity(menuItemId, 0);
  }

  function applyDiscount(menuItemId, finalPrice) {
    setDiscounts((current) => ({ ...current, [menuItemId]: finalPrice }));
  }

  function removeDiscount(menuItemId) {
    setDiscounts((current) => {
      const next = { ...current };
      delete next[menuItemId];
      return next;
    });
  }

  function clear() {
    setCart([]);
    setDiscounts({});
  }

  const priceFor = (item) => discounts[item.menuItemId] ?? item.basePrice;

  const summary = useMemo(() => {
    const items = cart.map((item) => {
      const unitPrice = discounts[item.menuItemId] ?? item.basePrice;
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
    const total = items.reduce((sum, item) => sum + item.total, 0);
    const discount = items.reduce(
      (sum, item) => sum + item.totalDiscount,
      0,
    );
    return {
      items,
      subtotal: total + discount,
      discount,
      total,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart, discounts]);

  const value = useMemo(
    () => ({
      cart,
      discounts,
      summary,
      addItem,
      setQuantity,
      removeItem,
      applyDiscount,
      removeDiscount,
      priceFor,
      clear,
    }),
    [cart, discounts, summary],
  );

  return <SaleContext.Provider value={value}>{children}</SaleContext.Provider>;
}

export function useSale() {
  const context = useContext(SaleContext);
  if (!context) {
    throw new Error("useSale deve ser usado dentro de SaleProvider.");
  }
  return context;
}
