import type { ReactNode } from "react";
import styles from "./Formulario.module.css";

interface CampoProps {
  id: string;
  label?: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Campo({
  id,
  label,
  error,
  hint,
  required,
  children,
  className = "",
}: CampoProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={`${styles.field} ${className}`}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
          {required ? <span className="sr-only"> (obrigatório)</span> : null}
        </label>
      ) : null}
      {children}
      {hint && !error ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function descricaoPor(
  id: string,
  hint?: ReactNode,
  error?: ReactNode,
): string | undefined {
  return (
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined
  );
}
