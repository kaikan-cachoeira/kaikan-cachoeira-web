import Button from "../Button/Button";
import styles from "./FilterPanel.module.css";

export default function FilterPanel({
  children,
  onClear,
  columns = 2,
  id,
  title = "Filtros",
}) {
  return (
    <section
      className={styles.panel}
      id={id}
      aria-label={title}
      style={{ "--filter-columns": columns }}
    >
      <div className={styles.grid}>{children}</div>
      {onClear ? (
        <div className={styles.footer}>
          <Button variant="tertiary" size="compact" onClick={onClear}>
            Limpar filtros
          </Button>
        </div>
      ) : null}
    </section>
  );
}
