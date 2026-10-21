import Icon from "../Icon/Icon";
import styles from "./Button.module.css";

export default function Button({
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
}) {
  const classes = [
    styles.button,
    styles[variant],
    size === "compact" ? styles.compact : "",
    loading ? styles.loading : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const componentProps = { ...props, className: classes };
  if (Component === "button") {
    componentProps.type = type || "button";
    componentProps.disabled = disabled || loading;
    componentProps["aria-busy"] = loading || undefined;
  } else if (disabled) {
    componentProps["aria-disabled"] = true;
  }

  return (
    <Component {...componentProps}>
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : iconLeft ? (
        <Icon name={iconLeft} size={size === "compact" ? 16 : 18} />
      ) : null}
      <span>{children}</span>
      {!loading && iconRight ? (
        <Icon name={iconRight} size={size === "compact" ? 16 : 18} />
      ) : null}
    </Component>
  );
}
