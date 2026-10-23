import type { ReactNode } from "react";
import Modal from "@/shared/components/Modal/Modal";
import Botao from "@/shared/components/Botao/Botao";
import Icone from "@/shared/components/Icone/Icone";
import styles from "./SucessoDialog.module.css";

interface SucessoDialogProps {
  title: ReactNode;
  message?: ReactNode;
  buttonLabel?: string;
  onClose?: () => void;
}

export default function SucessoDialog({
  title,
  message,
  buttonLabel = "Voltar",
  onClose,
}: SucessoDialogProps) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      size="small"
      footer={
        <Botao onClick={onClose} className={styles.button}>
          {buttonLabel}
        </Botao>
      }
    >
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          <Icone name="check-circle" size={32} />
        </span>
        {message ? <p className={styles.message}>{message}</p> : null}
      </div>
    </Modal>
  );
}
