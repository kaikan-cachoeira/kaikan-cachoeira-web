import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import Modal from "@/shared/components/Modal/Modal";
import Botao from "@/shared/components/Botao/Botao";
import CampoMoeda from "@/shared/components/Formulario/CampoMoeda";
import { formatarMoeda } from "@/shared/lib/formatacao";
import type { ItemCardapio } from "@/features/eventos";
import styles from "./ModaisVenda.module.css";

interface DescontoModalProps {
  item?: ItemCardapio | null;
  basePrice: number;
  onClose: () => void;
  onApply?: (price: number) => void;
}

interface DescontoFormValues {
  finalPrice: number;
}

export default function DescontoModal({
  item,
  basePrice,
  onClose,
  onApply,
}: DescontoModalProps) {
  const {
    control,
    handleSubmit,
    watch,
  } = useForm<DescontoFormValues>({
    mode: "onTouched",
    defaultValues: { finalPrice: basePrice },
  });
  const finalPrice = Number(watch("finalPrice")) || 0;
  const discount = Math.max(0, basePrice - finalPrice);

  const onSubmit: SubmitHandler<DescontoFormValues> = (values) => {
    onApply?.(Number(values.finalPrice));
  };

  return (
    <Modal
      title="Aplicar desconto"
      subtitle="Informe o novo preço de venda com desconto e será calculado o valor do desconto"
      onClose={onClose}
      size="small"
      footer={
        <>
          <Botao variant="secondary" onClick={onClose}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-desconto">
            Aplicar desconto
          </Botao>
        </>
      }
    >
      <form
        id="form-desconto"
        className={styles.discountForm}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className={styles.discountContext}>
          <strong>{item?.name}</strong>
          <span>Preço original: {formatarMoeda(basePrice)}</span>
        </div>

        <Controller
          name="finalPrice"
          control={control}
          rules={{
            validate: (value) => {
              const number = Number(value);
              if (number <= 0) return "Informe um preço maior que zero.";
              if (number >= basePrice) {
                return "O preço com desconto deve ser menor que o preço original.";
              }
              return true;
            },
          }}
          render={({ field, fieldState }) => (
            <CampoMoeda
              id="desconto-preco"
              label="Preço com desconto"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              required
              error={fieldState.error?.message}
            />
          )}
        />

        <div className={styles.discountResult}>
          <span>Desconto</span>
          <strong>{formatarMoeda(discount)}</strong>
        </div>
      </form>
    </Modal>
  );
}
