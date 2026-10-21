import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from "../Icon/Icon";
import styles from "./Modal.module.css";

let openCount = 0;

function focusable(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.offsetParent !== null);
}

export default function Modal({
  title,
  subtitle,
  children,
  footer,
  onClose,
  showClose = true,
  closeOnOverlay = true,
  size = "medium",
  labelledBy,
  className = "",
  initialFocus,
}) {
  const generatedId = useId();
  const titleId = labelledBy || `modal-title-${generatedId}`;
  const subtitleId = subtitle ? `modal-subtitle-${generatedId}` : undefined;
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    previousFocus.current = document.activeElement;
    openCount += 1;
    document.body.classList.add("modal-aberto");

    const timer = window.requestAnimationFrame(() => {
      const target =
        (initialFocus && dialogRef.current?.querySelector(initialFocus)) ||
        focusable(dialogRef.current)[0] ||
        dialogRef.current;
      target?.focus?.();
    });

    return () => {
      window.cancelAnimationFrame(timer);
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) document.body.classList.remove("modal-aberto");
      const previous = previousFocus.current;
      if (previous instanceof HTMLElement) {
        window.setTimeout(() => previous.focus(), 0);
      }
    };
  }, [initialFocus]);

  function handleKeyDown(event) {
    if (event.key === "Escape" && onClose) {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusable(dialogRef.current);
    if (items.length === 0) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (closeOnOverlay && event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        className={`${styles.modal} ${styles[size]} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {(title || showClose) && (
          <header className={styles.header}>
            <div className={styles.heading}>
              {title ? (
                <h2 className={styles.title} id={titleId}>
                  {title}
                </h2>
              ) : null}
              {subtitle ? (
                <p className={styles.subtitle} id={subtitleId}>
                  {subtitle}
                </p>
              ) : null}
            </div>
            {showClose ? (
              <button
                type="button"
                className={styles.close}
                onClick={onClose}
                aria-label="Fechar"
              >
                <Icon name="x" size={20} />
              </button>
            ) : null}
          </header>
        )}
        <div className={styles.content}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
