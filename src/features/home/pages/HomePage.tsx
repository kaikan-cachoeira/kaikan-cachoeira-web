import { Link, useNavigate } from "react-router-dom";
import Card from "@/shared/components/Card/Card";
import Botao from "@/shared/components/Botao/Botao";
import Icone from "@/shared/components/Icone/Icone";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import { EstadoCarregando, EstadoErro } from "@/shared/components/Estado/Estado";
import { varianteStatus, type Evento } from "@/features/eventos";
import { formatarData, formatarHora } from "@/shared/lib/formatacao";
import { useHome } from "../hooks/useHome";
import styles from "./HomePage.module.css";

interface Atalho {
  title: string;
  description: string;
  to: string;
  icon: string;
}

const ATALHOS: Atalho[] = [
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
    to: "/relatorio-geral",
    icon: "chart",
  },
];

function periodoDoEvento(evento: Evento) {
  return `${formatarData(evento.dataHoraInicio)} ${formatarHora(evento.dataHoraInicio)} – ${formatarData(
    evento.dataHoraEncerramento,
  )} ${formatarHora(evento.dataHoraEncerramento)}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { evento, carregando, erro, recarregar } = useHome();

  return (
    <div className={styles.stack}>
   
      {carregando ? (
        <EstadoCarregando message="Carregando o painel..." />
      ) : erro ? (
        <EstadoErro
          message="Não foi possível carregar o evento em andamento."
          onRetry={recarregar}
        />
      ) : evento ? (
        <Card className={styles.eventCard}>
          <div className={styles.eventHeading}>
            <div>
              <p className={styles.eyebrow}>Evento em andamento</p>
              <h2 className={styles.eventName}>{evento.nome}</h2>
              <p className={styles.eventPeriod}>{periodoDoEvento(evento)}</p>
            </div>
            <Etiqueta variant={varianteStatus(evento.status.codigo)} dot>
              {evento.status.descricao}
            </Etiqueta>
          </div>
          <div className={styles.eventActions}>
            <Botao onClick={() => navigate("/registro-vendas")}>
              Registro de vendas
            </Botao>
            <Botao variant="secondary" onClick={() => navigate("/caixa")}>
              Caixa
            </Botao>
            <Botao
              variant="secondary"
              onClick={() => navigate(`/eventos/${evento.id}`)}
            >
              Ver detalhes
            </Botao>
          </div>
        </Card>
      ) : (
        <Card className={styles.emptyEvent}>
          <Icone name="calendar" size={28} className={styles.emptyIcon} />
          <div>
            <h2 className={styles.emptyTitle}>Nenhum evento em andamento</h2>
            <p className={styles.emptyText}>
              Inicie um evento na área de eventos para acompanhar vendas e
              caixa por aqui.
            </p>
          </div>
          <Botao variant="secondary" onClick={() => navigate("/eventos")}>
            Ver eventos
          </Botao>
        </Card>
      )}

      <section className={styles.quickSection} aria-labelledby="acesso-rapido">
        <h2 className={styles.sectionTitle} id="acesso-rapido">
          Acesso rápido
        </h2>
        <div className={styles.shortcutGrid}>
          {ATALHOS.map((atalho) => (
            <Card as="article" className={styles.shortcut} key={atalho.title}>
              <span className={styles.shortcutIcon} aria-hidden="true">
                <Icone name={atalho.icon} size={24} />
              </span>
              <h3 className={styles.shortcutTitle}>{atalho.title}</h3>
              <p className={styles.shortcutText}>{atalho.description}</p>
              <Link to={atalho.to} className={styles.shortcutLink}>
                Acessar
                <Icone name="arrow-right" size={18} />
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
