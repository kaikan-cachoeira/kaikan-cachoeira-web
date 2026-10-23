import Icone from "@/shared/components/Icone/Icone";
import styles from "./SeletorQuantidade.module.css";

interface SeletorQuantidadeProps {
  value?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  label?: string;
  size?: string;
}

export default function SeletorQuantidade({
  value = 1,
  min = 1,
  max,
  onChange,
  label = "quantidade",
  size = "standard",
}: SeletorQuantidadeProps) {
  const hasMax = Number.isFinite(max);
  return (
    <div className={`${styles.stepper} ${size === "small" ? styles.small : ""}`}>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange?.(value - 1)}
        disabled={value <= min}
        aria-label={`Diminuir ${label}`}
      >
        <Icone name="minus" size={16} />
      </button>
      <input
        type="number"
        className={styles.input}
        value={value}
        min={min}
        max={hasMax ? max : undefined}
        aria-label={label}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) return;
          const clamped = Math.max(min, hasMax ? Math.min(max!, next) : next);
          onChange?.(clamped);
        }}
      />
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange?.(value + 1)}
        disabled={hasMax && value >= max!}
        aria-label={`Aumentar ${label}`}
      >
        <Icone name="plus" size={16} />
      </button>
    </div>
  );
}
