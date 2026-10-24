import { useLocation, useNavigate } from "react-router-dom";
import Icone from "@/shared/components/Icone/Icone";
import styles from "./BotaoVoltar.module.css";

interface BotaoVoltarProps {
  /** Rota usada quando não há página anterior (ex.: a pessoa abriu o link direto) */
  fallback: string;
  label?: string;
}

export default function BotaoVoltar({
  fallback,
  label = "Voltar",
}: BotaoVoltarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  function voltar() {
    // "default" é a key da primeira página aberta: não existe anterior
    if (location.key !== "default") navigate(-1);
    else navigate(fallback);
  }

  return (
    <button type="button" className={styles.backLink} onClick={voltar}>
      <Icone name="arrow-left" size={18} />
      {label}
    </button>
  );
}