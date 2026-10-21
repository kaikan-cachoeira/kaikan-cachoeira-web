import { Link, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import Icon from "../../components/Icon/Icon";
import Badge from "../../components/Badge/Badge";
import { useEvent } from "../../hooks/useEvents";
import SalesHistoryView from "../sales/SalesHistoryView";
import styles from "./EventSalesPage.module.css";

export default function EventSalesPage() {
  const { id } = useParams();
  const { data: event } = useEvent(id);

  return (
    <div className={styles.stack}>
      <Link to={`/eventos/${id}`} className={styles.backLink}>
        <Icon name="arrow-left" size={18} />
        Voltar para o evento
      </Link>
      <PageHeader
        title="Histórico de vendas"
        subtitle="Histórico de vendas dos produtos vendidos no baiten do evento"
      />
      {event ? (
        <div className={styles.eventContext}>
          <span>{event.name}</span>
          <Badge
            variant={
              event.status === "Em andamento"
                ? "success"
                : event.status === "Não iniciado"
                  ? "warning"
                  : "muted"
            }
            dot
          >
            {event.status}
          </Badge>
        </div>
      ) : null}
      <SalesHistoryView eventId={id} pageSize={8} />
    </div>
  );
}
