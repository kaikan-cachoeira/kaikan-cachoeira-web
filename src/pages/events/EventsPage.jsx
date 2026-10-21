import { useState } from "react";
import PageHeader from "../../components/PageHeader/PageHeader";
import SearchBar from "../../components/SearchBar/SearchBar";
import FilterPanel from "../../components/Filters/FilterPanel";
import MultiSelect from "../../components/Form/MultiSelect";
import Input from "../../components/Form/Input";
import Button from "../../components/Button/Button";
import Pagination from "../../components/Pagination/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/State/State";
import { useToast } from "../../context/ToastContext";
import {
  useChangeEventStatus,
  useDeleteEvent,
  useEvents,
} from "../../hooks/useEvents";
import { apiErrorMessage } from "../../services/api";
import EventCard from "./EventCard";
import EventFormModal from "./EventFormModal";
import styles from "./EventsPage.module.css";

const STATUS_OPTIONS = [
  { value: "Em andamento", label: "Em andamento" },
  { value: "Não iniciado", label: "Não iniciado" },
  { value: "Encerrado", label: "Encerrado" },
];

const TYPE_OPTIONS = [
  { value: "Evento", label: "Evento" },
  { value: "Reunião", label: "Reunião" },
];

export default function EventsPage() {
  const { addToast } = useToast();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [types, setTypes] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const changeStatus = useChangeEventStatus();
  const deleteEvent = useDeleteEvent();

  const params = {
    search,
    page,
    pageSize: 8,
    statuses: statuses.length ? statuses.join(",") : undefined,
    types: types.length ? types.join(",") : undefined,
    from: from || undefined,
    to: to || undefined,
  };

  const { data, isLoading, isError, refetch } = useEvents(params);

  async function handleStatus(event, nextStatus) {
    try {
      await changeStatus.mutateAsync({ id: event.id, status: nextStatus });
      addToast(
        nextStatus === "Em andamento"
          ? `Evento "${event.name}" iniciado.`
          : nextStatus === "Encerrado"
            ? `Evento "${event.name}" encerrado.`
            : `Início do evento "${event.name}" desfeito.`,
      );
    } catch (error) {
      addToast(
        apiErrorMessage(error, "Não foi possível alterar a situação do evento."),
        "error",
      );
    }
  }

  async function confirmDelete() {
    try {
      await deleteEvent.mutateAsync(deleteTarget.id);
      addToast(`Evento "${deleteTarget.name}" excluído.`);
      setDeleteTarget(null);
    } catch (error) {
      addToast(
        apiErrorMessage(error, "Não foi possível excluir o evento."),
        "error",
      );
    }
  }

  function clearFilters() {
    setStatuses([]);
    setTypes([]);
    setFrom("");
    setTo("");
    setPage(1);
  }

  const items = data?.items || [];
  const ongoing = items.find((event) => event.ongoing);
  const others = ongoing
    ? items.filter((event) => event.id !== ongoing.id)
    : items;
  const hasFilters =
    Boolean(search) ||
    statuses.length > 0 ||
    types.length > 0 ||
    Boolean(from) ||
    Boolean(to);

  const cardProps = {
    onChangeStatus: handleStatus,
    onDelete: setDeleteTarget,
    onPending: (label) =>
      addToast(
        `${label}: a tela de edição ainda não foi especificada no SDD.`,
        "info",
      ),
  };

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Eventos"
        subtitle="Gerencie eventos e reuniões da associação"
        actions={
          <Button iconLeft="plus" onClick={() => setCreateOpen(true)}>
            Criar evento
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
        placeholder="Pesquisar evento pelo nome"
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((current) => !current)}
      />

      {filtersOpen ? (
        <FilterPanel onClear={clearFilters} columns={2}>
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
          <MultiSelect
            label="Tipo do evento"
            options={TYPE_OPTIONS}
            value={types}
            onChange={(value) => {
              setTypes(value);
              setPage(1);
            }}
            placeholder="Todos"
          />
          <Input
            id="eventos-de"
            label="Período: de"
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
          />
          <Input
            id="eventos-ate"
            label="até"
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
          />
        </FilterPanel>
      ) : null}

      {isLoading ? (
        <LoadingState message="Carregando eventos..." />
      ) : isError ? (
        <ErrorState
          message="Não foi possível carregar os eventos."
          onRetry={refetch}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={
            hasFilters ? "Nenhum evento encontrado." : "Nenhum evento cadastrado."
          }
          description={
            hasFilters
              ? "Ajuste a pesquisa ou limpe os filtros."
              : "Crie o primeiro evento ou reunião da associação."
          }
          icon="ticket"
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
              <Button onClick={() => setCreateOpen(true)}>Criar evento</Button>
            )
          }
        />
      ) : (
        <>
          {ongoing ? (
            <section
              className={styles.ongoingSection}
              aria-labelledby="evento-em-andamento"
            >
              <h2 className={styles.sectionTitle} id="evento-em-andamento">
                Evento em andamento
              </h2>
              <EventCard
                event={ongoing}
                highlighted
                busy={
                  changeStatus.isPending &&
                  changeStatus.variables?.id === ongoing.id
                }
                {...cardProps}
              />
            </section>
          ) : null}

          {others.length ? (
            <section className={styles.listSection} aria-label="Eventos">
              {ongoing ? (
                <h2 className={styles.sectionTitle}>Outros eventos</h2>
              ) : null}
              <div className={styles.grid}>
                {others.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    busy={
                      changeStatus.isPending &&
                      changeStatus.variables?.id === event.id
                    }
                    {...cardProps}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {createOpen ? (
        <EventFormModal onClose={() => setCreateOpen(false)} />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          title="Excluir evento"
          message={`Deseja excluir o evento "${deleteTarget.name}"? Vendas, doações, fiados e lançamentos de caixa vinculados também serão removidos.`}
          confirmLabel="Excluir evento"
          destructive
          loading={deleteEvent.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}
