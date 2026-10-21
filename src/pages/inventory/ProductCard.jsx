import { useEffect, useRef, useState } from "react";
import Badge from "../../components/Badge/Badge";
import Button from "../../components/Button/Button";
import Icon from "../../components/Icon/Icon";
import ProductThumb from "../../components/ProductThumb/ProductThumb";
import { formatNumber } from "../../utils/format";
import styles from "./ProductCard.module.css";

export default function ProductCard({
  product,
  onDetails,
  onMovement,
  onPending,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function onPointer(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    }
    function onKey(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const outOfStock = Number(product.quantity) === 0;
  const lowStock = !outOfStock && product.lowStock;

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <ProductThumb src={product.image} alt={`Imagem de ${product.name}`} />
        <div className={styles.info}>
          <div className={styles.titleRow}>
            <h3 className={styles.name}>{product.name}</h3>
            <div className={styles.menuWrap} ref={menuRef}>
              <button
                ref={triggerRef}
                type="button"
                className={styles.menuButton}
                aria-label={`Mais opções de ${product.name}`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
              >
                <Icon name="more-vertical" size={20} />
              </button>
              {menuOpen ? (
                <div className={styles.menu} role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onDetails?.(product);
                    }}
                  >
                    <Icon name="eye" size={16} />
                    Ver detalhes
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onPending?.("Editar produto", product);
                    }}
                  >
                    <Icon name="edit" size={16} />
                    Editar produto
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <p className={styles.category}>{product.category || "Sem categoria"}</p>
          <div className={styles.stockRow}>
            <span className={styles.quantity}>
              {formatNumber(product.quantity)}{" "}
              {Number(product.quantity) === 1 ? "unidade" : "unidades"}
            </span>
            {outOfStock ? (
              <Badge variant="danger" dot>
                Sem estoque
              </Badge>
            ) : lowStock ? (
              <Badge variant="warning" dot>
                Estoque baixo
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="compact"
          onClick={() => onDetails?.(product)}
        >
          Ver detalhes
        </Button>
        <Button size="compact" onClick={() => onMovement?.(product)}>
          Movimentar
        </Button>
      </div>
    </article>
  );
}
