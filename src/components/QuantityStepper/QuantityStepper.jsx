import Icon from "../Icon/Icon";
import styles from "./QuantityStepper.module.css";

export default function QuantityStepper({
  value = 1,
  min = 1,
  max,
  onChange,
  label = "quantidade",
  size = "standard",
}) {
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
        <Icon name="minus" size={16} />
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
          const clamped = Math.max(min, hasMax ? Math.min(max, next) : next);
          onChange?.(clamped);
        }}
      />
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange?.(value + 1)}
        disabled={hasMax && value >= max}
        aria-label={`Aumentar ${label}`}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
