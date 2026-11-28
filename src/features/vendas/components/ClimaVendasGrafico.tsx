import { useEffect, useId, useRef, useState } from "react";
import { formatarNumero } from "@/shared/lib/formatacao";
import {
  criarEscalasClimaVendas,
  criarLinhaTemperatura,
  FUSO_HORARIO_CLIMA,
  type PontoClimaVendas,
} from "../domain/climaVendas";
import styles from "./ClimaVendasGrafico.module.css";

const ALTURA = 220;
const MARGEM = 36;
const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const hora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO_HORARIO_CLIMA, hour: "2-digit", hourCycle: "h23",
});
const data = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO_HORARIO_CLIMA, day: "2-digit", month: "2-digit",
});
const dataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO_HORARIO_CLIMA, day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

function medida(valor: number | undefined, unidade: string): string {
  return valor !== undefined && Number.isFinite(valor)
    ? `${numero.format(valor)} ${unidade}`
    : "Indisponível";
}

interface ClimaVendasGraficoProps {
  pontos: readonly PontoClimaVendas[];
}

export default function ClimaVendasGrafico({ pontos }: ClimaVendasGraficoProps) {
  const identificador = useId();
  const recipiente = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(800);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  useEffect(() => {
    const elemento = recipiente.current;
    if (!elemento) return;
    const observador = new ResizeObserver(([entrada]) => {
      setLargura(Math.max(260, Math.floor(entrada.contentRect.width)));
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  const larguraGrafico = Math.max(largura, pontos.length * 28 + MARGEM * 2);
  const larguraUtil = larguraGrafico - MARGEM * 2;
  const passo = larguraUtil / Math.max(1, pontos.length);
  const escala = criarEscalasClimaVendas(pontos);
  const amplitude = escala.temperaturaMaxima - escala.temperaturaMinima;
  const pontoSelecionado = pontos.find((ponto) => ponto.dataHora === selecionado);
  const temperaturaY = (temperatura: number) =>
    ALTURA - ((temperatura - escala.temperaturaMinima) / amplitude) * ALTURA;

  return (
    <div className={styles.stack}>
      <figure className={styles.figure}>
        <figcaption className={styles.legend}>
          <span><i className={styles.salesSample} aria-hidden="true" />Vendas por hora</span>
          <span><i className={styles.temperatureSample} aria-hidden="true" />Temperatura prevista (°C)</span>
        </figcaption>
        <div className={styles.axisNames} aria-hidden="true">
          <span>Vendas</span><span>Temperatura (°C)</span>
        </div>
        <div ref={recipiente} className={styles.scroll} tabIndex={0}
          role="region" aria-label="Gráfico de clima e vendas por hora">
          <svg width={larguraGrafico} height={300} viewBox={`0 0 ${larguraGrafico} 300`}
            role="group" aria-labelledby={`${identificador}-titulo ${identificador}-descricao`}>
            <title id={`${identificador}-titulo`}>Vendas por hora e temperatura prevista</title>
            <desc id={`${identificador}-descricao`}>
              Barras representam vendas e a linha representa temperatura. Selecione um horário
              para consultar os detalhes. Horários no fuso de Brasília.
            </desc>
            <g transform={`translate(${MARGEM},16)`}>
              {[0, 1, 2, 3, 4].map((indice) => {
                const y = ALTURA - (indice / 4) * ALTURA;
                return (
                  <g key={indice} className={styles.axis} aria-hidden="true">
                    <line x1={0} x2={larguraUtil} y1={y} y2={y} />
                    <text x={-10} y={y + 4} textAnchor="end">
                      {formatarNumero((indice / 4) * escala.maximoVendas)}
                    </text>
                    <text x={larguraUtil + 10} y={y + 4} textAnchor="start">
                      {numero.format(escala.temperaturaMinima + (indice / 4) * amplitude)}
                    </text>
                  </g>
                );
              })}
              {pontos.map((ponto, indice) => {
                const instante = new Date(ponto.dataHora);
                const dia = data.format(instante);
                const mudouDia = indice === 0 || data.format(new Date(pontos[indice - 1].dataHora)) !== dia;
                const x = (indice + 0.5) * passo;
                const alturaBarra = (ponto.quantidadeVendas / escala.maximoVendas) * ALTURA;
                const ativo = selecionado === ponto.dataHora;
                const descricao = `${dataHora.format(instante)}: ${formatarNumero(ponto.quantidadeVendas)} vendas, `
                  + `temperatura ${medida(ponto.clima?.temperatura, "°C")}.`;
                return (
                  <g key={ponto.dataHora} className={styles.hour} role="button" tabIndex={0}
                    aria-label={descricao} aria-pressed={ativo}
                    onPointerEnter={() => setSelecionado(ponto.dataHora)}
                    onFocus={() => setSelecionado(ponto.dataHora)}
                    onClick={() => setSelecionado(ponto.dataHora)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelecionado(ponto.dataHora);
                      }
                    }}>
                    <rect className={styles.hitArea} x={indice * passo + 1} y={0}
                      width={Math.max(1, passo - 2)} height={ALTURA}
                      data-selected={ativo || undefined} />
                    <rect className={styles.salesBar} x={x - Math.min(42, passo * 0.44) / 2}
                      y={ALTURA - alturaBarra} width={Math.min(42, passo * 0.44)}
                      height={alturaBarra} rx={3} />
                    <text className={styles.hourLabel} x={x} y={ALTURA + 23} textAnchor="middle">
                      {hora.format(instante)}h
                    </text>
                    {mudouDia ? (
                      <text className={styles.dateLabel} x={x} y={ALTURA + 44} textAnchor="middle">
                        {dia}
                      </text>
                    ) : null}
                  </g>
                );
              })}
              <path d={criarLinhaTemperatura(pontos, larguraUtil, ALTURA)}
                className={styles.temperatureLine} aria-hidden="true" />
              {pontos.map((ponto, indice) => {
                const temperatura = ponto.clima?.temperatura;
                return temperatura !== undefined && Number.isFinite(temperatura) ? (
                  <circle key={ponto.dataHora} cx={(indice + 0.5) * passo}
                    cy={temperaturaY(temperatura)} r={4}
                    className={styles.temperaturePoint} aria-hidden="true" />
                ) : null;
              })}
            </g>
          </svg>
        </div>
      </figure>
      <p className={styles.help}>Horário de Brasília · Selecione um horário para ver os detalhes.</p>
      {pontoSelecionado ? (
        <section className={styles.details} aria-label="Detalhes do horário selecionado" aria-live="polite">
          <h3>{dataHora.format(new Date(pontoSelecionado.dataHora))}
            {pontoSelecionado.clima ? ` · ${pontoSelecionado.clima.descricaoClima}` : " · Clima indisponível"}
          </h3>
          <dl className={styles.detailsGrid}>
            {[
              ["Vendas", formatarNumero(pontoSelecionado.quantidadeVendas)],
              ["Temperatura", medida(pontoSelecionado.clima?.temperatura, "°C")],
              ["Sensação térmica", medida(pontoSelecionado.clima?.sensacaoTermica, "°C")],
              ["Chuva prevista", medida(pontoSelecionado.clima?.chuvaMm, "mm")],
              ["Prob. de chuva", medida(pontoSelecionado.clima?.probabilidadeChuva, "%")],
              ["Vento", medida(pontoSelecionado.clima?.ventoVelocidade, "km/h")],
            ].map(([rotulo, valor]) => (
              <div key={rotulo}><dt>{rotulo}</dt><dd>{valor}</dd></div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}
