import type { ReactNode } from "react";
import Botao from "@/shared/components/Botao/Botao";
import Modal from "@/shared/components/Modal/Modal";

interface ConfirmacaoDialogProps {
  title: ReactNode;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmacaoDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmacaoDialogProps) {
  return (
    <Modal
      title={title}
      onClose={loading ? undefined : onCancel}
      showClose={!loading}
      closeOnOverlay={!loading}
      size="small"
      footer={
        <>
          <Botao variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Botao>
          <Botao
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Botao>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
