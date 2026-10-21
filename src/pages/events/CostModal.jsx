import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input";
import Textarea from "../../components/Form/Textarea";
import CurrencyInput from "../../components/Form/CurrencyInput";
import Icon from "../../components/Icon/Icon";
import { useCreateEventCost } from "../../hooks/useEvents";
import { useToast } from "../../context/ToastContext";
import { apiErrorMessage } from "../../services/api";
import styles from "./EventModals.module.css";

export default function CostModal({ eventId, onClose }) {
  const createCost = useCreateEventCost();
  const { addToast } = useToast();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: { value: 0, name: "", description: "" },
  });

  async function onSubmit(values) {
    setServerError("");
    try {
      await createCost.mutateAsync({ id: eventId, payload: values });
      addToast("Custo registrado com sucesso.");
      onClose?.();
    } catch (error) {
      setServerError(
        apiErrorMessage(error, "Não foi possível registrar o custo."),
      );
    }
  }

  return (
    <Modal
      title="Registrar custos"
      subtitle="Registre custos do evento"
      onClose={createCost.isPending ? undefined : onClose}
      showClose={!createCost.isPending}
      closeOnOverlay={!createCost.isPending}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={createCost.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-custo"
            loading={createCost.isPending}
          >
            Registrar Custos
          </Button>
        </>
      }
    >
      <form
        id="form-custo"
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Input
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
            <CurrencyInput
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
        <Textarea
          id="custo-descricao"
          label="Descrição"
          rows={3}
          placeholder="Descrição do custo (opcional)"
          error={errors.description?.message}
          {...register("description")}
        />
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
