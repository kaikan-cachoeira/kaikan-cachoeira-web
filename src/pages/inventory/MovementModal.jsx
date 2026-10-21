import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Textarea from "../../components/Form/Textarea";
import CurrencyInput from "../../components/Form/CurrencyInput";
import Icon from "../../components/Icon/Icon";
import { useCreateMovement } from "../../hooks/useInventory";
import { apiErrorMessage } from "../../services/api";
import { formatCurrency, formatNumber } from "../../utils/format";
import styles from "./InventoryModals.module.css";

const MOVEMENT_TYPES = [
  "Reabastecimento",
  "Consumo interno",
  "Perda",
  "Ajuste de saída",
];

export default function MovementModal({ product, onClose, onSuccess }) {
  const createMovement = useCreateMovement();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      type: "Reabastecimento",
      quantity: 1,
      totalCost: 0,
      notes: "",
    },
  });

  const type = watch("type");
  const rawQuantity = Number(watch("quantity"));
  const rawTotalCost = Number(watch("totalCost"));
  const isEntry = type === "Reabastecimento";
  const quantity = Number.isFinite(rawQuantity) ? rawQuantity : 0;
  const afterQuantity = isEntry
    ? Number(product.quantity) + quantity
    : Number(product.quantity) - quantity;
  const unitCost = isEntry && quantity > 0 ? rawTotalCost / quantity : 0;

  async function onSubmit(values) {
    setServerError("");
    try {
      await createMovement.mutateAsync({
        productId: product.id,
        payload: {
          type: values.type,
          quantity: values.quantity,
          totalCost: isEntry ? values.totalCost : 0,
          notes: values.notes,
        },
      });
      onSuccess?.();
    } catch (error) {
      setServerError(
        apiErrorMessage(error, "Não foi possível registrar a movimentação."),
      );
    }
  }

  return (
    <Modal
      title="Movimentar estoque"
      subtitle="As saídas consomem primeiro o lote mais antigo."
      onClose={createMovement.isPending ? undefined : onClose}
      showClose={!createMovement.isPending}
      closeOnOverlay={!createMovement.isPending}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={createMovement.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-movimentacao"
            loading={createMovement.isPending}
          >
            Confirmar movimentação
          </Button>
        </>
      }
    >
      <form
        id="form-movimentacao"
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className={styles.currentStock}>
          <span>{product.name}</span>
          <strong>
            Quantidade atual: {formatNumber(product.quantity)} unidades
          </strong>
        </div>

        <Select
          id="movimentacao-tipo"
          label="Tipo de movimentação"
          options={MOVEMENT_TYPES.map((item) => ({
            value: item,
            label: item,
          }))}
          error={errors.type?.message}
          {...register("type", { required: "Selecione o tipo." })}
        />

        <div className={styles.twoColumns}>
          <Input
            id="movimentacao-quantidade"
            label="Quantidade"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            required
            error={errors.quantity?.message}
            {...register("quantity", {
              valueAsNumber: true,
              required: "Informe a quantidade.",
              validate: (value) => {
                if (!Number.isInteger(value) || value <= 0) {
                  return "Informe uma quantidade inteira maior que zero.";
                }
                if (!isEntry && value > Number(product.quantity)) {
                  return "A quantidade não pode ser maior que o saldo disponível.";
                }
                return true;
              },
            })}
          />
          {isEntry ? (
            <Controller
              name="totalCost"
              control={control}
              rules={{
                validate: (value) =>
                  Number(value) >= 0 ||
                  "O custo não pode ser negativo.",
              }}
              render={({ field, fieldState }) => (
                <CurrencyInput
                  id="movimentacao-custo-total"
                  label="Custo total do lote"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={fieldState.error?.message}
                  hint="Opcional. O custo unitário é calculado pelo total."
                />
              )}
            />
          ) : null}
        </div>

        <div className={styles.calculationGrid}>
          {isEntry ? (
            <div className={styles.calculation}>
              <span>Custo unitário calculado</span>
              <strong>{formatCurrency(unitCost)}</strong>
            </div>
          ) : null}
          <div className={styles.calculation}>
            <span>Quantidade após movimentação</span>
            <strong>
              {formatNumber(Math.max(0, afterQuantity))} unidades
            </strong>
          </div>
        </div>

        <Textarea
          id="movimentacao-observacoes"
          label="Observações"
          rows={3}
          placeholder="Informações adicionais (opcional)"
          error={errors.notes?.message}
          {...register("notes")}
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
