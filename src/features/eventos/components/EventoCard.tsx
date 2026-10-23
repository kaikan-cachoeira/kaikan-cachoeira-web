import { Link } from "react-router-dom";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import Botao from "@/shared/components/Botao/Botao";
import Icone from "@/shared/components/Icone/Icone";
import { formatarDataHora } from "@/shared/lib/formatacao";
import type { Evento } from "../models";
import styles from "./EventoCard.module.css";

const STATUS_VARIANT: Record<string, string> = {
  "Em andamento": "success",
  "Não iniciado": "warning",
  Encerrado: "muted",
};

interface EventoCardProps {
  event: Evento;
  highlighted?: boolean;
  busy?: boolean;
  onChangeStatus: (event: Evento, status: string) => void;
  onDelete: (event: Evento) => void;
  onPending: (action: string, event: Evento) => void;
}

export default function EventoCard({
  event,
  highlighted = false,
  busy = false,
  onChangeStatus,
  onDelete,
  onPending,
}: EventoCardProps) {
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
            <Etiqueta>{event.type || "Evento"}</Etiqueta>
            <Etiqueta variant={STATUS_VARIANT[status] || "neutral"} dot>
              {status}
            </Etiqueta>
          </div>
        </div>
        <Icone
          name={event.type === "Reunião" ? "users" : "ticket"}
          size={24}
          className={styles.icon}
        />
      </div>

      <dl className={styles.dates}>
        <div>
          <dt>Início</dt>
          <dd>{formatarDataHora(event.start)}</dd>
        </div>
        <div>
          <dt>Encerramento</dt>
          <dd>{formatarDataHora(event.end)}</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <Botao
          as={Link}
          to={`/eventos/${event.id}`}
          variant="secondary"
          size="compact"
        >
          Ver detalhes
        </Botao>

        {isOngoing ? (
          <>
            <Botao
              as={Link}
              to="/registro-vendas"
              size="compact"
              iconLeft="bag"
            >
              Registro de vendas
            </Botao>
            <Botao
              as={Link}
              to="/caixa"
              variant="secondary"
              size="compact"
              iconLeft="cash"
            >
              Caixa
            </Botao>
            <Botao
              variant="secondary"
              size="compact"
              loading={busy}
              onClick={() => onChangeStatus(event, "Encerrado")}
            >
              Encerrar evento
            </Botao>
            <Botao
              variant="tertiary"
              size="compact"
              disabled={busy}
              onClick={() => onChangeStatus(event, "Não iniciado")}
            >
              Desfazer início
            </Botao>
          </>
        ) : null}

        {status === "Não iniciado" ? (
          <Botao
            size="compact"
            loading={busy}
            onClick={() => onChangeStatus(event, "Em andamento")}
          >
            Iniciar evento
          </Botao>
        ) : null}

        {isClosed ? (
          <Botao
            size="compact"
            loading={busy}
            onClick={() => onChangeStatus(event, "Em andamento")}
          >
            Reabrir evento
          </Botao>
        ) : null}

        <Botao
          variant="tertiary"
          size="compact"
          onClick={() => onPending?.("Editar evento", event)}
        >
          Editar evento
        </Botao>
        <Botao
          variant="danger"
          size="compact"
          iconLeft="trash"
          disabled={busy}
          onClick={() => onDelete?.(event)}
        >
          Excluir evento
        </Botao>
      </div>
    </article>
  );
}
