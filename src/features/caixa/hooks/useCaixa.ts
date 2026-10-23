import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import { comporChave, queryKeys } from "@/shared/query/keys";
import { useEventoAtualQuery } from "@/features/eventos";
import type {
  CriarLancamentoCaixaPayload,
  LancamentoCaixa,
  ParametrosCaixa,
  ParametrosFiados,
  QuitarFiadoPayload,
  ResumoCaixa,
} from "../models";
import {
  cancelarLancamentoCaixa,
  criarLancamentoCaixa,
  listarCaixa,
} from "../services/caixa";
import {
  desquitarFiado,
  listarFiados,
  quitarFiado,
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
    mutationFn: (id: string) => cancelarLancamentoCaixa(id),
    onSuccess: invalidarCaixa,
  });

  const quitar = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: QuitarFiadoPayload;
    }) => quitarFiado(id, payload),
    onSuccess: invalidarCaixa,
  });

  const desquitar = useMutation({
    mutationFn: (id: string) => desquitarFiado(id),
    onSuccess: invalidarCaixa,
  });

  return {
    criarLancamento: criar,
    cancelarLancamento: cancelar,
    quitarFiado: quitar,
    desquitarFiado: desquitar,
  };
}

export function useCaixa() {
  const location = useLocation();
  const { addToast } = useToast();
  const [type, setType] = useState("");
  const [payment, setPayment] = useState("");
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
      types: type || undefined,
      payments: payment || undefined,
    }),
    [eventoQuery.data?.id, page, type, payment],
  );

  const caixaQuery = useCaixaQuery(params);
  const summary: ResumoCaixa = caixaQuery.data?.summary || {
    sold: 0,
    returned: 0,
    openFiados: 0,
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
    if (!cancelTarget) return;
    try {
      await cancelarLancamento.mutateAsync(cancelTarget.id);
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
