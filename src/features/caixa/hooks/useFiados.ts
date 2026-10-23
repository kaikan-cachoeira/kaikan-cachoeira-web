import { useState } from "react";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import { useEventoAtualQuery } from "@/features/eventos";
import type { Fiado, ResumoCaixa } from "../models";
import {
  useCaixaMutations,
  useCaixaQuery,
  useFiadosQuery,
} from "./useCaixa";

export function useFiados() {
  const { addToast } = useToast();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [settleTarget, setSettleTarget] = useState<Fiado | null>(null);
  const [unsettleTarget, setUnsettleTarget] = useState<Fiado | null>(null);

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
  const { desquitarFiado: desquitar } = useCaixaMutations();

  const summary: ResumoCaixa = caixaQuery.data?.summary || {
    sold: 0,
    returned: 0,
    openFiados: 0,
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

  async function confirmUnsettle() {
    if (!unsettleTarget) return;
    try {
      await desquitar.mutateAsync(unsettleTarget.id);
      addToast("Quitação cancelada. O fiado voltou para pendente.");
      setUnsettleTarget(null);
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível cancelar a quitação."),
        "error",
      );
    }
  }

  return {
    event: eventoQuery.data,
    eventLoading: eventoQuery.isLoading,
    status,
    setStatus,
    page,
    setPage,
    settleTarget,
    setSettleTarget,
    unsettleTarget,
    setUnsettleTarget,
    caixaQuery,
    fiadosQuery,
    summary,
    fiados,
    tabs,
    desquitarFiado: desquitar,
    confirmUnsettle,
  };
}
