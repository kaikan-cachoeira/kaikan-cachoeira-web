import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAutenticacao } from "@/features/auth";
import Logo from "@/shared/components/Logo/Logo";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
  children?: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { estaAutenticado } = useAutenticacao();
  const location = useLocation();

  if (estaAutenticado) {
    const destination =
      (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname || "/inicio";
    return <Navigate to={destination} replace />;
  }

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <div className={styles.formColumn}>
          <div className={styles.top}>
            <Logo />
          </div>
          <div className={styles.content}>{children || <Outlet />}</div>
        </div>
      </main>
      <aside className={styles.photo} aria-hidden="true">
        <div className={styles.photoImage} />
        <div className={styles.photoText}>
          <h2>Kaikan Cachoeira</h2>
          <p>Sistema de gestão administrativa da associação cultural japonesa.</p>
        </div>
      </aside>
    </div>
  );
}
