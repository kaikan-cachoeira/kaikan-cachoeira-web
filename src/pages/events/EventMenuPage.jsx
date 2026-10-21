import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import SearchBar from "../../components/SearchBar/SearchBar";
import FilterPanel from "../../components/Filters/FilterPanel";
import Select from "../../components/Form/Select";
import Button from "../../components/Button/Button";
import Badge from "../../components/Badge/Badge";
import Icon from "../../components/Icon/Icon";
import Pagination from "../../components/Pagination/Pagination";
import CategoriesModal from "../inventory/CategoriesModal";
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
import { useEvent, useEventMenu } from "../../hooks/useEvents";
import {
  formatCurrency,
  formatNumber,
  formatPeriod,
} from "../../utils/format";
import AddMenuProductModal from "./AddMenuProductModal";
import styles from "./EventMenuPage.module.css";

const TYPE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "ready", label: "Produto pronto" },
  { value: "made", label: "Feito na hora" },
];

const PAGE_SIZE = 8;

export default function EventMenuPage() {
  const { id } = useParams();
  const { addToast } = useToast();
  const { data: event } = useEvent(id);
  const { data, isLoading, isError, refetch } = useEventMenu(id);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState("ready");
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const items = useMemo(() => data?.items || [], [data]);
  const categories = useMemo(() => data?.categories || [], [data]);

  const filtered = useMemo(() => {
    const term = search
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return items
      .filter((item) => !category || item.category === category)
      .filter((item) => !type || item.type === type)
      .filter((item) =>
        term
          ? item.name
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .includes(term)
          : true,
      );
  }, [items, category, type, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function clearFilters() {
    setCategory("");
    setType("");
    setPage(1);
  }

  function openAdd(nextType = "ready") {
    setAddType(nextType);
    setAddOpen(true);
  }

  const hasFilters = Boolean(search) || Boolean(category) || Boolean(type);

  return (
    <div className={styles.stack}>
      <Link to={`/eventos/${id}`} className={styles.backLink}>
        <Icon name="arrow-left" size={18} />
        Voltar para o evento
      </Link>

      <PageHeader
        title="Produtos do cardápio"
        subtitle="Controle dos produtos vendidos no baiten do evento"
        actions={
          <>
            <Button
              variant="secondary"
              iconLeft="ticket"
              onClick={() => setCategoriesOpen(true)}
            >
              Menu de categorias
            </Button>
            <Button iconLeft="plus" onClick={() => openAdd("ready")}>
              Adicionar produto
            </Button>
          </>
        }
      >
        {event ? (
          <div className={styles.eventContext}>
            <span>{event.name}</span>
            <span className={styles.eventMeta}>
              {formatPeriod(event.start, event.end)}
            </span>
            <Badge
              variant={
                event.status === "Em andamento"
                  ? "success"
                  : event.status === "Não iniciado"
                    ? "warning"
                    : "muted"
              }
              dot
            >
              {event.status}
            </Badge>
          </div>
        ) : null}
      </PageHeader>

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
          <Select
            id="cardapio-filtro-categoria"
            label="Categoria"
            options={[
              { value: "", label: "Todas" },
              ...categories.map((item) => ({
                value: item.name,
                label: item.name,
              })),
            ]}
            value={category}
            onChange={(changeEvent) => {
              setCategory(changeEvent.target.value);
              setPage(1);
            }}
          />
          <Select
            id="cardapio-filtro-tipo"
            label="Tipo"
            options={TYPE_OPTIONS}
            value={type}
            onChange={(changeEvent) => {
              setType(changeEvent.target.value);
              setPage(1);
            }}
          />
        </FilterPanel>
      ) : null}

      {isLoading ? (
        <LoadingState message="Carregando cardápio..." />
      ) : isError ? (
        <ErrorState
          message="Não foi possível carregar o cardápio do evento."
          onRetry={refetch}
        />
      ) : filtered.length ? (
        <>
          <Table caption="Produtos do cardápio do evento">
            <THead>
              <TR>
                <TH>Produto</TH>
                <TH>Categoria</TH>
                <TH numeric>Previsto</TH>
                <TH numeric>Vendido</TH>
                <TH numeric>Preço de venda</TH>
                <TH numeric>Receita</TH>
                <TH numeric>Custo total</TH>
                <TH numeric>Descontos</TH>
                <TH numeric>Lucro líquido</TH>
                <TH>Ações</TH>
              </TR>
            </THead>
            <TBody>
              {visible.map((item) => {
                const revenue = Math.max(
                  0,
                  item.price * item.sold - item.discounts,
                );
                const profit = revenue - item.costTotal;
                return (
                  <TR key={item.id}>
                    <TD>
                      <span className={styles.productName}>{item.name}</span>
                      <span className={styles.productType}>
                        {item.type === "ready"
                          ? "produto pronto"
                          : "feito na hora"}
                      </span>
                    </TD>
                    <TD>{item.category}</TD>
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
                    <TD>
                      <button
                        type="button"
                        className={styles.moreButton}
                        aria-label={`Mais opções de ${item.name}`}
                        onClick={() =>
                          addToast(
                            "O menu de opções do produto do cardápio ainda não foi especificado no SDD.",
                            "info",
                          )
                        }
                      >
                        <Icon name="more-vertical" size={20} />
                      </button>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EmptyState
          title={
            hasFilters
              ? "Nenhum produto encontrado."
              : "Nenhum produto no cardápio."
          }
          description={
            hasFilters
              ? "Ajuste a pesquisa ou limpe os filtros."
              : "Adicione produtos prontos do estoque ou produtos feitos na hora."
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
              <Button onClick={() => openAdd("ready")}>
                Adicionar produto
              </Button>
            )
          }
        />
      )}

      {addOpen ? (
        <AddMenuProductModal
          eventId={id}
          categories={categories}
          initialType={addType}
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {categoriesOpen ? (
        <CategoriesModal onClose={() => setCategoriesOpen(false)} />
      ) : null}
    </div>
  );
}
