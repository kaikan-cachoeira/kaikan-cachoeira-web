import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import Botao from "@/shared/components/Botao/Botao";
import MiniaturaProduto from "@/shared/components/MiniaturaProduto/MiniaturaProduto";
import SeletorQuantidade from "@/shared/components/SeletorQuantidade/SeletorQuantidade";
import { resolverUrlApi } from "@/shared/api/urls";
import type { ItemCardapio } from "@/features/eventos";
import { useCarrinho } from "../hooks/useVendas";
import { formatarMoeda, formatarNumero } from "@/shared/lib/formatacao";
import styles from "./VendaProdutoCard.module.css";

interface VendaProdutoCardProps {
  item: ItemCardapio;
  onDiscount?: (item: ItemCardapio) => void;
  onRemoveDiscount?: (item: ItemCardapio) => void;
  discountLoading?: boolean;
}

export default function VendaProdutoCard({
  item,
  onDiscount,
  onRemoveDiscount,
  discountLoading = false,
}: VendaProdutoCardProps) {
  const { adicionarItem, itens, definirQuantidade } = useCarrinho();
  const cartId = String(item.id);
  const cartItem = itens.find((entry) => entry.menuItemId === cartId);
  const quantity = cartItem?.quantity || 0;
  const disponivel =
    item.origem === "ESTOQUE" &&
    item.restantePrevisto !== null &&
    item.restantePrevisto !== undefined
      ? item.restantePrevisto
      : null;
  const max = disponivel !== null ? disponivel : undefined;
  const currentPrice = item.precoComDesconto;
  const hasDiscount = item.desconto > 0;
  const soldOut = disponivel !== null && disponivel <= 0;
  const atMax = max !== undefined && quantity >= max;

  return (
    <article className={styles.card}>
      <MiniaturaProduto
        src={resolverUrlApi(item.fotoUrl)}
        alt={`Imagem de ${item.nome}`}
        size="fill"
      />

      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h3 className={styles.name}>{item.nome}</h3>
          {soldOut ? <Etiqueta variant="danger">Sem estoque</Etiqueta> : null}
        </div>
        <p className={styles.category}>{item.categoria || "Sem categoria"}</p>
        <p className={styles.priceRow}>
          <strong>{formatarMoeda(currentPrice)}</strong>
          {hasDiscount ? <s>{formatarMoeda(item.precoVenda)}</s> : null}
        </p>
        <p className={styles.availability}>
          {item.origem === "ESTOQUE"
            ? `Quantidade: ${
                disponivel === null ? "—" : formatarNumero(disponivel)
              }`
            : "Produzido no evento"}
        </p>
      </div>

      <div className={styles.actions}>
        {quantity > 0 ? (
          <SeletorQuantidade
            value={quantity}
            min={1}
            max={max}
            onChange={(next) => definirQuantidade(cartId, next)}
            label={`quantidade de ${item.nome}`}
          />
        ) : (
          <Botao
            className={styles.addButton}
            onClick={() =>
              adicionarItem({
                id: cartId,
                name: item.nome,
                price: item.precoComDesconto,
                availableQuantity: item.restantePrevisto ?? null,
              })
            }
            disabled={soldOut || atMax}
          >
            Adicionar à venda
          </Botao>
        )}

        <Botao
          variant="secondary"
          size="compact"
          onClick={() => (hasDiscount ? onRemoveDiscount?.(item) : onDiscount?.(item))}
          loading={discountLoading}
        >
          {hasDiscount ? "Remover desconto" : "Aplicar desconto"}
        </Botao>
      </div>
    </article>
  );
}
