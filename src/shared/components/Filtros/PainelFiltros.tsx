import type { CSSProperties, ReactNode } from "react";
import Botao from "@/shared/components/Botao/Botao";
import styles from "./PainelFiltros.module.css";

interface PainelFiltrosProps {
  children?: ReactNode;
  onClear?: () => void;
  columns?: number;
  id?: string;
  title?: string;
}

export default function PainelFiltros({
  children,
  onClear,
  columns = 2,
  id,
  title = "Filtros",
}: PainelFiltrosProps) {
  return (
    <section
      className={styles.panel}
      id={id}
      aria-label={title}
      style={{ "--filter-columns": columns } as CSSProperties}
    >
      <div className={styles.grid}>{children}</div>
      {onClear ? (
        <div className={styles.footer}>
          <Botao variant="tertiary" size="compact" onClick={onClear}>
            Limpar filtros
          </Botao>
        </div>
      ) : null}
    </section>
  );
}
