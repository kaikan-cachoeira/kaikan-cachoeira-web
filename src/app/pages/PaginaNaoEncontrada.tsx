import { useNavigate } from "react-router-dom";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import Botao from "@/shared/components/Botao/Botao";
import Card from "@/shared/components/Card/Card";
import styles from "./PaginaPendente.module.css";

export default function PaginaNaoEncontrada() {
  const navigate = useNavigate();
  return (
    <div className={styles.stack}>
      <PageHeader title="Página não encontrada" />
      <Card className={styles.card}>
        <h2 className={styles.cardTitle}>Não encontramos este endereço</h2>
        <p className={styles.text}>
          Verifique o link acessado ou volte para o início do sistema.
        </p>
        <Botao onClick={() => navigate("/inicio")}>Ir para o início</Botao>
      </Card>
    </div>
  );
}
