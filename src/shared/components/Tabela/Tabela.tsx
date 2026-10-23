import type { ReactNode } from "react";
import styles from "./Tabela.module.css";

interface TabelaProps {
  children?: ReactNode;
  caption?: ReactNode;
  className?: string;
}

export function Tabela({ children, caption, className = "" }: TabelaProps) {
  return (
    <div className={styles.wrapper}>
      <table className={`${styles.table} ${className}`}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

interface TabelaSecaoProps {
  children?: ReactNode;
}

export function Cabecalho({ children }: TabelaSecaoProps) {
  return <thead className={styles.head}>{children}</thead>;
}

export function Corpo({ children }: TabelaSecaoProps) {
  return <tbody>{children}</tbody>;
}

interface LinhaProps extends TabelaSecaoProps {
  muted?: boolean;
  className?: string;
}

export function Linha({ children, muted = false, className = "" }: LinhaProps) {
  return (
    <tr className={`${muted ? styles.muted : ""} ${className}`.trim()}>
      {children}
    </tr>
  );
}

interface CelulaProps extends TabelaSecaoProps {
  numeric?: boolean;
  className?: string;
}

export function CelulaCabecalho({
  children,
  numeric = false,
  className = "",
}: CelulaProps) {
  return (
    <th
      scope="col"
      className={`${styles.th} ${numeric ? styles.numeric : ""} ${className}`.trim()}
    >
      {children}
    </th>
  );
}

export function Celula({
  children,
  numeric = false,
  className = "",
}: CelulaProps) {
  return (
    <td
      className={`${styles.td} ${numeric ? styles.numeric : ""} ${className}`.trim()}
    >
      {children}
    </td>
  );
}
