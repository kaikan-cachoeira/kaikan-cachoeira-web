import styles from "./Card.module.css";

export default function Card({
  as: Component = "section",
  children,
  className = "",
  ...props
}) {
  return (
    <Component className={`${styles.card} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
  id,
}) {
  const titleId = id ? `${id}-titulo` : undefined;
  return (
    <Card className={className} aria-labelledby={titleId} id={id}>
      {(title || action) && (
        <header className={styles.sectionHeader}>
          <div>
            {title ? (
              <h2 className={styles.sectionTitle} id={titleId}>
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className={styles.sectionSubtitle}>{subtitle}</p>
            ) : null}
          </div>
          {action ? <div className={styles.sectionAction}>{action}</div> : null}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </Card>
  );
}

export function StatCard({ label, value, helper, variant = "default" }) {
  return (
    <Card className={`${styles.statCard} ${styles[variant] || ""}`}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {helper ? <p className={styles.statHelper}>{helper}</p> : null}
    </Card>
  );
}
