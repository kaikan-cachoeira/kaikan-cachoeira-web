import Icon from "../Icon/Icon";
import styles from "./Pagination.module.css";

export default function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  return (
    <nav className={styles.pagination} aria-label="Paginação">
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <Icon name="chevron-left" size={16} />
        Anterior
      </button>
      <span className={styles.status}>
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Próxima
        <Icon name="chevron-right" size={16} />
      </button>
    </nav>
  );
}
