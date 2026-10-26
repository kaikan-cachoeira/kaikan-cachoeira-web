import Modal from "@/shared/components/Modal/Modal";
import Botao from "@/shared/components/Botao/Botao";
import {
  EstadoCarregando,
  EstadoErro,
  EstadoVazio,
} from "@/shared/components/Estado/Estado";
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
import type { Venda, VendaDetalhe } from "../models";
import styles from "./ModaisVenda.module.css";

interface VendaDetalhesModalProps {
  sale: Venda;
  details?: VendaDetalhe;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onClose: () => void;
}

export default function VendaDetalhesModal({
  sale,
  details,
  loading = false,
  error = false,
  onRetry,
  onClose,
}: VendaDetalhesModalProps) {
  const isCancelled = details?.cancelada ?? sale.cancelada;
  const itens = details?.itens || [];
  const totalDiscount = details?.desconto ?? sale.desconto;
  const total = details?.precoTotal ?? sale.precoTotal;

  return (
    <Modal
      title={`Detalhes da venda - ${formatarDataHora(details?.criadoEm || sale.criadoEm)}`}
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
          <span>{`Venda #${sale.id}`}</span>
          <Etiqueta variant={isCancelled ? "muted" : "success"}>
            {isCancelled ? "Cancelada" : "Venda ativa"}
          </Etiqueta>
        </div>

        {loading ? (
          <EstadoCarregando message="Carregando detalhes da venda..." />
        ) : error ? (
          <EstadoErro
            message="Não foi possível carregar os detalhes da venda."
            onRetry={onRetry}
          />
        ) : itens.length ? (
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
              {itens.map((item) => (
                <Linha key={item.produtoEventoId}>
                  <Celula>{item.nome}</Celula>
                  <Celula numeric>{formatarMoeda(item.precoUnitario)}</Celula>
                  <Celula numeric>{formatarNumero(item.quantidade)}</Celula>
                  <Celula numeric>
                    {formatarMoeda(item.descontoUnitario * item.quantidade)}
                  </Celula>
                  <Celula numeric>
                    {formatarMoeda(
                      (item.precoUnitario - item.descontoUnitario) * item.quantidade,
                    )}
                  </Celula>
                </Linha>
              ))}
            </Corpo>
          </Tabela>
        ) : (
          <EstadoVazio
            title="Sem itens na venda"
            description="Não há itens para exibir nesta venda."
            icon="bag"
          />
        )}

        <dl className={styles.totals}>
          <div>
            <dt>Desconto</dt>
            <dd>{formatarMoeda(totalDiscount)}</dd>
          </div>
          <div className={styles.grandTotal}>
            <dt>Total</dt>
            <dd>{formatarMoeda(total)}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}
