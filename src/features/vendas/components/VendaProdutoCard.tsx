import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import Botao from "@/shared/components/Botao/Botao";
import MiniaturaProduto from "@/shared/components/MiniaturaProduto/MiniaturaProduto";
import SeletorQuantidade from "@/shared/components/SeletorQuantidade/SeletorQuantidade";
import type { ItemCardapio } from "@/features/eventos";
import { useCarrinho } from "../hooks/useVendas";
import { formatarMoeda, formatarNumero } from "@/shared/lib/formatacao";
import styles from "./VendaProdutoCard.module.css";

interface VendaProdutoCardProps {
  item: ItemCardapio;
  onDiscount?: (item: ItemCardapio) => void;
}

export default function VendaProdutoCard({
  item,
  onDiscount,
}: VendaProdutoCardProps) {
  const { adicionarItem, itens, definirQuantidade, descontos, removerDesconto } = useCarrinho();
  const cartItem = itens.find((entry) => entry.menuItemId === item.id);
  const quantity = cartItem?.quantity || 0;
  const max =
    item.type === "ready" && Number.isFinite(Number(item.availableQuantity))
      ? Number(item.availableQuantity)
      : undefined;
  const discountedPrice = descontos[item.id];
  const currentPrice = discountedPrice ?? item.price;
  const hasDiscount = discountedPrice !== undefined;
  const soldOut = item.type === "ready" && Number(item.availableQuantity) <= 0;
  const atMax = max !== undefined && quantity >= max;

  return (
    <article className={styles.card}>
      <MiniaturaProduto
        src={item.image}
        alt={`Imagem de ${item.name}`}
        size="fill"
      />

      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h3 className={styles.name}>{item.name}</h3>
          {soldOut ? (
            <Etiqueta variant="danger">Sem estoque</Etiqueta>
          ) : null}
        </div>
        <p className={styles.category}>{item.category}</p>
        <p className={styles.priceRow}>
          <strong>{formatarMoeda(currentPrice)}</strong>
          {hasDiscount ? <s>{formatarMoeda(item.price)}</s> : null}
        </p>
        <p className={styles.availability}>
          {item.type === "ready"
            ? `Quantidade: ${formatarNumero(item.availableQuantity)}`
            : "Feito na hora"}
        </p>
      </div>

      <div className={styles.actions}>
        {quantity > 0 ? (
          <SeletorQuantidade
            value={quantity}
            min={1}
            max={max}
            onChange={(next) => definirQuantidade(item.id, next)}
            label={`quantidade de ${item.name}`}
          />
        ) : (
          <Botao
            className={styles.addButton}
            onClick={() => adicionarItem(item)}
            disabled={soldOut || atMax}
          >
            Adicionar à venda
          </Botao>
        )}

        <Botao
          variant="secondary"
          size="compact"
          onClick={() =>
            hasDiscount ? removerDesconto(item.id) : onDiscount?.(item)
          }
        >
          {hasDiscount ? "Remover desconto" : "Aplicar desconto"}
        </Botao>
      </div>
    </article>
  );
}
