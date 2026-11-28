import type { Evento } from "@/features/eventos";
import { modoDemoAtivo } from "@/shared/api/cliente";
import Card, { SecaoCard } from "@/shared/components/Card/Card";
import { EstadoCarregando, EstadoErro, EstadoVazio } from "@/shared/components/Estado/Estado";
import Icone from "@/shared/components/Icone/Icone";
import { PERMISSOES, temPermissao } from "@/shared/permissoes/permissoes";
import { usePermissoes } from "@/shared/permissoes/usePermissoes";
import ClimaVendasGrafico from "../components/ClimaVendasGrafico";
import { useClimaVendas } from "../hooks/useClimaVendas";
import styles from "./ClimaVendas.module.css";

interface ClimaVendasProps {
  evento: Evento;
}

const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

function valorComUnidade(valor: number, unidade: string): string {
  return Number.isFinite(valor) ? `${numero.format(valor)} ${unidade}` : "—";
}

function ConteudoClimaVendas({ evento }: ClimaVendasProps) {
  const { climaQuery, vendasQuery, pontos } = useClimaVendas(evento);
  const dados = climaQuery.data;

  return (
    <SecaoCard id="clima-vendas" title="Clima x Vendas"
      subtitle="Comparação entre previsão do clima e vendas por hora"
      className={styles.section} bodyClassName={styles.body}>
      {climaQuery.isError ? (
        <EstadoErro message="Não foi possível carregar o clima do evento." />
      ) : !dados ? (
        <EstadoCarregando message="Carregando clima do evento..." />
      ) : !dados.itens.length ? (
        <EstadoVazio title="Ainda não há dados climáticos para este evento." icon="cloud-rain" />
      ) : (
        <>
          {vendasQuery.isError ? (
            <EstadoErro message="Não foi possível carregar as vendas para comparar com o clima." />
          ) : pontos ? (
            <ClimaVendasGrafico pontos={pontos} />
          ) : (
            <EstadoCarregando message="Carregando vendas por hora..." />
          )}
          <div className={styles.summary} role="group" aria-label="Resumo climático do evento">
            {[
              { rotulo: "Temperatura média", valor: dados.resumo.temperaturaMedia, unidade: "°C", icone: "thermometer" },
              { rotulo: "Temperatura mínima", valor: dados.resumo.temperaturaMinima, unidade: "°C", icone: "thermometer" },
              { rotulo: "Temperatura máxima", valor: dados.resumo.temperaturaMaxima, unidade: "°C", icone: "thermometer" },
              { rotulo: "Chuva acumulada", valor: dados.resumo.chuvaAcumulada, unidade: "mm", icone: "cloud-rain" },
              { rotulo: "Vento máximo", valor: dados.resumo.ventoMaximo, unidade: "km/h", icone: "wind" },
            ].map((indicador) => (
              <Card key={indicador.rotulo} as="div" className={styles.summaryCard}>
                <Icone name={indicador.icone} size={22} className={styles.weatherIcon} />
                <dl>
                  <dt>{indicador.rotulo}</dt>
                  <dd>{valorComUnidade(indicador.valor, indicador.unidade)}</dd>
                </dl>
              </Card>
            ))}
          </div>
          <p className={styles.note}>
            <Icone name="info" size={16} />
            <span>{modoDemoAtivo ? "Dados demonstrativos. " : ""}
              Valores de previsão do clima para o período do evento.</span>
          </p>
        </>
      )}
    </SecaoCard>
  );
}

export default function ClimaVendas({ evento }: ClimaVendasProps) {
  const permissoes = usePermissoes();
  if (evento.tipoEvento !== "EVENTO" || !temPermissao(permissoes, PERMISSOES.relatoriosMenu)) {
    return null;
  }

  return <ConteudoClimaVendas evento={evento} />;
}
