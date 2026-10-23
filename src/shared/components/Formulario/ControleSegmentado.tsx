import type { CSSProperties, ReactNode } from "react";
import styles from "./Formulario.module.css";

export interface OpcaoSegmentada {
  value: string;
  label: ReactNode;
}

interface ControleSegmentadoProps {
  label?: ReactNode;
  options?: OpcaoSegmentada[];
  value?: string;
  onChange?: (value: string) => void;
  columns?: number;
  className?: string;
  ariaLabel?: string;
}

export default function ControleSegmentado({
  label,
  options = [],
  value,
  onChange,
  columns,
  className = "",
  ariaLabel,
}: ControleSegmentadoProps) {
  return (
    <div className={`${styles.segmentedField} ${className}`}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <div
        className={`${styles.segmented} ${columns ? styles.segmentedGrid : ""}`}
        style={
          columns
            ? ({ "--segmented-columns": columns } as CSSProperties)
            : undefined
        }
        role="group"
        aria-label={ariaLabel || (typeof label === "string" ? label : undefined)}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.segment} ${
              value === option.value ? styles.segmentActive : ""
            }`}
            aria-pressed={value === option.value}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
