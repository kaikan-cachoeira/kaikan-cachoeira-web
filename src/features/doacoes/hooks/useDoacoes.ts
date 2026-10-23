import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { comporChave, queryKeys } from "@/shared/query/keys";
import { useEventosQuery } from "@/features/eventos";
import type { CriarDoacaoPayload, ParametrosDoacoes } from "../models";
import { criarDoacao, listarDoacoes } from "../services/doacoes";

export function useDoacoesQuery(params: ParametrosDoacoes) {
  return useQuery({
    queryKey: comporChave(queryKeys.doacoes, params),
    queryFn: () => listarDoacoes(params),
  });
}

export function useDoacaoMutations() {
  const queryClient = useQueryClient();

  const criar = useMutation({
    mutationFn: (payload: CriarDoacaoPayload) => criarDoacao(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doacoes });
      queryClient.invalidateQueries({ queryKey: queryKeys.eventos });
    },
  });

  return { criarDoacao: criar };
}

export function useDoacoes() {
  const [searchParams] = useSearchParams();
  const initialEvent = searchParams.get("evento");
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(Boolean(initialEvent));
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    initialEvent ? [initialEvent] : [],
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const params = useMemo<ParametrosDoacoes>(
    () => ({
      search,
      page,
      pageSize: 6,
      eventIds: selectedEvents.length ? selectedEvents.join(",") : undefined,
      types: selectedTypes.length ? selectedTypes.join(",") : undefined,
    }),
    [search, page, selectedEvents, selectedTypes],
  );

  const doacoesQuery = useDoacoesQuery(params);
  const eventosQuery = useEventosQuery({ pageSize: 100 });

  const eventOptions = (eventosQuery.data?.items || []).map((event) => ({
    value: event.id,
    label: event.name,
  }));

  function runSearch() {
    setSearch(searchDraft.trim());
    setPage(1);
  }

  function clearFilters() {
    setSelectedEvents([]);
    setSelectedTypes([]);
    setPage(1);
  }

  function clearAll() {
    clearFilters();
    setSearchDraft("");
    setSearch("");
  }

  return {
    searchDraft,
    setSearchDraft,
    search,
    page,
    setPage,
    filtersOpen,
    setFiltersOpen,
    selectedEvents,
    setSelectedEvents,
    selectedTypes,
    setSelectedTypes,
    modalOpen,
    setModalOpen,
    doacoesQuery,
    eventosQuery,
    eventOptions,
    runSearch,
    clearFilters,
    clearAll,
  };
}
