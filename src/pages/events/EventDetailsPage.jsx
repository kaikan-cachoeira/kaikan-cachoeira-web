import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import Button from "../../components/Button/Button";
import Badge from "../../components/Badge/Badge";
import Icon from "../../components/Icon/Icon";
import { SectionCard, StatCard } from "../../components/Card/Card";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "../../components/Table/Table";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import {
  ErrorState,
  LoadingState,
} from "../../components/State/State";
import { useToast } from "../../context/ToastContext";
import {
  useChangeEventStatus,
  useEvent,
  useEventSales,
} from "../../hooks/useEvents";
import { useCategories } from "../../hooks/useInventory";
import { apiErrorMessage } from "../../services/api";
import {
  formatCurrency,
  formatNumber,
  formatPeriod,
} from "../../utils/format";
import CostModal from "./CostModal";
import AddMenuProductModal from "./AddMenuProductModal";
import styles from "./EventDetailsPage.module.css";

const DONATION_TYPES = {
  ready: "Produto",
  money: "Dinheiro",
  ingredient: "Ingrediente",
};

function donationDescription(donation) {
  if (donation.type === "money") {
    return `Doação em dinheiro · ${donation.paymentMethod || "PIX"}`;
  }
  return `${donation.itemName || "Doação"}${
    donation.quantity ? ` · ${formatNumber(donation.quantity)} un.` : ""
  }`;
}

function InlineEmpty({ children }) {
  return <p className={styles.inlineEmpty}>{children}</p>;
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const { addToast } = useToast();
  const { data: event, isLoading, isError, refetch } = useEvent(id);
  const { data: categoriesData } = useCategories();
  const changeStatus = useChangeEventStatus();
  const { data: salesData, isLoading: salesLoading } = useEventSales(id, {
    pageSize: 100,
  });
  const [costOpen, setCostOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);

  if (isLoading) {
    return <LoadingState message="Carregando evento..." />;
  }

  if (isError || !event) {
    return (
      <ErrorState
        message="Não foi possível carregar o evento."
        onRetry={refetch}
      />
    );
  }

  const isOngoing = event.status === "Em andamento";
  const isNotStarted = event.status === "Não iniciado";
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

  const sales = (salesData?.items || []).filter(
    (sale) => sale.status === "active",
  );
  const hourCounts = {};
  sales.forEach((sale) => {
    const hour = new Date(sale.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const hours = Object.keys(hourCounts)
    .map(Number)
    .sort((a, b) => a - b);
  const maxHourCount = Math.max(1, ...Object.values(hourCounts));

  async function startEvent() {
    try {
      await changeStatus.mutateAsync({ id, status: "Em andamento" });
      addToast("Evento iniciado com sucesso.");
    } catch (error) {
      addToast(
        apiErrorMessage(error, "Não foi possível iniciar o evento."),
        "error",
      );
    }
  }

  async function closeEvent() {
    try {
      await changeStatus.mutateAsync({ id, status: "Encerrado" });
      addToast("Evento encerrado com sucesso.");
      setCloseConfirm(false);
    } catch (error) {
      addToast(
        apiErrorMessage(error, "Não foi possível encerrar o evento."),
        "error",
      );
    }
  }

  return (
    <div className={styles.stack}>
      <Link to="/eventos" className={styles.backLink}>
        <Icon name="arrow-left" size={18} />
        Voltar para eventos
      </Link>

      <PageHeader
        title={
          <span className={styles.titleRow}>
            {event.name}
            <Badge
              variant={isOngoing ? "success" : isNotStarted ? "warning" : "muted"}
              dot
            >
              {event.status}
            </Badge>
          </span>
        }
        subtitle={`${event.type || "Evento"} · ${formatPeriod(
          event.start,
          event.end,
        )}`}
        actions={
          <>
            {isNotStarted ? (
              <>
                <Button
                  variant="secondary"
                  iconLeft="plus"
                  onClick={() => setAddProductOpen(true)}
                >
                  Adicionar produto
                </Button>
                <Button
                  variant="secondary"
                  iconLeft="cash"
                  onClick={() => setCostOpen(true)}
                >
                  Registrar custo
                </Button>
                <Button loading={changeStatus.isPending} onClick={startEvent}>
                  Iniciar evento
                </Button>
              </>
            ) : null}
            {isOngoing ? (
              <>
                <Button
                  variant="secondary"
                  iconLeft="cash"
                  onClick={() => setCostOpen(true)}
                >
                  Registrar custo
                </Button>
                <Button
                  variant="danger"
                  loading={changeStatus.isPending}
                  onClick={() => setCloseConfirm(true)}
                >
                  Encerrar evento
                </Button>
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
        <StatCard label="Receita" value={formatCurrency(metrics.revenue)} />
        <StatCard label="Custos" value={formatCurrency(metrics.costs)} />
        <StatCard
          label="Lucro líquido"
          value={formatCurrency(metrics.profit)}
          variant={metrics.profit >= 0 ? "success" : "danger"}
        />
        <StatCard label="Vendas" value={formatNumber(metrics.sales)} />
      </section>

      {isOngoing ? (
        <div className={styles.insightsGrid}>
          <SectionCard
            title="Produtos mais vendidos"
            subtitle="Por quantidade no evento"
            action={
              <Button
                as={Link}
                to={`/eventos/${id}/cardapio`}
                variant="tertiary"
                size="compact"
              >
                Ver todos
              </Button>
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
                          {formatNumber(item.sold)}
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
          </SectionCard>

          <SectionCard
            title="Vendas por hora"
            subtitle="Visualize os horários de maior e menor pico"
          >
            {salesLoading ? (
              <InlineEmpty>Carregando vendas...</InlineEmpty>
            ) : hours.length ? (
              <div className={styles.chart}>
                <div className={styles.chartBars}>
                  {hours.map((hour) => (
                    <div className={styles.chartColumn} key={hour}>
                      <span className={styles.chartValue}>
                        {hourCounts[hour]}
                      </span>
                      <div className={styles.chartTrack}>
                        <span
                          className={styles.chartBar}
                          style={{
                            height: `${(hourCounts[hour] / maxHourCount) * 100}%`,
                          }}
                        />
                      </div>
                      <span className={styles.chartLabel}>
                        {String(hour).padStart(2, "0")}h
                      </span>
                    </div>
                  ))}
                </div>
                <p className={styles.chartLegend}>
                  Quantidade de vendas · Total: {sales.length}{" "}
                  {sales.length === 1 ? "venda" : "vendas"}
                </p>
              </div>
            ) : (
              <InlineEmpty>Nenhuma venda registrada.</InlineEmpty>
            )}
          </SectionCard>
        </div>
      ) : null}

      <SectionCard
        title="Produtos e desempenho"
        subtitle="Cardápio, vendas, custos e resultados em um só lugar"
        action={
          <Button
            as={Link}
            to={`/eventos/${id}/cardapio`}
            variant="tertiary"
            size="compact"
          >
            Ver todos
          </Button>
        }
      >
        {menu.length ? (
          <Table caption="Produtos e desempenho do evento">
            <THead>
              <TR>
                <TH>Produto</TH>
                <TH numeric>Previsto</TH>
                <TH numeric>Vendido</TH>
                <TH numeric>Preço de venda</TH>
                <TH numeric>Receita</TH>
                <TH numeric>Custo total</TH>
                <TH numeric>Descontos</TH>
                <TH numeric>Lucro líquido</TH>
              </TR>
            </THead>
            <TBody>
              {menu.map((item) => {
                const revenue = Math.max(
                  0,
                  item.price * item.sold - item.discounts,
                );
                const profit = revenue - item.costTotal;
                return (
                  <TR key={item.id}>
                    <TD>
                      <span className={styles.productName}>{item.name}</span>
                      {item.type === "made" ? (
                        <span className={styles.produced}>· produzido</span>
                      ) : null}
                    </TD>
                    <TD numeric>
                      {item.expected === null || item.expected === undefined
                        ? "—"
                        : formatNumber(item.expected)}
                    </TD>
                    <TD numeric>{formatNumber(item.sold)}</TD>
                    <TD numeric>{formatCurrency(item.price)}</TD>
                    <TD numeric>{formatCurrency(revenue)}</TD>
                    <TD numeric>{formatCurrency(item.costTotal)}</TD>
                    <TD numeric>{formatCurrency(item.discounts)}</TD>
                    <TD numeric>
                      <span
                        className={
                          profit >= 0 ? styles.positive : styles.negative
                        }
                      >
                        {formatCurrency(profit)}
                      </span>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        ) : (
          <InlineEmpty>
            Nenhum produto adicionado ao cardápio do evento.
          </InlineEmpty>
        )}
      </SectionCard>

      <SectionCard
        title="Doações"
        subtitle="Doações do evento"
        action={
          <Button
            as={Link}
            to={`/doacoes?evento=${id}`}
            variant="tertiary"
            size="compact"
          >
            Ver todos
          </Button>
        }
      >
        {donations.length ? (
          <Table caption="Doações do evento">
            <THead>
              <TR>
                <TH>Doação</TH>
                <TH>Doador</TH>
                <TH>Tipo</TH>
                <TH numeric>Fichas de agradecimento</TH>
              </TR>
            </THead>
            <TBody>
              {donations.slice(0, 5).map((donation) => (
                <TR key={donation.id}>
                  <TD>{donationDescription(donation)}</TD>
                  <TD>{donation.donor || "Não informado"}</TD>
                  <TD>{DONATION_TYPES[donation.type] || donation.type}</TD>
                  <TD numeric>
                    {donation.type === "money"
                      ? "—"
                      : formatCurrency(donation.ticketValue)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <InlineEmpty>Nenhuma doação registrada para este evento.</InlineEmpty>
        )}
      </SectionCard>

      <div className={styles.bottomGrid}>
        <SectionCard
          title="Histórico de vendas"
          subtitle="Últimas vendas e cancelamentos do evento."
        >
          <p className={styles.historyText}>
            {metrics.sales > 0
              ? `${formatNumber(metrics.sales)} ${
                  metrics.sales === 1 ? "venda registrada" : "vendas registradas"
                } no evento.`
              : "Ainda não há vendas registradas neste evento."}
          </p>
          <Button
            as={Link}
            to={`/eventos/${id}/vendas`}
            variant="secondary"
            size="compact"
          >
            {metrics.sales > 0
              ? `Ver ${formatNumber(metrics.sales)} vendas`
              : "Ver vendas"}
          </Button>
        </SectionCard>

        <SectionCard title="Custos adicionais">
          {costs.length ? (
            <ul className={styles.costList}>
              {costs.map((cost) => (
                <li key={cost.id}>
                  <span>
                    <strong>{cost.name}</strong>
                    {cost.description ? (
                      <small>{cost.description}</small>
                    ) : null}
                  </span>
                  <span>{formatCurrency(cost.value)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <InlineEmpty>Nenhum custo adicional registrado.</InlineEmpty>
          )}
        </SectionCard>
      </div>

      {costOpen ? (
        <CostModal eventId={id} onClose={() => setCostOpen(false)} />
      ) : null}

      {addProductOpen ? (
        <AddMenuProductModal
          eventId={id}
          categories={categoriesData?.items || []}
          initialType="ready"
          onClose={() => setAddProductOpen(false)}
        />
      ) : null}

      {closeConfirm ? (
        <ConfirmDialog
          title="Encerrar evento"
          message={`Deseja encerrar o evento "${event.name}"? Novas vendas e lançamentos deixarão de ser associados ao evento em andamento.`}
          confirmLabel="Encerrar evento"
          loading={changeStatus.isPending}
          onCancel={() => setCloseConfirm(false)}
          onConfirm={closeEvent}
        />
      ) : null}
    </div>
  );
}
