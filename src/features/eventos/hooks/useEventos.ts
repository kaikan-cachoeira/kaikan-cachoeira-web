import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import { comporChave, queryKeys } from "@/shared/query/keys";
import type {
  AdicionarProdutoCardapioPayload,
  CriarCustoEventoPayload,
  CriarEventoPayload,
  Evento,
  ParametrosEventos,
} from "../models";
import {
  adicionarProdutoCardapio,
  alterarStatusEvento,
  criarCustoEvento,
  criarEvento,
  excluirEvento,
  listarEventos,
  obterCardapioEvento,
  obterEvento,
  obterEventoAtual,
} from "../services/eventos";

export function useEventosQuery(params: ParametrosEventos) {
  return useQuery({
    queryKey: comporChave(queryKeys.eventos, params),
    queryFn: () => listarEventos(params),
  });
}

export function useEventoAtualQuery() {
  return useQuery({
    queryKey: comporChave(queryKeys.eventos, "atual"),
    queryFn: obterEventoAtual,
  });
}

export function useEventoQuery(id?: string | null) {
  return useQuery({
    queryKey: comporChave(queryKeys.eventos, "detalhe", id),
    queryFn: () => obterEvento(id as string),
    enabled: Boolean(id),
  });
}

export function useEventoCardapioQuery(id?: string | null) {
  return useQuery({
    queryKey: comporChave(queryKeys.eventos, "cardapio", id),
    queryFn: () => obterCardapioEvento(id as string),
    enabled: Boolean(id),
  });
}

export function useEventoMutations() {
  const queryClient = useQueryClient();

  function invalidarEventos() {
    queryClient.invalidateQueries({ queryKey: queryKeys.eventos });
    queryClient.invalidateQueries({ queryKey: queryKeys.vendas });
    queryClient.invalidateQueries({ queryKey: queryKeys.caixa });
    queryClient.invalidateQueries({ queryKey: queryKeys.fiados });
    queryClient.invalidateQueries({ queryKey: queryKeys.doacoes });
  }

  const criar = useMutation({
    mutationFn: (payload: CriarEventoPayload) => criarEvento(payload),
    onSuccess: invalidarEventos,
  });

  const alterarStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      alterarStatusEvento(id, status),
    onSuccess: (_data, variables) => {
      invalidarEventos();
      queryClient.invalidateQueries({
        queryKey: comporChave(queryKeys.eventos, "detalhe", variables.id),
      });
    },
  });

  const excluir = useMutation({
    mutationFn: (id: string) => excluirEvento(id),
    onSuccess: invalidarEventos,
  });

  const criarCusto = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CriarCustoEventoPayload;
    }) => criarCustoEvento(id, payload),
    onSuccess: (_data, variables) => {
      invalidarEventos();
      queryClient.invalidateQueries({
        queryKey: comporChave(queryKeys.eventos, "detalhe", variables.id),
      });
    },
  });

  const adicionarProduto = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AdicionarProdutoCardapioPayload;
    }) => adicionarProdutoCardapio(id, payload),
    onSuccess: (_data, variables) => {
      invalidarEventos();
      queryClient.invalidateQueries({
        queryKey: comporChave(queryKeys.eventos, "detalhe", variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: comporChave(queryKeys.eventos, "cardapio", variables.id),
      });
    },
  });

  return {
    criarEvento: criar,
    alterarStatus,
    excluirEvento: excluir,
    criarCusto,
    adicionarProduto,
  };
}

export function useEventos() {
  const { addToast } = useToast();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Evento | null>(null);

  const { alterarStatus, excluirEvento } = useEventoMutations();

  const params = useMemo<ParametrosEventos>(
    () => ({
      search,
      page,
      pageSize: 8,
      statuses: statuses.length ? statuses.join(",") : undefined,
      types: types.length ? types.join(",") : undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [search, page, statuses, types, from, to],
  );

  const eventosQuery = useEventosQuery(params);

  async function handleStatus(event: Evento, nextStatus: string) {
    try {
      await alterarStatus.mutateAsync({ id: event.id, status: nextStatus });
      addToast(
        nextStatus === "Em andamento"
          ? `Evento "${event.name}" iniciado.`
          : nextStatus === "Encerrado"
            ? `Evento "${event.name}" encerrado.`
            : `Início do evento "${event.name}" desfeito.`,
      );
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível alterar a situação do evento."),
        "error",
      );
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await excluirEvento.mutateAsync(deleteTarget.id);
      addToast(`Evento "${deleteTarget.name}" excluído.`);
      setDeleteTarget(null);
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível excluir o evento."),
        "error",
      );
    }
  }

  function runSearch() {
    setSearch(searchDraft.trim());
    setPage(1);
  }

  function clearFilters() {
    setStatuses([]);
    setTypes([]);
    setFrom("");
    setTo("");
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
    statuses,
    setStatuses,
    types,
    setTypes,
    from,
    setFrom,
    to,
    setTo,
    createOpen,
    setCreateOpen,
    deleteTarget,
    setDeleteTarget,
    eventosQuery,
    alterarStatus,
    excluirEvento,
    handleStatus,
    confirmDelete,
    runSearch,
    clearFilters,
    clearAll,
  };
}
