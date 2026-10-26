import BarraPesquisa from "@/shared/components/BarraPesquisa/BarraPesquisa";
import PainelFiltros from "@/shared/components/Filtros/PainelFiltros";
import SelecaoMultipla from "@/shared/components/Formulario/SelecaoMultipla";
import Entrada from "@/shared/components/Formulario/Entrada";
import Botao from "@/shared/components/Botao/Botao";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import Paginacao from "@/shared/components/Paginacao/Paginacao";
import ConfirmacaoDialog from "@/shared/components/ConfirmacaoDialog/ConfirmacaoDialog";
import {
  Tabela,
  Cabecalho,
  Corpo,
  Linha,
  CelulaCabecalho,
  Celula,
} from "@/shared/components/Tabela/Tabela";
import {
  EstadoVazio,
  EstadoErro,
  EstadoCarregando,
} from "@/shared/components/Estado/Estado";
import {
  formatarMoeda,
  formatarDataHora,
  formatarNumero,
} from "@/shared/lib/formatacao";
import { useHistoricoVendas } from "../hooks/useVendas";
import VendaDetalhesModal from "./VendaDetalhesModal";
import styles from "./HistoricoVendas.module.css";

const STATUS_OPTIONS = [
  { value: "active", label: "Vendas ativas" },
  { value: "cancelled", label: "Canceladas" },
];

interface HistoricoVendasViewProps {
  eventId?: number;
  pageSize?: number;
  className?: string;
}

export default function HistoricoVendasView({
  eventId,
  pageSize = 8,
  className = "",
}: HistoricoVendasViewProps) {
  const {
    searchDraft,
    setSearchDraft,
    search,
    setPage,
    filtersOpen,
    setFiltersOpen,
    statuses,
    setStatuses,
    from,
    setFrom,
    to,
    setTo,
    detailsSale,
    setDetailsSale,
    detalhesQuery,
    cancelTarget,
    setCancelTarget,
    vendasQuery,
    cancelarVenda,
    runSearch,
    clearFilters,
    clearAll,
    confirmCancel,
  } = useHistoricoVendas(eventId, pageSize);
  const { data, isLoading, isError, refetch } = vendasQuery;

  const hasFilters =
    Boolean(search) || statuses.length > 0 || Boolean(from) || Boolean(to);

  return (
    <div className={`${styles.view} ${className}`.trim()}>
      <BarraPesquisa
        value={searchDraft}
        onChange={setSearchDraft}
        onSubmit={runSearch}
        placeholder="Pesquisar produto..."
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((current) => !current)}
      />

      {filtersOpen ? (
        <PainelFiltros onClear={clearFilters}>
          <SelecaoMultipla
            label="Status"
            options={STATUS_OPTIONS}
            value={statuses}
            onChange={(value) => {
              setStatuses(value);
              setPage(1);
            }}
            placeholder="Todos"
          />
          <div className={styles.dateRange}>
            <Entrada
              id="vendas-de"
              label="Período: de"
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
            />
            <Entrada
              id="vendas-ate"
              label="até"
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </PainelFiltros>
      ) : null}

      {isLoading ? (
        <EstadoCarregando message="Carregando vendas..." />
      ) : isError ? (
        <EstadoErro
          message="Não foi possível carregar as vendas."
          onRetry={refetch}
        />
      ) : data?.items?.length ? (
        <>
          <Tabela caption="Histórico de vendas">
            <Cabecalho>
              <Linha>
                <CelulaCabecalho>Produtos vendidos</CelulaCabecalho>
                <CelulaCabecalho>Data/hora</CelulaCabecalho>
                <CelulaCabecalho numeric>Quantidade</CelulaCabecalho>
                <CelulaCabecalho numeric>Desconto</CelulaCabecalho>
                <CelulaCabecalho numeric>Total</CelulaCabecalho>
                <CelulaCabecalho>Ações</CelulaCabecalho>
              </Linha>
            </Cabecalho>
            <Corpo>
              {data.items.map((sale) => (
                <Linha key={sale.id} muted={sale.cancelada}>
                  <Celula>{`Venda #${sale.id}`}</Celula>
                  <Celula>{formatarDataHora(sale.criadoEm)}</Celula>
                  <Celula numeric>{formatarNumero(sale.quantidadeItens)}</Celula>
                  <Celula numeric>{formatarMoeda(sale.desconto)}</Celula>
                  <Celula numeric>
                    <strong>{formatarMoeda(sale.precoTotal)}</strong>
                  </Celula>
                  <Celula>
                    <div className={styles.rowActions}>
                      <Botao
                        variant="secondary"
                        size="compact"
                        onClick={() => setDetailsSale(sale)}
                      >
                        Ver detalhes
                      </Botao>
                      {!sale.cancelada ? (
                        <Botao
                          variant="danger"
                          size="compact"
                          onClick={() => setCancelTarget(sale)}
                        >
                          Cancelar venda
                        </Botao>
                      ) : (
                        <Etiqueta variant="muted">Cancelada</Etiqueta>
                      )}
                    </div>
                  </Celula>
                </Linha>
              ))}
            </Corpo>
          </Tabela>
          <Paginacao
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EstadoVazio
          title={
            hasFilters ? "Nenhuma venda encontrada." : "Nenhuma venda registrada."
          }
          description={
            hasFilters
              ? "Ajuste a pesquisa ou limpe os filtros."
              : "As vendas confirmadas aparecerão aqui."
          }
          icon="bag"
          action={
            hasFilters ? (
              <Botao variant="secondary" onClick={clearAll}>
                Limpar filtros
              </Botao>
            ) : null
          }
        />
      )}

      {detailsSale ? (
        <VendaDetalhesModal
          sale={detailsSale}
          details={detalhesQuery.data}
          loading={detalhesQuery.isLoading}
          error={detalhesQuery.isError}
          onRetry={detalhesQuery.refetch}
          onClose={() => setDetailsSale(null)}
        />
      ) : null}

      {cancelTarget ? (
        <ConfirmacaoDialog
          title="Cancelar venda"
          message={`Deseja cancelar esta venda de ${formatarMoeda(
            cancelTarget.precoTotal,
          )}? Os produtos voltarão ao desempenho do evento.`}
          confirmLabel="Cancelar venda"
          cancelLabel="Voltar"
          destructive
          loading={cancelarVenda.isPending}
          onCancel={() => setCancelTarget(null)}
          onConfirm={confirmCancel}
        />
      ) : null}
    </div>
  );
}
