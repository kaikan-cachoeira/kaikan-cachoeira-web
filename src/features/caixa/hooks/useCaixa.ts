import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import { comporChave, queryKeys } from "@/shared/query/keys";
import { useEventoAtualQuery } from "@/features/eventos";
import type {
  CriarLancamentoCaixaPayload,
  FormaPagamentoCaixa,
  LancamentoCaixa,
  ParametrosCaixa,
  ParametrosFiados,
  QuitarFiadoPayload,
  ResumoCaixa,
  TipoLancamentoCaixa,
} from "../models";
import {
  cancelarLancamentoCaixa,
  criarLancamentoCaixa,
  listarCaixa,
} from "../services/caixa";
import {
  listarFiados,
  quitarFiadoEvento,
} from "../services/fiados";

export function useCaixaQuery(params: ParametrosCaixa) {
  return useQuery({
    queryKey: comporChave(queryKeys.caixa, params),
    queryFn: () => listarCaixa(params),
  });
}

export function useFiadosQuery(params: ParametrosFiados) {
  return useQuery({
    queryKey: comporChave(queryKeys.fiados, params),
    queryFn: () => listarFiados(params),
    enabled: Boolean(params.eventId) || Boolean(params.eventIds),
  });
}

export function useCaixaMutations() {
  const queryClient = useQueryClient();

  function invalidarCaixa() {
    queryClient.invalidateQueries({ queryKey: queryKeys.caixa });
    queryClient.invalidateQueries({ queryKey: queryKeys.fiados });
    queryClient.invalidateQueries({ queryKey: queryKeys.eventos });
    queryClient.invalidateQueries({ queryKey: queryKeys.vendas });
  }

  const criar = useMutation({
    mutationFn: (payload: CriarLancamentoCaixaPayload) =>
      criarLancamentoCaixa(payload),
    onSuccess: invalidarCaixa,
  });

  const cancelar = useMutation({
    mutationFn: ({
      eventId,
      id,
    }: {
      eventId: number;
      id: number;
    }) => cancelarLancamentoCaixa(eventId, id),
    onSuccess: invalidarCaixa,
  });

  const quitar = useMutation({
    mutationFn: ({
      eventId,
      id,
      payload,
    }: {
      eventId: number;
      id: number;
      payload: QuitarFiadoPayload;
    }) => quitarFiadoEvento(eventId, id, payload),
    onSuccess: invalidarCaixa,
  });

  return {
    criarLancamento: criar,
    cancelarLancamento: cancelar,
    quitarFiado: quitar,
  };
}

export function useCaixa() {
  const location = useLocation();
  const { addToast } = useToast();
  const [type, setType] = useState<TipoLancamentoCaixa | "">("");
  const [payment, setPayment] = useState<FormaPagamentoCaixa | "">("");
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<LancamentoCaixa | null>(
    null,
  );
  const { cancelarLancamento } = useCaixaMutations();
  const eventoQuery = useEventoAtualQuery();

  const params = useMemo<ParametrosCaixa>(
    () => ({
      eventId: eventoQuery.data?.id,
      page,
      pageSize: 6,
      tipo: type || undefined,
      formaPagamento: payment || undefined,
    }),
    [eventoQuery.data?.id, page, type, payment],
  );

  const caixaQuery = useCaixaQuery(params);
  const summary: ResumoCaixa = caixaQuery.data?.summary || {
    fichasVendidas: 0,
    fichasDevolvidas: 0,
    saldoFichas: 0,
    porFormaPagamento: {},
    fiadosEmAberto: 0,
    quantidadeFiadosEmAberto: 0,
    totalRecebido: 0,
  };
  const entries = caixaQuery.data?.items || [];
  const historyPath =
    location.pathname === "/caixa/fiado" ? "/caixa/fiado" : "/caixa";
  const tabs = [
    { to: historyPath, label: "Histórico", end: true },
    {
      to: "/caixa/fiados",
      label: "Fiados",
      count: caixaQuery.data?.fiadosCount ?? 0,
    },
  ];

  function clearFilters() {
    setType("");
    setPayment("");
    setPage(1);
  }

  async function confirmCancel() {
    if (!cancelTarget || !eventoQuery.data?.id) return;
    try {
      await cancelarLancamento.mutateAsync({
        eventId: eventoQuery.data.id,
        id: cancelTarget.id,
      });
      addToast("Lançamento cancelado com sucesso.");
      setCancelTarget(null);
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível cancelar o lançamento."),
        "error",
      );
    }
  }

  return {
    event: eventoQuery.data,
    eventLoading: eventoQuery.isLoading,
    type,
    setType,
    payment,
    setPayment,
    page,
    setPage,
    cancelTarget,
    setCancelTarget,
    caixaQuery,
    summary,
    entries,
    tabs,
    cancelarLancamento,
    clearFilters,
    confirmCancel,
  };
}
