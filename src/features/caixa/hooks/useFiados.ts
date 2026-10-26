import { useState } from "react";
import { useEventoAtualQuery } from "@/features/eventos";
import type { Fiado, ResumoCaixa } from "../models";
import {
  useCaixaQuery,
  useFiadosQuery,
} from "./useCaixa";

export function useFiados() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [settleTarget, setSettleTarget] = useState<Fiado | null>(null);

  const eventoQuery = useEventoAtualQuery();
  const caixaQuery = useCaixaQuery({
    eventId: eventoQuery.data?.id,
    pageSize: 1,
  });
  const fiadosQuery = useFiadosQuery({
    eventId: eventoQuery.data?.id,
    status: status || undefined,
    page,
    pageSize: 6,
  });
  const summary: ResumoCaixa = caixaQuery.data?.summary || {
    fichasVendidas: 0,
    fichasDevolvidas: 0,
    saldoFichas: 0,
    porFormaPagamento: {},
    fiadosEmAberto: 0,
    quantidadeFiadosEmAberto: 0,
    totalRecebido: 0,
  };
  const fiados = fiadosQuery.data?.items || [];
  const tabs = [
    { to: "/caixa", label: "Histórico", end: true },
    {
      to: "/caixa/fiados",
      label: "Fiados",
      end: true,
      count: caixaQuery.data?.fiadosCount ?? 0,
    },
  ];

  return {
    event: eventoQuery.data,
    eventLoading: eventoQuery.isLoading,
    status,
    setStatus,
    page,
    setPage,
    settleTarget,
    setSettleTarget,
    caixaQuery,
    fiadosQuery,
    summary,
    fiados,
    tabs,
  };
}
