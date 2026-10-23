import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import Botao from "@/shared/components/Botao/Botao";
import Card from "@/shared/components/Card/Card";
import Icone from "@/shared/components/Icone/Icone";
import styles from "./PaginaPendente.module.css";

const LABELS: Record<string, string> = {
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

export default function PaginaPendente() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const title =
    LABELS[slug || ""] ||
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
          <Botao variant="secondary" onClick={() => navigate(-1)}>
            Voltar
          </Botao>
        }
      />
      <Card className={styles.card}>
        <Icone name="info" size={36} className={styles.icon} />
        <h2 className={styles.cardTitle}>Tela pendente de especificação</h2>
        <p className={styles.text}>
          Este destino é citado no SDD ou nos wireframes, porém não possui tela
          desenhada. Para não criar uma interface sem referência, a navegação
          mantém o fluxo documentado e retorna à tela de origem.
        </p>
        <p className={styles.reference}>
          Referência: <code>{title}</code>
        </p>
        <Botao variant="secondary" onClick={() => navigate(-1)}>
          Voltar à tela anterior
        </Botao>
      </Card>
    </div>
  );
}
