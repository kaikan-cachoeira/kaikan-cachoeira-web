import type { ReactNode } from "react";
import styles from "./Etiqueta.module.css";

interface EtiquetaProps {
  children?: ReactNode;
  variant?: string;
  dot?: boolean;
  className?: string;
}

export default function Etiqueta({
  children,
  variant = "neutral",
  dot = false,
  className = "",
}: EtiquetaProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`.trim()}>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
