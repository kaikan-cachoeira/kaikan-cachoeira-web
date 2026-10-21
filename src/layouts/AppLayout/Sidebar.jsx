import { NavLink } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import Icon from "../../components/Icon/Icon";
import { useAuth } from "../../context/AuthContext";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { to: "/inicio", label: "Início", icon: "home", end: true },
  { to: "/estoque", label: "Estoque", icon: "box" },
  { to: "/eventos", label: "Eventos", icon: "ticket" },
  { to: "/doacoes", label: "Doações", icon: "gift" },
  {
    to: "/em-definicao/painel-de-controle",
    label: "Painel de controle",
    icon: "chart",
  },
  { to: "/registro-vendas", label: "Registro de vendas", icon: "bag" },
  { to: "/caixa", label: "Caixa", icon: "cash" },
];

export default function Sidebar({ open, onClose, onNavigate }) {
  const { user, signOut } = useAuth();
  const initials = user?.initials || "AD";

  return (
    <aside
      className={`${styles.sidebar} ${open ? styles.open : ""}`}
      aria-label="Navegação principal"
    >
      <div className={styles.top}>
        <div className={styles.brandRow}>
          <Logo />
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.active : ""}`.trim()
                  }
                >
                  <Icon name={item.icon} size={20} />
                  <span>{item.label}</span>
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
            <span className={styles.userName}>{user?.name || "Administrador"}</span>
            <span className={styles.userEmail}>
              {user?.email || "conta compartilhada"}
            </span>
          </span>
        </div>
        <button type="button" className={styles.signOut} onClick={signOut}>
          <Icon name="logout" size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
