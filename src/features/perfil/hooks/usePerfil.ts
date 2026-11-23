import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { type Usuario, useAutenticacao } from "@/features/auth";
import { useToast } from "@/shared/components/Toast/ToastProvider";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SenhaForm {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}

function obterIniciais(nome: string) {
  return (
    (nome || "U")
      .split(" ")
      .filter(Boolean)
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

export function usePerfil() {
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
    formState: { errors: errosPerfil },
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

  const camposPerfil = {
    nome: register("nome", {
      required: "Informe o nome completo.",
    }),
    email: register("email", {
      required: "Informe o e-mail.",
      pattern: {
        value: EMAIL_REGEX,
        message: "Informe um e-mail válido.",
      },
    }),
  };

  const camposSenha = {
    senhaAtual: registerSenha("senhaAtual", {
      required: "Informe a senha atual.",
    }),
    novaSenha: registerSenha("novaSenha", {
      required: "Informe a nova senha.",
      minLength: {
        value: 8,
        message: "A nova senha deve ter pelo menos 8 caracteres.",
      },
    }),
    confirmarSenha: registerSenha("confirmarSenha", {
      required: "Confirme a nova senha.",
      validate: (value) =>
        value === getSenhaValues("novaSenha") || "As senhas não coincidem.",
    }),
  };

  return {
    dados,
    editando,
    iniciais: obterIniciais(dados.nome),
    somenteLeitura: !editando,
    camposPerfil,
    errosPerfil,
    enviarPerfil: handleSubmit(onSubmit),
    camposSenha,
    errosSenha,
    enviarSenha: handleSubmitSenha(onSubmitSenha),
    handleEditar,
    handleCancelar,
  };
}
