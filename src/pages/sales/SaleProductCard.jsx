import Badge from "../../components/Badge/Badge";
import Button from "../../components/Button/Button";
import ProductThumb from "../../components/ProductThumb/ProductThumb";
import QuantityStepper from "../../components/QuantityStepper/QuantityStepper";
import { useSale } from "../../context/SaleContext";
import { formatCurrency, formatNumber } from "../../utils/format";
import styles from "./SaleProductCard.module.css";

export default function SaleProductCard({ item, onDiscount }) {
  const { addItem, cart, setQuantity, discounts, removeDiscount } = useSale();
  const cartItem = cart.find((entry) => entry.menuItemId === item.id);
  const quantity = cartItem?.quantity || 0;
  const max =
    item.type === "ready" && Number.isFinite(Number(item.availableQuantity))
      ? Number(item.availableQuantity)
      : undefined;
  const discountedPrice = discounts[item.id];
  const currentPrice = discountedPrice ?? item.price;
  const hasDiscount = discountedPrice !== undefined;
  const soldOut = item.type === "ready" && Number(item.availableQuantity) <= 0;
  const atMax = Number.isFinite(max) && quantity >= max;

  return (
    <article className={styles.card}>
      <ProductThumb
        src={item.image}
        alt={`Imagem de ${item.name}`}
        size="fill"
      />

      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h3 className={styles.name}>{item.name}</h3>
          {soldOut ? (
            <Badge variant="danger">Sem estoque</Badge>
          ) : null}
        </div>
        <p className={styles.category}>{item.category}</p>
        <p className={styles.priceRow}>
          <strong>{formatCurrency(currentPrice)}</strong>
          {hasDiscount ? <s>{formatCurrency(item.price)}</s> : null}
        </p>
        <p className={styles.availability}>
          {item.type === "ready"
            ? `Quantidade: ${formatNumber(item.availableQuantity)}`
            : "Feito na hora"}
        </p>
      </div>

      <div className={styles.actions}>
        {quantity > 0 ? (
          <QuantityStepper
            value={quantity}
            min={1}
            max={max}
            onChange={(next) => setQuantity(item.id, next)}
            label={`quantidade de ${item.name}`}
          />
        ) : (
          <Button
            className={styles.addButton}
            onClick={() => addItem(item)}
            disabled={soldOut || atMax}
          >
            Adicionar à venda
          </Button>
        )}

        <Button
          variant="secondary"
          size="compact"
          onClick={() =>
            hasDiscount ? removeDiscount(item.id) : onDiscount?.(item)
          }
        >
          {hasDiscount ? "Remover desconto" : "Aplicar desconto"}
        </Button>
      </div>
    </article>
  );
}
