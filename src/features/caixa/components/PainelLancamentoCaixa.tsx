import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import Botao from "@/shared/components/Botao/Botao";
import Entrada from "@/shared/components/Formulario/Entrada";
import AreaTexto from "@/shared/components/Formulario/AreaTexto";
import ControleSegmentado from "@/shared/components/Formulario/ControleSegmentado";
import CampoMoeda from "@/shared/components/Formulario/CampoMoeda";
import Icone from "@/shared/components/Icone/Icone";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { useCaixaMutations } from "../hooks/useCaixa";
import { mensagemErro } from "@/shared/api/erros";
import styles from "./PainelLancamentoCaixa.module.css";

const TYPE_OPTIONS = [
  { value: "Venda de fichas", label: "Venda de fichas" },
  { value: "Devolução", label: "Devolução" },
];

const PAYMENT_OPTIONS = [
  { value: "PIX", label: "PIX" },
  { value: "Débito", label: "Débito" },
  { value: "Crédito", label: "Crédito" },
  { value: "Dinheiro", label: "Dinheiro" },
  { value: "Fiado", label: "Fiado" },
];

interface CaixaFormValues {
  type: string;
  value: number;
  payment: string;
  debtorName: string;
  note: string;
}

const EMPTY: CaixaFormValues = {
  type: "Venda de fichas",
  value: 0,
  payment: "PIX",
  debtorName: "",
  note: "",
};

interface PainelLancamentoCaixaProps {
  eventId: string;
}

export default function PainelLancamentoCaixa({
  eventId,
}: PainelLancamentoCaixaProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { criarLancamento: createEntry } = useCaixaMutations();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CaixaFormValues>({
    mode: "onTouched",
    defaultValues: EMPTY,
  });

  const type = watch("type");
  const payment = watch("payment");
  const isFiado = payment === "Fiado";
  const isDevolucao = type === "Devolução";
  const fiadoPath = location.pathname === "/caixa/fiado";

  useEffect(() => {
    if (fiadoPath) {
      setValue("payment", "Fiado");
    } else {
      setValue("payment", "PIX");
    }
  }, [fiadoPath, setValue]);

  function changeType(nextType: string) {
    setValue("type", nextType);
    if (nextType === "Devolução" && payment === "Fiado") {
      setValue("payment", "PIX");
      if (fiadoPath) navigate("/caixa", { replace: true });
    }
  }

  function changePayment(nextPayment: string) {
    setValue("payment", nextPayment);
    if (nextPayment === "Fiado" && !fiadoPath) {
      navigate("/caixa/fiado", { replace: true });
    }
    if (nextPayment !== "Fiado" && fiadoPath) {
      navigate("/caixa", { replace: true });
    }
  }

  const onSubmit: SubmitHandler<CaixaFormValues> = async (values) => {
    setServerError("");
    try {
      await createEntry.mutateAsync({
        eventId,
        type: values.type,
        value: values.value,
        payment: values.payment,
        debtorName: values.payment === "Fiado" ? values.debtorName : null,
        note: values.payment === "Fiado" ? values.note : "",
      });
      addToast("Registro adicionado ao caixa.");
      reset({
        type: values.type,
        value: 0,
        payment: values.payment,
        debtorName: "",
        note: "",
      });
    } catch (error) {
      setServerError(
        mensagemErro(error, "Não foi possível registrar no caixa."),
      );
    }
  };

  return (
    <aside className={styles.panel} aria-labelledby="registrar-caixa">
      <header className={styles.header}>
        <h2 className={styles.title} id="registrar-caixa">
          Registrar no caixa
        </h2>
        <p className={styles.subtitle}>Novo lançamento para o evento atual</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <ControleSegmentado
          label="Tipo de registro"
          options={TYPE_OPTIONS}
          value={type}
          onChange={changeType}
          columns={2}
        />

        <Controller
          name="value"
          control={control}
          rules={{
            validate: (value) =>
              Number(value) > 0 || "Informe um valor maior que zero.",
          }}
          render={({ field, fieldState }) => (
            <CampoMoeda
              id="caixa-valor"
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

        <div className={styles.payments}>
          <ControleSegmentado
            label="Forma de pagamento"
            options={
              isDevolucao
                ? PAYMENT_OPTIONS.filter((option) => option.value !== "Fiado")
                : PAYMENT_OPTIONS
            }
            value={payment}
            onChange={changePayment}
            columns={2}
            className={styles.paymentGrid}
          />
        </div>

        {isFiado ? (
          <section className={styles.fiadoSection} aria-labelledby="dados-fiado">
            <div className={styles.fiadoHeader}>
              <h3 id="dados-fiado">Dados do fiado</h3>
              <p>Preencha os dados da pessoa responsável.</p>
            </div>
            <Entrada
              id="caixa-devedor"
              label="Nome"
              placeholder="Nome do devedor"
              required
              error={errors.debtorName?.message}
              {...register("debtorName", {
                validate: (value) =>
                  !isFiado ||
                  Boolean(String(value || "").trim()) ||
                  "Informe o nome do devedor.",
              })}
            />
            <AreaTexto
              id="caixa-observacao"
              label="Observação (opcional)"
              rows={3}
              placeholder="Informações adicionais"
              error={errors.note?.message}
              {...register("note")}
            />
          </section>
        ) : null}

        {serverError ? (
          <p className={styles.serverError} role="alert">
            <Icone name="alert-circle" size={18} />
            {serverError}
          </p>
        ) : null}

        <Botao
          type="submit"
          className={styles.submit}
          loading={createEntry.isPending}
        >
          Confirmar registro
        </Botao>
      </form>
    </aside>
  );
}
