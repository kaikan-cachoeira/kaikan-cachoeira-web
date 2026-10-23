import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "./AppLayout.module.css";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#conteudo-principal">
        Pular para o conteúdo
      </a>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={() => setSidebarOpen(false)}
      />

      {sidebarOpen ? (
        <button
          type="button"
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu de navegação"
        />
      ) : null}

      <div className={styles.workspace}>
        <Header onOpenMenu={() => setSidebarOpen(true)} />
        <main className={styles.content} id="conteudo-principal" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
