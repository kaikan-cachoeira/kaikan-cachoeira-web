import Button from "../../components/Button/Button";
import Icon from "../../components/Icon/Icon";
import QuantityStepper from "../../components/QuantityStepper/QuantityStepper";
import { useSale } from "../../context/SaleContext";
import { formatCurrency, formatNumber } from "../../utils/format";
import styles from "./SaleSummary.module.css";

export default function SaleSummary({ onConfirm, confirming = false }) {
  const { summary, setQuantity, removeItem } = useSale();

  return (
    <aside className={styles.summary} aria-labelledby="resumo-venda">
      <h2 className={styles.title} id="resumo-venda">
        Resumo da venda
      </h2>

      {summary.items.length ? (
        <ul className={styles.items}>
          {summary.items.map((item) => (
            <li className={styles.item} key={item.menuItemId}>
              <div className={styles.itemMain}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>
                    {formatCurrency(item.unitPrice)} cada
                    {item.discount > 0 ? (
                      <s>{formatCurrency(item.originalPrice)}</s>
                    ) : null}
                  </span>
                </div>
                <QuantityStepper
                  size="small"
                  value={item.quantity}
                  min={1}
                  max={item.availableQuantity ?? undefined}
                  onChange={(next) => setQuantity(item.menuItemId, next)}
                  label={`quantidade de ${item.name}`}
                />
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => removeItem(item.menuItemId)}
                  aria-label={`Remover ${item.name} da venda`}
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
              <div className={styles.itemTotal}>
                <span>{formatNumber(item.quantity)} ×</span>
                <strong>{formatCurrency(item.total)}</strong>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          Nenhum produto adicionado à venda. Selecione produtos no cardápio do
          evento.
        </p>
      )}

      <div className={styles.finalValue}>
        <span>Valor final</span>
        <div className={styles.valueBox} aria-live="polite">
          {formatCurrency(summary.total)}
        </div>
      </div>

      <dl className={styles.totals}>
        <div>
          <dt>Desconto</dt>
          <dd>- {formatCurrency(summary.discount)}</dd>
        </div>
        <div className={styles.totalRow}>
          <dt>Total</dt>
          <dd>{formatCurrency(summary.total)}</dd>
        </div>
      </dl>

      <Button
        className={styles.confirm}
        onClick={onConfirm}
        loading={confirming}
        disabled={summary.items.length === 0}
      >
        Confirmar venda
      </Button>
    </aside>
  );
}
