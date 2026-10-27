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
import type { CustoEvento } from "../models";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import styles from "./ModaisEvento.module.css";

interface CustoModalProps {
  eventId: number;
  custoEvento?: CustoEvento;
  onClose: () => void;
}

interface CustoFormValues {
  nome: string;
  valor: number;
  descricao?: string;
}

export default function CustoModal({
  eventId,
  custoEvento,
  onClose,
}: CustoModalProps) {
  const isEdit = Boolean(custoEvento);
  const { criarCusto: createCost, atualizarCusto: updateCost } =
    useEventoMutations();
  const mutation = isEdit ? updateCost : createCost;
  const { addToast } = useToast();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CustoFormValues>({
    mode: "onTouched",
    defaultValues: {
      nome: custoEvento?.nome ?? "",
      valor: custoEvento?.valor ?? 0,
      descricao: custoEvento?.descricao ?? "",
    },
  });

  const onSubmit: SubmitHandler<CustoFormValues> = async (values) => {
    setServerError("");
    try {
      if (custoEvento) {
        await updateCost.mutateAsync({
          id: eventId,
          custoId: custoEvento.id,
          payload: values,
        });
        addToast("Custo atualizado com sucesso.");
      } else {
        await createCost.mutateAsync({ id: eventId, payload: values });
        addToast("Custo registrado com sucesso.");
      }
      onClose();
    } catch (error) {
      setServerError(
        mensagemErro(
          error,
          isEdit
            ? "Não foi possível atualizar o custo."
            : "Não foi possível registrar o custo.",
        ),
      );
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar custo" : "Registrar custos"}
      subtitle={isEdit ? "Atualize os dados do custo" : "Registre custos do evento"}
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
            form="form-custo"
            loading={mutation.isPending}
          >
            {isEdit ? "Salvar alterações" : "Registrar Custos"}
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
          error={errors.nome?.message}
          {...register("nome", {
            required: "Informe o nome do custo.",
            minLength: { value: 2, message: "Informe ao menos 2 caracteres." },
          })}
        />
        <Controller
          name="valor"
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
          error={errors.descricao?.message}
          {...register("descricao")}
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
