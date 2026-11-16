import { useMemo, useState } from "react";
import { useEventosListaCompletaQuery } from "@/features/eventos";
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

  const eventosQuery = useEventosListaCompletaQuery();
  const params = useMemo<ParametrosFiados>(
    () => ({
      search: search || undefined,
      status: status || undefined,
      eventIds: eventIds.length
        ? eventIds.join(",")
        : (eventosQuery.data || []).map((evento) => evento.id).join(",") ||
          undefined,
      page,
      pageSize: 8,
    }),
    [search, status, eventIds, eventosQuery.data, page],
  );
  const fiadosQuery = useFiadosQuery(params);
  const eventNameById = useMemo(() => {
    const entradas = (eventosQuery.data || []).map((evento) => [
      evento.id,
      evento.nome,
    ] as const);
    return Object.fromEntries(entradas) as Record<number, string>;
  }, [eventosQuery.data]);
  const fiados = useMemo(
    () =>
      (fiadosQuery.data?.items || []).map((fiado) => ({
        ...fiado,
        eventName: fiado.eventName || eventNameById[fiado.eventId],
      })),
    [fiadosQuery.data?.items, eventNameById],
  );

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
    fiados,
    hasFilters: Boolean(search || eventIds.length || status !== "pending"),
    runSearch,
    clearFilters,
  };
}
