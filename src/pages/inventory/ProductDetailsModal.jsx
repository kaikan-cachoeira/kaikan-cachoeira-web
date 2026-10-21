import { useState } from "react";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import ProductThumb from "../../components/ProductThumb/ProductThumb";
import Badge from "../../components/Badge/Badge";
import { LoadingState, ErrorState, EmptyState } from "../../components/State/State";
import { useProduct } from "../../hooks/useInventory";
import { useToast } from "../../context/ToastContext";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "../../utils/format";
import styles from "./InventoryModals.module.css";

function LotRow({ lot, onPending }) {
  const hasCost = Number(lot.totalCost) > 0;
  return (
    <li className={styles.listItem}>
      <div className={styles.listMain}>
        <p>
          <strong>{formatNumber(lot.entryQty)} un.</strong> de entrada · saldo{" "}
          <strong>{formatNumber(lot.balance)} un.</strong>
        </p>
        <p className={styles.listMeta}>
          {formatDateTime(lot.createdAt)} · Custo total:{" "}
          {hasCost ? formatCurrency(lot.totalCost) : "Sem custo"} · Custo
          unitário: {hasCost ? formatCurrency(lot.unitCost) : "Sem custo"}
        </p>
      </div>
      <Button
        variant="tertiary"
        size="compact"
        onClick={() => onPending("Movimentações do lote")}
      >
        Ver movimentações
      </Button>
    </li>
  );
}

function MovementRow({ movement }) {
  const positive = Number(movement.quantity) > 0;
  return (
    <li className={styles.listItem}>
      <div className={styles.listMain}>
        <div className={styles.movementTitle}>
          <span>{movement.type}</span>
          <strong className={positive ? styles.positive : styles.negative}>
            {positive ? "+" : ""}
            {formatNumber(movement.quantity)} un
          </strong>
        </div>
        <p className={styles.listMeta}>
          {formatDateTime(movement.createdAt)}
          {movement.eventName ? ` · ${movement.eventName}` : ""}
        </p>
        {movement.type === "Reabastecimento" ? (
          <p className={styles.listMeta}>
            Custo total: {formatCurrency(movement.totalCost)} · Custo unitário:{" "}
            {formatCurrency(movement.unitCost)}
          </p>
        ) : null}
        {movement.notes ? (
          <p className={styles.listNote}>{movement.notes}</p>
        ) : null}
      </div>
    </li>
  );
}

export default function ProductDetailsModal({
  productId,
  onClose,
  onMovement,
}) {
  const { data: product, isLoading, isError, refetch } = useProduct(productId);
  const { addToast } = useToast();
  const [showAllLots, setShowAllLots] = useState(false);
  const [showAllMovements, setShowAllMovements] = useState(false);

  const pending = (label) =>
    addToast(
      `${label}: a tela detalhada ainda não foi especificada no SDD.`,
      "info",
    );

  const lots = product?.lots || [];
  const movements = product?.movements || [];
  const visibleLots = showAllLots ? lots : lots.slice(0, 3);
  const visibleMovements = showAllMovements
    ? movements
    : movements.slice(0, 3);

  return (
    <Modal
      title="Detalhes do produto"
      onClose={onClose}
      size="large"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button
            onClick={() => onMovement?.(product)}
            disabled={!product}
          >
            Movimentar Estoque
          </Button>
        </>
      }
    >
      {isLoading ? (
        <LoadingState message="Carregando produto..." />
      ) : isError ? (
        <ErrorState
          message="Não foi possível carregar os detalhes do produto."
          onRetry={refetch}
        />
      ) : product ? (
        <div className={styles.details}>
          <div className={styles.productSummary}>
            <ProductThumb
              src={product.image}
              alt={`Imagem de ${product.name}`}
              size="large"
            />
            <div className={styles.productInfo}>
              <div className={styles.titleBadges}>
                <h3>{product.name}</h3>
                {product.lowStock ? (
                  <Badge variant="warning" dot>
                    Estoque baixo
                  </Badge>
                ) : null}
              </div>
              <p className={styles.description}>
                {product.description || "Sem descrição cadastrada."}
              </p>
              <dl className={styles.infoGrid}>
                <div>
                  <dt>Categoria</dt>
                  <dd>{product.category || "Sem categoria"}</dd>
                </div>
                <div>
                  <dt>Quantidade atual</dt>
                  <dd>{formatNumber(product.quantity)} un</dd>
                </div>
                <div>
                  <dt>Estoque mínimo</dt>
                  <dd>{formatNumber(product.minStock)} un</dd>
                </div>
              </dl>
            </div>
          </div>

          <section className={styles.section} aria-labelledby="lotes-titulo">
            <div className={styles.sectionHeader}>
              <h3 id="lotes-titulo">Lotes</h3>
              {lots.length > 3 ? (
                <Button
                  variant="tertiary"
                  size="compact"
                  onClick={() => setShowAllLots((current) => !current)}
                >
                  {showAllLots ? "Mostrar menos" : "Ver todos os lotes"}
                </Button>
              ) : null}
            </div>
            {visibleLots.length ? (
              <ul className={styles.list}>
                {visibleLots.map((lot) => (
                  <LotRow key={lot.id} lot={lot} onPending={pending} />
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Nenhum lote registrado."
                description="As entradas de estoque aparecerão aqui."
                icon="box"
              />
            )}
          </section>

          <section
            className={styles.section}
            aria-labelledby="movimentacoes-titulo"
          >
            <div className={styles.sectionHeader}>
              <h3 id="movimentacoes-titulo">Movimentações</h3>
              {movements.length > 3 ? (
                <Button
                  variant="tertiary"
                  size="compact"
                  onClick={() =>
                    setShowAllMovements((current) => !current)
                  }
                >
                  {showAllMovements
                    ? "Mostrar menos"
                    : "Ver todas as movimentações"}
                </Button>
              ) : null}
            </div>
            {visibleMovements.length ? (
              <ul className={styles.list}>
                {visibleMovements.map((movement) => (
                  <MovementRow key={movement.id} movement={movement} />
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Nenhuma movimentação registrada."
                description="As entradas e saídas do produto aparecerão aqui."
                icon="bag"
              />
            )}
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
