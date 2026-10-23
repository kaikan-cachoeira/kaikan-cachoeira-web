import type { ReactNode } from "react";
import Botao from "@/shared/components/Botao/Botao";
import Icone from "@/shared/components/Icone/Icone";
import styles from "./Estado.module.css";

interface EstadoCarregandoProps {
  message?: string;
}

export function EstadoCarregando({
  message = "Carregando informações...",
}: EstadoCarregandoProps) {
  return (
    <div className={styles.state} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

interface EstadoErroProps {
  message?: string;
  onRetry?: () => void;
}

export function EstadoErro({
  message = "Não foi possível carregar as informações. Tente novamente.",
  onRetry,
}: EstadoErroProps) {
  return (
    <div className={styles.state} role="alert">
      <Icone name="alert-circle" size={32} className={styles.errorIcon} />
      <p>{message}</p>
      {onRetry ? (
        <Botao variant="secondary" onClick={onRetry}>
          Tentar novamente
        </Botao>
      ) : null}
    </div>
  );
}

interface EstadoVazioProps {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: string;
}

export function EstadoVazio({
  title = "Nenhum registro encontrado.",
  description,
  action,
  icon = "box",
}: EstadoVazioProps) {
  return (
    <div className={styles.state}>
      <Icone name={icon} size={36} className={styles.emptyIcon} />
      <p className={styles.emptyTitle}>{title}</p>
      {description ? <p className={styles.emptyText}>{description}</p> : null}
      {action ? <div className={styles.emptyAction}>{action}</div> : null}
    </div>
  );
}

interface EsqueletoPaginaProps {
  rows?: number;
}

export function EsqueletoPagina({ rows = 3 }: EsqueletoPaginaProps) {
  return (
    <div className={styles.skeletonList} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div className={styles.skeleton} key={index} />
      ))}
    </div>
  );
}
