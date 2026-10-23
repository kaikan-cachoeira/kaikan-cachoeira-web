import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { mensagemErro } from "@/shared/api/erros";
import Botao from "@/shared/components/Botao/Botao";
import Entrada from "@/shared/components/Formulario/Entrada";
import Icone from "@/shared/components/Icone/Icone";
import { solicitarRecuperacaoSenha } from "../services/autenticacao";
import styles from "./AuthPages.module.css";

interface RecuperacaoFormValues {
  email: string;
}

export default function RecuperarSenhaPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperacaoFormValues>({ mode: "onTouched" });

  const onSubmit: SubmitHandler<RecuperacaoFormValues> = async (values) => {
    setServerError("");
    try {
      await solicitarRecuperacaoSenha(values.email);
      navigate("/confirmacao-recuperacao", {
        state: { email: values.email },
      });
    } catch (error) {
      setServerError(
        mensagemErro(error, "Não foi possível solicitar a recuperação."),
      );
    }
  };

  return (
      <div className={styles.panel}>
        <Link to="/login" className={styles.backLink}>
          <Icone name="arrow-left" size={18} />
          Voltar para o login
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>Recupere sua senha</h1>
          <p className={styles.subtitle}>
            Informe seu e-mail para receber as instruções de recuperação de
            senha.
          </p>
        </header>

        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Entrada
            id="recover-email"
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="seuemail@exemplo.com"
            error={errors.email?.message}
            required
            {...register("email", {
              required: "Informe seu e-mail.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Informe um e-mail válido.",
              },
            })}
          />

          {serverError ? (
            <p className={styles.serverError} role="alert">
              <Icone name="alert-circle" size={18} />
              {serverError}
            </p>
          ) : null}

          <Botao type="submit" loading={isSubmitting} className={styles.submit}>
            RECUPERAR
          </Botao>
        </form>
      </div>
  );
}
