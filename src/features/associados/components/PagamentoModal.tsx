import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { mensagemErro } from "@/shared/api/erros";
import Botao from "@/shared/components/Botao/Botao";
import CampoMoeda from "@/shared/components/Formulario/CampoMoeda";
import Icone from "@/shared/components/Icone/Icone";
import Modal from "@/shared/components/Modal/Modal";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { formatarMoeda } from "@/shared/lib/formatacao";
import type { Associado, ConfiguracaoAnuidade } from "../models";
import { usePagamentoAnuidadeMutations } from "../hooks/useAnuidades";
import { saldoAnuidade } from "../utils/anuidade";
import styles from "./PagamentoModal.module.css";

interface PagamentoModalProps {
  associado: Associado;
  configuracao: ConfiguracaoAnuidade;
  onClose: () => void;
}

interface PagamentoFormValues {
  valor: number | undefined;
}

export default function PagamentoModal({
  associado,
  configuracao,
  onClose,
}: PagamentoModalProps) {
  const [serverError, setServerError] = useState("");
  const { addToast } = useToast();
  const { registrarPagamento } = usePagamentoAnuidadeMutations();
  const anuidade = associado.anuidade;
  const valorAnuidade = anuidade?.valor ?? configuracao.valor;
  const totalPago = anuidade?.totalPago ?? 0;
  const restante = saldoAnuidade(valorAnuidade, totalPago);
  const restanteCentavos = Math.round(restante * 100);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PagamentoFormValues>({
    mode: "onTouched",
    defaultValues: { valor: restante },
  });

  const onSubmit: SubmitHandler<PagamentoFormValues> = async (values) => {
    setServerError("");
    const valorCentavos =
      typeof values.valor === "number" ? Math.round(values.valor * 100) : 0;
    try {
      await registrarPagamento.mutateAsync({
        associadoId: associado.id,
        configuracaoId: configuracao.id,
        valor: valorCentavos / 100,
      });
      addToast("Pagamento registrado com sucesso.");
      onClose();
    } catch (error) {
      setServerError(
        mensagemErro(error, "Não foi possível registrar o pagamento."),
      );
    }
  };

  const isPending = registrarPagamento.isPending;

  return (
    <Modal
      title="Registrar pagamento"
      subtitle={`${associado.nome} · Anuidade ${configuracao.ano}`}
      onClose={isPending ? undefined : onClose}
      showClose={!isPending}
      closeOnOverlay={!isPending}
      size="small"
      footer={
        <>
          <Botao
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-pagamento-anuidade"
            loading={isPending}
          >
            Confirmar pagamento
          </Botao>
        </>
      }
    >
      <form
        id="form-pagamento-anuidade"
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span>Valor da anuidade</span>
            <strong>{formatarMoeda(valorAnuidade)}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Já pago</span>
            <strong>{formatarMoeda(totalPago)}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Restante</span>
            <strong>{formatarMoeda(restante)}</strong>
          </div>
        </div>

        {!anuidade ? (
          <p className={styles.notice}>
            <Icone name="info" size={18} />
            A cobrança individual será criada automaticamente ao confirmar este
            pagamento.
          </p>
        ) : null}

        <Controller
          name="valor"
          control={control}
          rules={{
            validate: (valor) => {
              const centavos =
                typeof valor === "number" ? Math.round(valor * 100) : 0;
              if (centavos <= 0) {
                return "Informe um valor de pagamento válido.";
              }
              return (
                centavos <= restanteCentavos ||
                "O valor não pode ultrapassar o saldo restante."
              );
            },
          }}
          render={({ field }) => (
            <CampoMoeda
              id="pagamento-anuidade-valor"
              label="Valor do pagamento"
              required
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              error={errors.valor?.message}
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
