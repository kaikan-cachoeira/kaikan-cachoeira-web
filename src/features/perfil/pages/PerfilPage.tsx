import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Botao from "@/shared/components/Botao/Botao";
import Card, { SecaoCard } from "@/shared/components/Card/Card";
import Entrada from "@/shared/components/Formulario/Entrada";
import Icone from "@/shared/components/Icone/Icone";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { useAutenticacao } from "@/features/auth";
import { DADOS_INICIAIS, type DadosPerfil } from "../models";
import styles from "./PerfilPage.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PerfilPage() {
  const navigate = useNavigate();
  const { usuario } = useAutenticacao();
  const { addToast } = useToast();

  const dadosIniciais: DadosPerfil = {
    ...DADOS_INICIAIS,
    nome: usuario?.nome ?? DADOS_INICIAIS.nome,
    cargo: usuario?.cargo ?? DADOS_INICIAIS.cargo,
  };

  const [dados, setDados] = useState<DadosPerfil>(dadosIniciais);
  const [editando, setEditando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DadosPerfil>({
    mode: "onTouched",
    defaultValues: dadosIniciais,
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

  const onSubmit: SubmitHandler<DadosPerfil> = (values) => {
    setDados(values);
    setEditando(false);
    addToast("Seus dados foram atualizados com sucesso.");
  };

  const readOnly = !editando;
  const readonlyClass = readOnly ? styles.readonlyInput : "";

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Meu perfil"
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
        <span
          className={`${styles.decor} ${styles.decorOne}`}
          aria-hidden="true"
        />
        <span
          className={`${styles.decor} ${styles.decorTwo}`}
          aria-hidden="true"
        />
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

        
        <Card className={styles.securityCard} as="section" aria-labelledby="perfil-seguranca-titulo">
          <span className={styles.securityIcon} aria-hidden="true">
            <Icone name="check-circle" size={24} />
          </span>
          <div className={styles.securityText}>
            <h2 className={styles.securityTitle} id="perfil-seguranca-titulo">
              Segurança da conta
            </h2>
            <p className={styles.securitySubtitle}>
              Para alterar sua senha, utilize o fluxo de recuperação de senha.
            </p>
          </div>
          <Botao
            variant="tertiary"
            iconRight="chevron-right"
            onClick={() => navigate("/recuperar-senha")}
          >
            Alterar senha
          </Botao>
        </Card>

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

      <p className={styles.footerNote}>Kaikan Cachoeira · Área do usuário</p>
    </div>
  );
}
