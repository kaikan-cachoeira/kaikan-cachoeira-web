import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import SearchBar from "../../components/SearchBar/SearchBar";
import FilterPanel from "../../components/Filters/FilterPanel";
import MultiSelect from "../../components/Form/MultiSelect";
import Button from "../../components/Button/Button";
import Badge from "../../components/Badge/Badge";
import Icon from "../../components/Icon/Icon";
import Pagination from "../../components/Pagination/Pagination";
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
import { useDonations } from "../../hooks/useDonations";
import { useEvents } from "../../hooks/useEvents";
import { useToast } from "../../context/ToastContext";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "../../utils/format";
import DonationModal from "./DonationModal";
import styles from "./DonationsPage.module.css";

const TYPE_OPTIONS = [
  { value: "ready", label: "Produto" },
  { value: "money", label: "Dinheiro" },
  { value: "ingredient", label: "Ingrediente" },
];

const TYPE_LABELS = {
  ready: "Produto",
  money: "Dinheiro",
  ingredient: "Ingrediente",
};

function donationLabel(donation) {
  if (donation.type === "money") {
    return `Doação em dinheiro · ${donation.paymentMethod || "PIX"}`;
  }
  return `${donation.itemName || "Doação"}${
    donation.quantity ? ` · ${formatNumber(donation.quantity)} unidades` : ""
  }`;
}

export default function DonationsPage() {
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const initialEvent = searchParams.get("evento");
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(Boolean(initialEvent));
  const [selectedEvents, setSelectedEvents] = useState(
    initialEvent ? [initialEvent] : [],
  );
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const params = {
    search,
    page,
    pageSize: 6,
    eventIds: selectedEvents.length ? selectedEvents.join(",") : undefined,
    types: selectedTypes.length ? selectedTypes.join(",") : undefined,
  };

  const { data, isLoading, isError, refetch } = useDonations(params);
  const { data: eventsData } = useEvents({ pageSize: 100 });

  const eventOptions = (eventsData?.items || []).map((event) => ({
    value: event.id,
    label: event.name,
  }));

  function clearFilters() {
    setSelectedEvents([]);
    setSelectedTypes([]);
    setPage(1);
  }

  const hasFilters =
    Boolean(search) || selectedEvents.length > 0 || selectedTypes.length > 0;

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Doações"
        subtitle="Doações destinadas e consumidas em cada evento"
        actions={
          <Button iconLeft="plus" onClick={() => setModalOpen(true)}>
            Registrar doação
          </Button>
        }
      />

      <SearchBar
        value={searchDraft}
        onChange={setSearchDraft}
        onSubmit={() => {
          setSearch(searchDraft.trim());
          setPage(1);
        }}
        placeholder="Pesquisar doador ou item..."
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((current) => !current)}
      />

      {filtersOpen ? (
        <FilterPanel onClear={clearFilters}>
          <MultiSelect
            label="Eventos"
            options={eventOptions}
            value={selectedEvents}
            onChange={(value) => {
              setSelectedEvents(value);
              setPage(1);
            }}
            placeholder="Todos"
          />
          <MultiSelect
            label="Tipo de doação"
            options={TYPE_OPTIONS}
            value={selectedTypes}
            onChange={(value) => {
              setSelectedTypes(value);
              setPage(1);
            }}
            placeholder="Todos"
          />
        </FilterPanel>
      ) : null}

      {isLoading ? (
        <LoadingState message="Carregando doações..." />
      ) : isError ? (
        <ErrorState
          message="Não foi possível carregar as doações."
          onRetry={refetch}
        />
      ) : data?.items?.length ? (
        <>
          <Table caption="Doações registradas">
            <THead>
              <TR>
                <TH>Doação</TH>
                <TH>Doador</TH>
                <TH>Evento destinado</TH>
                <TH>Tipo</TH>
                <TH numeric>Custo da ficha</TH>
                <TH>Data</TH>
                <TH>Ações</TH>
              </TR>
            </THead>
            <TBody>
              {data.items.map((donation) => (
                <TR key={donation.id}>
                  <TD>{donationLabel(donation)}</TD>
                  <TD>{donation.donor || "Não informado"}</TD>
                  <TD>{donation.eventName}</TD>
                  <TD>
                    <Badge
                      variant={donation.type === "money" ? "success" : "neutral"}
                    >
                      {TYPE_LABELS[donation.type] || donation.type}
                    </Badge>
                  </TD>
                  <TD numeric>{formatCurrency(donation.ticketValue)}</TD>
                  <TD>{formatDateTime(donation.createdAt)}</TD>
                  <TD>
                    <button
                      type="button"
                      className={styles.moreButton}
                      aria-label={`Mais opções da doação de ${donation.donor || donation.itemName}`}
                      onClick={() =>
                        addToast(
                          "O menu de opções da doação ainda não foi especificado no SDD.",
                          "info",
                        )
                      }
                    >
                      <Icon name="more-vertical" size={20} />
                    </button>
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
            hasFilters
              ? "Nenhuma doação encontrada."
              : "Nenhuma doação registrada."
          }
          description={
            hasFilters
              ? "Ajuste a pesquisa ou limpe os filtros."
              : "Registre a primeira doação destinada a um evento."
          }
          icon="gift"
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
            ) : (
              <Button onClick={() => setModalOpen(true)}>
                Registrar doação
              </Button>
            )
          }
        />
      )}

      {modalOpen ? (
        <DonationModal onClose={() => setModalOpen(false)} />
      ) : null}
    </div>
  );
}
