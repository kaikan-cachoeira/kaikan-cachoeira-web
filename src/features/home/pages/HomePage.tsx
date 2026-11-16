import { Link, useNavigate } from "react-router-dom";
import Card from "@/shared/components/Card/Card";
import Botao from "@/shared/components/Botao/Botao";
import Icone from "@/shared/components/Icone/Icone";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import { EstadoCarregando, EstadoErro } from "@/shared/components/Estado/Estado";
import { varianteStatus, type Evento } from "@/features/eventos";
import { formatarData, formatarHora } from "@/shared/lib/formatacao";
import Permissao from "@/shared/permissoes/Permissao";
import {
  PERMISSOES,
  temPermissao,
  type Permissao as CodigoDePermissao,
} from "@/shared/permissoes/permissoes";
import { usePermissoes } from "@/shared/permissoes/usePermissoes";
import { useHome } from "../hooks/useHome";
import styles from "./HomePage.module.css";

interface Atalho {
  title: string;
  description: string;
  to: string;
  icon: string;
  permissao: CodigoDePermissao;
}

const ATALHOS: Atalho[] = [
  {
    title: "Estoque",
    description: "Consulte e gerencie os itens disponíveis em estoque.",
    to: "/estoque",
    icon: "box",
    permissao: PERMISSOES.estoqueMenu,
  },
  {
    title: "Eventos",
    description: "Organize e acompanhe os eventos do Kaikan.",
    to: "/eventos",
    icon: "ticket",
    permissao: PERMISSOES.eventosMenu,
  },
  {
    title: "Doações",
    description: "Registre e acompanhe as doações recebidas.",
    to: "/doacoes",
    icon: "gift",
    permissao: PERMISSOES.doacoesMenu,
  },
  {
    title: "Relatório geral",
    description: "Acompanhe indicadores e resultados dos eventos.",
    to: "/relatorio-geral",
    icon: "chart",
    permissao: PERMISSOES.relatoriosMenu,
  },
];

function periodoDoEvento(evento: Evento) {
  return `${formatarData(evento.dataHoraInicio)} ${formatarHora(evento.dataHoraInicio)} – ${formatarData(
    evento.dataHoraEncerramento,
  )} ${formatarHora(evento.dataHoraEncerramento)}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const permissoes = usePermissoes();
  const { evento, carregando, erro, recarregar, podeVerEventos } = useHome();

  const atalhos = ATALHOS.filter((atalho) =>
    temPermissao(permissoes, atalho.permissao),
  );

  return (
    <div className={styles.stack}>
      {podeVerEventos ? (
        carregando ? (
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
              <Permissao precisa={PERMISSOES.vendasMenu}>
                <Botao onClick={() => navigate("/registro-vendas")}>
                  Registro de vendas
                </Botao>
              </Permissao>
              <Permissao precisa={PERMISSOES.caixaMenu}>
                <Botao variant="secondary" onClick={() => navigate("/caixa")}>
                  Caixa
                </Botao>
              </Permissao>
              <Permissao precisa={PERMISSOES.eventosMenu}>
                <Botao
                  variant="secondary"
                  onClick={() => navigate(`/eventos/${evento.id}`)}
                >
                  Ver detalhes
                </Botao>
              </Permissao>
            </div>
          </Card>
        ) : (
          <Card className={styles.emptyEvent}>
            <Icone name="calendar" size={28} className={styles.emptyIcon} />
            <div>
              <h2 className={styles.emptyTitle}>Nenhum evento em andamento</h2>
              <p className={styles.emptyText}>
                {temPermissao(permissoes, PERMISSOES.eventosMenu)
                  ? "Inicie um evento na área de eventos para acompanhar vendas e caixa por aqui."
                  : "O evento em andamento é iniciado por quem tem acesso à área de Eventos. Quando houver um, os dados aparecem aqui."}
              </p>
            </div>
            <Permissao precisa={PERMISSOES.eventosMenu}>
              <Botao variant="secondary" onClick={() => navigate("/eventos")}>
                Ver eventos
              </Botao>
            </Permissao>
          </Card>
        )
      ) : null}

      {atalhos.length > 0 ? (
        <section className={styles.quickSection} aria-labelledby="acesso-rapido">
          <h2 className={styles.sectionTitle} id="acesso-rapido">
            Acesso rápido
          </h2>
          <div className={styles.shortcutGrid}>
            {atalhos.map((atalho) => (
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
      ) : null}
    </div>
  );
}
