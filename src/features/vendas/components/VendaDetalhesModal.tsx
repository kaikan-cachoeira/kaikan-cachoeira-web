import Modal from "@/shared/components/Modal/Modal";
import Botao from "@/shared/components/Botao/Botao";
import {
  Tabela,
  Cabecalho,
  Corpo,
  Linha,
  CelulaCabecalho,
  Celula,
} from "@/shared/components/Tabela/Tabela";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import { formatarMoeda, formatarDataHora, formatarNumero } from "@/shared/lib/formatacao";
import type { Venda } from "../models";
import styles from "./ModaisVenda.module.css";

interface VendaDetalhesModalProps {
  sale: Venda;
  onClose: () => void;
}

export default function VendaDetalhesModal({
  sale,
  onClose,
}: VendaDetalhesModalProps) {
  const totalDiscount = sale.discount || 0;
  return (
    <Modal
      title={`Detalhes da venda - ${formatarDataHora(sale.createdAt)}`}
      subtitle="Mostra produtos vendidos, quantidade, descontos e preço total da venda"
      onClose={onClose}
      size="large"
      footer={
        <Botao variant="secondary" onClick={onClose}>
          Fechar
        </Botao>
      }
    >
      <div className={styles.details}>
        <div className={styles.detailsMeta}>
          <span>{sale.eventName || "Evento"}</span>
          <Etiqueta variant={sale.status === "cancelled" ? "muted" : "success"}>
            {sale.status === "cancelled" ? "Cancelada" : "Venda ativa"}
          </Etiqueta>
        </div>

        <Tabela caption="Produtos vendidos nesta venda">
          <Cabecalho>
            <Linha>
              <CelulaCabecalho>Produtos vendidos</CelulaCabecalho>
              <CelulaCabecalho numeric>Preço unitário</CelulaCabecalho>
              <CelulaCabecalho numeric>Quantidade</CelulaCabecalho>
              <CelulaCabecalho numeric>Desconto</CelulaCabecalho>
              <CelulaCabecalho numeric>Total</CelulaCabecalho>
            </Linha>
          </Cabecalho>
          <Corpo>
            {sale.items.map((item, index) => (
              <Linha key={`${item.menuItemId}-${index}`}>
                <Celula>{item.name}</Celula>
                <Celula numeric>{formatarMoeda(item.unitPrice)}</Celula>
                <Celula numeric>{formatarNumero(item.quantity)}</Celula>
                <Celula numeric>
                  {formatarMoeda((item.discount || 0) * item.quantity)}
                </Celula>
                <Celula numeric>{formatarMoeda(item.total)}</Celula>
              </Linha>
            ))}
          </Corpo>
        </Tabela>

        <dl className={styles.totals}>
          <div>
            <dt>Desconto</dt>
            <dd>{formatarMoeda(totalDiscount)}</dd>
          </div>
          <div className={styles.grandTotal}>
            <dt>Total</dt>
            <dd>{formatarMoeda(sale.total)}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}
