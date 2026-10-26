import Botao from "@/shared/components/Botao/Botao";
import BotaoVoltar from "@/shared/components/BotaoVoltar/BotaoVoltar";
import { EstatisticaCard } from "@/shared/components/Card/Card";
import {
  EstadoCarregando,
  EstadoErro,
  EstadoVazio,
} from "@/shared/components/Estado/Estado";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import BarraPesquisa from "@/shared/components/BarraPesquisa/BarraPesquisa";
import PainelFiltros from "@/shared/components/Filtros/PainelFiltros";
import Selecao from "@/shared/components/Formulario/Selecao";
import SelecaoMultipla from "@/shared/components/Formulario/SelecaoMultipla";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import Paginacao from "@/shared/components/Paginacao/Paginacao";
import {
  Cabecalho,
  Celula,
  CelulaCabecalho,
  Corpo,
  Linha,
  Tabela,
} from "@/shared/components/Tabela/Tabela";
import {
  formatarDataHora,
  formatarMoeda,
  formatarNumero,
} from "@/shared/lib/formatacao";
import QuitarFiadoModal from "../components/QuitarFiadoModal";
import { useFiadosGerais } from "../hooks/useFiadosGerais";
import styles from "./FiadosGeraisPage.module.css";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "settled", label: "Quitados" },
];

export default function FiadosGeraisPage() {
  const {
    searchDraft,
    setSearchDraft,
    search,
    status,
    setStatus,
    eventIds,
    setEventIds,
    setPage,
    filtersOpen,
    setFiltersOpen,
    settleTarget,
    setSettleTarget,
    eventosQuery,
    fiadosQuery,
    fiados,
    hasFilters,
    runSearch,
    clearFilters,
  } = useFiadosGerais();

  const response = fiadosQuery.data;
  const eventOptions = (eventosQuery.data?.items || []).map((event) => ({
    value: String(event.id),
    label: event.nome,
  }));
  const hasActiveFilters = hasFilters || Boolean(search);

  return (
    <div className={styles.page}>
      <BotaoVoltar fallback="/relatorio-geral" />
      <PageHeader
        title="Fiados"
        subtitle="Acompanhe os fiados de todos os eventos"
      />

      <section className={styles.statsGrid} aria-label="Resumo dos fiados filtrados">
        <EstatisticaCard
          label="Total em aberto"
          value={formatarMoeda(response?.openAmount)}
        />
        <EstatisticaCard
          label="Fiados pendentes"
          value={formatarNumero(response?.pendingCount)}
        />
      </section>

      <BarraPesquisa
        value={searchDraft}
        onChange={setSearchDraft}
        onSubmit={runSearch}
        placeholder="Pesquisar pelo nome do devedor"
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((open) => !open)}
      />

      {filtersOpen ? (
        <PainelFiltros onClear={clearFilters} columns={2}>
          <Selecao
            id="fiados-gerais-situacao"
            label="Situação"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          />
          {eventosQuery.isLoading ? (
            <EstadoCarregando message="Carregando eventos..." />
          ) : eventosQuery.isError ? (
            <EstadoErro
              message="Não foi possível carregar os eventos para filtrar."
              onRetry={eventosQuery.refetch}
            />
          ) : (
            <SelecaoMultipla
              label="Evento"
              options={eventOptions}
              value={eventIds.map(String)}
              onChange={(value) => {
                setEventIds(value.map(Number));
                setPage(1);
              }}
              placeholder="Todos"
            />
          )}
        </PainelFiltros>
      ) : null}

      {fiadosQuery.isLoading ? (
        <EstadoCarregando message="Carregando fiados..." />
      ) : fiadosQuery.isError ? (
        <EstadoErro
          message="Não foi possível carregar os fiados."
          onRetry={fiadosQuery.refetch}
        />
      ) : fiados.length ? (
        <>
          <Tabela caption="Fiados de todos os eventos">
            <Cabecalho>
              <Linha>
                <CelulaCabecalho>Devedor</CelulaCabecalho>
                <CelulaCabecalho>Evento</CelulaCabecalho>
                <CelulaCabecalho numeric>Valor</CelulaCabecalho>
                <CelulaCabecalho numeric>Pago</CelulaCabecalho>
                <CelulaCabecalho numeric>Restante</CelulaCabecalho>
                <CelulaCabecalho>Data</CelulaCabecalho>
                <CelulaCabecalho>Situação</CelulaCabecalho>
                <CelulaCabecalho>Ações</CelulaCabecalho>
              </Linha>
            </Cabecalho>
            <Corpo>
              {fiados.map((fiado) => (
                <Linha key={fiado.id}>
                  <Celula>{fiado.debtorName}</Celula>
                  <Celula>{fiado.eventName || "—"}</Celula>
                  <Celula numeric>{formatarMoeda(fiado.amount)}</Celula>
                  <Celula numeric>{formatarMoeda(fiado.paidAmount)}</Celula>
                  <Celula numeric>{formatarMoeda(fiado.remaining)}</Celula>
                  <Celula>{formatarDataHora(fiado.createdAt)}</Celula>
                  <Celula>
                    <Etiqueta
                      variant={fiado.status === "settled" ? "success" : "warning"}
                    >
                      {fiado.situationLabel}
                    </Etiqueta>
                  </Celula>
                  <Celula>
                    {fiado.status === "pending" ? (
                      <Botao
                        size="compact"
                        onClick={() => setSettleTarget(fiado)}
                      >
                        Quitar fiado
                      </Botao>
                    ) : null}
                  </Celula>
                </Linha>
              ))}
            </Corpo>
          </Tabela>
          {response && response.totalPages > 1 ? (
            <Paginacao
              page={response.page}
              totalPages={response.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </>
      ) : hasActiveFilters ? (
        <EstadoVazio
          title="Nenhum fiado encontrado."
          icon="cash"
          action={
            <Botao variant="secondary" onClick={clearFilters}>
              Limpar filtros
            </Botao>
          }
        />
      ) : (
        <EstadoVazio title="Nenhum fiado em aberto." icon="cash" />
      )}

      {settleTarget ? (
        <QuitarFiadoModal
          fiado={settleTarget}
          onClose={() => setSettleTarget(null)}
        />
      ) : null}
    </div>
  );
}
