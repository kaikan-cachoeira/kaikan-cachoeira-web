import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import styles from "./SuccessDialog.module.css";

export default function SuccessDialog({
  title,
  message,
  buttonLabel = "Voltar",
  onClose,
}) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      size="small"
      footer={
        <Button onClick={onClose} className={styles.button}>
          {buttonLabel}
        </Button>
      }
    >
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          <Icon name="check-circle" size={32} />
        </span>
        {message ? <p className={styles.message}>{message}</p> : null}
      </div>
    </Modal>
  );
}
