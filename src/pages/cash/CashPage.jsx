import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import Tabs from "../../components/Tabs/Tabs";
import Select from "../../components/Form/Select";
import Button from "../../components/Button/Button";
import Pagination from "../../components/Pagination/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { StatCard } from "../../components/Card/Card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/State/State";
import { useToast } from "../../context/ToastContext";
import { useCancelCashEntry, useCash } from "../../hooks/useCash";
import { useOngoingEvent } from "../../hooks/useEvents";
import { apiErrorMessage } from "../../services/api";
import { formatCurrency, formatTodayTime } from "../../utils/format";
import CashEntryPanel from "./CashEntryPanel";
import styles from "./CashPage.module.css";

const TYPE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "Venda de fichas", label: "Venda de fichas" },
  { value: "Devolução", label: "Devolução" },
];

const PAYMENT_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "PIX", label: "PIX" },
  { value: "Débito", label: "Débito" },
  { value: "Crédito", label: "Crédito" },
  { value: "Dinheiro", label: "Dinheiro" },
  { value: "Fiado", label: "Fiado" },
];

function cancelLabel(entry) {
  if (entry.payment === "Fiado") return "Cancelar fiado";
  if (entry.type === "Venda de fichas") return "Cancelar venda";
  return "Cancelar devolução";
}

export default function CashPage() {
  const location = useLocation();
  const { addToast } = useToast();
  const { data: event, isLoading: eventLoading } = useOngoingEvent();
  const [type, setType] = useState("");
  const [payment, setPayment] = useState("");
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState(null);
  const cancelCash = useCancelCashEntry();

  const params = {
    eventId: event?.id,
    page,
    pageSize: 6,
    types: type || undefined,
    payments: payment || undefined,
  };
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useCash(params);

  const summary = data?.summary || { sold: 0, returned: 0, openFiados: 0 };
  const entries = data?.items || [];
  const historyPath =
    location.pathname === "/caixa/fiado" ? "/caixa/fiado" : "/caixa";
  const tabs = [
    { to: historyPath, label: "Histórico", end: true },
    {
      to: "/caixa/fiados",
      label: "Fiados",
      count: data?.fiadosCount ?? 0,
    },
  ];

  function clearFilters() {
    setType("");
    setPayment("");
    setPage(1);
  }

  async function confirmCancel() {
    try {
      await cancelCash.mutateAsync(cancelTarget.id);
      addToast("Lançamento cancelado com sucesso.");
      setCancelTarget(null);
    } catch (error) {
      addToast(
        apiErrorMessage(error, "Não foi possível cancelar o lançamento."),
        "error",
      );
    }
  }

  if (eventLoading) {
    return <LoadingState message="Carregando caixa..." />;
  }

  if (!event) {
    return (
      <div className={styles.page}>
        <PageHeader
          title="Caixa"
          subtitle="Controle de fichas, pagamentos e fiados"
        />
        <EmptyState
          title="Nenhum evento em andamento."
          description="Inicie um evento para registrar e consultar o caixa."
          icon="cash"
          action={
            <Button as={Link} to="/eventos">
              Ir para eventos
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Caixa"
        subtitle="Controle de fichas, pagamentos e fiados"
      />

      <section className={styles.statsGrid} aria-label="Resumo do caixa">
        <StatCard label="Fichas vendidas" value={formatCurrency(summary.sold)} />
        <StatCard
          label="Fichas devolvidas"
          value={formatCurrency(summary.returned)}
        />
        <StatCard
          label="Fiados em aberto"
          value={formatCurrency(summary.openFiados)}
        />
      </section>

      <div className={styles.layout}>
        <div className={styles.left}>
          <Tabs items={tabs} label="Seções do caixa" />

          <div className={styles.filters}>
            <Select
              id="caixa-filtro-tipo"
              label="Tipo de registro"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(changeEvent) => {
                setType(changeEvent.target.value);
                setPage(1);
              }}
            />
            <Select
              id="caixa-filtro-pagamento"
              label="Forma de pagamento"
              options={PAYMENT_OPTIONS}
              value={payment}
              onChange={(changeEvent) => {
                setPayment(changeEvent.target.value);
                setPage(1);
              }}
            />
            <Button
              variant="secondary"
              className={styles.clearButton}
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          </div>

          <section className={styles.listCard} aria-labelledby="historico-caixa">
            <header className={styles.listHeader}>
              <h2 id="historico-caixa">Histórico de lançamentos</h2>
            </header>

            {isLoading ? (
              <LoadingState message="Carregando lançamentos..." />
            ) : isError ? (
              <ErrorState
                message="Não foi possível carregar o caixa."
                onRetry={refetch}
              />
            ) : entries.length ? (
              <ul className={styles.list}>
                {entries.map((entry) => (
                  <li className={styles.row} key={entry.id}>
                    <strong className={styles.rowValue}>
                      {formatCurrency(entry.value)}
                    </strong>
                    <span className={styles.rowPayment}>
                      {entry.type === "Venda de fichas"
                        ? "Venda"
                        : "Devolução"}{" "}
                      - {entry.paymentLabel}
                    </span>
                    <span className={styles.rowDate}>
                      {formatTodayTime(entry.createdAt)}
                    </span>
                    <div className={styles.rowAction}>
                      <Button
                        variant="secondary"
                        size="compact"
                        onClick={() => setCancelTarget(entry)}
                      >
                        {cancelLabel(entry)}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Nenhum lançamento encontrado."
                description={
                  type || payment
                    ? "Ajuste os filtros para ver outros lançamentos."
                    : "Os lançamentos do caixa aparecerão aqui."
                }
                icon="cash"
                action={
                  type || payment ? (
                    <Button variant="secondary" onClick={clearFilters}>
                      Limpar filtros
                    </Button>
                  ) : null
                }
              />
            )}
          </section>

          {entries.length && data.totalPages > 1 ? (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>

        <CashEntryPanel eventId={event.id} />
      </div>

      {cancelTarget ? (
        <ConfirmDialog
          title={cancelLabel(cancelTarget)}
          message={`Deseja cancelar este lançamento de ${formatCurrency(
            cancelTarget.value,
          )}? ${
            cancelTarget.payment === "Fiado"
              ? "O fiado correspondente também será removido."
              : "O valor deixará de ser considerado no resumo do caixa."
          }`}
          confirmLabel={cancelLabel(cancelTarget)}
          cancelLabel="Voltar"
          destructive
          loading={cancelCash.isPending}
          onCancel={() => setCancelTarget(null)}
          onConfirm={confirmCancel}
        />
      ) : null}
    </div>
  );
}
