import { useState } from "react";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import {
  useEventoMutations,
  useEventoProdutosQuery,
  useEventoQuery,
  useRelatorioEventoQuery,
} from "./useEventos";

export function useEventoDetalhes(id?: number | null) {
  const { addToast } = useToast();
  const [costOpen, setCostOpen] = useState(false);
  const [costsListOpen, setCostsListOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [startConfirm, setStartConfirm] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);

  const eventoQuery = useEventoQuery(id);
  const statusCodigo = eventoQuery.data?.status.codigo;
  const isNotStarted = statusCodigo === "NAO_INICIADO";
  const relatorioQuery = useRelatorioEventoQuery(id, statusCodigo);
  const produtosQuery = useEventoProdutosQuery(id, isNotStarted);
  const { alterarStatus } = useEventoMutations();

  async function startEvent() {
    if (!id) return;
    try {
      await alterarStatus.mutateAsync({ id, status: "EM_ANDAMENTO" });
      addToast("Evento iniciado com sucesso.");
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível iniciar o evento."),
        "error",
      );
    }
  }

  async function confirmStart() {
    try {
      await startEvent();
    } finally {
      setStartConfirm(false);
    }
  }

  async function closeEvent() {
    if (!id) return;
    try {
      await alterarStatus.mutateAsync({ id, status: "ENCERRADO" });
      addToast("Evento encerrado com sucesso.");
      setCloseConfirm(false);
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível encerrar o evento."),
        "error",
      );
    }
  }

  return {
    costOpen,
    setCostOpen,
    costsListOpen,
    setCostsListOpen,
    addProductOpen,
    setAddProductOpen,
    startConfirm,
    setStartConfirm,
    closeConfirm,
    setCloseConfirm,
    eventoQuery,
    relatorioQuery,
    produtosQuery,
    alterarStatus,
    isNotStarted,
    startEvent,
    confirmStart,
    closeEvent,
  };
}
