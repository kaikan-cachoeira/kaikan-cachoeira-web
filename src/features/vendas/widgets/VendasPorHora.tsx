import { SecaoCard } from "@/shared/components/Card/Card";
import { useVendasEventoQuery } from "../hooks/useVendas";
import styles from "./VendasPorHora.module.css";

interface VendasPorHoraProps {
  eventId: number;
}

export default function VendasPorHora({ eventId }: VendasPorHoraProps) {
  const { data, isLoading } = useVendasEventoQuery(eventId, {
    pageSize: 100,
  });

  const sales = (data?.items || []).filter(
    (sale) => sale.status === "active",
  );
  const hourCounts: Record<number, number> = {};
  sales.forEach((sale) => {
    const hour = new Date(sale.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const hours = Object.keys(hourCounts)
    .map(Number)
    .sort((a, b) => a - b);
  const maxHourCount = Math.max(1, ...Object.values(hourCounts));

  return (
    <SecaoCard
      title="Vendas por hora"
      subtitle="Visualize os horários de maior e menor pico"
    >
      {isLoading ? (
        <p className={styles.inlineEmpty}>Carregando vendas...</p>
      ) : hours.length ? (
        <div className={styles.chart}>
          <div className={styles.chartBars}>
            {hours.map((hour) => (
              <div className={styles.chartColumn} key={hour}>
                <span className={styles.chartValue}>{hourCounts[hour]}</span>
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
        <p className={styles.inlineEmpty}>Nenhuma venda registrada.</p>
      )}
    </SecaoCard>
  );
}
