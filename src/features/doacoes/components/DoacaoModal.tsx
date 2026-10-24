import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import Modal from "@/shared/components/Modal/Modal";
import Botao from "@/shared/components/Botao/Botao";
import Entrada from "@/shared/components/Formulario/Entrada";
import Selecao from "@/shared/components/Formulario/Selecao";
import ControleSegmentado from "@/shared/components/Formulario/ControleSegmentado";
import CampoMoeda from "@/shared/components/Formulario/CampoMoeda";
import Icone from "@/shared/components/Icone/Icone";
import { useDoacaoMutations } from "../hooks/useDoacoes";
import { useEventosQuery } from "@/features/eventos";
import { useProdutosQuery } from "@/features/inventario";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import type { CriarDoacaoPayload, Doacao } from "../models";
import { formatarNumero } from "@/shared/lib/formatacao";
import styles from "./DoacaoModal.module.css";

const TYPE_OPTIONS = [
  { value: "ready", label: "Produto pronto" },
  { value: "money", label: "Dinheiro" },
  { value: "ingredient", label: "Ingrediente" },
];

const PAYMENT_OPTIONS = [
  { value: "PIX", label: "PIX" },
  { value: "Débito", label: "Débito" },
  { value: "Crédito", label: "Crédito" },
  { value: "Dinheiro", label: "Dinheiro" },
];

interface DoacaoModalProps {
  doacao?: Doacao;
  initialType?: string;
  onClose: () => void;
}

interface DoacaoFormValues {
  eventId: string;
  productId: string;
  quantity: number;
  donor: string;
  ticketValue: number;
  amount: number;
  paymentMethod: string;
  itemName: string;
}

export default function DoacaoModal({
  doacao,
  initialType = "ready",
  onClose,
}: DoacaoModalProps) {
  const isEdit = Boolean(doacao);
  const [type, setType] = useState(doacao?.type ?? initialType);
  const [serverError, setServerError] = useState("");
  const { addToast } = useToast();
  const {
    criarDoacao: createDonation,
    atualizarDoacao: updateDonation,
  } = useDoacaoMutations();
  const mutation = isEdit ? updateDonation : createDonation;
  const { data: eventsData } = useEventosQuery({ pageSize: 100 });
  const { data: productsData, isLoading: productsLoading } = useProdutosQuery({
    pageSize: 100,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    resetField,
    formState: { errors },
  } = useForm<DoacaoFormValues>({
    mode: "onTouched",
    defaultValues: {
      eventId: doacao?.eventId ?? "",
      productId: doacao?.productId ?? "",
      quantity: doacao?.quantity ?? 1,
      donor: doacao?.donor ?? "",
      ticketValue: doacao?.ticketValue ?? 0,
      amount: doacao?.amount ?? 0,
      paymentMethod: doacao?.paymentMethod ?? "PIX",
      itemName: doacao?.itemName ?? "",
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
  if (
    doacao &&
    !eventOptions.some((option) => option.value === doacao.eventId)
  ) {
    eventOptions.push({ value: doacao.eventId, label: doacao.eventName });
  }

  const productOptions = (productsData?.items || []).map((product) => ({
    value: product.id,
    label: `${product.name} (${formatarNumero(product.quantity)} un.)`,
  }));
  if (
    doacao?.type === "ready" &&
    doacao.productId &&
    !productOptions.some((option) => option.value === doacao.productId)
  ) {
    productOptions.push({
      value: doacao.productId,
      label: `${doacao.itemName || "Produto"} (indisponível)`,
    });
  }

  function changeType(nextType: string) {
    setType(nextType);
    setServerError("");
    resetField("productId");
    resetField("quantity");
    resetField("amount");
    resetField("itemName");
  }

  const onSubmit: SubmitHandler<DoacaoFormValues> = async (values) => {
    setServerError("");
    const payload: CriarDoacaoPayload = {
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
      if (doacao) {
        await updateDonation.mutateAsync({ id: doacao.id, payload });
        addToast("Doação atualizada com sucesso.");
      } else {
        await createDonation.mutateAsync(payload);
        addToast("Doação registrada com sucesso.");
      }
      onClose();
    } catch (error) {
      setServerError(
        mensagemErro(
          error,
          isEdit
            ? "Não foi possível atualizar a doação."
            : "Não foi possível registrar a doação.",
        ),
      );
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar doação" : "Registrar doação"}
      subtitle="Toda doação deve ser vinculada a um evento."
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
            form="form-doacao"
            loading={mutation.isPending}
          >
            {isEdit ? "Salvar alterações" : "Registrar"}
          </Botao>
        </>
      }
    >
      <form
        id="form-doacao"
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Selecao
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

        <ControleSegmentado
          label="Tipo de doação"
          options={TYPE_OPTIONS}
          value={type}
          onChange={changeType}
          columns={3}
        />

        {type === "ready" ? (
          <>
            <Selecao
              id="doacao-produto"
              label="Produto / item"
              placeholder="Selecione o produto"
              options={productOptions}
              disabled={productsLoading}
              required
              error={errors.productId?.message}
              {...register("productId", {
                required: "Selecione o produto doado.",
              })}
            />
            <div className={styles.twoColumns}>
              <Entrada
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
              <Entrada
                id="doacao-doador"
                label="Doador"
                placeholder="Nome do doador"
                error={errors.donor?.message}
                {...register("donor")}
              />
            </div>
            {selectedProduct ? (
              <p className={styles.stockHint}>
                Saldo atual do produto: {formatarNumero(selectedProduct.quantity)}{" "}
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
                  <CampoMoeda
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
              <Selecao
                id="doacao-pagamento"
                label="Forma de pagamento"
                options={PAYMENT_OPTIONS}
                error={errors.paymentMethod?.message}
                {...register("paymentMethod")}
              />
            </div>
            <Entrada
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
              <Icone name="info" size={18} />
              Use esta opção apenas em casos excepcionais. Produtos feitos na
              hora normalmente usam ingredientes comprados e registrados como
              custo do evento.
            </p>
            <Entrada
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
            <Entrada
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
            <CampoMoeda
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
            <Icone name="alert-circle" size={18} />
            {serverError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
