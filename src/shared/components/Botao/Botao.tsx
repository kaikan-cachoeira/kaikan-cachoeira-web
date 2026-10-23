import type {
  ButtonHTMLAttributes,
  ElementType,
  ReactNode,
} from "react";
import Icone from "@/shared/components/Icone/Icone";
import styles from "./Botao.module.css";

type BotaoProps = {
  as?: ElementType;
  variant?: string;
  size?: string;
  loading?: boolean;
  iconLeft?: string;
  iconRight?: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "disabled" | "className" | "children"
> &
  Record<string, unknown>;

export default function Botao({
  as: Component = "button",
  variant = "primary",
  size = "standard",
  loading = false,
  iconLeft,
  iconRight,
  children,
  className = "",
  disabled,
  type,
  ...props
}: BotaoProps) {
  const classes = [
    styles.button,
    styles[variant],
    size === "compact" ? styles.compact : "",
    loading ? styles.loading : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const componentProps: Record<string, unknown> = { ...props, className: classes };
  if (Component === "button") {
    componentProps.type = type || "button";
    componentProps.disabled = disabled || loading;
    componentProps["aria-busy"] = loading || undefined;
  } else if (disabled) {
    componentProps["aria-disabled"] = true;
  }

  return (
    <Component {...(componentProps as any)}>
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : iconLeft ? (
        <Icone name={iconLeft} size={size === "compact" ? 16 : 18} />
      ) : null}
      <span>{children}</span>
      {!loading && iconRight ? (
        <Icone name={iconRight} size={size === "compact" ? 16 : 18} />
      ) : null}
    </Component>
  );
}
