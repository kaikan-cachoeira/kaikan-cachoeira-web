import { useNavigate } from "react-router-dom";
import Botao from "./Botao.jsx";

// Faixa vermelha "Evento em andamento"
function EventoAtual({ nome, inicio }) {
  const navegar = useNavigate();

  return (
    <section className="evento">
      <div>
        <p className="evento-etiqueta">EVENTO EM ANDAMENTO</p>
        <h2 className="evento-nome">{nome}</h2>
        <p className="evento-data">Iniciado em {inicio}</p>
      </div>

      <div className="evento-botoes">
        <Botao tipo="branco" aoClicar={() => navegar("/pedidos")}>
          Pedidos
        </Botao>
        <Botao tipo="translucido" aoClicar={() => navegar("/caixa")}>
          Caixa
        </Botao>
      </div>
    </section>
  );
}

export default EventoAtual;
