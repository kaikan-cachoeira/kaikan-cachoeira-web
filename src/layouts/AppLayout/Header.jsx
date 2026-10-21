import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import { useAuth } from "../../context/AuthContext";
import styles from "./Header.module.css";

const TITLES = [
  { pattern: /^\/inicio/, title: "Início" },
  { pattern: /^\/estoque/, title: "Estoque" },
  { pattern: /^\/doacoes/, title: "Doações" },
  { pattern: /^\/eventos/, title: "Eventos" },
  { pattern: /^\/registro-vendas/, title: "Registro de vendas" },
  { pattern: /^\/caixa/, title: "Caixa" },
  { pattern: /^\/em-definicao/, title: "Em definição" },
];

export default function Header({ onOpenMenu }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const pageTitle =
    TITLES.find((item) => item.pattern.test(location.pathname))?.title ||
    "Kaikan Cachoeira";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function onPointer(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    }
    function onKey(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onOpenMenu}
          aria-label="Abrir menu de navegação"
        >
          <Icon name="menu" size={22} />
        </button>
        <p className={styles.title}>{pageTitle}</p>
      </div>

      <div className={styles.userArea} ref={menuRef}>
        <button
          ref={buttonRef}
          type="button"
          className={styles.userButton}
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <span className={styles.userText}>
            <span className={styles.userName}>
              {user?.name || "Administrador"}
            </span>
            <span className={styles.userEmail}>
              {user?.email || "conta compartilhada"}
            </span>
          </span>
          <span className={styles.avatar} aria-hidden="true">
            {user?.initials || "AD"}
          </span>
          <Icon name={menuOpen ? "chevron-up" : "chevron-down"} size={18} />
        </button>

        {menuOpen ? (
          <div className={styles.popover}>
            <div className={styles.popoverIdentity}>
              <span className={styles.avatar} aria-hidden="true">
                {user?.initials || "AD"}
              </span>
              <div>
                <p className={styles.popoverName}>
                  {user?.name || "Administrador"}
                </p>
                <p className={styles.popoverEmail}>
                  {user?.email || "conta compartilhada"}
                </p>
              </div>
            </div>
            <p className={styles.accountLabel}>
              {user?.accountLabel || "Conta compartilhada"}
            </p>
            <button type="button" className={styles.logout} onClick={signOut}>
              <Icon name="logout" size={18} />
              Sair
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
