import styles from "./PageHeader.module.css";

export default function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
  headingLevel = 1,
  children,
}) {
  const Heading = `h${headingLevel}`;
  return (
    <header className={styles.header}>
      <div className={styles.main}>
        {breadcrumb ? <div className={styles.breadcrumb}>{breadcrumb}</div> : null}
        <div className={styles.headingRow}>
          <div>
            <Heading className={styles.title}>{title}</Heading>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
        {children}
      </div>
    </header>
  );
}
