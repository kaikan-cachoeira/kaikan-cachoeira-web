import Icone from "@/shared/components/Icone/Icone";
import styles from "./Paginacao.module.css";

interface PaginacaoProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function Paginacao({
  page = 1,
  totalPages = 1,
  onPageChange,
}: PaginacaoProps) {
  return (
    <nav className={styles.pagination} aria-label="Paginação">
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange?.(page - 1)}
        disabled={page <= 1}
      >
        <Icone name="chevron-left" size={16} />
        Anterior
      </button>
      <span className={styles.status}>
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange?.(page + 1)}
        disabled={page >= totalPages}
      >
        Próxima
        <Icone name="chevron-right" size={16} />
      </button>
    </nav>
  );
}
