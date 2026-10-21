import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import SegmentedControl from "../../components/Form/SegmentedControl";
import CurrencyInput from "../../components/Form/CurrencyInput";
import Icon from "../../components/Icon/Icon";
import { useCreateDonation } from "../../hooks/useDonations";
import { useEvents } from "../../hooks/useEvents";
import { useProducts } from "../../hooks/useInventory";
import { useToast } from "../../context/ToastContext";
import { apiErrorMessage } from "../../services/api";
import { formatNumber } from "../../utils/format";
import styles from "./DonationModal.module.css";

const TYPE_OPTIONS = [
  { value: "ready", label: "Produto pronto" },
  { value: "money", label: "Dinheiro" },
  { value: "ingredient", label: "Ingrediente" },
];

const PAYMENT_OPTIONS = [{ value: "PIX", label: "PIX" }];

export default function DonationModal({ initialType = "ready", onClose }) {
  const [type, setType] = useState(initialType);
  const [serverError, setServerError] = useState("");
  const { addToast } = useToast();
  const createDonation = useCreateDonation();
  const { data: eventsData } = useEvents({ pageSize: 100 });
  const { data: productsData, isLoading: productsLoading } = useProducts({
    pageSize: 100,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    resetField,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      eventId: "",
      productId: "",
      quantity: 1,
      donor: "",
      ticketValue: 0,
      amount: 0,
      paymentMethod: "PIX",
      itemName: "",
    },
  });

  const selectedProductId = watch("productId");
  const selectedProduct = (productsData?.items || []).find(
    (product) => product.id === selectedProductId,
  );
  const eventOptions = (eventsData?.items || []).map((event) => ({
    value: event.id,
    label: event.name,
  }));

  function changeType(nextType) {
    setType(nextType);
    setServerError("");
    resetField("productId");
    resetField("quantity");
    resetField("amount");
    resetField("itemName");
  }

  async function onSubmit(values) {
    setServerError("");
    const payload = {
      eventId: values.eventId,
      type,
      donor: values.donor,
      ticketValue: values.ticketValue,
    };

    if (type === "ready") {
      payload.productId = values.productId;
      payload.itemName = selectedProduct?.name || "";
      payload.quantity = values.quantity;
    } else if (type === "money") {
      payload.amount = values.amount;
      payload.paymentMethod = values.paymentMethod;
    } else {
      payload.itemName = values.itemName;
    }

    try {
      await createDonation.mutateAsync(payload);
      addToast("Doação registrada com sucesso.");
      onClose?.();
    } catch (error) {
      setServerError(
        apiErrorMessage(error, "Não foi possível registrar a doação."),
      );
    }
  }

  return (
    <Modal
      title="Registrar doação"
      subtitle="Toda doação deve ser vinculada a um evento."
      onClose={createDonation.isPending ? undefined : onClose}
      showClose={!createDonation.isPending}
      closeOnOverlay={!createDonation.isPending}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={createDonation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-doacao"
            loading={createDonation.isPending}
          >
            Registrar
          </Button>
        </>
      }
    >
      <form
        id="form-doacao"
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Select
          id="doacao-evento"
          label="Evento destinado"
          placeholder="Selecione o evento"
          options={eventOptions}
          required
          error={errors.eventId?.message}
          {...register("eventId", {
            required: "Selecione o evento destinado à doação.",
          })}
        />

        <SegmentedControl
          label="Tipo de doação"
          options={TYPE_OPTIONS}
          value={type}
          onChange={changeType}
          columns={3}
        />

        {type === "ready" ? (
          <>
            <Select
              id="doacao-produto"
              label="Produto / item"
              placeholder="Selecione o produto"
              options={(productsData?.items || []).map((product) => ({
                value: product.id,
                label: `${product.name} (${formatNumber(product.quantity)} un.)`,
              }))}
              disabled={productsLoading}
              required
              error={errors.productId?.message}
              {...register("productId", {
                required: "Selecione o produto doado.",
              })}
            />
            <div className={styles.twoColumns}>
              <Input
                id="doacao-quantidade"
                label="Quantidade"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                required
                error={errors.quantity?.message}
                {...register("quantity", {
                  valueAsNumber: true,
                  validate: (value) =>
                    (Number.isInteger(value) && value > 0) ||
                    "Informe uma quantidade inteira maior que zero.",
                })}
              />
              <Input
                id="doacao-doador"
                label="Doador"
                placeholder="Nome do doador"
                error={errors.donor?.message}
                {...register("donor")}
              />
            </div>
            {selectedProduct ? (
              <p className={styles.stockHint}>
                Saldo atual do produto: {formatNumber(selectedProduct.quantity)}{" "}
                unidades. A doação não altera o saldo automaticamente.
              </p>
            ) : null}
          </>
        ) : null}

        {type === "money" ? (
          <>
            <div className={styles.twoColumns}>
              <Controller
                name="amount"
                control={control}
                rules={{
                  validate: (value) =>
                    Number(value) > 0 || "Informe um valor maior que zero.",
                }}
                render={({ field, fieldState }) => (
                  <CurrencyInput
                    id="doacao-valor"
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
              <Select
                id="doacao-pagamento"
                label="Forma de pagamento"
                options={PAYMENT_OPTIONS}
                error={errors.paymentMethod?.message}
                {...register("paymentMethod")}
              />
            </div>
            <Input
              id="doacao-doador-dinheiro"
              label="Doador"
              placeholder="Nome do doador"
              error={errors.donor?.message}
              {...register("donor")}
            />
          </>
        ) : null}

        {type === "ingredient" ? (
          <>
            <p className={styles.notice}>
              <Icon name="info" size={18} />
              Use esta opção apenas em casos excepcionais. Produtos feitos na
              hora normalmente usam ingredientes comprados e registrados como
              custo do evento.
            </p>
            <Input
              id="doacao-ingrediente"
              label="Produto / item"
              placeholder="Ingrediente doado"
              required
              error={errors.itemName?.message}
              {...register("itemName", {
                validate: (value) =>
                  type !== "ingredient" ||
                  Boolean(String(value || "").trim()) ||
                  "Informe o ingrediente doado.",
              })}
            />
            <Input
              id="doacao-doador-ingrediente"
              label="Doador"
              placeholder="Nome do doador"
              error={errors.donor?.message}
              {...register("donor")}
            />
          </>
        ) : null}

        <Controller
          name="ticketValue"
          control={control}
          rules={{
            validate: (value) =>
              Number(value) >= 0 || "O valor não pode ser negativo.",
          }}
          render={({ field, fieldState }) => (
            <CurrencyInput
              id="doacao-ficha"
              label="Valor da ficha de agradecimento"
              hint="(custo do evento)"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              error={fieldState.error?.message}
            />
          )}
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
