import Icon from "../Icon/Icon";
import styles from "./ProductThumb.module.css";

export default function ProductThumb({
  src,
  alt,
  size = "medium",
  className = "",
}) {
  return (
    <div
      className={`${styles.thumb} ${styles[size]} ${className}`.trim()}
      aria-hidden={!src ? "true" : undefined}
    >
      {src ? (
        <img src={src} alt={alt || ""} />
      ) : (
        <>
          <Icon name="image" size={size === "small" ? 18 : 24} />
          <span>Produto</span>
        </>
      )}
    </div>
  );
}
