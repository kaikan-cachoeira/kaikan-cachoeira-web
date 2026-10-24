import { useState } from "react";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import BarraPesquisa from "@/shared/components/BarraPesquisa/BarraPesquisa";
import PainelFiltros from "@/shared/components/Filtros/PainelFiltros";
import SelecaoMultipla from "@/shared/components/Formulario/SelecaoMultipla";
import Entrada from "@/shared/components/Formulario/Entrada";
import Botao from "@/shared/components/Botao/Botao";
import Paginacao from "@/shared/components/Paginacao/Paginacao";
import ConfirmacaoDialog from "@/shared/components/ConfirmacaoDialog/ConfirmacaoDialog";
import {
  EstadoVazio,
  EstadoErro,
  EstadoCarregando,
} from "@/shared/components/Estado/Estado";
import { useEventos } from "../hooks/useEventos";
import type { Evento } from "../models";
import EventoCard from "../components/EventoCard";
import EventoFormModal from "../components/EventoFormModal";
import styles from "./EventosPage.module.css";

const STATUS_OPTIONS = [
  { value: "Em andamento", label: "Em andamento" },
  { value: "Não iniciado", label: "Não iniciado" },
  { value: "Encerrado", label: "Encerrado" },
];

const TYPE_OPTIONS = [
  { value: "Evento", label: "Evento" },
  { value: "Reunião", label: "Reunião" },
];

export default function EventosPage() {
  const {
    searchDraft,
    setSearchDraft,
    search,
    setPage,
    filtersOpen,
    setFiltersOpen,
    statuses,
    setStatuses,
    types,
    setTypes,
    from,
    setFrom,
    to,
    setTo,
    createOpen,
    setCreateOpen,
    deleteTarget,
    setDeleteTarget,
    eventosQuery,
    alterarStatus: changeStatus,
    excluirEvento: deleteEvent,
    handleStatus,
    confirmDelete,
    runSearch,
    clearFilters,
    clearAll,
  } = useEventos();
  const [editTarget, setEditTarget] = useState<Evento | null>(null);

  const { data, isLoading, isError, refetch } = eventosQuery;
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
    onEdit: setEditTarget,
  };

  return (
    <div className={styles.stack}>
      <PageHeader
        subtitle="Gerencie eventos e reuniões da associação"
        actions={
          <Botao iconLeft="plus" onClick={() => setCreateOpen(true)}>
            Criar evento
          </Botao>
        }
      />

      <BarraPesquisa
        value={searchDraft}
        onChange={setSearchDraft}
        onSubmit={runSearch}
        placeholder="Pesquisar evento pelo nome"
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((current) => !current)}
      />

      {filtersOpen ? (
        <PainelFiltros onClear={clearFilters} columns={2}>
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
          <SelecaoMultipla
            label="Tipo do evento"
            options={TYPE_OPTIONS}
            value={types}
            onChange={(value) => {
              setTypes(value);
              setPage(1);
            }}
            placeholder="Todos"
          />
          <Entrada
            id="eventos-de"
            label="Período: de"
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
          />
          <Entrada
            id="eventos-ate"
            label="até"
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
          />
        </PainelFiltros>
      ) : null}

      {isLoading ? (
        <EstadoCarregando message="Carregando eventos..." />
      ) : isError ? (
        <EstadoErro
          message="Não foi possível carregar os eventos."
          onRetry={refetch}
        />
      ) : items.length === 0 ? (
        <EstadoVazio
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
              <Botao
                variant="secondary"
                onClick={clearAll}
              >
                Limpar filtros
              </Botao>
            ) : (
              <Botao onClick={() => setCreateOpen(true)}>Criar evento</Botao>
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
              <EventoCard
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
                  <EventoCard
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

          {data ? (
            <Paginacao
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      {createOpen ? (
        <EventoFormModal onClose={() => setCreateOpen(false)} />
      ) : null}

      {editTarget ? (
        <EventoFormModal
          evento={editTarget}
          onClose={() => setEditTarget(null)}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmacaoDialog
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
