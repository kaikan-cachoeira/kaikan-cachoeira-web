import { ChevronDown } from "lucide-react";
import { usuario } from "../data/dados.js";

// Barra de cima: título da página + usuário logado
function Cabecalho({ titulo }) {
  return (
    <header className="cabecalho">
      <h1 className="cabecalho-titulo">{titulo}</h1>

      <div className="cabecalho-usuario">
        <div className="avatar">{usuario.iniciais}</div>
        <div>
          <p className="usuario-nome">{usuario.nome}</p>
          <p className="usuario-email">{usuario.email}</p>
        </div>
        <ChevronDown size={16} color="#9a9a9a" />
      </div>
    </header>
  );
}

export default Cabecalho;
