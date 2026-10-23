import type { ElementType, ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
}

export default function Card({
  as: Component = "section",
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <Component className={`${styles.card} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}

interface SecaoCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}

export function SecaoCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
  id,
}: SecaoCardProps) {
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

interface EstatisticaCardProps {
  label: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
  variant?: string;
}

export function EstatisticaCard({
  label,
  value,
  helper,
  variant = "default",
}: EstatisticaCardProps) {
  return (
    <Card className={`${styles.statCard} ${styles[variant] || ""}`}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {helper ? <p className={styles.statHelper}>{helper}</p> : null}
    </Card>
  );
}
