import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import { comporChave, queryKeys } from "@/shared/query/keys";
import {
  useEventoAtualQuery,
  useEventoCardapioQuery,
} from "@/features/eventos";
import type { ItemCardapio } from "@/features/eventos";
import type {
  CriarVendaPayload,
  ParametrosVendas,
  ParametrosVendasEvento,
  Venda,
  VendaDetalhe,
} from "../models";
import {
  aplicarDescontoProduto,
  cancelarVenda,
  criarVenda,
  detalharVenda,
  listarVendas,
  removerDescontoProduto,
} from "../services/vendas";
import { VendaContexto } from "../providers/vendaContexto";

export function useCarrinho() {
  const contexto = useContext(VendaContexto);
  if (!contexto) {
    throw new Error("useCarrinho deve ser usado dentro de VendaProvider.");
  }
  return contexto;
}

export function useVendasQuery(params: ParametrosVendas) {
  return useQuery({
    queryKey: comporChave(queryKeys.vendas, params),
    queryFn: () => listarVendas(params),
  });
}

export function useVendasEventoQuery(
  id?: number | null,
  params: Omit<ParametrosVendasEvento, "eventId"> = {},
) {
  return useQuery({
    queryKey: comporChave(queryKeys.vendas, "evento", id, params),
    queryFn: () => listarVendas({ ...params, eventId: id as number }),
    enabled: typeof id === "number" && Number.isFinite(id),
  });
}

export function useVendaMutations() {
  const queryClient = useQueryClient();

  function invalidarVendas() {
    queryClient.invalidateQueries({ queryKey: queryKeys.vendas });
    queryClient.invalidateQueries({ queryKey: queryKeys.eventos });
    queryClient.invalidateQueries({ queryKey: queryKeys.caixa });
    queryClient.invalidateQueries({ queryKey: queryKeys.fiados });
    queryClient.invalidateQueries({ queryKey: queryKeys.doacoes });
  }

  const criar = useMutation({
    mutationFn: (payload: CriarVendaPayload) => criarVenda(payload),
    onSuccess: invalidarVendas,
  });

  const cancelar = useMutation({
    mutationFn: ({ eventId, id }: { eventId: number; id: number }) =>
      cancelarVenda(eventId, id),
    onSuccess: invalidarVendas,
  });

  const aplicarDesconto = useMutation({
    mutationFn: ({
      eventId,
      produtoEventoId,
      novoPreco,
    }: {
      eventId: number;
      produtoEventoId: number;
      novoPreco: number;
    }) => aplicarDescontoProduto(eventId, produtoEventoId, novoPreco),
    onSuccess: invalidarVendas,
  });

  const removerDesconto = useMutation({
    mutationFn: ({ eventId, produtoEventoId }: { eventId: number; produtoEventoId: number }) =>
      removerDescontoProduto(eventId, produtoEventoId),
    onSuccess: invalidarVendas,
  });

  return {
    criarVenda: criar,
    cancelarVenda: cancelar,
    aplicarDesconto,
    removerDesconto,
  };
}

interface UseVendasOptions {
  carregarCardapio?: boolean;
}

export function useVendas({ carregarCardapio = false }: UseVendasOptions = {}) {
  const { addToast } = useToast();
  const { resumo, limpar } = useCarrinho();
  const {
    data: event,
    isLoading: eventLoading,
    isError: eventError,
    refetch: refetchEvent,
  } = useEventoAtualQuery();
  const cardapioQuery = useEventoCardapioQuery(
    carregarCardapio ? event?.id : undefined,
  );
  const {
    criarVenda: createSale,
    aplicarDesconto,
    removerDesconto,
  } = useVendaMutations();

  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [discountItem, setDiscountItem] = useState<ItemCardapio | null>(null);
  const [valorFinal, setValorFinal] = useState<number | null>(null);
  const lastEventId = useRef(event?.id);

  useEffect(() => {
    if (lastEventId.current !== event?.id) {
      limpar();
      setValorFinal(null);
      lastEventId.current = event?.id;
    }
  }, [event?.id, limpar]);

  const items = useMemo<ItemCardapio[]>(
    () => (carregarCardapio ? cardapioQuery.data?.items || [] : []),
    [carregarCardapio, cardapioQuery.data],
  );

  const categories = useMemo<string[]>(() => {
    const names: string[] = [];
    items.forEach((item) => {
      if (item.categoria && !names.includes(item.categoria)) {
        names.push(item.categoria);
      }
    });
    return ["Todos", ...names];
  }, [items]);

  const filtered = useMemo<ItemCardapio[]>(() => {
    const term = search
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return items
      .filter((item) => category === "Todos" || item.categoria === category)
      .filter((item) =>
        term
          ? item.nome
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .includes(term)
          : true,
      );
  }, [items, category, search]);

  function runSearch() {
    setSearch(searchDraft.trim());
  }

  const totalComDescontoDosItens = resumo.total;
  const valorFinalEfetivo = valorFinal ?? totalComDescontoDosItens;
  const valorFinalInvalido =
    valorFinalEfetivo < 0 || valorFinalEfetivo > totalComDescontoDosItens;
  const descontoVenda = Math.max(0, totalComDescontoDosItens - valorFinalEfetivo);

  async function confirmSale() {
    if (!event || resumo.items.length === 0) return;
    if (valorFinalInvalido) return;
    try {
      await createSale.mutateAsync({
        eventId: event.id,
        itens: resumo.items.map((item) => ({
          produtoEventoId: Number(item.menuItemId),
          quantidade: item.quantity,
        })),
        valorFinal: valorFinal !== null ? valorFinal : undefined,
      });
      addToast("Venda registrada com sucesso.");
      limpar();
      setValorFinal(null);
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível registrar a venda."),
        "error",
      );
    }
  }

  async function aplicarDescontoNoItem(price: number) {
    if (!discountItem || !event) return;
    try {
      await aplicarDesconto.mutateAsync({
        eventId: event.id,
        produtoEventoId: discountItem.id,
        novoPreco: price,
      });
      addToast("Desconto aplicado com sucesso.");
      setDiscountItem(null);
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível aplicar o desconto."),
        "error",
      );
    }
  }

  async function removerDescontoNoItem(item: ItemCardapio) {
    if (!event) return;
    try {
      await removerDesconto.mutateAsync({
        eventId: event.id,
        produtoEventoId: item.id,
      });
      addToast("Desconto removido com sucesso.");
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível remover o desconto."),
        "error",
      );
    }
  }

  function setValorFinalEditavel(next: number) {
    if (!Number.isFinite(next)) {
      setValorFinal(null);
      return;
    }
    setValorFinal(next);
  }

  const subtitle = event
    ? `Evento em andamento: ${event.nome}`
    : "Nenhum evento em andamento";

  return {
    event,
    eventLoading,
    eventError,
    refetchEvent,
    menuLoading: cardapioQuery.isLoading,
    menuError: cardapioQuery.isError,
    refetchMenu: cardapioQuery.refetch,
    items,
    categories,
    filtered,
    searchDraft,
    setSearchDraft,
    category,
    setCategory,
    runSearch,
    discountItem,
    setDiscountItem,
    aplicarDescontoNoItem,
    removerDescontoNoItem,
    descontoLoading:
      aplicarDesconto.isPending || removerDesconto.isPending,
    totalComDescontoDosItens,
    valorFinal: valorFinalEfetivo,
    setValorFinal: setValorFinalEditavel,
    valorFinalInvalido,
    descontoVenda,
    resumo,
    createSale,
    confirmSale,
    subtitle,
  };
}

export function useHistoricoVendas(eventId?: number, pageSize = 8) {
  const { addToast } = useToast();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [detailsSale, setDetailsSale] = useState<Venda | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Venda | null>(null);

  const { cancelarVenda: cancelar } = useVendaMutations();

  const cancelada = useMemo(() => {
    if (statuses.length !== 1) return undefined;
    return statuses[0] === "cancelled" ? true : statuses[0] === "active" ? false : undefined;
  }, [statuses]);

  const params = useMemo<ParametrosVendas>(
    () => ({
      eventId,
      search,
      page,
      pageSize,
      from: from || undefined,
      to: to || undefined,
      cancelada,
    }),
    [eventId, search, page, pageSize, from, to, cancelada],
  );

  const vendasQuery = useVendasQuery(params);

  const detalhesQuery = useQuery<VendaDetalhe>({
    queryKey: comporChave(queryKeys.vendas, "detalhe", eventId, detailsSale?.id),
    queryFn: () => detalharVenda(eventId as number, detailsSale?.id as number),
    enabled:
      typeof eventId === "number" && Number.isFinite(eventId) &&
      typeof detailsSale?.id === "number",
  });

  function runSearch() {
    setSearch(searchDraft.trim());
    setPage(1);
  }

  function clearFilters() {
    setStatuses([]);
    setFrom("");
    setTo("");
    setPage(1);
  }

  function clearAll() {
    clearFilters();
    setSearchDraft("");
    setSearch("");
  }

  async function confirmCancel() {
    if (!cancelTarget || !eventId) return;
    try {
      await cancelar.mutateAsync({ eventId, id: cancelTarget.id });
      addToast(
        "Venda cancelada. Os itens foram devolvidos ao desempenho do evento.",
      );
      setCancelTarget(null);
      setDetailsSale(null);
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível cancelar a venda."),
        "error",
      );
    }
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
    from,
    setFrom,
    to,
    setTo,
    detailsSale,
    setDetailsSale,
    detalhesQuery,
    cancelTarget,
    setCancelTarget,
    vendasQuery,
    cancelarVenda: cancelar,
    runSearch,
    clearFilters,
    clearAll,
    confirmCancel,
  };
}
