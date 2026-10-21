import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "../../components/Table/Table";
import Badge from "../../components/Badge/Badge";
import { formatCurrency, formatDateTime, formatNumber } from "../../utils/format";
import styles from "./SalesModals.module.css";

export default function SaleDetailsModal({ sale, onClose }) {
  const totalDiscount = sale.discount || 0;
  return (
    <Modal
      title={`Detalhes da venda - ${formatDateTime(sale.createdAt)}`}
      subtitle="Mostra produtos vendidos, quantidade, descontos e preço total da venda"
      onClose={onClose}
      size="large"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className={styles.details}>
        <div className={styles.detailsMeta}>
          <span>{sale.eventName || "Evento"}</span>
          <Badge variant={sale.status === "cancelled" ? "muted" : "success"}>
            {sale.status === "cancelled" ? "Cancelada" : "Venda ativa"}
          </Badge>
        </div>

        <Table caption="Produtos vendidos nesta venda">
          <THead>
            <TR>
              <TH>Produtos vendidos</TH>
              <TH numeric>Preço unitário</TH>
              <TH numeric>Quantidade</TH>
              <TH numeric>Desconto</TH>
              <TH numeric>Total</TH>
            </TR>
          </THead>
          <TBody>
            {sale.items.map((item, index) => (
              <TR key={`${item.menuItemId}-${index}`}>
                <TD>{item.name}</TD>
                <TD numeric>{formatCurrency(item.unitPrice)}</TD>
                <TD numeric>{formatNumber(item.quantity)}</TD>
                <TD numeric>
                  {formatCurrency((item.discount || 0) * item.quantity)}
                </TD>
                <TD numeric>{formatCurrency(item.total)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>

        <dl className={styles.totals}>
          <div>
            <dt>Desconto</dt>
            <dd>{formatCurrency(totalDiscount)}</dd>
          </div>
          <div className={styles.grandTotal}>
            <dt>Total</dt>
            <dd>{formatCurrency(sale.total)}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}
