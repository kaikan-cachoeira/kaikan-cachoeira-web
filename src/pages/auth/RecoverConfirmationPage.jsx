import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout";
import Button from "../../components/Button/Button";
import Icon from "../../components/Icon/Icon";
import styles from "./AuthPages.module.css";

export default function RecoverConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/recuperar-senha" replace />;
  }

  return (
    <AuthLayout>
      <div className={styles.panel}>
        <div className={styles.successIcon} aria-hidden="true">
          <Icon name="check-circle" size={32} />
        </div>
        <header className={styles.header}>
          <h1 className={styles.title}>Verifique seu e-mail</h1>
          <p className={styles.subtitle}>
            Caso o e-mail <strong>{email}</strong> esteja cadastrado no sistema,
            será enviado um link para recuperar sua senha.
          </p>
        </header>

        <Button
          type="button"
          className={styles.submit}
          onClick={() => navigate("/login")}
        >
          Voltar para o login
        </Button>
      </div>
    </AuthLayout>
  );
}
