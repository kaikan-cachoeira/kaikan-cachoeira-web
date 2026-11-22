import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import Botao from "@/shared/components/Botao/Botao";
import Card, { SecaoCard } from "@/shared/components/Card/Card";
import Entrada from "@/shared/components/Formulario/Entrada";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { type Usuario, useAutenticacao } from "@/features/auth";
import styles from "./PerfilPage.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SenhaForm {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}

export default function PerfilPage() {
  const { usuario } = useAutenticacao();
  const { addToast } = useToast();

  const dadosIniciais: Usuario = {
    nome: usuario?.nome ?? "Nome de usuário não encontrado",
    email: usuario?.email ?? "E-mail não encontrado",
    cargo: usuario?.cargo ?? "Cargo não encontrado",
    permissoes: usuario?.permissoes ?? [],
  };

  const [dados, setDados] = useState<Usuario>(dadosIniciais);
  const [editando, setEditando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Usuario>({
    mode: "onTouched",
    defaultValues: dadosIniciais,
  });

  const {
    register: registerSenha,
    handleSubmit: handleSubmitSenha,
    reset: resetSenha,
    getValues: getSenhaValues,
    formState: { errors: errosSenha },
  } = useForm<SenhaForm>({
    mode: "onTouched",
    defaultValues: {
      senhaAtual: "",
      novaSenha: "",
      confirmarSenha: "",
    },
  });

  const iniciais =
    (dados.nome || "U")
      .split(" ")
      .filter(Boolean)
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  function handleEditar() {
    reset(dados);
    setEditando(true);
  }

  function handleCancelar() {
    reset(dados);
    setEditando(false);
  }

  const onSubmit: SubmitHandler<Usuario> = (values) => {
    setDados(values);
    setEditando(false);
    addToast("Seus dados foram atualizados com sucesso.");
  };

  const onSubmitSenha: SubmitHandler<SenhaForm> = () => {
    resetSenha();
    addToast("Sua senha foi alterada com sucesso.");
  };

  const readOnly = !editando;
  const readonlyClass = readOnly ? styles.readonlyInput : "";

  return (
    <div className={styles.stack}>
      <PageHeader
        subtitle="Gerencie suas informações pessoais e os dados da sua conta."
      />

      <Card className={styles.banner} aria-label="Resumo do perfil">
        <span className={styles.avatarGrande} aria-hidden="true">
          {iniciais}
        </span>
        <div className={styles.bannerInfo}>
          <span className={styles.eyebrow}>
            <span className={styles.statusDot} aria-hidden="true" />
            Conta ativa
          </span>
          <h2 className={styles.nome}>{dados.nome}</h2>
          <p className={styles.email}>{dados.email}</p>
          <span className={styles.rolePill}>{dados.cargo}</span>
        </div>
      </Card>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <SecaoCard
          title="Informações pessoais"
          subtitle="Seus dados básicos de identificação e contato."
          action={
            !editando ? (
              <Botao
                variant="secondary"
                iconLeft="edit"
                onClick={handleEditar}
              >
                Editar perfil
              </Botao>
            ) : undefined
          }
        >
          <div className={styles.formGrid}>
            <Entrada
              id="perfil-nome"
              label="Nome completo"
              autoComplete="name"
              required
              disabled={!editando}
              error={errors.nome?.message}
              readOnly={readOnly}
              inputClassName={readonlyClass}
              {...register("nome", {
                required: "Informe o nome completo.",
              })}
            />
            <Entrada
              id="perfil-email"
              label="E-mail"
              type="email"
              autoComplete="email"
              required
              disabled={!editando}
              error={errors.email?.message}
              readOnly={readOnly}
              inputClassName={readonlyClass}
              {...register("email", {
                required: "Informe o e-mail.",
                pattern: {
                  value: EMAIL_REGEX,
                  message: "Informe um e-mail válido.",
                },
              })}
            />
          </div>
        </SecaoCard>

        {editando ? (
          <div className={styles.actions}>
            <Botao
              variant="secondary"
              iconLeft="x"
              type="button"
              onClick={handleCancelar}
            >
              Cancelar
            </Botao>
            <Botao type="submit" iconLeft="check">
              Salvar alterações
            </Botao>
          </div>
        ) : null}
      </form>

      <form
        className={styles.form}
        onSubmit={handleSubmitSenha(onSubmitSenha)}
        noValidate
      >
        <SecaoCard
          title="Alterar senha"
          subtitle="Informe a senha atual e escolha uma nova senha para a sua conta."
        >
          <div className={styles.formGrid}>
            <Entrada
              id="perfil-senha-atual"
              label="Senha atual"
              type="password"
              autoComplete="current-password"
              required
              className={styles.fullWidth}
              error={errosSenha.senhaAtual?.message}
              {...registerSenha("senhaAtual", {
                required: "Informe a senha atual.",
              })}
            />
            <Entrada
              id="perfil-nova-senha"
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              required
              hint="Use pelo menos 8 caracteres."
              error={errosSenha.novaSenha?.message}
              {...registerSenha("novaSenha", {
                required: "Informe a nova senha.",
                minLength: {
                  value: 8,
                  message: "A nova senha deve ter pelo menos 8 caracteres.",
                },
              })}
            />
            <Entrada
              id="perfil-confirmar-senha"
              label="Confirmar nova senha"
              type="password"
              autoComplete="new-password"
              required
              error={errosSenha.confirmarSenha?.message}
              {...registerSenha("confirmarSenha", {
                required: "Confirme a nova senha.",
                validate: (value) =>
                  value === getSenhaValues("novaSenha") ||
                  "As senhas não coincidem.",
              })}
            />
          </div>
        </SecaoCard>

        <div className={styles.actions}>
          <Botao type="submit" iconLeft="check">
            Salvar senha
          </Botao>
        </div>
      </form>
    </div>
  );
}
