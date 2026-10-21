import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import Icon from "../../components/Icon/Icon";
import styles from "./PendingPage.module.css";

const LABELS = {
  "painel-de-controle": "Painel de controle",
  "relatorio-geral": "Relatório geral",
  "editar-evento": "Editar evento",
  "editar-produto": "Editar produto",
  "editar-categoria": "Editar categoria",
  "devolucao-fichas": "Devolução de fichas",
  "cancelamento-venda": "Cancelamento de venda",
  "cancelamento-lancamento": "Cancelamento de lançamento",
  "cancelamento-quitacao": "Cancelamento de quitação",
  "lista-de-lotes": "Lista de lotes",
  "lista-de-movimentacoes": "Lista de movimentações",
};

export default function PendingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const title =
    LABELS[slug] ||
    String(slug || "Tela")
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  return (
    <div className={styles.stack}>
      <PageHeader
        title={title}
        subtitle="Destino identificado, mas ainda sem tela especificada"
        actions={
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        }
      />
      <Card className={styles.card}>
        <Icon name="info" size={36} className={styles.icon} />
        <h2 className={styles.cardTitle}>Tela pendente de especificação</h2>
        <p className={styles.text}>
          Este destino é citado no SDD ou nos wireframes, porém não possui tela
          desenhada. Para não criar uma interface sem referência, a navegação
          mantém o fluxo documentado e retorna à tela de origem.
        </p>
        <p className={styles.reference}>
          Referência: <code>{title}</code>
        </p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Voltar à tela anterior
        </Button>
      </Card>
    </div>
  );
}
