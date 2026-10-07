// Cardzinho de número lá embaixo (Eventos este ano, Produtos, etc.)
function CardEstatistica({ valor, titulo, detalhe }) {
  return (
    <div className="estatistica">
      <p className="estatistica-valor">{valor}</p>
      <p className="estatistica-titulo">{titulo}</p>
      <p className="estatistica-detalhe">{detalhe}</p>
    </div>
  );
}

export default CardEstatistica;
