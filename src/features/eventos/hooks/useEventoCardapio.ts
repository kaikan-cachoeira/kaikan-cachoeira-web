import { useMemo, useState } from "react";
import type { OrigemProdutoEvento } from "../models";
import { useEventoCardapioQuery, useEventoQuery } from "./useEventos";

const PAGE_SIZE = 8;

export function useEventoCardapio(id?: number) {
  const { data: event } = useEventoQuery(id);
  const { data, isLoading, isError, refetch } = useEventoCardapioQuery(id);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<OrigemProdutoEvento>("ESTOQUE");
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const items = useMemo(() => data?.items || [], [data]);
  const categories = useMemo(() => data?.categories || [], [data]);

  const filtered = useMemo(() => {
    const term = search
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return items
      .filter((item) => !category || item.categoria === category)
      .filter((item) => !type || item.origem === type)
      .filter((item) =>
        term
          ? item.nome
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .includes(term)
          : true,
      );
  }, [items, category, type, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function runSearch() {
    setSearch(searchDraft.trim());
    setPage(1);
  }

  function clearFilters() {
    setCategory("");
    setType("");
    setPage(1);
  }

  function clearAll() {
    clearFilters();
    setSearchDraft("");
    setSearch("");
  }

  function changeCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  function changeType(value: string) {
    setType(value);
    setPage(1);
  }

  function openAdd(nextType: OrigemProdutoEvento = "ESTOQUE") {
    setAddType(nextType);
    setAddOpen(true);
  }

  const hasFilters = Boolean(search) || Boolean(category) || Boolean(type);

  return {
    event,
    data,
    isLoading,
    isError,
    refetch,
    items,
    categories,
    filtered,
    visible,
    totalPages,
    safePage,
    searchDraft,
    setSearchDraft,
    filtersOpen,
    setFiltersOpen,
    category,
    type,
    changeCategory,
    changeType,
    setPage,
    addOpen,
    setAddOpen,
    addType,
    categoriesOpen,
    setCategoriesOpen,
    runSearch,
    clearFilters,
    clearAll,
    openAdd,
    hasFilters,
  };
}
