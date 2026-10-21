import styles from "./Form.module.css";

export default function SegmentedControl({
  label,
  options = [],
  value,
  onChange,
  columns,
  className = "",
  ariaLabel,
}) {
  return (
    <div className={`${styles.segmentedField} ${className}`}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <div
        className={`${styles.segmented} ${columns ? styles.segmentedGrid : ""}`}
        style={columns ? { "--segmented-columns": columns } : undefined}
        role="group"
        aria-label={ariaLabel || label}
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
