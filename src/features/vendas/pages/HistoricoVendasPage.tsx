import { Link } from "react-router-dom";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import Abas from "@/shared/components/Abas/Abas";
import Botao from "@/shared/components/Botao/Botao";
import {
  EstadoVazio,
  EstadoErro,
  EstadoCarregando,
} from "@/shared/components/Estado/Estado";
import { useVendas } from "../hooks/useVendas";
import HistoricoVendasView from "../components/HistoricoVendasView";
import ResumoVenda from "../components/ResumoVenda";
import styles from "./Vendas.module.css";

const TABS = [
  { to: "/registro-vendas", label: "Registro de vendas", end: true },
  { to: "/registro-vendas/historico", label: "Histórico de vendas" },
];

export default function HistoricoVendasPage() {
  const {
    event,
    eventLoading,
    eventError,
    refetchEvent,
    createSale,
    confirmSale,
    subtitle,
  } = useVendas();

  return (
    <div className={styles.page}>
      <PageHeader subtitle={subtitle} />

      {eventLoading ? (
        <EstadoCarregando message="Carregando evento em andamento..." />
      ) : eventError ? (
        <EstadoErro
          message="Não foi possível carregar o evento em andamento."
          onRetry={refetchEvent}
        />
      ) : !event ? (
        <div className={styles.noEvent}>
          <Abas items={TABS} label="Seções do registro de venda" />
          <EstadoVazio
            title="Nenhum evento em andamento."
            description="Inicie um evento para consultar o histórico de vendas do PDV."
            icon="calendar"
            action={
              <Botao as={Link} to="/eventos">
                Ir para eventos
              </Botao>
            }
          />
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.main}>
            <Abas items={TABS} label="Seções do registro de venda" />
            <HistoricoVendasView eventId={event.id} pageSize={8} />
          </div>
          <ResumoVenda
            onConfirm={confirmSale}
            confirming={createSale.isPending}
          />
        </div>
      )}
    </div>
  );
}
