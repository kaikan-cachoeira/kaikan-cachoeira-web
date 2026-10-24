import type { ComponentType, ReactNode } from "react";
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
  formatarMoeda,
  formatarNumero,
  formatarPeriodo,
} from "@/shared/lib/formatacao";
import type { DoacaoEvento } from "../models";
import CustoModal from "../components/CustoModal";
import CustosEventoModal from "../components/CustosEventoModal";
import AdicionarProdutoCardapioModal from "../components/AdicionarProdutoCardapioModal";
import styles from "./EventoDetalhesPage.module.css";

const DONATION_TYPES: Record<string, string> = {
  ready: "Produto",
  money: "Dinheiro",
  ingredient: "Ingrediente",
};

function donationDescription(donation: DoacaoEvento) {
  if (donation.type === "money") {
    return `Doação em dinheiro · ${donation.paymentMethod || "PIX"}`;
  }
  return `${donation.itemName || "Doação"}${
    donation.quantity ? ` · ${formatarNumero(donation.quantity)} un.` : ""
  }`;
}

function InlineEmpty({ children }: { children: ReactNode }) {
  return <p className={styles.inlineEmpty}>{children}</p>;
}

interface EventoDetalhesPageProps {
  vendasPorHora?: ComponentType<{ eventId: string }>;
}

export default function EventoDetalhesPage({
  vendasPorHora: VendasPorHora,
}: EventoDetalhesPageProps) {
  const { id } = useParams();
  const {
    costOpen,
    setCostOpen,
    costsListOpen,
    setCostsListOpen,
    addProductOpen,
    setAddProductOpen,
    startConfirm,
    setStartConfirm,
    closeConfirm,
    setCloseConfirm,
    eventoQuery,
    categoriasQuery,
    alterarStatus: changeStatus,
    confirmStart,
    closeEvent,
  } = useEventoDetalhes(id);
  const { data: event, isLoading, isError, refetch } = eventoQuery;
  const categoriesData = categoriasQuery.data;

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

  const isOngoing = event.status === "Em andamento";
  const isNotStarted = event.status === "Não iniciado";
  const startConfirmation = obterConfirmacaoStatus(event, "Em andamento");
  const menu = event.menu || [];
  const donations = event.donations || [];
  const costs = event.costs || [];
  const metrics = event.metrics || {
    revenue: 0,
    costs: 0,
    profit: 0,
    sales: 0,
  };

  const topProducts = [...menu]
    .filter((item) => item.sold > 0)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);
  const topMax = topProducts[0]?.sold || 1;

  return (
    <div className={styles.stack}>
      <Link to="/eventos" className={styles.backLink}>
        <Icone name="arrow-left" size={18} />
        Voltar para eventos
      </Link>

      <PageHeader
        title={
          <span className={styles.titleRow}>
            {event.name}
            <Etiqueta
              variant={isOngoing ? "success" : isNotStarted ? "warning" : "muted"}
              dot
            >
              {event.status}
            </Etiqueta>
          </span>
        }
        subtitle={`${event.type || "Evento"} · ${formatarPeriodo(
          event.start,
          event.end,
        )}`}
        actions={
          <>
            {isNotStarted ? (
              <>
                <Botao
                  variant="secondary"
                  iconLeft="plus"
                  onClick={() => setAddProductOpen(true)}
                >
                  Adicionar produto
                </Botao>
                <Botao
                  variant="secondary"
                  iconLeft="cash"
                  onClick={() => setCostOpen(true)}
                >
                  Registrar custo
                </Botao>
                <Botao
                  loading={changeStatus.isPending}
                  onClick={() => setStartConfirm(true)}
                >
                  Iniciar evento
                </Botao>
              </>
            ) : null}
            {isOngoing ? (
              <>
                <Botao
                  variant="secondary"
                  iconLeft="cash"
                  onClick={() => setCostOpen(true)}
                >
                  Registrar custo
                </Botao>
                <Botao
                  variant="danger"
                  loading={changeStatus.isPending}
                  onClick={() => setCloseConfirm(true)}
                >
                  Encerrar evento
                </Botao>
              </>
            ) : null}
          </>
        }
      >
        <div className={styles.notes}>
          <span className={styles.notesLabel}>Observações</span>
          <p>{event.notes || "Nenhuma observação registrada."}</p>
        </div>
      </PageHeader>

      <section className={styles.statsGrid} aria-label="Indicadores do evento">
        <EstatisticaCard label="Receita" value={formatarMoeda(metrics.revenue)} />
        <EstatisticaCard label="Custos" value={formatarMoeda(metrics.costs)} />
        <EstatisticaCard
          label="Lucro líquido"
          value={formatarMoeda(metrics.profit)}
          variant={metrics.profit >= 0 ? "success" : "danger"}
        />
        <EstatisticaCard label="Vendas" value={formatarNumero(metrics.sales)} />
      </section>

      {isOngoing ? (
        <div className={styles.insightsGrid}>
          <SecaoCard
            title="Produtos mais vendidos"
            subtitle="Por quantidade no evento"
            action={
              <Botao
                as={Link}
                to={`/eventos/${id}/cardapio`}
                variant="tertiary"
                size="compact"
              >
                Ver todos
              </Botao>
            }
          >
            {topProducts.length ? (
              <ol className={styles.ranking}>
                {topProducts.map((item, index) => (
                  <li key={item.id} className={styles.rankingItem}>
                    <span className={styles.rank}>{index + 1}</span>
                    <div className={styles.rankingMain}>
                      <div className={styles.rankingHeader}>
                        <span className={styles.rankingName}>{item.name}</span>
                        <span className={styles.rankingValue}>
                          {formatarNumero(item.sold)}
                        </span>
                      </div>
                      <div className={styles.barTrack} aria-hidden="true">
                        <span
                          className={styles.bar}
                          style={{ width: `${(item.sold / topMax) * 100}%` }}
                        />
                      </div>
                      <span className={styles.rankingCategory}>
                        {item.category}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <InlineEmpty>Nenhum produto vendido até o momento.</InlineEmpty>
            )}
          </SecaoCard>

          {VendasPorHora && id ? <VendasPorHora eventId={id} /> : null}
        </div>
      ) : null}

      <SecaoCard
        title="Produtos e desempenho"
        subtitle="Cardápio, vendas, custos e resultados em um só lugar"
        action={
          <Botao
            as={Link}
            to={`/eventos/${id}/cardapio`}
            variant="tertiary"
            size="compact"
          >
            Ver todos
          </Botao>
        }
      >
        {menu.length ? (
          <Tabela caption="Produtos e desempenho do evento">
            <Cabecalho>
              <Linha>
                <CelulaCabecalho>Produto</CelulaCabecalho>
                <CelulaCabecalho numeric>Previsto</CelulaCabecalho>
                <CelulaCabecalho numeric>Vendido</CelulaCabecalho>
                <CelulaCabecalho numeric>Preço de venda</CelulaCabecalho>
                <CelulaCabecalho numeric>Receita</CelulaCabecalho>
                <CelulaCabecalho numeric>Custo total</CelulaCabecalho>
                <CelulaCabecalho numeric>Descontos</CelulaCabecalho>
                <CelulaCabecalho numeric>Lucro líquido</CelulaCabecalho>
              </Linha>
            </Cabecalho>
            <Corpo>
              {menu.map((item) => {
                const revenue = Math.max(
                  0,
                  item.price * item.sold - item.discounts,
                );
                const profit = revenue - item.costTotal;
                return (
                  <Linha key={item.id}>
                    <Celula>
                      <span className={styles.productName}>{item.name}</span>
                      {item.type === "made" ? (
                        <span className={styles.produced}>· produzido</span>
                      ) : null}
                    </Celula>
                    <Celula numeric>
                      {item.expected === null || item.expected === undefined
                        ? "—"
                        : formatarNumero(item.expected)}
                    </Celula>
                    <Celula numeric>{formatarNumero(item.sold)}</Celula>
                    <Celula numeric>{formatarMoeda(item.price)}</Celula>
                    <Celula numeric>{formatarMoeda(revenue)}</Celula>
                    <Celula numeric>{formatarMoeda(item.costTotal)}</Celula>
                    <Celula numeric>{formatarMoeda(item.discounts)}</Celula>
                    <Celula numeric>
                      <span
                        className={
                          profit >= 0 ? styles.positive : styles.negative
                        }
                      >
                        {formatarMoeda(profit)}
                      </span>
                    </Celula>
                  </Linha>
                );
              })}
            </Corpo>
          </Tabela>
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
            variant="tertiary"
            size="compact"
          >
            Ver todos
          </Botao>
        }
      >
        {donations.length ? (
          <Tabela caption="Doações do evento">
            <Cabecalho>
              <Linha>
                <CelulaCabecalho>Doação</CelulaCabecalho>
                <CelulaCabecalho>Doador</CelulaCabecalho>
                <CelulaCabecalho>Tipo</CelulaCabecalho>
                <CelulaCabecalho numeric>Fichas de agradecimento</CelulaCabecalho>
              </Linha>
            </Cabecalho>
            <Corpo>
              {donations.slice(0, 5).map((donation) => (
                <Linha key={donation.id}>
                  <Celula>{donationDescription(donation)}</Celula>
                  <Celula>{donation.donor || "Não informado"}</Celula>
                  <Celula>{DONATION_TYPES[donation.type] || donation.type}</Celula>
                  <Celula numeric>
                    {donation.type === "money"
                      ? "—"
                      : formatarMoeda(donation.ticketValue)}
                  </Celula>
                </Linha>
              ))}
            </Corpo>
          </Tabela>
        ) : (
          <InlineEmpty>Nenhuma doação registrada para este evento.</InlineEmpty>
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
                  metrics.sales === 1 ? "venda registrada" : "vendas registradas"
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
          action={
            costs.length ? (
              <Botao
                variant="tertiary"
                size="compact"
                onClick={() => setCostsListOpen(true)}
              >
                Ver todos
              </Botao>
            ) : undefined
          }
        >
          {costs.length ? (
            <ul className={styles.costList}>
              {costs.slice(0, 3).map((cost) => (
                <li key={cost.id}>
                  <span>
                    <strong>{cost.name}</strong>
                    {cost.description ? (
                      <small>{cost.description}</small>
                    ) : null}
                  </span>
                  <span>{formatarMoeda(cost.value)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <InlineEmpty>Nenhum custo adicional registrado.</InlineEmpty>
          )}
        </SecaoCard>
      </div>

      {costOpen && id ? (
        <CustoModal eventId={id} onClose={() => setCostOpen(false)} />
      ) : null}

      {costsListOpen && id ? (
        <CustosEventoModal
          eventId={id}
          custos={costs}
          somenteLeitura={event.status === "Encerrado"}
          onClose={() => setCostsListOpen(false)}
        />
      ) : null}

      {addProductOpen && id ? (
        <AdicionarProdutoCardapioModal
          eventId={id}
          categories={categoriesData?.items || []}
          initialType="ready"
          onClose={() => setAddProductOpen(false)}
        />
      ) : null}

      {closeConfirm ? (
        <ConfirmacaoDialog
          title="Encerrar evento"
          message={`Deseja encerrar o evento "${event.name}"? Novas vendas e lançamentos deixarão de ser associados ao evento em andamento.`}
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
