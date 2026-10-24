import type { ElementType, ReactNode } from "react";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
  headingLevel = 1,
  children,
}: PageHeaderProps) {
  const Heading = `h${headingLevel}` as ElementType;
  return (
    <header className={styles.header}>
      <div className={styles.main}>
        {breadcrumb ? <div className={styles.breadcrumb}>{breadcrumb}</div> : null}
        <div className={styles.headingRow}>
          <div>
            {title ? <Heading className={styles.title}>{title}</Heading> : null}
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
        {children}
      </div>
    </header>
  );
}
