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
} from "../models";
import {
  cancelarVenda,
  criarVenda,
  listarVendas,
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
    mutationFn: (id: string) => cancelarVenda(id),
    onSuccess: invalidarVendas,
  });

  return { criarVenda: criar, cancelarVenda: cancelar };
}

interface UseVendasOptions {
  carregarCardapio?: boolean;
}

export function useVendas({ carregarCardapio = false }: UseVendasOptions = {}) {
  const { addToast } = useToast();
  const { resumo, limpar, aplicarDesconto } = useCarrinho();
  const {
    data: event,
    isLoading: eventLoading,
    isError: eventError,
    refetch: refetchEvent,
  } = useEventoAtualQuery();
  const cardapioQuery = useEventoCardapioQuery(
    carregarCardapio ? event?.id : undefined,
  );
  const { criarVenda: createSale } = useVendaMutations();

  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [discountItem, setDiscountItem] = useState<ItemCardapio | null>(null);
  const lastEventId = useRef(event?.id);

  useEffect(() => {
    if (lastEventId.current !== event?.id) {
      limpar();
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

  async function confirmSale() {
    if (!event || resumo.items.length === 0) return;
    try {
      await createSale.mutateAsync({
        eventId: event.id,
        items: resumo.items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          originalPrice: item.originalPrice,
        })),
      });
      addToast("Venda registrada com sucesso.");
      limpar();
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível registrar a venda."),
        "error",
      );
    }
  }

  function aplicarDescontoNoItem(price: number) {
    if (!discountItem) return;
    aplicarDesconto(String(discountItem.id), price);
    setDiscountItem(null);
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

  const params = useMemo<ParametrosVendas>(
    () => ({
      eventId,
      search,
      page,
      pageSize,
      statuses: statuses.length ? statuses.join(",") : undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [eventId, search, page, pageSize, statuses, from, to],
  );

  const vendasQuery = useVendasQuery(params);

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
    if (!cancelTarget) return;
    try {
      await cancelar.mutateAsync(cancelTarget.id);
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
