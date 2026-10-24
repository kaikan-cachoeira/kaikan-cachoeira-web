import { NavLink } from "react-router-dom";
import styles from "./Abas.module.css";

interface AbaItem {
  to: string;
  label: string;
  end?: boolean;
  count?: number;
}

interface AbasProps {
  items: AbaItem[];
  label?: string;
}

export default function Abas({ items, label = "Seções" }: AbasProps) {
  return (
    <nav className={styles.tabs} aria-label={label}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          replace
          className={({ isActive }) =>
            `${styles.tab} ${isActive ? styles.active : ""}`.trim()
          }
        >
          {item.label}
          {item.count !== undefined ? (
            <span className={styles.count}> ({item.count})</span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}
