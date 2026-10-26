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
import type {
  CriarDoacaoPayload,
  Doacao,
  FormaPagamentoDoacao,
  TipoDoacao,
} from "../models";
import { formatarNumero } from "@/shared/lib/formatacao";
import { OPCOES_TIPO_DOACAO } from "@/shared/lib/tiposDoacao";
import styles from "./DoacaoModal.module.css";

const PAYMENT_OPTIONS = [
  { value: "PIX", label: "PIX" },
  { value: "DEBITO", label: "Débito" },
  { value: "CREDITO", label: "Crédito" },
  { value: "DINHEIRO", label: "Dinheiro" },
];

interface DoacaoModalProps {
  doacao?: Doacao;
  initialType?: TipoDoacao;
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
  initialType = "REABASTECIMENTO",
  onClose,
}: DoacaoModalProps) {
  const isEdit = Boolean(doacao);
  const [type, setType] = useState<TipoDoacao>(doacao?.tipo ?? initialType);
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
      eventId: doacao ? String(doacao.eventoId) : "",
      productId: doacao?.produtoId ? String(doacao.produtoId) : "",
      quantity: doacao?.quantidade ?? 1,
      donor: doacao?.doador ?? "",
      ticketValue: doacao?.valorFicha ?? 0,
      amount: doacao?.valor ?? 0,
      paymentMethod: doacao?.formaPagamento ?? "PIX",
      itemName: doacao?.nome ?? "",
    },
  });

  const selectedProductId = watch("productId");
  const selectedProduct = (productsData?.items || []).find(
    (product) => String(product.id) === selectedProductId,
  );
  const eventOptions = (eventsData?.items || []).map((event) => ({
    value: String(event.id),
    label: event.nome,
  }));
  if (
    doacao &&
    !eventOptions.some((option) => option.value === String(doacao.eventoId))
  ) {
    eventOptions.push({
      value: String(doacao.eventoId),
      label: doacao.eventoNome,
    });
  }

  const productOptions = (productsData?.items || []).map((product) => ({
    value: String(product.id),
    label: `${product.nome} (${formatarNumero(product.quantidadeAtual)} un.)`,
  }));
  if (
    doacao?.tipo === "REABASTECIMENTO" &&
    doacao.produtoId &&
    !productOptions.some((option) => option.value === String(doacao.produtoId))
  ) {
    productOptions.push({
      value: String(doacao.produtoId),
      label: `${doacao.nome || "Produto"} (indisponível)`,
    });
  }

  function changeType(nextType: string) {
    setType(nextType as TipoDoacao);
    setServerError("");
    resetField("productId");
    resetField("quantity");
    resetField("amount");
    resetField("itemName");
  }

  const onSubmit: SubmitHandler<DoacaoFormValues> = async (values) => {
    setServerError("");
    const payload: CriarDoacaoPayload = {
      eventoId: Number(values.eventId),
      tipo: type,
      doador: values.donor,
      valorFicha: values.ticketValue,
    };

    if (type === "REABASTECIMENTO") {
      payload.produtoId = Number(values.productId);
      payload.quantidade = values.quantity;
    } else if (type === "DINHEIRO") {
      payload.valor = values.amount;
      payload.formaPagamento = values.paymentMethod as FormaPagamentoDoacao;
    } else {
      payload.nome = values.itemName;
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
            validate: (value) =>
              Number(value) > 0 || "Selecione o evento destinado à doação.",
          })}
        />

        <ControleSegmentado
          label="Tipo de doação"
          options={OPCOES_TIPO_DOACAO}
          value={type}
          onChange={changeType}
          columns={3}
        />

        {type === "REABASTECIMENTO" ? (
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
                Saldo atual do produto: {formatarNumero(selectedProduct.quantidadeAtual)}{" "}
                unidades. O reabastecimento por doação aumenta o estoque.
              </p>
            ) : null}
          </>
        ) : null}

        {type === "DINHEIRO" ? (
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

        {type === "PRODUTO" ? (
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
                  type !== "PRODUTO" ||
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
