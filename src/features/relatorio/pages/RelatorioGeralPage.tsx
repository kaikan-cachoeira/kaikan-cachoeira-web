import { useState } from "react";
import { Link } from "react-router-dom";
import { varianteStatus } from "@/features/eventos";
import Botao from "@/shared/components/Botao/Botao";
import {
  EstatisticaCard,
  SecaoCard,
} from "@/shared/components/Card/Card";
import {
  EstadoCarregando,
  EstadoErro,
  EstadoVazio,
} from "@/shared/components/Estado/Estado";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import Entrada from "@/shared/components/Formulario/Entrada";
import SelecaoMultipla from "@/shared/components/Formulario/SelecaoMultipla";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import { PERMISSOES, temPermissao } from "@/shared/permissoes/permissoes";
import { usePermissoes } from "@/shared/permissoes/usePermissoes";
import {
  Cabecalho,
  Celula,
  CelulaCabecalho,
  Corpo,
  Linha,
  Tabela,
} from "@/shared/components/Tabela/Tabela";
import {
  formatarData,
  formatarMoeda,
  formatarNumero,
} from "@/shared/lib/formatacao";
import { useRelatorio } from "../hooks";
import styles from "./RelatorioGeralPage.module.css";

const TYPE_OPTIONS = [
  { value: "Evento", label: "Evento" },
  { value: "Reunião", label: "Reunião" },
];

function periodoLabel(from: string, to: string) {
  const formatDateInput = (value: string) =>
    formatarData(value ? `${value}T12:00:00` : value);
  if (!from && !to) return "Todos os períodos";
  if (from && to) return `${formatDateInput(from)} a ${formatDateInput(to)}`;
  return from
    ? `A partir de ${formatDateInput(from)}`
    : `Até ${formatDateInput(to)}`;
}

export default function RelatorioGeralPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const permissoes = usePermissoes();
  const podeVerEstoque = temPermissao(permissoes, PERMISSOES.estoqueMenu);
  const podeVerDoacoes = temPermissao(permissoes, PERMISSOES.doacoesMenu);
  const {
    relatorioGeralQuery,
    produtosQuery,
    estoqueBaixoQuery,
    semEstoqueQuery,
    fiadosQuery,
    donationsQuery,
  } = useRelatorio({ from, to, types });

  const report = relatorioGeralQuery.data;
  const events = report?.itens || [];
  const totals = {
    revenue: report?.receitaTotal ?? 0,
    costs: report?.custosTotais ?? 0,
    profit: report?.lucroTotal ?? 0,
    sales: report?.quantidadeVendas ?? 0,
  };
  const totalRegistros =
    (report?.quantidadeEventos || 0) + (report?.quantidadeReunioes || 0);

  const chartEvents = [...events]
    .sort((a, b) => Date.parse(a.dataHoraInicio) - Date.parse(b.dataHoraInicio))
    .slice(-12);
  const chartMax = Math.max(
    1,
    ...chartEvents.flatMap((event) => [
      event.receitaTotal,
      event.custoTotal,
    ]),
  );
  const donations = donationsQuery.data?.items || [];
  const ticketValue = donations.reduce(
    (sum, donation) => sum + Number(donation.valorFicha || 0),
    0,
  );
  const hasFilters = Boolean(from || to || types.length);

  const textoEstoqueBaixo = estoqueBaixoQuery.data
    ? `${formatarNumero(estoqueBaixoQuery.data)} ${
        estoqueBaixoQuery.data === 1 ? "produto" : "produtos"
      } com estoque baixo`
    : "Nenhum produto com estoque baixo";
  const textoSemEstoque = semEstoqueQuery.data
    ? `${formatarNumero(semEstoqueQuery.data)} ${
        semEstoqueQuery.data === 1 ? "produto" : "produtos"
      } sem estoque`
    : "Nenhum produto sem estoque";

  function clearFilters() {
    setFrom("");
    setTo("");
    setTypes([]);
  }

  return (
    <div className={styles.stack}>
      <PageHeader subtitle="Indicadores consolidados e comparativo dos eventos e reuniões" />

      <section className={styles.filters} aria-label="Filtros do relatório">
        <Entrada
          id="relatorio-de"
          label="Período: de"
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
        />
        <Entrada
          id="relatorio-ate"
          label="até"
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
        />
        <SelecaoMultipla
          label="Tipo do evento"
          options={TYPE_OPTIONS}
          value={types}
          onChange={setTypes}
          placeholder="Todos"
        />
        <Botao variant="secondary" onClick={clearFilters}>
          Limpar filtros
        </Botao>
      </section>

      {relatorioGeralQuery.isLoading ? (
        <EstadoCarregando message="Carregando relatório geral..." />
      ) : relatorioGeralQuery.isError ? (
        <EstadoErro
          message="Não foi possível carregar o relatório geral."
          onRetry={relatorioGeralQuery.refetch}
        />
      ) : events.length === 0 ? (
        <EstadoVazio
          title="Nenhum registro encontrado neste período."
          description="Ajuste os filtros ou consulte todos os períodos."
          icon="chart"
          action={
            hasFilters ? (
              <Botao variant="secondary" onClick={clearFilters}>
                Limpar filtros
              </Botao>
            ) : null
          }
        />
      ) : (
        <>
          <section className={styles.statsGrid} aria-label="Resumo consolidado">
            <EstatisticaCard
              label="Receita"
              value={formatarMoeda(totals.revenue)}
            />
            <EstatisticaCard label="Custos" value={formatarMoeda(totals.costs)} />
            <EstatisticaCard
              label="Lucro"
              value={formatarMoeda(totals.profit)}
              variant={totals.profit >= 0 ? "success" : "danger"}
            />
            <EstatisticaCard
              label="Vendas"
              value={formatarNumero(totals.sales)}
            />
            <p className={styles.periodSummary}>
              {formatarNumero(totalRegistros)}{" "}
              {totalRegistros === 1 ? "registro" : "registros"} ·{" "}
              {periodoLabel(from, to)}
            </p>
          </section>

          <SecaoCard title="Receita e custos por evento ou reunião">
            <div
              className={styles.chartScroll}
              role="img"
              aria-label={`Receita e custos de ${chartEvents.length} registros. Receita total ${formatarMoeda(totals.revenue)} e custos totais ${formatarMoeda(totals.costs)}.`}
            >
              <div className={styles.chart}>
                {chartEvents.map((event) => {
                  const revenue = event.receitaTotal;
                  const costs = event.custoTotal;
                  const profit = event.lucro;
                  return (
                    <div className={styles.chartEvent} key={event.eventoId}>
                      <div className={styles.bars}>
                        <span
                          className={`${styles.bar} ${styles.revenueBar}`}
                          style={{
                            height: revenue
                              ? `${Math.max(2, (revenue / chartMax) * 100)}%`
                              : "0%",
                          }}
                          title={`Receita: ${formatarMoeda(revenue)}`}
                        />
                        <span
                          className={`${styles.bar} ${styles.costBar}`}
                          style={{
                            height: costs
                              ? `${Math.max(2, (costs / chartMax) * 100)}%`
                              : "0%",
                          }}
                          title={`Custos: ${formatarMoeda(costs)}`}
                        />
                      </div>
                      <span className={styles.chartName} title={event.nome}>
                        {event.nome}
                      </span>
                      <span
                        className={
                          profit >= 0 ? styles.positive : styles.negative
                        }
                      >
                        {formatarMoeda(profit)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={styles.legend} aria-hidden="true">
              <span><i className={styles.revenueKey} />Receita</span>
              <span><i className={styles.costKey} />Custos</span>
            </div>
          </SecaoCard>

          <SecaoCard title="Comparativo de eventos e reuniões">
            <Tabela caption="Comparativo consolidado dos eventos e reuniões">
              <Cabecalho>
                <Linha>
                  <CelulaCabecalho>Registro</CelulaCabecalho>
                  <CelulaCabecalho>Data</CelulaCabecalho>
                  <CelulaCabecalho numeric>Vendas</CelulaCabecalho>
                  <CelulaCabecalho numeric>Receita</CelulaCabecalho>
                  <CelulaCabecalho numeric>Custos</CelulaCabecalho>
                  <CelulaCabecalho numeric>Lucro</CelulaCabecalho>
                  <CelulaCabecalho>Ação</CelulaCabecalho>
                </Linha>
              </Cabecalho>
              <Corpo>
                {[...events]
                  .sort((a, b) => Date.parse(b.dataHoraInicio) - Date.parse(a.dataHoraInicio))
                  .map((event) => (
                    <Linha key={event.eventoId}>
                      <Celula>
                        <div className={styles.eventCell}>
                          <span className={styles.eventName}>{event.nome}</span>
                          <Etiqueta variant={varianteStatus(event.status.codigo)}>
                            {event.status.descricao}
                          </Etiqueta>
                        </div>
                      </Celula>
                      <Celula>{formatarData(event.dataHoraInicio)}</Celula>
                      <Celula numeric>
                        {formatarNumero(event.quantidadeVendas)}
                      </Celula>
                      <Celula numeric>
                        {formatarMoeda(event.receitaTotal)}
                      </Celula>
                      <Celula numeric>
                        {formatarMoeda(event.custoTotal)}
                      </Celula>
                      <Celula numeric>
                        <span
                          className={
                            event.lucro >= 0
                              ? styles.positive
                              : styles.negative
                          }
                        >
                          {formatarMoeda(event.lucro)}
                        </span>
                      </Celula>
                      <Celula>
                        <Botao
                          as={Link}
                          to={`/eventos/${event.eventoId}`}
                          variant="tertiary"
                          size="compact"
                        >
                          Ver relatório
                        </Botao>
                      </Celula>
                    </Linha>
                  ))}
              </Corpo>
            </Tabela>
          </SecaoCard>

          <div className={styles.insightsGrid}>
            <SecaoCard
              title="Produtos mais vendidos"
              subtitle="No período e tipos de evento selecionados"
            >
              {produtosQuery.isLoading ? (
                <EstadoCarregando message="Carregando produtos..." />
              ) : produtosQuery.isError ? (
                <EstadoErro
                  message="Não foi possível carregar os produtos mais vendidos."
                  onRetry={produtosQuery.refetch}
                />
              ) : produtosQuery.data?.items.length ? (
                <ol className={styles.productList}>
                  {produtosQuery.data.items.map((product, index) => (
                    <li className={styles.productItem} key={product.name}>
                      <span className={styles.rank}>{index + 1}</span>
                      <div className={styles.productDetails}>
                        <span className={styles.productName}>{product.name}</span>
                        <span className={styles.productMeta}>
                          {formatarNumero(product.sold)} unidades ·{" "}
                          {formatarMoeda(product.revenue)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.emptyText}>
                  Nenhum produto vendido neste período.
                </p>
              )}
            </SecaoCard>

            <div className={styles.rightColumn}>
              <SecaoCard
                title="Atenção"
                subtitle="Situação atual do estoque e dos fiados; não depende dos filtros do relatório."
              >
                <div className={styles.alertList}>
                  {estoqueBaixoQuery.isLoading ? (
                    <EstadoCarregando message="Consultando estoque baixo..." />
                  ) : estoqueBaixoQuery.isError ? (
                    <EstadoErro
                      message="Não foi possível consultar o estoque baixo."
                      onRetry={estoqueBaixoQuery.refetch}
                    />
                  ) : podeVerEstoque ? (
                    <Link className={styles.alertLink} to="/estoque">
                      {textoEstoqueBaixo}
                    </Link>
                  ) : (
                    <span className={styles.alertText}>
                      {textoEstoqueBaixo}
                    </span>
                  )}
                  {semEstoqueQuery.isLoading ? (
                    <EstadoCarregando message="Consultando produtos sem estoque..." />
                  ) : semEstoqueQuery.isError ? (
                    <EstadoErro
                      message="Não foi possível consultar os produtos sem estoque."
                      onRetry={semEstoqueQuery.refetch}
                    />
                  ) : podeVerEstoque ? (
                    <Link className={styles.alertLink} to="/estoque">
                      {textoSemEstoque}
                    </Link>
                  ) : (
                    <span className={styles.alertText}>
                      {textoSemEstoque}
                    </span>
                  )}
                  {fiadosQuery.isLoading ? (
                    <EstadoCarregando message="Consultando fiados..." />
                  ) : fiadosQuery.isError ? (
                    <EstadoErro
                      message="Não foi possível consultar os fiados em aberto."
                      onRetry={fiadosQuery.refetch}
                    />
                  ) : (
                    <Link
                      className={styles.alertLink}
                      to="/relatorio-geral/fiados"
                    >
                      Fiados em aberto:{" "}
                      {formatarMoeda(fiadosQuery.data?.openAmount)} (
                      {formatarNumero(fiadosQuery.data?.pendingCount)}{" "}
                      {fiadosQuery.data?.pendingCount === 1 ? "fiado" : "fiados"}
                      )
                    </Link>
                  )}
                </div>
              </SecaoCard>

              <SecaoCard
                title="Doações"
                subtitle="Doações dos eventos no período selecionado"
                action={
                  podeVerDoacoes ? (
                    <Botao
                      as={Link}
                      to="/doacoes"
                      variant="tertiary"
                      size="compact"
                    >
                      Ver todas
                    </Botao>
                  ) : undefined
                }
              >
                {donationsQuery.isLoading ? (
                  <EstadoCarregando message="Carregando doações..." />
                ) : donationsQuery.isError ? (
                  <EstadoErro
                    message="Não foi possível carregar as doações."
                    onRetry={donationsQuery.refetch}
                  />
                ) : (
                  <div className={styles.donationStats}>
                    <p>
                      {formatarNumero(donationsQuery.data?.total || 0)}{" "}
                      {donationsQuery.data?.total === 1
                        ? "doação"
                        : "doações"}
                    </p>
                    <p>
                      {formatarMoeda(ticketValue)} em fichas de agradecimento
                    </p>
                  </div>
                )}
              </SecaoCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
