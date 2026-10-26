import { useMemo, useState } from "react";
import { useEventosQuery } from "@/features/eventos";
import type { Fiado, ParametrosFiados } from "../models";
import { useFiadosQuery } from "./useCaixa";

export function useFiadosGerais() {
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("pending");
  const [eventIds, setEventIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [settleTarget, setSettleTarget] = useState<Fiado | null>(null);

  const eventosQuery = useEventosQuery({ pageSize: 100 });
  const params = useMemo<ParametrosFiados>(
    () => ({
      search: search || undefined,
      status: status || undefined,
      eventIds: eventIds.length ? eventIds.join(",") : undefined,
      page,
      pageSize: 8,
    }),
    [search, status, eventIds, page],
  );
  const fiadosQuery = useFiadosQuery(params);

  function runSearch() {
    setSearch(searchDraft.trim());
    setPage(1);
  }

  function clearFilters() {
    setSearchDraft("");
    setSearch("");
    setStatus("pending");
    setEventIds([]);
    setPage(1);
  }

  return {
    searchDraft,
    setSearchDraft,
    search,
    status,
    setStatus,
    eventIds,
    setEventIds,
    page,
    setPage,
    filtersOpen,
    setFiltersOpen,
    settleTarget,
    setSettleTarget,
    eventosQuery,
    fiadosQuery,
    fiados: fiadosQuery.data?.items || [],
    hasFilters: Boolean(search || eventIds.length || status !== "pending"),
    runSearch,
    clearFilters,
  };
}
