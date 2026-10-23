import Botao from "@/shared/components/Botao/Botao";
import Icone from "@/shared/components/Icone/Icone";
import SeletorQuantidade from "@/shared/components/SeletorQuantidade/SeletorQuantidade";
import { useCarrinho } from "../hooks/useVendas";
import { formatarMoeda, formatarNumero } from "@/shared/lib/formatacao";
import styles from "./ResumoVenda.module.css";

interface ResumoVendaProps {
  onConfirm: () => void;
  confirming?: boolean;
}

export default function ResumoVenda({
  onConfirm,
  confirming = false,
}: ResumoVendaProps) {
  const { resumo, definirQuantidade, removerItem } = useCarrinho();

  return (
    <aside className={styles.summary} aria-labelledby="resumo-venda">
      <h2 className={styles.title} id="resumo-venda">
        Resumo da venda
      </h2>

      {resumo.items.length ? (
        <ul className={styles.items}>
          {resumo.items.map((item) => (
            <li className={styles.item} key={item.menuItemId}>
              <div className={styles.itemMain}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>
                    {formatarMoeda(item.unitPrice)} cada
                    {item.discount > 0 ? (
                      <s>{formatarMoeda(item.originalPrice)}</s>
                    ) : null}
                  </span>
                </div>
                <SeletorQuantidade
                  size="small"
                  value={item.quantity}
                  min={1}
                  max={item.availableQuantity ?? undefined}
                  onChange={(next) => definirQuantidade(item.menuItemId, next)}
                  label={`quantidade de ${item.name}`}
                />
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => removerItem(item.menuItemId)}
                  aria-label={`Remover ${item.name} da venda`}
                >
                  <Icone name="trash" size={16} />
                </button>
              </div>
              <div className={styles.itemTotal}>
                <span>{formatarNumero(item.quantity)} ×</span>
                <strong>{formatarMoeda(item.total)}</strong>
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
          {formatarMoeda(resumo.total)}
        </div>
      </div>

      <dl className={styles.totals}>
        <div>
          <dt>Desconto</dt>
          <dd>- {formatarMoeda(resumo.discount)}</dd>
        </div>
        <div className={styles.totalRow}>
          <dt>Total</dt>
          <dd>{formatarMoeda(resumo.total)}</dd>
        </div>
      </dl>

      <Botao
        className={styles.confirm}
        onClick={onConfirm}
        loading={confirming}
        disabled={resumo.items.length === 0}
      >
        Confirmar venda
      </Botao>
    </aside>
  );
}
