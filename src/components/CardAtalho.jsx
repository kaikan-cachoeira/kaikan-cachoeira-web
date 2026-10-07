import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// Card branco com ícone, título, descrição e link "Acessar"
function CardAtalho({ titulo, descricao, icone, cor, caminho }) {
  const Icone = icone;

  return (
    <div className="card-atalho">
      <div className={"card-icone card-icone-" + cor}>
        <Icone size={20} />
      </div>

      <h3 className="card-titulo">{titulo}</h3>
      <p className="card-descricao">{descricao}</p>

      <Link to={caminho} className="card-link">
        Acessar <ChevronRight size={14} />
      </Link>
    </div>
  );
}

export default CardAtalho;
