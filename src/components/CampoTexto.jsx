import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Campo de formulário com label.
// Se o tipo for "password", mostra o olhinho para ver a senha.
function CampoTexto({ label, tipo = "text", placeholder, valor, aoMudar }) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const ehSenha = tipo === "password";
  const tipoDoInput = ehSenha && mostrarSenha ? "text" : tipo;

  return (
    <div className="campo">
      <label className="campo-label">{label}</label>

      <div className="campo-caixa">
        <input
          className="campo-input"
          type={tipoDoInput}
          placeholder={placeholder}
          value={valor}
          onChange={aoMudar}
        />

        {ehSenha && (
          <button
            type="button"
            className="campo-olho"
            onClick={() => setMostrarSenha(!mostrarSenha)}
          >
            {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default CampoTexto;
