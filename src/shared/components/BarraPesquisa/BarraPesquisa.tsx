import type { ReactNode } from "react";
import { useId } from "react";
import Botao from "@/shared/components/Botao/Botao";
import Icone from "@/shared/components/Icone/Icone";
import styles from "./BarraPesquisa.module.css";

interface BarraPesquisaProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  showFilter?: boolean;
  filterLabel?: string;
  filtersOpen?: boolean;
  onToggleFilters?: () => void;
  searchLabel?: string;
  filterIcon?: boolean;
  extra?: ReactNode;
}

export default function BarraPesquisa({
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
}: BarraPesquisaProps) {
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
        <Icone name="search" size={18} className={styles.searchIcon} />
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
        <Botao
          variant="secondary"
          onClick={onToggleFilters}
          iconLeft={filterIcon ? "filter" : undefined}
          aria-expanded={onToggleFilters ? filtersOpen : undefined}
          aria-controls={onToggleFilters ? `${id}-filtros` : undefined}
        >
          {filterLabel}
        </Botao>
      ) : null}
      <Botao
        variant="primary"
        type="submit"
        iconLeft={filterIcon ? "search" : undefined}
      >
        {searchLabel}
      </Botao>
      <span className="sr-only" id={`${id}-filtros`}>
        Filtros da listagem
      </span>
    </form>
  );
}
