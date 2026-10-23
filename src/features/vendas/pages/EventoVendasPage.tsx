import { Link, useParams } from "react-router-dom";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import Icone from "@/shared/components/Icone/Icone";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import { useEventoQuery } from "@/features/eventos";
import HistoricoVendasView from "../components/HistoricoVendasView";
import styles from "./EventoVendasPage.module.css";

export default function EventoVendasPage() {
  const { id } = useParams();
  const { data: event } = useEventoQuery(id);

  return (
    <div className={styles.stack}>
      <Link to={`/eventos/${id}`} className={styles.backLink}>
        <Icone name="arrow-left" size={18} />
        Voltar para o evento
      </Link>
      <PageHeader
        title="Histórico de vendas"
        subtitle="Histórico de vendas dos produtos vendidos no baiten do evento"
      />
      {event ? (
        <div className={styles.eventContext}>
          <span>{event.name}</span>
          <Etiqueta
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
          </Etiqueta>
        </div>
      ) : null}
      <HistoricoVendasView eventId={id} pageSize={8} />
    </div>
  );
}
