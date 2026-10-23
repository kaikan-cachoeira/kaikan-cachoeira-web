import PageHeader from "@/shared/components/PageHeader/PageHeader";
import BarraPesquisa from "@/shared/components/BarraPesquisa/BarraPesquisa";
import PainelFiltros from "@/shared/components/Filtros/PainelFiltros";
import SelecaoMultipla from "@/shared/components/Formulario/SelecaoMultipla";
import Botao from "@/shared/components/Botao/Botao";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import Icone from "@/shared/components/Icone/Icone";
import Paginacao from "@/shared/components/Paginacao/Paginacao";
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
import type { Doacao } from "../models";
import { useDoacoes } from "../hooks/useDoacoes";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import {
  formatarMoeda,
  formatarDataHora,
  formatarNumero,
} from "@/shared/lib/formatacao";
import DoacaoModal from "../components/DoacaoModal";
import styles from "./DoacoesPage.module.css";

const TYPE_OPTIONS = [
  { value: "ready", label: "Produto" },
  { value: "money", label: "Dinheiro" },
  { value: "ingredient", label: "Ingrediente" },
];

const TYPE_LABELS: Record<string, string> = {
  ready: "Produto",
  money: "Dinheiro",
  ingredient: "Ingrediente",
};

function donationLabel(donation: Doacao) {
  if (donation.type === "money") {
    return `Doação em dinheiro · ${donation.paymentMethod || "PIX"}`;
  }
  return `${donation.itemName || "Doação"}${
    donation.quantity ? ` · ${formatarNumero(donation.quantity)} unidades` : ""
  }`;
}

export default function DoacoesPage() {
  const { addToast } = useToast();
  const {
    searchDraft,
    setSearchDraft,
    search,
    setPage,
    filtersOpen,
    setFiltersOpen,
    selectedEvents,
    setSelectedEvents,
    selectedTypes,
    setSelectedTypes,
    modalOpen,
    setModalOpen,
    doacoesQuery,
    eventOptions,
    runSearch,
    clearFilters,
    clearAll,
  } = useDoacoes();
  const { data, isLoading, isError, refetch } = doacoesQuery;

  const hasFilters =
    Boolean(search) || selectedEvents.length > 0 || selectedTypes.length > 0;

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Doações"
        subtitle="Doações destinadas e consumidas em cada evento"
        actions={
          <Botao iconLeft="plus" onClick={() => setModalOpen(true)}>
            Registrar doação
          </Botao>
        }
      />

      <BarraPesquisa
        value={searchDraft}
        onChange={setSearchDraft}
        onSubmit={runSearch}
        placeholder="Pesquisar doador ou item..."
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((current) => !current)}
      />

      {filtersOpen ? (
        <PainelFiltros onClear={clearFilters}>
          <SelecaoMultipla
            label="Eventos"
            options={eventOptions}
            value={selectedEvents}
            onChange={(value) => {
              setSelectedEvents(value);
              setPage(1);
            }}
            placeholder="Todos"
          />
          <SelecaoMultipla
            label="Tipo de doação"
            options={TYPE_OPTIONS}
            value={selectedTypes}
            onChange={(value) => {
              setSelectedTypes(value);
              setPage(1);
            }}
            placeholder="Todos"
          />
        </PainelFiltros>
      ) : null}

      {isLoading ? (
        <EstadoCarregando message="Carregando doações..." />
      ) : isError ? (
        <EstadoErro
          message="Não foi possível carregar as doações."
          onRetry={refetch}
        />
      ) : data?.items?.length ? (
        <>
          <Tabela caption="Doações registradas">
            <Cabecalho>
              <Linha>
                <CelulaCabecalho>Doação</CelulaCabecalho>
                <CelulaCabecalho>Doador</CelulaCabecalho>
                <CelulaCabecalho>Evento destinado</CelulaCabecalho>
                <CelulaCabecalho>Tipo</CelulaCabecalho>
                <CelulaCabecalho numeric>Custo da ficha</CelulaCabecalho>
                <CelulaCabecalho>Data</CelulaCabecalho>
                <CelulaCabecalho>Ações</CelulaCabecalho>
              </Linha>
            </Cabecalho>
            <Corpo>
              {data.items.map((donation) => (
                <Linha key={donation.id}>
                  <Celula>{donationLabel(donation)}</Celula>
                  <Celula>{donation.donor || "Não informado"}</Celula>
                  <Celula>{donation.eventName}</Celula>
                  <Celula>
                    <Etiqueta
                      variant={donation.type === "money" ? "success" : "neutral"}
                    >
                      {TYPE_LABELS[donation.type] || donation.type}
                    </Etiqueta>
                  </Celula>
                  <Celula numeric>{formatarMoeda(donation.ticketValue)}</Celula>
                  <Celula>{formatarDataHora(donation.createdAt)}</Celula>
                  <Celula>
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
                      <Icone name="more-vertical" size={20} />
                    </button>
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
              <Botao variant="secondary" onClick={clearAll}>
                Limpar filtros
              </Botao>
            ) : (
              <Botao onClick={() => setModalOpen(true)}>
                Registrar doação
              </Botao>
            )
          }
        />
      )}

      {modalOpen ? (
        <DoacaoModal onClose={() => setModalOpen(false)} />
      ) : null}
    </div>
  );
}
