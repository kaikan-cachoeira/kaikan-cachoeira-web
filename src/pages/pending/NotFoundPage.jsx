import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import styles from "./PendingPage.module.css";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className={styles.stack}>
      <PageHeader title="Página não encontrada" />
      <Card className={styles.card}>
        <h2 className={styles.cardTitle}>Não encontramos este endereço</h2>
        <p className={styles.text}>
          Verifique o link acessado ou volte para o início do sistema.
        </p>
        <Button onClick={() => navigate("/inicio")}>Ir para o início</Button>
      </Card>
    </div>
  );
}
