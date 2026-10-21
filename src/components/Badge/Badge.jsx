import styles from "./Badge.module.css";

export default function Badge({
  children,
  variant = "neutral",
  dot = false,
  className = "",
}) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`.trim()}>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
