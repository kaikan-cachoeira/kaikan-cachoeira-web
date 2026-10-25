import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Botao from "@/shared/components/Botao/Botao";
import Icone from "@/shared/components/Icone/Icone";
import styles from "./AuthPages.module.css";

export default function SenhaAlteradaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const senhaAlterada = (
    location.state as { senhaAlterada?: boolean } | null
  )?.senhaAlterada;

  if (!senhaAlterada) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.successIcon} aria-hidden="true">
        <Icone name="check-circle" size={32} />
      </div>
      <header className={styles.header}>
        <h1 className={styles.title}>Senha alterada com sucesso</h1>
        <p className={styles.subtitle}>
          Sua senha foi atualizada. Use a nova senha para acessar o sistema.
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
