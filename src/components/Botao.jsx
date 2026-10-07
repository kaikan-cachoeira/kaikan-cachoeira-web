// Botão simples. "tipo" pode ser: "principal", "branco" ou "translucido"
function Botao({ children, tipo = "principal", aoClicar, submit = false }) {
  return (
    <button
      type={submit ? "submit" : "button"}
      className={"botao botao-" + tipo}
      onClick={aoClicar}
    >
      {children}
    </button>
  );
}

export default Botao;
