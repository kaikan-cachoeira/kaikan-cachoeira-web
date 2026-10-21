import { useId } from "react";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import styles from "./SearchBar.module.css";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Pesquisar...",
  showFilter = true,
  filterLabel = "Filtrar",
  filtersOpen = false,
  onToggleFilters,
  searchLabel = "Pesquisar",
  filterIcon = false,
  extra,
}) {
  const id = useId();
  return (
    <form
      className={styles.searchBar}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <div className={styles.inputWrapper}>
        <label className="sr-only" htmlFor={id}>
          {placeholder}
        </label>
        <Icon name="search" size={18} className={styles.searchIcon} />
        <input
          id={id}
          type="search"
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </div>
      {extra ? <div className={styles.extra}>{extra}</div> : null}
      {showFilter ? (
        <Button
          variant="secondary"
          onClick={onToggleFilters}
          iconLeft={filterIcon ? "filter" : undefined}
          aria-expanded={onToggleFilters ? filtersOpen : undefined}
          aria-controls={onToggleFilters ? `${id}-filtros` : undefined}
        >
          {filterLabel}
        </Button>
      ) : null}
      <Button variant="primary" type="submit" iconLeft={filterIcon ? "search" : undefined}>
        {searchLabel}
      </Button>
      <span className="sr-only" id={`${id}-filtros`}>
        Filtros da listagem
      </span>
    </form>
  );
}
