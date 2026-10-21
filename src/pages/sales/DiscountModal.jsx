import { Controller, useForm } from "react-hook-form";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import CurrencyInput from "../../components/Form/CurrencyInput";
import { formatCurrency } from "../../utils/format";
import styles from "./SalesModals.module.css";

export default function DiscountModal({ item, basePrice, onClose, onApply }) {
  const {
    control,
    handleSubmit,
    watch,
  } = useForm({
    mode: "onTouched",
    defaultValues: { finalPrice: basePrice },
  });
  const finalPrice = Number(watch("finalPrice")) || 0;
  const discount = Math.max(0, basePrice - finalPrice);

  function onSubmit(values) {
    onApply?.(Number(values.finalPrice));
  }

  return (
    <Modal
      title="Aplicar desconto"
      subtitle="Informe o novo preço de venda com desconto e será calculado o valor do desconto"
      onClose={onClose}
      size="small"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-desconto">
            Aplicar desconto
          </Button>
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
          <span>Preço original: {formatCurrency(basePrice)}</span>
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
            <CurrencyInput
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
          <strong>{formatCurrency(discount)}</strong>
        </div>
      </form>
    </Modal>
  );
}
