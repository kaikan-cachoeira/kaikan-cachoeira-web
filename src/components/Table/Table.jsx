import styles from "./Table.module.css";

export function Table({ children, caption, className = "" }) {
  return (
    <div className={styles.wrapper}>
      <table className={`${styles.table} ${className}`}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function THead({ children }) {
  return <thead className={styles.head}>{children}</thead>;
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children, muted = false, className = "" }) {
  return (
    <tr className={`${muted ? styles.muted : ""} ${className}`.trim()}>
      {children}
    </tr>
  );
}

export function TH({ children, numeric = false, className = "" }) {
  return (
    <th
      scope="col"
      className={`${styles.th} ${numeric ? styles.numeric : ""} ${className}`.trim()}
    >
      {children}
    </th>
  );
}

export function TD({ children, numeric = false, className = "" }) {
  return (
    <td
      className={`${styles.td} ${numeric ? styles.numeric : ""} ${className}`.trim()}
    >
      {children}
    </td>
  );
}
