import { Controller, useForm } from "react-hook-form";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import CurrencyInput from "../../components/Form/CurrencyInput";
import SegmentedControl from "../../components/Form/SegmentedControl";
import Icon from "../../components/Icon/Icon";
import { useToast } from "../../context/ToastContext";
import { useSettleFiado } from "../../hooks/useCash";
import { apiErrorMessage } from "../../services/api";
import { formatCurrency } from "../../utils/format";
import styles from "./SettleFiadoModal.module.css";

const PAYMENT_OPTIONS = [
  { value: "PIX", label: "PIX" },
  { value: "Débito", label: "Débito" },
  { value: "Crédito", label: "Crédito" },
  { value: "Dinheiro", label: "Dinheiro" },
];

export default function SettleFiadoModal({ fiado, onClose }) {
  const { addToast } = useToast();
  const settleFiado = useSettleFiado();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      value: fiado.remaining,
      paymentMethod: "PIX",
    },
  });
  const payment = watch("paymentMethod");

  async function onSubmit(values) {
    try {
      const result = await settleFiado.mutateAsync({
        id: fiado.id,
        payload: {
          value: values.value,
          paymentMethod: values.paymentMethod,
        },
      });
      addToast(
        result.status === "settled"
          ? "Fiado quitado com sucesso."
          : "Pagamento parcial registrado. O fiado permanece pendente.",
      );
      onClose?.();
    } catch (error) {
      addToast(
        apiErrorMessage(error, "Não foi possível quitar o fiado."),
        "error",
      );
    }
  }

  return (
    <Modal
      title="Quitar fiado"
      subtitle="Informe o valor a ser quitado do fiado e a forma de pagamento"
      onClose={settleFiado.isPending ? undefined : onClose}
      showClose={!settleFiado.isPending}
      closeOnOverlay={!settleFiado.isPending}
      size="small"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={settleFiado.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-quitar-fiado"
            loading={settleFiado.isPending}
          >
            Quitar fiado
          </Button>
        </>
      }
    >
      <form
        id="form-quitar-fiado"
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className={styles.context}>
          <div>
            <span>Devedor</span>
            <strong>{fiado.debtorName}</strong>
          </div>
          <div>
            <span>Saldo devedor</span>
            <strong>{formatCurrency(fiado.remaining)}</strong>
          </div>
        </div>

        <Controller
          name="value"
          control={control}
          rules={{
            validate: (value) => {
              const number = Number(value);
              if (number <= 0) return "Informe um valor maior que zero.";
              if (number > fiado.remaining) {
                return "O valor não pode ser maior que o saldo do fiado.";
              }
              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <CurrencyInput
              id="quitar-valor"
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

        <SegmentedControl
          label="Forma de pagamento"
          options={PAYMENT_OPTIONS}
          value={payment}
          onChange={(value) => setValue("paymentMethod", value)}
          columns={2}
        />

        {errors.paymentMethod ? (
          <p className={styles.fieldError} role="alert">
            <Icon name="alert-circle" size={16} />
            {errors.paymentMethod.message}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
