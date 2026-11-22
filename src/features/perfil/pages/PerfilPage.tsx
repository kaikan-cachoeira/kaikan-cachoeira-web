import Botao from "@/shared/components/Botao/Botao";
import Card, { SecaoCard } from "@/shared/components/Card/Card";
import Entrada from "@/shared/components/Formulario/Entrada";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import { usePerfil } from "../hooks/usePerfil";
import styles from "./PerfilPage.module.css";

export default function PerfilPage() {
  const {
    dados,
    editando,
    iniciais,
    somenteLeitura,
    camposPerfil,
    errosPerfil,
    enviarPerfil,
    camposSenha,
    errosSenha,
    enviarSenha,
    handleEditar,
    handleCancelar,
  } = usePerfil();

  const readonlyClass = somenteLeitura ? styles.readonlyInput : "";

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

      <form className={styles.form} onSubmit={enviarPerfil} noValidate>
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
              error={errosPerfil.nome?.message}
              readOnly={somenteLeitura}
              inputClassName={readonlyClass}
              {...camposPerfil.nome}
            />
            <Entrada
              id="perfil-email"
              label="E-mail"
              type="email"
              autoComplete="email"
              required
              disabled={!editando}
              error={errosPerfil.email?.message}
              readOnly={somenteLeitura}
              inputClassName={readonlyClass}
              {...camposPerfil.email}
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
        onSubmit={enviarSenha}
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
              {...camposSenha.senhaAtual}
            />
            <Entrada
              id="perfil-nova-senha"
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              required
              hint="Use pelo menos 8 caracteres."
              error={errosSenha.novaSenha?.message}
              {...camposSenha.novaSenha}
            />
            <Entrada
              id="perfil-confirmar-senha"
              label="Confirmar nova senha"
              type="password"
              autoComplete="new-password"
              required
              error={errosSenha.confirmarSenha?.message}
              {...camposSenha.confirmarSenha}
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
