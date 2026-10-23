import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Botao from "@/shared/components/Botao/Botao";
import Icone from "@/shared/components/Icone/Icone";
import styles from "./AuthPages.module.css";

export default function ConfirmacaoRecuperacaoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string } | null)?.email;

  if (!email) {
    return <Navigate to="/recuperar-senha" replace />;
  }

  return (
      <div className={styles.panel}>
        <div className={styles.successIcon} aria-hidden="true">
          <Icone name="check-circle" size={32} />
        </div>
        <header className={styles.header}>
          <h1 className={styles.title}>Verifique seu e-mail</h1>
          <p className={styles.subtitle}>
            Caso o e-mail <strong>{email}</strong> esteja cadastrado no sistema,
            será enviado um link para recuperar sua senha.
          </p>
        </header>

        <Botao
          type="button"
          className={styles.submit}
          onClick={() => navigate("/login")}
        >
          Voltar para o login
        </Botao>
      </div>
  );
}
