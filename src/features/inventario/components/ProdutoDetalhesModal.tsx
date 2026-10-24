import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Botao from "@/shared/components/Botao/Botao";
import {
  EstadoCarregando,
  EstadoErro,
  EstadoVazio,
} from "@/shared/components/Estado/Estado";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import MiniaturaProduto from "@/shared/components/MiniaturaProduto/MiniaturaProduto";
import Modal from "@/shared/components/Modal/Modal";
import {
  formatarDataHora,
  formatarMoeda,
  formatarNumero,
} from "@/shared/lib/formatacao";
import type { LoteProduto, MovimentacaoProduto, Produto } from "../models";
import { useProdutoQuery } from "../hooks/useInventario";
import styles from "./ModaisInventario.module.css";

interface LotRowProps {
  lot: LoteProduto;
  onViewMovements: () => void;
}

function LotRow({ lot, onViewMovements }: LotRowProps) {
  const hasCost = Number(lot.totalCost) > 0;
  return (
    <li className={styles.listItem}>
      <div className={styles.listMain}>
        <p>
          <strong>{formatarNumero(lot.entryQty)} un.</strong> de entrada · saldo{" "}
          <strong>{formatarNumero(lot.balance)} un.</strong>
        </p>
        <p className={styles.listMeta}>
          {formatarDataHora(lot.createdAt)} · Custo total:{" "}
          {hasCost ? formatarMoeda(lot.totalCost) : "Sem custo"} · Custo
          unitário: {hasCost ? formatarMoeda(lot.unitCost) : "Sem custo"}
        </p>
      </div>
      <Botao variant="tertiary" size="compact" onClick={onViewMovements}>
        Ver movimentações
      </Botao>
    </li>
  );
}

interface MovementRowProps {
  movement: MovimentacaoProduto;
}

function MovementRow({ movement }: MovementRowProps) {
  const positive = Number(movement.quantity) > 0;
  return (
    <li className={styles.listItem}>
      <div className={styles.listMain}>
        <div className={styles.movementTitle}>
          <span>{movement.type}</span>
          <strong className={positive ? styles.positive : styles.negative}>
            {positive ? "+" : ""}
            {formatarNumero(movement.quantity)} un
          </strong>
        </div>
        <p className={styles.listMeta}>
          {formatarDataHora(movement.createdAt)}
          {movement.eventName ? ` · ${movement.eventName}` : ""}
        </p>
        {movement.type === "Reabastecimento" ? (
          <p className={styles.listMeta}>
            Custo total: {formatarMoeda(movement.totalCost)} · Custo unitário:{" "}
            {formatarMoeda(movement.unitCost)}
          </p>
        ) : null}
        {movement.notes ? (
          <p className={styles.listNote}>{movement.notes}</p>
        ) : null}
      </div>
    </li>
  );
}

interface ProdutoDetalhesModalProps {
  productId: string;
  onClose: () => void;
  onMovement: (produto: Produto) => void;
}

export default function ProdutoDetalhesModal({
  productId,
  onClose,
  onMovement,
}: ProdutoDetalhesModalProps) {
  const { data: product, isLoading, isError, refetch } = useProdutoQuery(productId);
  const navigate = useNavigate();
  const [showAllLots, setShowAllLots] = useState(false);
  const [showAllMovements, setShowAllMovements] = useState(false);

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
          <Botao variant="secondary" onClick={onClose}>
            Fechar
          </Botao>
          <Botao
            onClick={() => product && onMovement(product)}
            disabled={!product}
          >
            Movimentar Estoque
          </Botao>
        </>
      }
    >
      {isLoading ? (
        <EstadoCarregando message="Carregando produto..." />
      ) : isError ? (
        <EstadoErro
          message="Não foi possível carregar os detalhes do produto."
          onRetry={refetch}
        />
      ) : product ? (
        <div className={styles.details}>
          <div className={styles.productSummary}>
            <MiniaturaProduto
              src={product.image}
              alt={`Imagem de ${product.name}`}
              size="large"
            />
            <div className={styles.productInfo}>
              <div className={styles.titleBadges}>
                <h3>{product.name}</h3>
                {product.lowStock ? (
                  <Etiqueta variant="warning" dot>
                    Estoque baixo
                  </Etiqueta>
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
                  <dd>{formatarNumero(product.quantity)} un</dd>
                </div>
                <div>
                  <dt>Estoque mínimo</dt>
                  <dd>{formatarNumero(product.minStock)} un</dd>
                </div>
              </dl>
            </div>
          </div>

          <section className={styles.section} aria-labelledby="lotes-titulo">
            <div className={styles.sectionHeader}>
              <h3 id="lotes-titulo">Lotes</h3>
              {lots.length > 3 ? (
                <Botao
                  variant="tertiary"
                  size="compact"
                  onClick={() => setShowAllLots((current) => !current)}
                >
                  {showAllLots ? "Mostrar menos" : "Ver todos os lotes"}
                </Botao>
              ) : null}
            </div>
            {visibleLots.length ? (
              <ul className={styles.list}>
                {visibleLots.map((lot) => (
                  <LotRow
                    key={lot.id}
                    lot={lot}
                    onViewMovements={() =>
                      navigate(
                        `/estoque/${productId}/lotes/${lot.id}/movimentacoes`,
                      )
                    }
                  />
                ))}
              </ul>
            ) : (
              <EstadoVazio
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
                <Botao
                  variant="tertiary"
                  size="compact"
                  onClick={() =>
                    setShowAllMovements((current) => !current)
                  }
                >
                  {showAllMovements
                    ? "Mostrar menos"
                    : "Ver todas as movimentações"}
                </Botao>
              ) : null}
            </div>
            {visibleMovements.length ? (
              <ul className={styles.list}>
                {visibleMovements.map((movement) => (
                  <MovementRow key={movement.id} movement={movement} />
                ))}
              </ul>
            ) : (
              <EstadoVazio
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