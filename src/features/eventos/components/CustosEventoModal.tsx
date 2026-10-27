import { useState } from "react";
import Botao from "@/shared/components/Botao/Botao";
import ConfirmacaoDialog from "@/shared/components/ConfirmacaoDialog/ConfirmacaoDialog";
import Modal from "@/shared/components/Modal/Modal";
import { mensagemErro } from "@/shared/api/erros";
import { formatarMoeda } from "@/shared/lib/formatacao";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { useEventoMutations } from "../hooks/useEventos";
import type { CustoEvento } from "../models";
import CustoModal from "./CustoModal";
import styles from "./ModaisEvento.module.css";

interface CustosEventoModalProps {
  eventId: number;
  custos: CustoEvento[];
  somenteLeitura: boolean;
  onClose: () => void;
}

export default function CustosEventoModal({
  eventId,
  custos,
  somenteLeitura,
  onClose,
}: CustosEventoModalProps) {
  const [editTarget, setEditTarget] = useState<CustoEvento | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustoEvento | null>(null);
  const { excluirCusto } = useEventoMutations();
  const { addToast } = useToast();

  const subtitle =
    custos.length === 1
      ? "1 custo registrado"
      : `${custos.length} custos registrados`;

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await excluirCusto.mutateAsync({
        id: eventId,
        custoId: deleteTarget.id,
      });
      addToast("Custo excluído.");
      setDeleteTarget(null);
    } catch (error) {
      addToast(mensagemErro(error, "Não foi possível excluir o custo."), "error");
    }
  }

  return (
    <>
      <Modal
        title="Custos adicionais"
        subtitle={subtitle}
        size="large"
        onClose={onClose}
      >
        {custos.length ? (
          <ul className={styles.costsList}>
            {custos.map((custo) => (
              <li key={custo.id} className={styles.costRow}>
                <div className={styles.costInfo}>
                  <strong>{custo.nome}</strong>
                  {custo.descricao ? <small>{custo.descricao}</small> : null}
                </div>
                <span className={styles.costValue}>
                  {formatarMoeda(custo.valor)}
                </span>
                {!somenteLeitura ? (
                  <div className={styles.costActions}>
                    <Botao
                      variant="tertiary"
                      size="compact"
                      onClick={() => setEditTarget(custo)}
                    >
                      Editar
                    </Botao>
                    <Botao
                      variant="danger"
                      size="compact"
                      iconLeft="trash"
                      onClick={() => setDeleteTarget(custo)}
                    >
                      Excluir
                    </Botao>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.costsEmpty}>
            Nenhum custo adicional registrado.
          </p>
        )}
      </Modal>

      {editTarget ? (
        <CustoModal
          eventId={eventId}
          custoEvento={editTarget}
          onClose={() => setEditTarget(null)}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmacaoDialog
          title="Excluir custo"
          message={`Deseja excluir o custo "${deleteTarget.nome}" (${formatarMoeda(deleteTarget.valor)})? Ele será removido dos custos do evento e o lucro será recalculado.`}
          confirmLabel="Excluir custo"
          destructive
          loading={excluirCusto.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </>
  );
}
