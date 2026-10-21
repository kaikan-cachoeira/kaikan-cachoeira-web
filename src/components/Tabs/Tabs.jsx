import { NavLink } from "react-router-dom";
import styles from "./Tabs.module.css";

export default function Tabs({ items, label = "Seções" }) {
  return (
    <nav className={styles.tabs} aria-label={label}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
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
