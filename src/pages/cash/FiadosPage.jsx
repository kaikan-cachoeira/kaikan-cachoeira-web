import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import Tabs from "../../components/Tabs/Tabs";
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
import {
  useCash,
  useFiados,
  useUnsettleFiado,
} from "../../hooks/useCash";
import { useOngoingEvent } from "../../hooks/useEvents";
import { apiErrorMessage } from "../../services/api";
import { formatCurrency, formatTodayTime } from "../../utils/format";
import CashEntryPanel from "./CashEntryPanel";
import SettleFiadoModal from "./SettleFiadoModal";
import styles from "./CashPage.module.css";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "settled", label: "Quitados" },
  { value: "pending", label: "Pendentes" },
];

export default function FiadosPage() {
  const { addToast } = useToast();
  const { data: event, isLoading: eventLoading } = useOngoingEvent();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [settleTarget, setSettleTarget] = useState(null);
  const [unsettleTarget, setUnsettleTarget] = useState(null);

  const cashQuery = useCash({ eventId: event?.id, pageSize: 1 });
  const fiadosQuery = useFiados({
    eventId: event?.id,
    status: status || undefined,
    page,
    pageSize: 6,
  });
  const unsettleFiado = useUnsettleFiado();

  const summary = cashQuery.data?.summary || {
    sold: 0,
    returned: 0,
    openFiados: 0,
  };
  const fiados = fiadosQuery.data?.items || [];

  const tabs = [
    { to: "/caixa", label: "Histórico", end: true },
    {
      to: "/caixa/fiados",
      label: "Fiados",
      end: true,
      count: cashQuery.data?.fiadosCount ?? 0,
    },
  ];

  async function confirmUnsettle() {
    try {
      await unsettleFiado.mutateAsync(unsettleTarget.id);
      addToast("Quitação cancelada. O fiado voltou para pendente.");
      setUnsettleTarget(null);
    } catch (error) {
      addToast(
        apiErrorMessage(error, "Não foi possível cancelar a quitação."),
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
          description="Inicie um evento para consultar os fiados."
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

          <div
            className={styles.statusPills}
            role="group"
            aria-label="Filtrar fiados por situação"
          >
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.pill} ${
                  status === option.value ? styles.pillActive : ""
                }`}
                aria-pressed={status === option.value}
                onClick={() => {
                  setStatus(option.value);
                  setPage(1);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <section className={styles.listCard} aria-labelledby="lista-fiados">
            <header className={styles.listHeader}>
              <h2 id="lista-fiados">Fiados</h2>
            </header>

            {fiadosQuery.isLoading ? (
              <LoadingState message="Carregando fiados..." />
            ) : fiadosQuery.isError ? (
              <ErrorState
                message="Não foi possível carregar os fiados."
                onRetry={fiadosQuery.refetch}
              />
            ) : fiados.length ? (
              <ul className={styles.list}>
                {fiados.map((fiado) => (
                  <li className={styles.fiadoRow} key={fiado.id}>
                    <div className={styles.fiadoAmount}>
                      <strong>{formatCurrency(fiado.amount)}</strong>
                      {fiado.status === "pending" && fiado.paidAmount > 0 ? (
                        <span>
                          Saldo: {formatCurrency(fiado.remaining)}
                        </span>
                      ) : null}
                    </div>
                    <span
                      className={
                        fiado.status === "settled"
                          ? styles.settled
                          : styles.pending
                      }
                    >
                      {fiado.situationLabel}
                    </span>
                    <span className={styles.fiadoDebtor}>
                      {fiado.debtorName}
                    </span>
                    <span className={styles.rowDate}>
                      {formatTodayTime(fiado.createdAt)}
                    </span>
                    <div className={styles.rowAction}>
                      {fiado.status === "pending" ? (
                        <Button
                          size="compact"
                          onClick={() => setSettleTarget(fiado)}
                        >
                          Quitar fiado
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="compact"
                          onClick={() => setUnsettleTarget(fiado)}
                        >
                          Cancelar quitação
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Nenhum fiado encontrado."
                description={
                  status
                    ? "Ajuste a situação para ver outros fiados."
                    : "Os fiados registrados no caixa aparecerão aqui."
                }
                icon="cash"
                action={
                  status ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setStatus("");
                        setPage(1);
                      }}
                    >
                      Ver todos
                    </Button>
                  ) : null
                }
              />
            )}
          </section>

          {fiados.length && fiadosQuery.data.totalPages > 1 ? (
            <Pagination
              page={fiadosQuery.data.page}
              totalPages={fiadosQuery.data.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>

        <CashEntryPanel eventId={event.id} />
      </div>

      {settleTarget ? (
        <SettleFiadoModal
          fiado={settleTarget}
          onClose={() => setSettleTarget(null)}
        />
      ) : null}

      {unsettleTarget ? (
        <ConfirmDialog
          title="Cancelar quitação"
          message={`Deseja cancelar a quitação do fiado de ${
            unsettleTarget.debtorName
          }, no valor de ${formatCurrency(
            unsettleTarget.amount,
          )}? O fiado voltará para pendente.`}
          confirmLabel="Cancelar quitação"
          cancelLabel="Voltar"
          destructive
          loading={unsettleFiado.isPending}
          onCancel={() => setUnsettleTarget(null)}
          onConfirm={confirmUnsettle}
        />
      ) : null}
    </div>
  );
}
