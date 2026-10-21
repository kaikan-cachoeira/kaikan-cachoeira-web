import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout";
import Button from "../../components/Button/Button";
import Input from "../../components/Form/Input";
import Icon from "../../components/Icon/Icon";
import { apiErrorMessage } from "../../services/api";
import styles from "./AuthPages.module.css";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onTouched" });

  async function onSubmit(values) {
    setServerError("");
    try {
      await signIn(values);
      const destination = location.state?.from?.pathname || "/inicio";
      navigate(destination, { replace: true });
    } catch (error) {
      setServerError(apiErrorMessage(error, "Não foi possível entrar."));
    }
  }

  return (
    <AuthLayout>
      <div className={styles.panel}>
        <header className={styles.header}>
          <h1 className={styles.title}>Entrar</h1>
          <p className={styles.subtitle}>Acesse sua conta para continuar</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            id="login-email"
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

          <Input
            id="login-senha"
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            error={errors.password?.message}
            required
            {...register("password", {
              required: "Informe sua senha.",
            })}
          />

          <div className={styles.inlineAction}>
            <Link to="/recuperar-senha" className={styles.link}>
              Esqueci minha senha
            </Link>
          </div>

          {serverError ? (
            <p className={styles.serverError} role="alert">
              <Icon name="alert-circle" size={18} />
              {serverError}
            </p>
          ) : null}

          <Button type="submit" loading={isSubmitting} className={styles.submit}>
            ENTRAR
          </Button>
        </form>

        <p className={styles.demoNote}>
          Modo de demonstração: use qualquer e-mail válido e uma senha para
          acessar. Nenhuma credencial real é validada.
        </p>
      </div>
    </AuthLayout>
  );
}
