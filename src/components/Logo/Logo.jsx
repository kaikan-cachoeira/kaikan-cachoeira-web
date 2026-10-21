import styles from "./Logo.module.css";

export default function Logo({ compact = false }) {
  return (
    <div className={`${styles.logo} ${compact ? styles.compact : ""}`.trim()}>
      <span className={styles.mark} aria-hidden="true">
        K
      </span>
      <span className={styles.text}>
        <span className={styles.name}>Kaikan Cachoeira</span>
        {!compact ? (
          <span className={styles.descriptor}>Gestão da associação</span>
        ) : null}
      </span>
    </div>
  );
}
