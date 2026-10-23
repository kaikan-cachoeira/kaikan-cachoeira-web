import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { mensagemErro } from "@/shared/api/erros";
import Botao from "@/shared/components/Botao/Botao";
import AreaTexto from "@/shared/components/Formulario/AreaTexto";
import CampoMoeda from "@/shared/components/Formulario/CampoMoeda";
import Entrada from "@/shared/components/Formulario/Entrada";
import Selecao from "@/shared/components/Formulario/Selecao";
import Icone from "@/shared/components/Icone/Icone";
import Modal from "@/shared/components/Modal/Modal";
import { formatarMoeda, formatarNumero } from "@/shared/lib/formatacao";
import type { Produto } from "../models";
import { useProdutoMutations } from "../hooks/useInventario";
import styles from "./ModaisInventario.module.css";

const TIPOS_MOVIMENTACAO = [
  "Reabastecimento",
  "Consumo interno",
  "Perda",
  "Ajuste de saída",
];

interface MovimentacaoFormValues {
  type: string;
  quantity: number;
  totalCost: number;
  notes: string;
}

interface MovimentacaoModalProps {
  produto: Produto;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MovimentacaoModal({
  produto,
  onClose,
  onSuccess,
}: MovimentacaoModalProps) {
  const { criarMovimentacao } = useProdutoMutations();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<MovimentacaoFormValues>({
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
    ? Number(produto.quantity) + quantity
    : Number(produto.quantity) - quantity;
  const unitCost = isEntry && quantity > 0 ? rawTotalCost / quantity : 0;

  const onSubmit: SubmitHandler<MovimentacaoFormValues> = async (values) => {
    setServerError("");
    try {
      await criarMovimentacao.mutateAsync({
        productId: produto.id,
        payload: {
          type: values.type,
          quantity: values.quantity,
          totalCost: isEntry ? values.totalCost : 0,
          notes: values.notes,
        },
      });
      onSuccess();
    } catch (error) {
      setServerError(
        mensagemErro(error, "Não foi possível registrar a movimentação."),
      );
    }
  };

  return (
    <Modal
      title="Movimentar estoque"
      subtitle="As saídas consomem primeiro o lote mais antigo."
      onClose={criarMovimentacao.isPending ? undefined : onClose}
      showClose={!criarMovimentacao.isPending}
      closeOnOverlay={!criarMovimentacao.isPending}
      footer={
        <>
          <Botao
            variant="secondary"
            onClick={onClose}
            disabled={criarMovimentacao.isPending}
          >
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-movimentacao"
            loading={criarMovimentacao.isPending}
          >
            Confirmar movimentação
          </Botao>
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
          <span>{produto.name}</span>
          <strong>
            Quantidade atual: {formatarNumero(produto.quantity)} unidades
          </strong>
        </div>

        <Selecao
          id="movimentacao-tipo"
          label="Tipo de movimentação"
          options={TIPOS_MOVIMENTACAO.map((item) => ({
            value: item,
            label: item,
          }))}
          error={errors.type?.message}
          {...register("type", { required: "Selecione o tipo." })}
        />

        <div className={styles.twoColumns}>
          <Entrada
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
                if (!isEntry && value > Number(produto.quantity)) {
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
                  Number(value) >= 0 || "O custo não pode ser negativo.",
              }}
              render={({ field, fieldState }) => (
                <CampoMoeda
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
              <strong>{formatarMoeda(unitCost)}</strong>
            </div>
          ) : null}
          <div className={styles.calculation}>
            <span>Quantidade após movimentação</span>
            <strong>{formatarNumero(Math.max(0, afterQuantity))} unidades</strong>
          </div>
        </div>

        <AreaTexto
          id="movimentacao-observacoes"
          label="Observações"
          rows={3}
          placeholder="Informações adicionais (opcional)"
          error={errors.notes?.message}
          {...register("notes")}
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
