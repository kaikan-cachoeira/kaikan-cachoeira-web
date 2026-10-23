import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import Modal from "@/shared/components/Modal/Modal";
import Botao from "@/shared/components/Botao/Botao";
import Entrada from "@/shared/components/Formulario/Entrada";
import AreaTexto from "@/shared/components/Formulario/AreaTexto";
import CampoMoeda from "@/shared/components/Formulario/CampoMoeda";
import Icone from "@/shared/components/Icone/Icone";
import { useEventoMutations } from "../hooks/useEventos";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import styles from "./ModaisEvento.module.css";

interface CustoModalProps {
  eventId: string;
  onClose: () => void;
}

interface CustoFormValues {
  name: string;
  value: number;
  description: string;
}

export default function CustoModal({ eventId, onClose }: CustoModalProps) {
  const { criarCusto: createCost } = useEventoMutations();
  const { addToast } = useToast();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CustoFormValues>({
    mode: "onTouched",
    defaultValues: { value: 0, name: "", description: "" },
  });

  const onSubmit: SubmitHandler<CustoFormValues> = async (values) => {
    setServerError("");
    try {
      await createCost.mutateAsync({ id: eventId, payload: values });
      addToast("Custo registrado com sucesso.");
      onClose?.();
    } catch (error) {
      setServerError(
        mensagemErro(error, "Não foi possível registrar o custo."),
      );
    }
  };

  return (
    <Modal
      title="Registrar custos"
      subtitle="Registre custos do evento"
      onClose={createCost.isPending ? undefined : onClose}
      showClose={!createCost.isPending}
      closeOnOverlay={!createCost.isPending}
      footer={
        <>
          <Botao
            variant="secondary"
            onClick={onClose}
            disabled={createCost.isPending}
          >
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-custo"
            loading={createCost.isPending}
          >
            Registrar Custos
          </Botao>
        </>
      }
    >
      <form
        id="form-custo"
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Entrada
          id="custo-nome"
          label="Nome"
          placeholder="Nome do custo"
          required
          error={errors.name?.message}
          {...register("name", {
            required: "Informe o nome do custo.",
            minLength: { value: 2, message: "Informe ao menos 2 caracteres." },
          })}
        />
        <Controller
          name="value"
          control={control}
          rules={{
            validate: (value) =>
              Number(value) > 0 || "Informe um valor maior que zero.",
          }}
          render={({ field, fieldState }) => (
            <CampoMoeda
              id="custo-valor"
              label="Valor"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              required
              error={fieldState.error?.message}
            />
          )}
        />
        <AreaTexto
          id="custo-descricao"
          label="Descrição"
          rows={3}
          placeholder="Descrição do custo (opcional)"
          error={errors.description?.message}
          {...register("description")}
        />
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
