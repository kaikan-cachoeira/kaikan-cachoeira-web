import Icone from "@/shared/components/Icone/Icone";
import styles from "./MiniaturaProduto.module.css";

interface MiniaturaProdutoProps {
  src?: string | null;
  alt?: string;
  size?: string;
  className?: string;
}

export default function MiniaturaProduto({
  src,
  alt,
  size = "medium",
  className = "",
}: MiniaturaProdutoProps) {
  return (
    <div
      className={`${styles.thumb} ${styles[size]} ${className}`.trim()}
      aria-hidden={!src ? "true" : undefined}
    >
      {src ? (
        <img src={src} alt={alt || ""} />
      ) : (
        <>
          <Icone name="image" size={size === "small" ? 18 : 24} />
          <span>Produto</span>
        </>
      )}
    </div>
  );
}
