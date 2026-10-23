import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import type {
  DescontosCarrinho,
  ItemAdicionavel,
  ItemCarrinho,
} from "../domain/carrinho";
import {
  adicionarItemAoCarrinho,
  aplicarDescontoNoCarrinho,
  calcularResumoCarrinho,
  definirQuantidadeNoCarrinho,
  removerDescontoDoCarrinho,
} from "../domain/carrinho";
import { VendaContexto } from "./vendaContexto";

interface VendaProviderProps {
  children?: ReactNode;
}

export function VendaProvider({ children }: VendaProviderProps) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [descontos, setDescontos] = useState<DescontosCarrinho>({});

  const adicionarItem = useCallback((menuItem: ItemAdicionavel) => {
    setItens((atuais) => adicionarItemAoCarrinho(atuais, menuItem));
  }, []);

  const definirQuantidade = useCallback(
    (menuItemId: string, quantity: number) => {
      setItens((atuais) =>
        definirQuantidadeNoCarrinho(atuais, menuItemId, quantity),
      );
      if (quantity <= 0) {
        setDescontos((atuais) =>
          removerDescontoDoCarrinho(atuais, menuItemId),
        );
      }
    },
    [],
  );

  const removerItem = useCallback(
    (menuItemId: string) => definirQuantidade(menuItemId, 0),
    [definirQuantidade],
  );

  const aplicarDesconto = useCallback(
    (menuItemId: string, finalPrice: number) => {
      setDescontos((atuais) =>
        aplicarDescontoNoCarrinho(atuais, menuItemId, finalPrice),
      );
    },
    [],
  );

  const removerDesconto = useCallback((menuItemId: string) => {
    setDescontos((atuais) =>
      removerDescontoDoCarrinho(atuais, menuItemId),
    );
  }, []);

  const limpar = useCallback(() => {
    setItens([]);
    setDescontos({});
  }, []);

  const resumo = useMemo(
    () => calcularResumoCarrinho(itens, descontos),
    [itens, descontos],
  );

  const precoDe = useCallback(
    (item: ItemCarrinho) => descontos[item.menuItemId] ?? item.basePrice,
    [descontos],
  );

  const valor = useMemo(
    () => ({
      itens,
      descontos,
      resumo,
      adicionarItem,
      definirQuantidade,
      removerItem,
      aplicarDesconto,
      removerDesconto,
      precoDe,
      limpar,
    }),
    [
      itens,
      descontos,
      resumo,
      adicionarItem,
      definirQuantidade,
      removerItem,
      aplicarDesconto,
      removerDesconto,
      precoDe,
      limpar,
    ],
  );

  return (
    <VendaContexto.Provider value={valor}>{children}</VendaContexto.Provider>
  );
}
