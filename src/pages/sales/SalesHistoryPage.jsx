import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import Tabs from "../../components/Tabs/Tabs";
import Button from "../../components/Button/Button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/State/State";
import { useToast } from "../../context/ToastContext";
import { useSale } from "../../context/SaleContext";
import { useOngoingEvent } from "../../hooks/useEvents";
import { useCreateSale } from "../../hooks/useSales";
import { apiErrorMessage } from "../../services/api";
import SalesHistoryView from "./SalesHistoryView";
import SaleSummary from "./SaleSummary";
import styles from "./SalesPage.module.css";

const TABS = [
  { to: "/registro-vendas", label: "Registro de vendas", end: true },
  { to: "/registro-vendas/historico", label: "Histórico de vendas" },
];

export default function SalesHistoryPage() {
  const { addToast } = useToast();
  const { summary, clear } = useSale();
  const {
    data: event,
    isLoading: eventLoading,
    isError: eventError,
    refetch: refetchEvent,
  } = useOngoingEvent();
  const createSale = useCreateSale();

  async function confirmSale() {
    if (!event || summary.items.length === 0) return;
    try {
      await createSale.mutateAsync({
        eventId: event.id,
        items: summary.items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          originalPrice: item.originalPrice,
        })),
      });
      addToast("Venda registrada com sucesso.");
      clear();
    } catch (error) {
      addToast(
        apiErrorMessage(error, "Não foi possível registrar a venda."),
        "error",
      );
    }
  }

  const subtitle = event
    ? `Evento em andamento: ${event.name}`
    : "Nenhum evento em andamento";

  return (
    <div className={styles.page}>
      <PageHeader title="Registro de venda" subtitle={subtitle} />

      {eventLoading ? (
        <LoadingState message="Carregando evento em andamento..." />
      ) : eventError ? (
        <ErrorState
          message="Não foi possível carregar o evento em andamento."
          onRetry={refetchEvent}
        />
      ) : !event ? (
        <div className={styles.noEvent}>
          <Tabs items={TABS} label="Seções do registro de venda" />
          <EmptyState
            title="Nenhum evento em andamento."
            description="Inicie um evento para consultar o histórico de vendas do PDV."
            icon="calendar"
            action={
              <Button as={Link} to="/eventos">
                Ir para eventos
              </Button>
            }
          />
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.main}>
            <Tabs items={TABS} label="Seções do registro de venda" />
            <SalesHistoryView eventId={event.id} pageSize={8} />
          </div>
          <SaleSummary
            onConfirm={confirmSale}
            confirming={createSale.isPending}
          />
        </div>
      )}
    </div>
  );
}
