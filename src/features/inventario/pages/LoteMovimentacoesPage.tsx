import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  EstadoCarregando,
  EstadoErro,
  EstadoVazio,
} from "@/shared/components/Estado/Estado";
import Icone from "@/shared/components/Icone/Icone";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import Paginacao from "@/shared/components/Paginacao/Paginacao";
import {
  formatarDataHora,
  formatarMoeda,
  formatarNumero,
} from "@/shared/lib/formatacao";
import {
  useMovimentacoesLoteQuery,
  useProdutoQuery,
} from "../hooks/useInventario";
import modalStyles from "../components/ModaisInventario.module.css";
import styles from "./LoteMovimentacoesPage.module.css";

export default function LoteMovimentacoesPage() {
  const { productId, lotId } = useParams();
  const produtoIdNumero = Number(productId);
  const loteIdNumero = Number(lotId);
  const [page, setPage] = useState(1);
  const produtoQuery = useProdutoQuery(
    Number.isFinite(produtoIdNumero) ? produtoIdNumero : null,
  );
  const movimentosQuery = useMovimentacoesLoteQuery(
    Number.isFinite(loteIdNumero) ? loteIdNumero : undefined,
    {
    page,
    pageSize: 6,
    },
  );

  const product = produtoQuery.data;
  const lot = product?.lotes?.find((item) => item.id === loteIdNumero);
  const { data, isLoading, isError, isFetching, refetch } = movimentosQuery;

  const voltar = (
    <Link to="/estoque" className={styles.backLink}>
      <Icone name="arrow-left" size={18} />
      Voltar para o estoque
    </Link>
  );

  if (produtoQuery.isLoading) {
    return <EstadoCarregando message="Carregando lote..." />;
  }

  if (produtoQuery.isError || !lot || !product) {
    return (
      <div className={styles.stack}>
        {voltar}
        <EstadoErro
          message="Não foi possível carregar o lote."
          onRetry={produtoQuery.refetch}
        />
      </div>
    );
  }

  const hasCost = Number(lot.custoTotal) > 0;

  return (
    <div className={styles.stack}>
      {voltar}

      <PageHeader
        title="Movimentações do lote"
        subtitle={`${product.nome} · entrada em ${formatarDataHora(lot.criadoEm)}`}
      />

      <dl className={styles.summary}>
        <div>
          <dt>Quantidade de entrada</dt>
          <dd>{formatarNumero(lot.quantidadeInicial)} un</dd>
        </div>
        <div>
          <dt>Saldo atual</dt>
          <dd>{formatarNumero(lot.quantidadeAtual)} un</dd>
        </div>
        <div>
          <dt>Custo total</dt>
          <dd>{hasCost ? formatarMoeda(lot.custoTotal) : "Sem custo"}</dd>
        </div>
        <div>
          <dt>Custo unitário</dt>
          <dd>{hasCost ? formatarMoeda(lot.custoUnitario) : "Sem custo"}</dd>
        </div>
      </dl>

      {isLoading ? (
        <EstadoCarregando message="Carregando movimentações..." />
      ) : isError ? (
        <EstadoErro
          message="Não foi possível carregar as movimentações do lote."
          onRetry={refetch}
        />
      ) : data?.items?.length ? (
        <>
          <ul
            className={modalStyles.list}
            aria-busy={isFetching ? "true" : undefined}
          >
            {data.items.map((movement) => {
              const positive = Number(movement.quantidade) > 0;
              return (
                <li key={movement.id} className={modalStyles.listItem}>
                  <div className={modalStyles.listMain}>
                    <div className={modalStyles.movementTitle}>
                      <span>{movement.type}</span>
                      <strong
                        className={
                          positive
                            ? modalStyles.positive
                            : modalStyles.negative
                        }
                      >
                        {positive ? "+" : ""}
                        {formatarNumero(movement.quantidade)} un
                      </strong>
                    </div>
                    <p className={modalStyles.listMeta}>
                      {formatarDataHora(movement.criadoEm)}
                      {movement.eventoNome ? ` · ${movement.eventoNome}` : ""}
                    </p>
                    {Number(movement.custoTotal) > 0 ? (
                      <p className={modalStyles.listMeta}>
                        Custo total: {formatarMoeda(movement.custoTotal)} ·
                        Custo unitário: {formatarMoeda(movement.custoUnitario)}
                      </p>
                    ) : null}
                    {movement.observacoes ? (
                      <p className={modalStyles.listNote}>{movement.observacoes}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
          <Paginacao
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EstadoVazio
          title="Nenhuma movimentação neste lote."
          description="As entradas e saídas deste lote aparecerão aqui."
          icon="bag"
        />
      )}
    </div>
  );
}
