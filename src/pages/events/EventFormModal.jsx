import { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Textarea from "../../components/Form/Textarea";
import Icon from "../../components/Icon/Icon";
import { useCreateEvent } from "../../hooks/useEvents";
import { useToast } from "../../context/ToastContext";
import { apiErrorMessage } from "../../services/api";
import styles from "./EventModals.module.css";

const TYPE_OPTIONS = [
  { value: "Evento", label: "Evento" },
  { value: "Reunião", label: "Reunião" },
];

export default function EventFormModal({ onClose }) {
  const createEvent = useCreateEvent();
  const { addToast } = useToast();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: { type: "Evento" },
  });

  const start = watch("start");

  async function onSubmit(values) {
    setServerError("");
    try {
      await createEvent.mutateAsync(values);
      addToast("Evento criado com sucesso.");
      onClose?.();
    } catch (error) {
      setServerError(
        apiErrorMessage(error, "Não foi possível criar o evento."),
      );
    }
  }

  return (
    <Modal
      title="Criar Evento"
      onClose={createEvent.isPending ? undefined : onClose}
      showClose={!createEvent.isPending}
      closeOnOverlay={!createEvent.isPending}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={createEvent.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-evento"
            loading={createEvent.isPending}
          >
            Criar Evento
          </Button>
        </>
      }
    >
      <form
        id="form-evento"
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Input
          id="evento-nome"
          label="Nome"
          placeholder="Nome do evento"
          required
          error={errors.name?.message}
          {...register("name", {
            required: "Informe o nome do evento.",
            minLength: { value: 2, message: "Informe ao menos 2 caracteres." },
          })}
        />

        <Select
          id="evento-tipo"
          label="Tipo do evento"
          options={TYPE_OPTIONS}
          error={errors.type?.message}
          {...register("type", { required: "Selecione o tipo do evento." })}
        />

        <Textarea
          id="evento-observacoes"
          label="Observações"
          rows={3}
          placeholder="Observações do evento (opcional)"
          error={errors.notes?.message}
          {...register("notes")}
        />

        <div className={styles.twoColumns}>
          <Input
            id="evento-inicio"
            label="Data e hora de início"
            type="datetime-local"
            required
            error={errors.start?.message}
            {...register("start", {
              required: "Informe a data e hora de início.",
            })}
          />
          <Input
            id="evento-fim"
            label="Data e hora de encerramento"
            type="datetime-local"
            required
            error={errors.end?.message}
            {...register("end", {
              required: "Informe a data e hora de encerramento.",
              validate: (value) =>
                !start ||
                !value ||
                new Date(value) > new Date(start) ||
                "O encerramento deve ser posterior ao início.",
            })}
          />
        </div>

        {serverError ? (
          <p className={styles.serverError} role="alert">
            <Icon name="alert-circle" size={18} />
            {serverError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
