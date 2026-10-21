import { useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import FilterPanel from "../../components/Filters/FilterPanel";
import MultiSelect from "../../components/Form/MultiSelect";
import Input from "../../components/Form/Input";
import Button from "../../components/Button/Button";
import Badge from "../../components/Badge/Badge";
import Pagination from "../../components/Pagination/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "../../components/Table/Table";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/State/State";
import { useToast } from "../../context/ToastContext";
import { useCancelSale, useSales } from "../../hooks/useSales";
import { apiErrorMessage } from "../../services/api";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "../../utils/format";
import SaleDetailsModal from "./SaleDetailsModal";
import styles from "./SalesHistory.module.css";

const STATUS_OPTIONS = [
  { value: "active", label: "Vendas ativas" },
  { value: "cancelled", label: "Canceladas" },
];

export default function SalesHistoryView({
  eventId,
  pageSize = 8,
  className = "",
}) {
  const { addToast } = useToast();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [detailsSale, setDetailsSale] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const cancelSale = useCancelSale();
  const params = {
    eventId,
    search,
    page,
    pageSize,
    statuses: statuses.length ? statuses.join(",") : undefined,
    from: from || undefined,
    to: to || undefined,
  };
  const { data, isLoading, isError, refetch } = useSales(params);

  function clearFilters() {
    setStatuses([]);
    setFrom("");
    setTo("");
    setPage(1);
  }

  async function confirmCancel() {
    try {
      await cancelSale.mutateAsync(cancelTarget.id);
      addToast("Venda cancelada. Os itens foram devolvidos ao desempenho do evento.");
      setCancelTarget(null);
      setDetailsSale(null);
    } catch (error) {
      addToast(
        apiErrorMessage(error, "Não foi possível cancelar a venda."),
        "error",
      );
    }
  }

  const hasFilters =
    Boolean(search) || statuses.length > 0 || Boolean(from) || Boolean(to);

  return (
    <div className={`${styles.view} ${className}`.trim()}>
      <SearchBar
        value={searchDraft}
        onChange={setSearchDraft}
        onSubmit={() => {
          setSearch(searchDraft.trim());
          setPage(1);
        }}
        placeholder="Pesquisar produto..."
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((current) => !current)}
      />

      {filtersOpen ? (
        <FilterPanel onClear={clearFilters}>
          <MultiSelect
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
            <Input
              id="vendas-de"
              label="Período: de"
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
            />
            <Input
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
        </FilterPanel>
      ) : null}

      {isLoading ? (
        <LoadingState message="Carregando vendas..." />
      ) : isError ? (
        <ErrorState
          message="Não foi possível carregar as vendas."
          onRetry={refetch}
        />
      ) : data?.items?.length ? (
        <>
          <Table caption="Histórico de vendas">
            <THead>
              <TR>
                <TH>Produtos vendidos</TH>
                <TH>Data/hora</TH>
                <TH numeric>Quantidade</TH>
                <TH numeric>Desconto</TH>
                <TH numeric>Total</TH>
                <TH>Ações</TH>
              </TR>
            </THead>
            <TBody>
              {data.items.map((sale) => (
                <TR key={sale.id} muted={sale.status === "cancelled"}>
                  <TD>{sale.productsLabel}</TD>
                  <TD>{formatDateTime(sale.createdAt)}</TD>
                  <TD numeric>{formatNumber(sale.quantity)}</TD>
                  <TD numeric>{formatCurrency(sale.discount)}</TD>
                  <TD numeric>
                    <strong>{formatCurrency(sale.total)}</strong>
                  </TD>
                  <TD>
                    <div className={styles.rowActions}>
                      <Button
                        variant="secondary"
                        size="compact"
                        onClick={() => setDetailsSale(sale)}
                      >
                        Ver detalhes
                      </Button>
                      {sale.status === "active" ? (
                        <Button
                          variant="danger"
                          size="compact"
                          onClick={() => setCancelTarget(sale)}
                        >
                          Cancelar venda
                        </Button>
                      ) : (
                        <Badge variant="muted">Cancelada</Badge>
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EmptyState
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
              <Button
                variant="secondary"
                onClick={() => {
                  clearFilters();
                  setSearchDraft("");
                  setSearch("");
                }}
              >
                Limpar filtros
              </Button>
            ) : null
          }
        />
      )}

      {detailsSale ? (
        <SaleDetailsModal
          sale={detailsSale}
          onClose={() => setDetailsSale(null)}
        />
      ) : null}

      {cancelTarget ? (
        <ConfirmDialog
          title="Cancelar venda"
          message={`Deseja cancelar esta venda de ${formatCurrency(
            cancelTarget.total,
          )}? Os produtos voltarão ao desempenho do evento.`}
          confirmLabel="Cancelar venda"
          cancelLabel="Voltar"
          destructive
          loading={cancelSale.isPending}
          onCancel={() => setCancelTarget(null)}
          onConfirm={confirmCancel}
        />
      ) : null}
    </div>
  );
}
