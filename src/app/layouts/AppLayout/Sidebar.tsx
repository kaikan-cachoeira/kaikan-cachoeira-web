import { NavLink } from "react-router-dom";
import Logo from "@/shared/components/Logo/Logo";
import Icone from "@/shared/components/Icone/Icone";
import { areasDoMenu } from "@/shared/navegacao/areas";
import { usePermissoes } from "@/shared/permissoes/usePermissoes";
import { useAutenticacao } from "@/features/auth";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: () => void;
}

export default function Sidebar({ open, onClose, onNavigate }: SidebarProps) {
  const { usuario, sair } = useAutenticacao();
  const permissoes = usePermissoes();
  const areas = areasDoMenu(permissoes);
  const initials:string | undefined = usuario?.nome.slice(0, 2).toUpperCase() || "AD";

  return (
    <aside
      className={`${styles.sidebar} ${open ? styles.open : ""}`}
      aria-label="Navegação principal"
    >
      <div className={styles.top}>
        <div className={styles.brandRow}>
          <Logo compact />
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <Icone name="x" size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          <ul>
            {areas.map((area) => (
              <li key={area.path}>
                <NavLink
                  to={area.path}
                  end={area.path === "/inicio"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.active : ""}`.trim()
                  }
                >
                  <Icone name={area.icon} size={20} />
                  <span>{area.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={styles.userArea}>
        <div className={styles.user}>
          <span className={styles.avatar} aria-hidden="true">
            {initials}
          </span>
          <span className={styles.userText}>
            <span className={styles.userName}>{usuario?.nome || "Administrador"}</span>
            <span className={styles.userEmail}>
              {usuario?.cargo || "conta compartilhada"}
            </span>
          </span>
        </div>
        <button type="button" className={styles.signOut} onClick={sair}>
          <Icone name="logout" size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
