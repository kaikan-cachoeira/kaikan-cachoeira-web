import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout";
import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input";
import Icon from "../../components/Icon/Icon";
import { requestPasswordRecovery } from "../../services/auth";
import { apiErrorMessage } from "../../services/api";
import styles from "./AuthPages.module.css";

export default function RecoverPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  async function onSubmit(values) {
    setServerError("");
    try {
      await requestPasswordRecovery(values.email);
      navigate("/confirmacao-recuperacao", {
        state: { email: values.email },
      });
    } catch (error) {
      setServerError(
        apiErrorMessage(error, "Não foi possível solicitar a recuperação."),
      );
    }
  }

  return (
    <AuthLayout>
      <div className={styles.panel}>
        <Link to="/login" className={styles.backLink}>
          <Icon name="arrow-left" size={18} />
          Voltar para o login
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>Recupere sua senha</h1>
          <p className={styles.subtitle}>
            Informe seu e-mail para receber as instruções de recuperação de
            senha.
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
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
              <Icon name="alert-circle" size={18} />
              {serverError}
            </p>
          ) : null}

          <Button type="submit" loading={isSubmitting} className={styles.submit}>
            RECUPERAR
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
