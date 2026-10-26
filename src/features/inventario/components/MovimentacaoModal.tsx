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
import {
  useProdutoMutations,
  useReunioesQuery,
  useTiposMovimentacaoQuery,
} from "../hooks/useInventario";
import styles from "./ModaisInventario.module.css";

interface MovimentacaoFormValues {
  tipoMovimentacaoId: string;
  quantidade: number;
  custoTotal: number;
  eventoId: string;
  observacoes: string;
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
  const tiposQuery = useTiposMovimentacaoQuery();
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
      tipoMovimentacaoId: "",
      quantidade: 1,
      custoTotal: 0,
      eventoId: "",
      observacoes: "",
    },
  });

  const tipoMovimentacaoId = Number(watch("tipoMovimentacaoId"));
  const tipoSelecionado = (tiposQuery.data || []).find(
    (item) => item.id === tipoMovimentacaoId,
  );
  const reunioesQuery = useReunioesQuery(
    tipoSelecionado?.codigo === "CONSUMO_INTERNO",
  );

  const rawQuantity = Number(watch("quantidade"));
  const rawTotalCost = Number(watch("custoTotal"));
  const isEntry = tipoSelecionado?.direcao === "ENTRADA";
  const exigeCusto = Boolean(tipoSelecionado?.exigeCusto);
  const exigeReuniao = tipoSelecionado?.codigo === "CONSUMO_INTERNO";
  const quantity = Number.isFinite(rawQuantity) ? rawQuantity : 0;
  const afterQuantity = isEntry
    ? Number(produto.quantidadeAtual) + quantity
    : Number(produto.quantidadeAtual) - quantity;
  const unitCost = isEntry && quantity > 0 ? rawTotalCost / quantity : 0;

  const onSubmit: SubmitHandler<MovimentacaoFormValues> = async (values) => {
    setServerError("");
    try {
      await criarMovimentacao.mutateAsync({
        productId: produto.id,
        payload: {
          tipoMovimentacaoId: Number(values.tipoMovimentacaoId),
          quantidade: values.quantidade,
          custoTotal: exigeCusto ? values.custoTotal : undefined,
          eventoId: values.eventoId ? Number(values.eventoId) : undefined,
          observacoes: values.observacoes,
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
          <span>{produto.nome}</span>
          <strong>
            Quantidade atual: {formatarNumero(produto.quantidadeAtual)} unidades
          </strong>
        </div>

        <Selecao
          id="movimentacao-tipo"
          label="Tipo de movimentação"
          options={(tiposQuery.data || []).map((item) => ({
            value: String(item.id),
            label: item.codigo
                .toLowerCase()
                .split('_')
                .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
                .join(' '),
          }))}
          disabled={tiposQuery.isLoading}
          error={errors.tipoMovimentacaoId?.message}
          {...register("tipoMovimentacaoId", {
            required: "Selecione o tipo.",
          })}
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
            error={errors.quantidade?.message}
            {...register("quantidade", {
              valueAsNumber: true,
              required: "Informe a quantidade.",
              validate: (value) => {
                if (!Number.isInteger(value) || value <= 0) {
                  return "Informe uma quantidade inteira maior que zero.";
                }
                if (!isEntry && value > Number(produto.quantidadeAtual)) {
                  return "A quantidade não pode ser maior que o saldo disponível.";
                }
                return true;
              },
            })}
          />
          {isEntry ? (
            <Controller
              name="custoTotal"
              control={control}
              rules={{
                validate: (value) => {
                  if (!exigeCusto) {
                    return Number(value) >= 0 || "O custo não pode ser negativo.";
                  }
                  return Number(value) > 0 || "Informe custo total maior que zero.";
                },
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
                  hint={
                    exigeCusto
                      ? "Obrigatório para este tipo de movimentação."
                      : "Opcional. O custo unitário é calculado pelo total."
                  }
                />
              )}
            />
          ) : null}
        </div>

        {exigeReuniao ? (
          <Selecao
            id="movimentacao-reuniao"
            label="Reunião vinculada"
            placeholder={
              reunioesQuery.isLoading ? "Carregando reuniões..." : "Selecione"
            }
            options={(reunioesQuery.data || []).map((evento) => ({
              value: String(evento.id),
              label: evento.nome,
            }))}
            error={errors.eventoId?.message}
            {...register("eventoId", {
              validate: (value) =>
                !exigeReuniao ||
                Boolean(value) ||
                "Selecione a reunião para consumo interno.",
            })}
          />
        ) : null}

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
          error={errors.observacoes?.message}
          {...register("observacoes")}
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
