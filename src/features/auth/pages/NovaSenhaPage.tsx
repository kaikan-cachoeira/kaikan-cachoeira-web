import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { mensagemErro } from "@/shared/api/erros";
import Botao from "@/shared/components/Botao/Botao";
import Entrada from "@/shared/components/Formulario/Entrada";
import Icone from "@/shared/components/Icone/Icone";
import { redefinirSenha } from "../services/autenticacao";
import styles from "./AuthPages.module.css";

const MIN_SENHA = 8;

interface NovaSenhaFormValues {
  novaSenha: string;
  confirmarSenha: string;
}

export default function NovaSenhaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<NovaSenhaFormValues>({ mode: "onTouched" });
  const token = searchParams.get("token") ?? undefined;

  const onSubmit: SubmitHandler<NovaSenhaFormValues> = async (values) => {
    setServerError("");
    try {
      await redefinirSenha({ token, password: values.novaSenha });
      navigate("/senha-alterada", {
        replace: true,
        state: { senhaAlterada: true },
      });
    } catch (error) {
      setServerError(
        mensagemErro(error, "Não foi possível criar a nova senha."),
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
        <h1 className={styles.title}>Crie uma nova senha</h1>
        <p className={styles.subtitle}>
          Defina uma nova senha para acessar sua conta.
        </p>
      </header>

      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Entrada
          id="nova-senha"
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          placeholder="Digite sua nova senha"
          error={errors.novaSenha?.message}
          required
          {...register("novaSenha", {
            required: "Informe a nova senha.",
            minLength: {
              value: MIN_SENHA,
              message: "A senha deve ter ao menos 8 caracteres.",
            },
            deps: "confirmarSenha",
          })}
        />

        <Entrada
          id="confirmar-senha"
          label="Confirme sua senha"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a nova senha"
          error={errors.confirmarSenha?.message}
          required
          {...register("confirmarSenha", {
            required: "Confirme sua senha.",
            validate: (value) =>
              value === getValues("novaSenha") || "As senhas não conferem.",
          })}
        />

        {serverError ? (
          <p className={styles.serverError} role="alert">
            <Icone name="alert-circle" size={18} />
            {serverError}
          </p>
        ) : null}

        <Botao type="submit" loading={isSubmitting} className={styles.submit}>
          Criar nova senha
        </Botao>
      </form>
    </div>
  );
}
