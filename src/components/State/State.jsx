import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import styles from "./State.module.css";

export function LoadingState({ message = "Carregando informações..." }) {
  return (
    <div className={styles.state} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({
  message = "Não foi possível carregar as informações. Tente novamente.",
  onRetry,
}) {
  return (
    <div className={styles.state} role="alert">
      <Icon name="alert-circle" size={32} className={styles.errorIcon} />
      <p>{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title = "Nenhum registro encontrado.",
  description,
  action,
  icon = "box",
}) {
  return (
    <div className={styles.state}>
      <Icon name={icon} size={36} className={styles.emptyIcon} />
      <p className={styles.emptyTitle}>{title}</p>
      {description ? <p className={styles.emptyText}>{description}</p> : null}
      {action ? <div className={styles.emptyAction}>{action}</div> : null}
    </div>
  );
}

export function PageSkeleton({ rows = 3 }) {
  return (
    <div className={styles.skeletonList} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div className={styles.skeleton} key={index} />
      ))}
    </div>
  );
}
