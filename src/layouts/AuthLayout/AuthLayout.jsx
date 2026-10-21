import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/Logo/Logo";
import styles from "./AuthLayout.module.css";

export default function AuthLayout({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || "/inicio";
    return <Navigate to={destination} replace />;
  }

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <div className={styles.top}>
          <Logo />
        </div>
        <div className={styles.content}>
          {children || <Outlet />}
        </div>
        <p className={styles.footer}>
          Sistema de gestão Kaikan Cachoeira
        </p>
      </main>
      <aside className={styles.illustration} aria-hidden="true">
        <div className={styles.pattern}>
          <span />
          <span />
          <span />
        </div>
        <div className={styles.illustrationContent}>
          <p className={styles.overline}>Associação Cultural</p>
          <p className={styles.illustrationTitle}>Kaikan Cachoeira</p>
          <p className={styles.illustrationText}>
            Tradição, comunidade e cuidado em cada evento.
          </p>
        </div>
      </aside>
    </div>
  );
}
