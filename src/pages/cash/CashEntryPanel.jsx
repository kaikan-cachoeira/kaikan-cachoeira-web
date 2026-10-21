import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input";
import Textarea from "../../components/Form/Textarea";
import SegmentedControl from "../../components/Form/SegmentedControl";
import CurrencyInput from "../../components/Form/CurrencyInput";
import Icon from "../../components/Icon/Icon";
import { useToast } from "../../context/ToastContext";
import { useCreateCashEntry } from "../../hooks/useCash";
import { apiErrorMessage } from "../../services/api";
import styles from "./CashEntryPanel.module.css";

const TYPE_OPTIONS = [
  { value: "Venda de fichas", label: "Venda de fichas" },
  { value: "Devolução", label: "Devolução" },
];

const PAYMENT_OPTIONS = [
  { value: "PIX", label: "PIX" },
  { value: "Débito", label: "Débito" },
  { value: "Crédito", label: "Crédito" },
  { value: "Dinheiro", label: "Dinheiro" },
  { value: "Fiado", label: "Fiado" },
];

const EMPTY = {
  type: "Venda de fichas",
  value: "",
  payment: "PIX",
  debtorName: "",
  note: "",
};

export default function CashEntryPanel({ eventId }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const createEntry = useCreateCashEntry();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: EMPTY,
  });

  const type = watch("type");
  const payment = watch("payment");
  const isFiado = payment === "Fiado";
  const isDevolucao = type === "Devolução";
  const fiadoPath = location.pathname === "/caixa/fiado";

  useEffect(() => {
    if (fiadoPath) {
      setValue("payment", "Fiado");
    } else {
      setValue("payment", "PIX");
    }
  }, [fiadoPath, setValue]);

  function changeType(nextType) {
    setValue("type", nextType);
    if (nextType === "Devolução" && payment === "Fiado") {
      setValue("payment", "PIX");
      if (fiadoPath) navigate("/caixa", { replace: true });
    }
  }

  function changePayment(nextPayment) {
    setValue("payment", nextPayment);
    if (nextPayment === "Fiado" && !fiadoPath) {
      navigate("/caixa/fiado", { replace: true });
    }
    if (nextPayment !== "Fiado" && fiadoPath) {
      navigate("/caixa", { replace: true });
    }
  }

  async function onSubmit(values) {
    setServerError("");
    try {
      await createEntry.mutateAsync({
        eventId,
        type: values.type,
        value: values.value,
        payment: values.payment,
        debtorName: values.payment === "Fiado" ? values.debtorName : null,
        note: values.payment === "Fiado" ? values.note : "",
      });
      addToast("Registro adicionado ao caixa.");
      reset({
        type: values.type,
        value: "",
        payment: values.payment,
        debtorName: "",
        note: "",
      });
    } catch (error) {
      setServerError(
        apiErrorMessage(error, "Não foi possível registrar no caixa."),
      );
    }
  }

  return (
    <aside className={styles.panel} aria-labelledby="registrar-caixa">
      <header className={styles.header}>
        <h2 className={styles.title} id="registrar-caixa">
          Registrar no caixa
        </h2>
        <p className={styles.subtitle}>Novo lançamento para o evento atual</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <SegmentedControl
          label="Tipo de registro"
          options={TYPE_OPTIONS}
          value={type}
          onChange={changeType}
          columns={2}
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
              id="caixa-valor"
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

        <div className={styles.payments}>
          <SegmentedControl
            label="Forma de pagamento"
            options={
              isDevolucao
                ? PAYMENT_OPTIONS.filter((option) => option.value !== "Fiado")
                : PAYMENT_OPTIONS
            }
            value={payment}
            onChange={changePayment}
            columns={2}
            className={styles.paymentGrid}
          />
        </div>

        {isFiado ? (
          <section className={styles.fiadoSection} aria-labelledby="dados-fiado">
            <div className={styles.fiadoHeader}>
              <h3 id="dados-fiado">Dados do fiado</h3>
              <p>Preencha os dados da pessoa responsável.</p>
            </div>
            <Input
              id="caixa-devedor"
              label="Nome"
              placeholder="Nome do devedor"
              required
              error={errors.debtorName?.message}
              {...register("debtorName", {
                validate: (value) =>
                  !isFiado ||
                  Boolean(String(value || "").trim()) ||
                  "Informe o nome do devedor.",
              })}
            />
            <Textarea
              id="caixa-observacao"
              label="Observação (opcional)"
              rows={3}
              placeholder="Informações adicionais"
              error={errors.note?.message}
              {...register("note")}
            />
          </section>
        ) : null}

        {serverError ? (
          <p className={styles.serverError} role="alert">
            <Icon name="alert-circle" size={18} />
            {serverError}
          </p>
        ) : null}

        <Button
          type="submit"
          className={styles.submit}
          loading={createEntry.isPending}
        >
          Confirmar registro
        </Button>
      </form>
    </aside>
  );
}
