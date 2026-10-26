import { Link, useParams } from "react-router-dom";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import Icone from "@/shared/components/Icone/Icone";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import { useEventoQuery, varianteStatus } from "@/features/eventos";
import HistoricoVendasView from "../components/HistoricoVendasView";
import styles from "./EventoVendasPage.module.css";

export default function EventoVendasPage() {
  const { id: paramId } = useParams();
  const id = Number(paramId);
  const idValido = Number.isInteger(id) && id > 0;
  const { data: event } = useEventoQuery(idValido ? id : null);

  return (
    <div className={styles.stack}>
      <Link to={idValido ? `/eventos/${id}` : "/eventos"} className={styles.backLink}>
        <Icone name="arrow-left" size={18} />
        Voltar para o evento
      </Link>
      <PageHeader
        title="Histórico de vendas"
        subtitle="Histórico de vendas dos produtos vendidos no baiten do evento"
      />
      {event ? (
        <div className={styles.eventContext}>
          <span>{event.nome}</span>
          <Etiqueta variant={varianteStatus(event.status.codigo)} dot>
            {event.status.descricao}
          </Etiqueta>
        </div>
      ) : null}
      <HistoricoVendasView
        eventId={idValido ? id : undefined}
        pageSize={8}
      />
    </div>
  );
}
