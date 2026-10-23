import { useState } from "react";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import { useCategoriasQuery } from "@/features/inventario";
import { useEventoMutations, useEventoQuery } from "./useEventos";

export function useEventoDetalhes(id?: string | null) {
  const { addToast } = useToast();
  const [costOpen, setCostOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);

  const eventoQuery = useEventoQuery(id);
  const categoriasQuery = useCategoriasQuery();
  const { alterarStatus } = useEventoMutations();

  async function startEvent() {
    if (!id) return;
    try {
      await alterarStatus.mutateAsync({ id, status: "Em andamento" });
      addToast("Evento iniciado com sucesso.");
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível iniciar o evento."),
        "error",
      );
    }
  }

  async function closeEvent() {
    if (!id) return;
    try {
      await alterarStatus.mutateAsync({ id, status: "Encerrado" });
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
    addProductOpen,
    setAddProductOpen,
    closeConfirm,
    setCloseConfirm,
    eventoQuery,
    categoriasQuery,
    alterarStatus,
    startEvent,
    closeEvent,
  };
}
