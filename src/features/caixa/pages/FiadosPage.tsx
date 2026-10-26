import { Link } from "react-router-dom";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import Abas from "@/shared/components/Abas/Abas";
import Botao from "@/shared/components/Botao/Botao";
import Paginacao from "@/shared/components/Paginacao/Paginacao";
import { EstatisticaCard } from "@/shared/components/Card/Card";
import {
  EstadoVazio,
  EstadoErro,
  EstadoCarregando,
} from "@/shared/components/Estado/Estado";
import { useFiados } from "../hooks/useFiados";
import type { Fiado } from "../models";
import { formatarMoeda, formatarHoraHoje } from "@/shared/lib/formatacao";
import PainelLancamentoCaixa from "../components/PainelLancamentoCaixa";
import QuitarFiadoModal from "../components/QuitarFiadoModal";
import styles from "./Caixa.module.css";
import BotaoVoltar from "@/shared/components/BotaoVoltar/BotaoVoltar";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "settled", label: "Quitados" },
  { value: "pending", label: "Pendentes" },
];

export default function FiadosPage() {
  const {
    event,
    eventLoading,
    status,
    setStatus,
    setPage,
    settleTarget,
    setSettleTarget,
    fiadosQuery,
    summary,
    fiados,
    tabs,
  } = useFiados();

  if (eventLoading) {
    return <EstadoCarregando message="Carregando caixa..." />;
  }

  if (!event) {
    return (
      <div className={styles.page}>
        <BotaoVoltar fallback="/inicio" />
        <PageHeader
          subtitle="Controle de fichas, pagamentos e fiados"
        />
        <EstadoVazio
          title="Nenhum evento em andamento."
          description="Inicie um evento para consultar os fiados."
          icon="cash"
          action={
            <Botao as={Link} to="/eventos">
              Ir para eventos
            </Botao>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <BotaoVoltar fallback="/inicio" />
      <PageHeader
        subtitle="Controle de fichas, pagamentos e fiados"
      />

      <section className={styles.statsGrid} aria-label="Resumo do caixa">
        <EstatisticaCard
          label="Fichas vendidas"
          value={formatarMoeda(summary.fichasVendidas)}
        />
        <EstatisticaCard
          label="Fichas devolvidas"
          value={formatarMoeda(summary.fichasDevolvidas)}
        />
        <EstatisticaCard
          label="Fiados em aberto"
          value={formatarMoeda(summary.fiadosEmAberto)}
        />
      </section>

      <div className={styles.layout}>
        <div className={styles.left}>
          <Abas items={tabs} label="Seções do caixa" />

          <div
            className={styles.statusPills}
            role="group"
            aria-label="Filtrar fiados por situação"
          >
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.pill} ${
                  status === option.value ? styles.pillActive : ""
                }`}
                aria-pressed={status === option.value}
                onClick={() => {
                  setStatus(option.value);
                  setPage(1);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <section className={styles.listCard} aria-labelledby="lista-fiados">
            <header className={styles.listHeader}>
              <h2 id="lista-fiados">Fiados</h2>
            </header>

            {fiadosQuery.isLoading ? (
              <EstadoCarregando message="Carregando fiados..." />
            ) : fiadosQuery.isError ? (
              <EstadoErro
                message="Não foi possível carregar os fiados."
                onRetry={fiadosQuery.refetch}
              />
            ) : fiados.length ? (
              <ul className={styles.list}>
                {fiados.map((fiado: Fiado) => (
                  <li className={styles.fiadoRow} key={fiado.id}>
                    <div className={styles.fiadoAmount}>
                      <strong>{formatarMoeda(fiado.amount)}</strong>
                      {fiado.status === "pending" && fiado.paidAmount > 0 ? (
                        <span>
                          Saldo: {formatarMoeda(fiado.remaining)}
                        </span>
                      ) : null}
                    </div>
                    <span
                      className={
                        fiado.status === "settled"
                          ? styles.settled
                          : styles.pending
                      }
                    >
                      {fiado.situationLabel}
                    </span>
                    <span className={styles.fiadoDebtor}>
                      {fiado.nomeDevedor}
                    </span>
                    <span className={styles.rowDate}>
                      {formatarHoraHoje(fiado.criadoEm)}
                    </span>
                    <div className={styles.rowAction}>
                      {fiado.quitado ? null : (
                        <Botao
                          size="compact"
                          onClick={() => setSettleTarget(fiado)}
                        >
                          Quitar fiado
                        </Botao>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EstadoVazio
                title="Nenhum fiado encontrado."
                description={
                  status
                    ? "Ajuste a situação para ver outros fiados."
                    : "Os fiados registrados no caixa aparecerão aqui."
                }
                icon="cash"
                action={
                  status ? (
                    <Botao
                      variant="secondary"
                      onClick={() => {
                        setStatus("");
                        setPage(1);
                      }}
                    >
                      Ver todos
                    </Botao>
                  ) : null
                }
              />
            )}
          </section>

          {fiados.length && fiadosQuery.data && fiadosQuery.data.totalPages > 1 ? (
            <Paginacao
              page={fiadosQuery.data.page}
              totalPages={fiadosQuery.data.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>

        <PainelLancamentoCaixa eventId={event.id} />
      </div>

      {settleTarget ? (
        <QuitarFiadoModal
          fiado={settleTarget}
          onClose={() => setSettleTarget(null)}
        />
      ) : null}
    </div>
  );
}
