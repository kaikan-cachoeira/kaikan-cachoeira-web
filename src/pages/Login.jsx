import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import CampoTexto from "../components/CampoTexto.jsx";
import Botao from "../components/Botao.jsx";
import AcessoDemo from "../components/AcessoDemo.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navegar = useNavigate();

  // Roda quando clica em "Entrar"
  function entrar(evento) {
    evento.preventDefault(); // não deixa a página recarregar

    // TODO (backend): enviar "email" e "senha" para a API e validar o login aqui.
    // Por enquanto, só vai para a tela inicial para dar para navegar no front.
    navegar("/inicio");
  }

  return (
    <div className="login">
      {/* Lado esquerdo: formulário */}
      <div className="login-esquerda">
        <form className="login-form" onSubmit={entrar}>
          <Logo />

          <h1 className="login-titulo">Bem-vindo!</h1>
          <p className="login-subtitulo">
            Faça login para acessar o sistema administrativo.
          </p>

          <CampoTexto
            label="E-mail"
            tipo="email"
            placeholder="seu@email.com.br"
            valor={email}
            aoMudar={(e) => setEmail(e.target.value)}
          />

          <CampoTexto
            label="Senha"
            tipo="password"
            placeholder="Digite sua senha"
            valor={senha}
            aoMudar={(e) => setSenha(e.target.value)}
          />

          <a href="#" className="login-esqueci">
            Esqueci minha senha
          </a>

          <Botao submit>Entrar</Botao>

          <AcessoDemo />
        </form>
      </div>

      {/* Lado direito: imagem com texto */}
<div className="login-direita">
  <div className="login-imagem" />

  <div className="login-texto">
    <h2>Kaikan Cachoeira</h2>
    <p>Sistema de gestão administrativa da associação cultural japonesa.</p>
  </div>
</div>
    </div>
  );
}

export default Login;
