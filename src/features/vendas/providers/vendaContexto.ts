import { createContext } from "react";
import type {
  DescontosCarrinho,
  ItemAdicionavel,
  ItemCarrinho,
  ResumoCarrinho,
} from "../domain/carrinho";

export interface VendaContextoValor {
  itens: ItemCarrinho[];
  descontos: DescontosCarrinho;
  resumo: ResumoCarrinho;
  adicionarItem: (menuItem: ItemAdicionavel) => void;
  definirQuantidade: (menuItemId: string, quantity: number) => void;
  removerItem: (menuItemId: string) => void;
  aplicarDesconto: (menuItemId: string, finalPrice: number) => void;
  removerDesconto: (menuItemId: string) => void;
  precoDe: (item: ItemCarrinho) => number;
  limpar: () => void;
}

export const VendaContexto = createContext<VendaContextoValor | null>(null);
