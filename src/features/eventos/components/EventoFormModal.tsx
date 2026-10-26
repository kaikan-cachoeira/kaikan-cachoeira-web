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
import type { CriarEventoPayload, Evento, TipoEvento } from "../models";
import { paraInstant } from "../utils/datas";
import { TIPO_EVENTO_OPTIONS } from "../utils/statusEvento";
import { paraEntradaDataHora } from "@/shared/lib/formatacao";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import styles from "./ModaisEvento.module.css";

interface EventoFormModalProps {
  evento?: Evento;
  onClose: () => void;
}

interface EventoFormValues {
  nome: string;
  tipoEvento: TipoEvento;
  observacoes: string;
  inicio: string;
  encerramento: string;
}

export default function EventoFormModal({
  evento,
  onClose,
}: EventoFormModalProps) {
  const isEdit = Boolean(evento);
  const { criarEvento: createEvent, atualizarEvento: updateEvent } =
    useEventoMutations();
  const mutation = isEdit ? updateEvent : createEvent;
  const { addToast } = useToast();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventoFormValues>({
    mode: "onTouched",
    defaultValues: {
      nome: evento?.nome ?? "",
      tipoEvento: evento?.tipoEvento ?? "EVENTO",
      observacoes: evento?.observacoes ?? "",
      inicio: paraEntradaDataHora(evento?.dataHoraInicio),
      encerramento: paraEntradaDataHora(evento?.dataHoraEncerramento),
    },
  });

  const inicio = watch("inicio");

  const onSubmit: SubmitHandler<EventoFormValues> = async (values) => {
    setServerError("");

    const payload: CriarEventoPayload = {
      nome: values.nome.trim(),
      tipoEvento: values.tipoEvento,
      observacoes: values.observacoes.trim() || undefined,
      dataHoraInicio: paraInstant(values.inicio),
      dataHoraEncerramento: paraInstant(values.encerramento),
    };

    try {
      if (evento) {
        await updateEvent.mutateAsync({ id: evento.id, payload });
        addToast("Evento atualizado com sucesso.");
      } else {
        await createEvent.mutateAsync(payload);
        addToast("Evento criado com sucesso.");
      }
      onClose();
    } catch (error) {
      setServerError(
        mensagemErro(
          error,
          isEdit
            ? "Não foi possível atualizar o evento."
            : "Não foi possível criar o evento.",
        ),
      );
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar Evento" : "Criar Evento"}
      onClose={mutation.isPending ? undefined : onClose}
      showClose={!mutation.isPending}
      closeOnOverlay={!mutation.isPending}
      footer={
        <>
          <Botao
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-evento"
            loading={mutation.isPending}
          >
            {isEdit ? "Salvar alterações" : "Criar Evento"}
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
          error={errors.nome?.message}
          {...register("nome", {
            required: "Informe o nome do evento.",
            minLength: { value: 2, message: "Informe ao menos 2 caracteres." },
          })}
        />

        <Selecao
          id="evento-tipo"
          label="Tipo do evento"
          options={TIPO_EVENTO_OPTIONS}
          error={errors.tipoEvento?.message}
          {...register("tipoEvento", {
            required: "Selecione o tipo do evento.",
          })}
        />

        <AreaTexto
          id="evento-observacoes"
          label="Observações"
          rows={3}
          placeholder="Observações do evento (opcional)"
          error={errors.observacoes?.message}
          {...register("observacoes")}
        />

        <div className={styles.twoColumns}>
          <Entrada
            id="evento-inicio"
            label="Data e hora de início"
            type="datetime-local"
            required
            error={errors.inicio?.message}
            {...register("inicio", {
              required: "Informe a data e hora de início.",
            })}
          />
          <Entrada
            id="evento-fim"
            label="Data e hora de encerramento"
            type="datetime-local"
            required
            error={errors.encerramento?.message}
            {...register("encerramento", {
              required: "Informe a data e hora de encerramento.",
              validate: (value) =>
                !inicio ||
                !value ||
                new Date(value) > new Date(inicio) ||
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
