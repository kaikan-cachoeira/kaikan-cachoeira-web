import { Link } from "react-router-dom";
import Badge from "../../components/Badge/Badge";
import Button from "../../components/Button/Button";
import Icon from "../../components/Icon/Icon";
import { formatDateTime } from "../../utils/format";
import styles from "./EventCard.module.css";

const STATUS_VARIANT = {
  "Em andamento": "success",
  "Não iniciado": "warning",
  Encerrado: "muted",
};

export default function EventCard({
  event,
  highlighted = false,
  busy = false,
  onChangeStatus,
  onDelete,
  onPending,
}) {
  const status = event.status;
  const isOngoing = status === "Em andamento";
  const isClosed = status === "Encerrado";

  return (
    <article
      className={`${styles.card} ${highlighted ? styles.highlighted : ""}`.trim()}
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.name}>{event.name}</h2>
          <div className={styles.badges}>
            <Badge>{event.type || "Evento"}</Badge>
            <Badge variant={STATUS_VARIANT[status] || "neutral"} dot>
              {status}
            </Badge>
          </div>
        </div>
        <Icon
          name={event.type === "Reunião" ? "users" : "ticket"}
          size={24}
          className={styles.icon}
        />
      </div>

      <dl className={styles.dates}>
        <div>
          <dt>Início</dt>
          <dd>{formatDateTime(event.start)}</dd>
        </div>
        <div>
          <dt>Encerramento</dt>
          <dd>{formatDateTime(event.end)}</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <Button
          as={Link}
          to={`/eventos/${event.id}`}
          variant="secondary"
          size="compact"
        >
          Ver detalhes
        </Button>

        {isOngoing ? (
          <>
            <Button
              as={Link}
              to="/registro-vendas"
              size="compact"
              iconLeft="bag"
            >
              Registro de vendas
            </Button>
            <Button
              as={Link}
              to="/caixa"
              variant="secondary"
              size="compact"
              iconLeft="cash"
            >
              Caixa
            </Button>
            <Button
              variant="secondary"
              size="compact"
              loading={busy}
              onClick={() => onChangeStatus(event, "Encerrado")}
            >
              Encerrar evento
            </Button>
            <Button
              variant="tertiary"
              size="compact"
              disabled={busy}
              onClick={() => onChangeStatus(event, "Não iniciado")}
            >
              Desfazer início
            </Button>
          </>
        ) : null}

        {status === "Não iniciado" ? (
          <Button
            size="compact"
            loading={busy}
            onClick={() => onChangeStatus(event, "Em andamento")}
          >
            Iniciar evento
          </Button>
        ) : null}

        {isClosed ? (
          <Button
            size="compact"
            loading={busy}
            onClick={() => onChangeStatus(event, "Em andamento")}
          >
            Reabrir evento
          </Button>
        ) : null}

        <Button
          variant="tertiary"
          size="compact"
          onClick={() => onPending?.("Editar evento", event)}
        >
          Editar evento
        </Button>
        <Button
          variant="danger"
          size="compact"
          iconLeft="trash"
          disabled={busy}
          onClick={() => onDelete?.(event)}
        >
          Excluir evento
        </Button>
      </div>
    </article>
  );
}
