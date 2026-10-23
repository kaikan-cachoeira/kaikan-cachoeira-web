import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import Modal from "@/shared/components/Modal/Modal";
import Botao from "@/shared/components/Botao/Botao";
import CampoMoeda from "@/shared/components/Formulario/CampoMoeda";
import ControleSegmentado from "@/shared/components/Formulario/ControleSegmentado";
import Icone from "@/shared/components/Icone/Icone";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { useCaixaMutations } from "../hooks/useCaixa";
import { mensagemErro } from "@/shared/api/erros";
import { formatarMoeda } from "@/shared/lib/formatacao";
import type { Fiado } from "../models";
import styles from "./QuitarFiadoModal.module.css";

const PAYMENT_OPTIONS = [
  { value: "PIX", label: "PIX" },
  { value: "Débito", label: "Débito" },
  { value: "Crédito", label: "Crédito" },
  { value: "Dinheiro", label: "Dinheiro" },
];

interface QuitarFiadoModalProps {
  fiado: Fiado;
  onClose: () => void;
}

interface QuitarFiadoFormValues {
  value: number;
  paymentMethod: string;
}

export default function QuitarFiadoModal({
  fiado,
  onClose,
}: QuitarFiadoModalProps) {
  const { addToast } = useToast();
  const { quitarFiado: settleFiado } = useCaixaMutations();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuitarFiadoFormValues>({
    mode: "onTouched",
    defaultValues: {
      value: fiado.remaining,
      paymentMethod: "PIX",
    },
  });
  const payment = watch("paymentMethod");

  const onSubmit: SubmitHandler<QuitarFiadoFormValues> = async (values) => {
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
        mensagemErro(error, "Não foi possível quitar o fiado."),
        "error",
      );
    }
  };

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
          <Botao
            variant="secondary"
            onClick={onClose}
            disabled={settleFiado.isPending}
          >
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-quitar-fiado"
            loading={settleFiado.isPending}
          >
            Quitar fiado
          </Botao>
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
            <strong>{formatarMoeda(fiado.remaining)}</strong>
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
            <CampoMoeda
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

        <ControleSegmentado
          label="Forma de pagamento"
          options={PAYMENT_OPTIONS}
          value={payment}
          onChange={(value) => setValue("paymentMethod", value)}
          columns={2}
        />

        {errors.paymentMethod ? (
          <p className={styles.fieldError} role="alert">
            <Icone name="alert-circle" size={16} />
            {errors.paymentMethod.message}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
