import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import Botao from "@/shared/components/Botao/Botao";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import Icone from "@/shared/components/Icone/Icone";
import { SecaoCard, EstatisticaCard } from "@/shared/components/Card/Card";
import {
  Tabela,
  Cabecalho,
  Corpo,
  Linha,
  CelulaCabecalho,
  Celula,
} from "@/shared/components/Tabela/Tabela";
import ConfirmacaoDialog from "@/shared/components/ConfirmacaoDialog/ConfirmacaoDialog";
import {
  EstadoErro,
  EstadoCarregando,
} from "@/shared/components/Estado/Estado";
import { useEventoDetalhes } from "../hooks/useEventoDetalhes";
import { obterConfirmacaoStatus } from "../utils/confirmacaoStatus";
import {
  formatarDataHora,
  formatarMoeda,
  formatarNumero,
  formatarPeriodo,
} from "@/shared/lib/formatacao";
import { rotuloTipoDoacao } from "@/shared/lib/tiposDoacao";
import type {
  CustoAdicionalRelatorio,
  ItemCardapio,
  MovimentacaoRelatorio,
  OrigemProdutoEvento,
  ProdutoRelatorio,
  VendasPorHoraRelatorio,
} from "../models";
import {
  rotuloTipoEvento,
  varianteStatus,
} from "../utils/statusEvento";
import CustoModal from "../components/CustoModal";
import AdicionarProdutoCardapioModal from "../components/AdicionarProdutoCardapioModal";
import styles from "./EventoDetalhesPage.module.css";

function InlineEmpty({ children }: { children: ReactNode }) {
  return <p className={styles.inlineEmpty}>{children}</p>;
}

function rotuloOrigem(origem: OrigemProdutoEvento): string {
  return origem === "PRODUZIDO" ? "Produzido" : "Estoque";
}

function TabelaProdutosRelatorio({
  produtos,
}: {
  produtos: ProdutoRelatorio[];
}) {
  return (
    <Tabela caption="Produtos e desempenho do evento">
      <Cabecalho>
        <Linha>
          <CelulaCabecalho>Produto</CelulaCabecalho>
          <CelulaCabecalho numeric>Previsto</CelulaCabecalho>
          <CelulaCabecalho numeric>Vendido</CelulaCabecalho>
          <CelulaCabecalho numeric>Preço vendido</CelulaCabecalho>
          <CelulaCabecalho numeric>Receita</CelulaCabecalho>
          <CelulaCabecalho numeric>Custo total</CelulaCabecalho>
          <CelulaCabecalho numeric>Descontos</CelulaCabecalho>
          <CelulaCabecalho numeric>Lucro líquido</CelulaCabecalho>
        </Linha>
      </Cabecalho>
      <Corpo>
        {produtos.map((item) => (
          <Linha key={item.produtoEventoId}>
            <Celula>
              <span className={styles.productName}>{item.nome}</span>
              <span className={styles.produced}>
                · {rotuloOrigem(item.origem).toLowerCase()}
              </span>
            </Celula>
            <Celula numeric>
              {item.quantidadePrevista === null ||
              item.quantidadePrevista === undefined
                ? "—"
                : formatarNumero(item.quantidadePrevista)}
            </Celula>
            <Celula numeric>{formatarNumero(item.quantidadeVendida)}</Celula>
            <Celula numeric>{formatarMoeda(item.precoVendido)}</Celula>
            <Celula numeric>{formatarMoeda(item.receitaVendas)}</Celula>
            <Celula numeric>{formatarMoeda(item.custoTotal)}</Celula>
            <Celula numeric>{formatarMoeda(item.totalDescontos)}</Celula>
            <Celula numeric>
              <span
                className={
                  item.lucroLiquido >= 0 ? styles.positive : styles.negative
                }
              >
                {formatarMoeda(item.lucroLiquido)}
              </span>
            </Celula>
          </Linha>
        ))}
      </Corpo>
    </Tabela>
  );
}

function TabelaProdutosPrevistos({
  produtos,
}: {
  produtos: ItemCardapio[];
}) {
  return (
    <Tabela caption="Cardápio previsto do evento">
      <Cabecalho>
        <Linha>
          <CelulaCabecalho>Produto</CelulaCabecalho>
          <CelulaCabecalho>Origem</CelulaCabecalho>
          <CelulaCabecalho numeric>Previsto</CelulaCabecalho>
          <CelulaCabecalho numeric>Restante</CelulaCabecalho>
          <CelulaCabecalho numeric>Preço de venda</CelulaCabecalho>
          <CelulaCabecalho numeric>Desconto</CelulaCabecalho>
          <CelulaCabecalho numeric>Custo ingredientes</CelulaCabecalho>
        </Linha>
      </Cabecalho>
      <Corpo>
        {produtos.map((item) => (
          <Linha key={item.id}>
            <Celula>
              <span className={styles.productName}>{item.nome}</span>
            </Celula>
            <Celula>{rotuloOrigem(item.origem)}</Celula>
            <Celula numeric>
              {item.quantidadePrevista === null ||
              item.quantidadePrevista === undefined
                ? "—"
                : formatarNumero(item.quantidadePrevista)}
            </Celula>
            <Celula numeric>
              {item.restantePrevisto === null ||
              item.restantePrevisto === undefined
                ? "—"
                : formatarNumero(item.restantePrevisto)}
            </Celula>
            <Celula numeric>{formatarMoeda(item.precoComDesconto)}</Celula>
            <Celula numeric>{formatarMoeda(item.desconto)}</Celula>
            <Celula numeric>
              {item.custoTotalIngredientes === null ||
              item.custoTotalIngredientes === undefined
                ? "—"
                : formatarMoeda(item.custoTotalIngredientes)}
            </Celula>
          </Linha>
        ))}
      </Corpo>
    </Tabela>
  );
}

function ListaCustos({ custos }: { custos: CustoAdicionalRelatorio[] }) {
  if (!custos.length) {
    return <InlineEmpty>Nenhum custo adicional registrado.</InlineEmpty>;
  }

  return (
    <ul className={styles.costList}>
      {custos.map((custo, index) => (
        <li key={`${custo.nome}-${index}`}>
          <span>
            <strong>{custo.nome}</strong>
            {custo.descricao ? <small>{custo.descricao}</small> : null}
          </span>
          <span>{formatarMoeda(custo.valor)}</span>
        </li>
      ))}
    </ul>
  );
}

function TabelaMovimentacoes({
  movimentacoes,
}: {
  movimentacoes: MovimentacaoRelatorio[];
}) {
  return (
    <Tabela caption="Movimentações da reunião">
      <Cabecalho>
        <Linha>
          <CelulaCabecalho>Produto</CelulaCabecalho>
          <CelulaCabecalho numeric>Quantidade</CelulaCabecalho>
          <CelulaCabecalho numeric>Custo unitário</CelulaCabecalho>
          <CelulaCabecalho numeric>Custo total</CelulaCabecalho>
          <CelulaCabecalho>Observações</CelulaCabecalho>
          <CelulaCabecalho>Data</CelulaCabecalho>
        </Linha>
      </Cabecalho>
      <Corpo>
        {movimentacoes.map((item) => (
          <Linha key={item.id}>
            <Celula>{item.produtoNome}</Celula>
            <Celula numeric>{formatarNumero(item.quantidade)}</Celula>
            <Celula numeric>{formatarMoeda(item.custoUnitario)}</Celula>
            <Celula numeric>{formatarMoeda(item.custoTotal)}</Celula>
            <Celula>{item.observacoes || "—"}</Celula>
            <Celula>{formatarDataHora(item.criadoEm)}</Celula>
          </Linha>
        ))}
      </Corpo>
    </Tabela>
  );
}

function VendasPorHoraChart({ data }: { data: VendasPorHoraRelatorio }) {
  if (!data.ranking.length) {
    return <InlineEmpty>Nenhuma venda registrada.</InlineEmpty>;
  }

  const maiorQuantidade = Math.max(
    1,
    ...data.ranking.map((item) => item.quantidadeVendas),
  );

  return (
    <div className={styles.chart}>
      <div className={styles.chartBars}>
        {data.ranking.map((item) => (
          <div className={styles.chartColumn} key={item.hora}>
            <span className={styles.chartValue}>
              {formatarNumero(item.quantidadeVendas)}
            </span>
            <div className={styles.chartTrack}>
              <span
                className={styles.chartBar}
                style={{
                  height: `${(item.quantidadeVendas / maiorQuantidade) * 100}%`,
                }}
              />
            </div>
            <span className={styles.chartLabel}>
              {String(item.hora).padStart(2, "0")}h
            </span>
          </div>
        ))}
      </div>
      <p className={styles.chartLegend}>
        Quantidade de vendas · Total:{" "}
        {formatarNumero(data.quantidadeVendasTotais)}{" "}
        {data.quantidadeVendasTotais === 1 ? "venda" : "vendas"}
      </p>
    </div>
  );
}

export default function EventoDetalhesPage() {
  const { id: paramId } = useParams();
  const id = Number(paramId);
  const idValido = Number.isFinite(id) && id > 0;

  const {
    costOpen,
    setCostOpen,
    addProductOpen,
    setAddProductOpen,
    startConfirm,
    setStartConfirm,
    closeConfirm,
    setCloseConfirm,
    eventoQuery,
    relatorioQuery,
    produtosQuery,
    alterarStatus: changeStatus,
    confirmStart,
    closeEvent,
  } = useEventoDetalhes(idValido ? id : null);

  const { data: event, isLoading, isError, refetch } = eventoQuery;

  if (!idValido) {
    return <EstadoErro message="Evento inválido." />;
  }

  if (isLoading) {
    return <EstadoCarregando message="Carregando evento..." />;
  }

  if (isError || !event) {
    return (
      <EstadoErro
        message="Não foi possível carregar o evento."
        onRetry={refetch}
      />
    );
  }

  const isReuniao = event.tipoEvento === "REUNIAO";
  const isNotStarted = event.status.codigo === "NAO_INICIADO";
  const isOngoing = event.status.codigo === "EM_ANDAMENTO";
  const startConfirmation = obterConfirmacaoStatus(event, "EM_ANDAMENTO");

  const relatorio = isNotStarted ? undefined : relatorioQuery.data;
  const relatorioEvento =
    relatorio?.tipoEvento === "EVENTO" ? relatorio : undefined;
  const relatorioReuniao =
    relatorio?.tipoEvento === "REUNIAO" ? relatorio : undefined;

  const resumoEvento = relatorioEvento?.resumo;
  const resumoReuniao = relatorioReuniao?.resumo;
  const metrics = {
    revenue: resumoEvento?.receitaTotal ?? 0,
    costs: resumoEvento?.custoTotal ?? 0,
    profit: resumoEvento?.lucro ?? 0,
    sales: resumoEvento?.vendas ?? 0,
  };

  const custos =
    relatorioEvento?.custosAdicionais ??
    relatorioReuniao?.custosAdicionais ??
    [];
  const produtosRelatorio = relatorioEvento?.produtos ?? [];
  const produtosPrevistos = produtosQuery.data ?? [];
  const topProducts = relatorioEvento?.produtosMaisVendidos.ranking ?? [];
  const topMax = topProducts[0]?.quantidadeVendida || 1;
  const doacoes = relatorioEvento?.doacoes;
  const movimentacoes = relatorioReuniao?.itens ?? [];

  const doacoesItens = doacoes?.itens ?? [];
  const doacoesDinheiro = doacoes?.emDinheiro ?? [];
  const totalDoacoes = doacoesItens.length + doacoesDinheiro.length;

  const relatorioCarregando = !isNotStarted && relatorioQuery.isLoading;
  const relatorioIndisponivel = !isNotStarted && relatorioQuery.isError;

  return (
    <div className={styles.stack}>
      <Link to="/eventos" className={styles.backLink}>
        <Icone name="arrow-left" size={18} />
        Voltar para eventos
      </Link>

      <PageHeader
        title={
          <span className={styles.titleRow}>
            {event.nome}
            <Etiqueta variant={varianteStatus(event.status.codigo)} dot>
              {event.status.descricao}
            </Etiqueta>
          </span>
        }
        subtitle={`${rotuloTipoEvento(event.tipoEvento)} · ${formatarPeriodo(
          event.dataHoraInicio,
          event.dataHoraEncerramento,
        )}`}
        actions={
          <>
            {isNotStarted && !isReuniao ? (
              <Botao
                variant="secondary"
                iconLeft="plus"
                onClick={() => setAddProductOpen(true)}
              >
                Adicionar produto
              </Botao>
            ) : null}
            {isNotStarted || isOngoing ? (
              <Botao
                variant="secondary"
                iconLeft="cash"
                onClick={() => setCostOpen(true)}
              >
                Registrar custo
              </Botao>
            ) : null}
            {isNotStarted ? (
              <Botao
                loading={changeStatus.isPending}
                onClick={() => setStartConfirm(true)}
              >
                Iniciar evento
              </Botao>
            ) : null}
            {isOngoing ? (
              <Botao
                variant="danger"
                loading={changeStatus.isPending}
                onClick={() => setCloseConfirm(true)}
              >
                Encerrar evento
              </Botao>
            ) : null}
          </>
        }
      >
        <div className={styles.notes}>
          <span className={styles.notesLabel}>Observações</span>
          <p>{event.observacoes || "Nenhuma observação registrada."}</p>
        </div>
      </PageHeader>

      {isReuniao ? (
        <section
          className={styles.statsGrid}
          aria-label="Indicadores da reunião"
        >
          <EstatisticaCard
            label="Custo de compras"
            value={formatarMoeda(resumoReuniao?.custoCompras ?? 0)}
          />
          <EstatisticaCard
            label="Consumo interno"
            value={formatarMoeda(resumoReuniao?.custoConsumoInterno ?? 0)}
          />
          <EstatisticaCard
            label="Custos adicionais"
            value={formatarMoeda(resumoReuniao?.totalCustosAdicionais ?? 0)}
          />
          <EstatisticaCard
            label="Custo total"
            value={formatarMoeda(resumoReuniao?.custoTotal ?? 0)}
            variant="danger"
          />
        </section>
      ) : (
        <section
          className={styles.statsGrid}
          aria-label="Indicadores do evento"
        >
          <EstatisticaCard
            label="Receita"
            value={formatarMoeda(metrics.revenue)}
          />
          <EstatisticaCard label="Custos" value={formatarMoeda(metrics.costs)} />
          <EstatisticaCard
            label="Lucro líquido"
            value={formatarMoeda(metrics.profit)}
            variant={metrics.profit >= 0 ? "success" : "danger"}
          />
          <EstatisticaCard
            label="Vendas"
            value={formatarNumero(metrics.sales)}
          />
        </section>
      )}

      {relatorioCarregando ? (
        <EstadoCarregando message="Carregando relatório do evento..." />
      ) : relatorioIndisponivel ? (
        <EstadoErro
          message="Não foi possível carregar o relatório do evento. O cabeçalho e o resumo continuam disponíveis."
          onRetry={relatorioQuery.refetch}
        />
      ) : isReuniao ? (
        <>
          <SecaoCard
            title="Movimentações"
            subtitle="Itens e custos registrados na reunião"
          >
            {movimentacoes.length ? (
              <TabelaMovimentacoes movimentacoes={movimentacoes} />
            ) : (
              <InlineEmpty>
                Nenhuma movimentação registrada para esta reunião.
              </InlineEmpty>
            )}
          </SecaoCard>

          <SecaoCard
            title="Custos adicionais"
            subtitle="Custos lançados no relatório da reunião"
          >
            <ListaCustos custos={custos} />
          </SecaoCard>
        </>
      ) : (
        <>
          {isOngoing || event.status.codigo === "ENCERRADO" ? (
            <div className={styles.insightsGrid}>
              <SecaoCard
                title="Produtos mais vendidos"
                subtitle="Por quantidade no evento"
              >
                {topProducts.length ? (
                  <ol className={styles.ranking}>
                    {topProducts.slice(0, 5).map((item, index) => (
                      <li
                        key={item.produtoEventoId}
                        className={styles.rankingItem}
                      >
                        <span className={styles.rank}>{index + 1}</span>
                        <div className={styles.rankingMain}>
                          <div className={styles.rankingHeader}>
                            <span className={styles.rankingName}>
                              {item.nome}
                            </span>
                            <span className={styles.rankingValue}>
                              {formatarNumero(item.quantidadeVendida)}
                            </span>
                          </div>
                          <div className={styles.barTrack} aria-hidden="true">
                            <span
                              className={styles.bar}
                              style={{
                                width: `${(item.quantidadeVendida / topMax) * 100}%`,
                              }}
                            />
                          </div>
                          <span className={styles.rankingCategory}>
                            {item.categoria || "Sem categoria"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <InlineEmpty>
                    Nenhum produto vendido até o momento.
                  </InlineEmpty>
                )}
              </SecaoCard>

              <SecaoCard
                title="Vendas por hora"
                subtitle="Visualize os horários de maior e menor pico"
              >
                {relatorioEvento ? (
                  <VendasPorHoraChart data={relatorioEvento.vendasPorHora} />
                ) : (
                  <InlineEmpty>Nenhuma venda registrada.</InlineEmpty>
                )}
              </SecaoCard>
            </div>
          ) : null}

          <SecaoCard
            title="Produtos e desempenho"
            subtitle={
              isNotStarted
                ? "Cardápio previsto para o evento"
                : "Cardápio, vendas, custos e resultados em um só lugar"
            }
            action={
              <Botao
                as={Link}
                to={`/eventos/${id}/cardapio`}
                variant="tertiary"
                size="compact"
              >
                Ver cardápio
              </Botao>
            }
          >
            {isNotStarted ? (
              produtosQuery.isLoading ? (
                <EstadoCarregando message="Carregando cardápio..." />
              ) : produtosQuery.isError ? (
                <EstadoErro
                  message="Não foi possível carregar o cardápio do evento."
                  onRetry={produtosQuery.refetch}
                />
              ) : produtosPrevistos.length ? (
                <TabelaProdutosPrevistos produtos={produtosPrevistos} />
              ) : (
                <InlineEmpty>
                  Nenhum produto adicionado ao cardápio do evento.
                </InlineEmpty>
              )
            ) : produtosRelatorio.length ? (
              <TabelaProdutosRelatorio produtos={produtosRelatorio} />
            ) : (
              <InlineEmpty>
                Nenhum produto adicionado ao cardápio do evento.
              </InlineEmpty>
            )}
          </SecaoCard>

          <SecaoCard
            title="Doações"
            subtitle="Doações do evento"
            action={
              <Botao
                as={Link}
                to={`/doacoes?evento=${id}`}
                state={{ fromEventId: id }}
                variant="tertiary"
                size="compact"
              >
                Ver todos
              </Botao>
            }
          >
            {totalDoacoes ? (
              <Tabela caption="Doações do evento">
                <Cabecalho>
                  <Linha>
                    <CelulaCabecalho>Doação</CelulaCabecalho>
                    <CelulaCabecalho>Doador</CelulaCabecalho>
                    <CelulaCabecalho>Tipo</CelulaCabecalho>
                    <CelulaCabecalho numeric>Valor</CelulaCabecalho>
                    <CelulaCabecalho numeric>
                      Fichas de agradecimento
                    </CelulaCabecalho>
                  </Linha>
                </Cabecalho>
                <Corpo>
                  {doacoesItens.slice(0, 5).map((item, index) => (
                    <Linha key={`item-${index}`}>
                      <Celula>
                        {item.nome}
                        {item.quantidade
                          ? ` · ${formatarNumero(item.quantidade)} un.`
                          : ""}
                      </Celula>
                      <Celula>{item.doador || "Não informado"}</Celula>
                      <Celula>{rotuloTipoDoacao(item.tipo)}</Celula>
                      <Celula numeric>—</Celula>
                      <Celula numeric>{formatarMoeda(item.valorFicha)}</Celula>
                    </Linha>
                  ))}
                  {doacoesDinheiro.slice(0, 5).map((item, index) => (
                    <Linha key={`dinheiro-${index}`}>
                      <Celula>
                        Doação em dinheiro · {item.formaPagamento || "PIX"}
                      </Celula>
                      <Celula>{item.doador || "Não informado"}</Celula>
                      <Celula>Dinheiro</Celula>
                      <Celula numeric>{formatarMoeda(item.valor)}</Celula>
                      <Celula numeric>{formatarMoeda(item.valorFicha)}</Celula>
                    </Linha>
                  ))}
                </Corpo>
              </Tabela>
            ) : (
              <InlineEmpty>
                Nenhuma doação registrada para este evento.
              </InlineEmpty>
            )}
          </SecaoCard>

          <div className={styles.bottomGrid}>
            <SecaoCard
              title="Histórico de vendas"
              subtitle="Últimas vendas e cancelamentos do evento."
            >
              <p className={styles.historyText}>
                {metrics.sales > 0
                  ? `${formatarNumero(metrics.sales)} ${
                      metrics.sales === 1
                        ? "venda registrada"
                        : "vendas registradas"
                    } no evento.`
                  : "Ainda não há vendas registradas neste evento."}
              </p>
              <Botao
                as={Link}
                to={`/eventos/${id}/vendas`}
                variant="secondary"
                size="compact"
              >
                {metrics.sales > 0
                  ? `Ver ${formatarNumero(metrics.sales)} vendas`
                  : "Ver vendas"}
              </Botao>
            </SecaoCard>

            <SecaoCard
              title="Custos adicionais"
              subtitle="Custos lançados no relatório do evento"
            >
              <ListaCustos custos={custos} />
            </SecaoCard>
          </div>
        </>
      )}

      {costOpen && idValido ? (
        <CustoModal eventId={id} onClose={() => setCostOpen(false)} />
      ) : null}

      {addProductOpen && idValido && !isReuniao ? (
        <AdicionarProdutoCardapioModal
          eventId={id}
          initialType="ESTOQUE"
          onClose={() => setAddProductOpen(false)}
        />
      ) : null}

      {closeConfirm ? (
        <ConfirmacaoDialog
          title="Encerrar evento"
          message={`Deseja encerrar o evento "${event.nome}"? Novas vendas e lançamentos deixarão de ser associados ao evento em andamento.`}
          confirmLabel="Encerrar evento"
          loading={changeStatus.isPending}
          onCancel={() => setCloseConfirm(false)}
          onConfirm={closeEvent}
        />
      ) : null}
      {startConfirm && startConfirmation ? (
        <ConfirmacaoDialog
          title={startConfirmation.title}
          message={startConfirmation.message}
          confirmLabel={startConfirmation.confirmLabel}
          loading={changeStatus.isPending}
          onCancel={() => setStartConfirm(false)}
          onConfirm={confirmStart}
        />
      ) : null}
    </div>
  );
}
