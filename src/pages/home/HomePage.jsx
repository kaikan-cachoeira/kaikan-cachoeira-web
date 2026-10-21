import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Icon from "../../components/Icon/Icon";
import Badge from "../../components/Badge/Badge";
import { LoadingState, ErrorState } from "../../components/State/State";
import { useOngoingEvent } from "../../hooks/useEvents";
import { formatDate, formatTime } from "../../utils/format";
import styles from "./HomePage.module.css";

const SHORTCUTS = [
  {
    title: "Estoque",
    description: "Consulte e gerencie os itens disponíveis em estoque.",
    to: "/estoque",
    icon: "box",
  },
  {
    title: "Eventos",
    description: "Organize e acompanhe os eventos do Kaikan.",
    to: "/eventos",
    icon: "ticket",
  },
  {
    title: "Doações",
    description: "Registre e acompanhe as doações recebidas.",
    to: "/doacoes",
    icon: "gift",
  },
  {
    title: "Relatório geral",
    description: "Acompanhe indicadores e resultados dos eventos.",
    to: "/em-definicao/relatorio-geral",
    icon: "chart",
  },
];

function eventPeriod(event) {
  return `${formatDate(event.start)} ${formatTime(event.start)} – ${formatDate(
    event.end,
  )} ${formatTime(event.end)}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { data: event, isLoading, isError, refetch } = useOngoingEvent();

  return (
    <div className={styles.stack}>
      <PageHeader title="Início" />

      {isLoading ? (
        <LoadingState message="Carregando o painel..." />
      ) : isError ? (
        <ErrorState
          message="Não foi possível carregar o evento em andamento."
          onRetry={refetch}
        />
      ) : event ? (
        <Card className={styles.eventCard}>
          <div className={styles.eventHeading}>
            <div>
              <p className={styles.eyebrow}>Evento em andamento</p>
              <h2 className={styles.eventName}>{event.name}</h2>
              <p className={styles.eventPeriod}>{eventPeriod(event)}</p>
            </div>
            <Badge variant="success" dot>
              Em andamento
            </Badge>
          </div>
          <div className={styles.eventActions}>
            <Button onClick={() => navigate("/registro-vendas")}>
              Registro de vendas
            </Button>
            <Button variant="secondary" onClick={() => navigate("/caixa")}>
              Caixa
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/eventos/${event.id}`)}
            >
              Ver detalhes
            </Button>
          </div>
        </Card>
      ) : (
        <Card className={styles.emptyEvent}>
          <Icon name="calendar" size={28} className={styles.emptyIcon} />
          <div>
            <h2 className={styles.emptyTitle}>Nenhum evento em andamento</h2>
            <p className={styles.emptyText}>
              Inicie um evento na área de eventos para acompanhar vendas e
              caixa por aqui.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/eventos")}>
            Ver eventos
          </Button>
        </Card>
      )}

      <section className={styles.quickSection} aria-labelledby="acesso-rapido">
        <h2 className={styles.sectionTitle} id="acesso-rapido">
          Acesso rápido
        </h2>
        <div className={styles.shortcutGrid}>
          {SHORTCUTS.map((shortcut) => (
            <Card as="article" className={styles.shortcut} key={shortcut.title}>
              <span className={styles.shortcutIcon} aria-hidden="true">
                <Icon name={shortcut.icon} size={24} />
              </span>
              <h3 className={styles.shortcutTitle}>{shortcut.title}</h3>
              <p className={styles.shortcutText}>{shortcut.description}</p>
              <Link to={shortcut.to} className={styles.shortcutLink}>
                Acessar
                <Icon name="arrow-right" size={18} />
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
