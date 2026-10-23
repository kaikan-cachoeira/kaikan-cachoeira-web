import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import Modal from "@/shared/components/Modal/Modal";
import Botao from "@/shared/components/Botao/Botao";
import Entrada from "@/shared/components/Formulario/Entrada";
import Selecao from "@/shared/components/Formulario/Selecao";
import AreaTexto from "@/shared/components/Formulario/AreaTexto";
import Icone from "@/shared/components/Icone/Icone";
import { useEventoMutations } from "../hooks/useEventos";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import styles from "./ModaisEvento.module.css";

const TYPE_OPTIONS = [
  { value: "Evento", label: "Evento" },
  { value: "Reunião", label: "Reunião" },
];

interface EventoFormModalProps {
  onClose: () => void;
}

interface EventoFormValues {
  name: string;
  type: string;
  notes: string;
  start: string;
  end: string;
}

export default function EventoFormModal({ onClose }: EventoFormModalProps) {
  const { criarEvento: createEvent } = useEventoMutations();
  const { addToast } = useToast();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventoFormValues>({
    mode: "onTouched",
    defaultValues: { type: "Evento", name: "", notes: "", start: "", end: "" },
  });

  const start = watch("start");

  const onSubmit: SubmitHandler<EventoFormValues> = async (values) => {
    setServerError("");
    try {
      await createEvent.mutateAsync(values);
      addToast("Evento criado com sucesso.");
      onClose?.();
    } catch (error) {
      setServerError(
        mensagemErro(error, "Não foi possível criar o evento."),
      );
    }
  };

  return (
    <Modal
      title="Criar Evento"
      onClose={createEvent.isPending ? undefined : onClose}
      showClose={!createEvent.isPending}
      closeOnOverlay={!createEvent.isPending}
      footer={
        <>
          <Botao
            variant="secondary"
            onClick={onClose}
            disabled={createEvent.isPending}
          >
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-evento"
            loading={createEvent.isPending}
          >
            Criar Evento
          </Botao>
        </>
      }
    >
      <form
        id="form-evento"
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Entrada
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

        <Selecao
          id="evento-tipo"
          label="Tipo do evento"
          options={TYPE_OPTIONS}
          error={errors.type?.message}
          {...register("type", { required: "Selecione o tipo do evento." })}
        />

        <AreaTexto
          id="evento-observacoes"
          label="Observações"
          rows={3}
          placeholder="Observações do evento (opcional)"
          error={errors.notes?.message}
          {...register("notes")}
        />

        <div className={styles.twoColumns}>
          <Entrada
            id="evento-inicio"
            label="Data e hora de início"
            type="datetime-local"
            required
            error={errors.start?.message}
            {...register("start", {
              required: "Informe a data e hora de início.",
            })}
          />
          <Entrada
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
            <Icone name="alert-circle" size={18} />
            {serverError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
