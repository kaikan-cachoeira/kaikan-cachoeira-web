import { useState } from "react";
import PageHeader from "../../components/PageHeader/PageHeader";
import SearchBar from "../../components/SearchBar/SearchBar";
import FilterPanel from "../../components/Filters/FilterPanel";
import Pagination from "../../components/Pagination/Pagination";
import Button from "../../components/Button/Button";
import MultiSelect from "../../components/Form/MultiSelect";
import Select from "../../components/Form/Select";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/State/State";
import SuccessDialog from "../../components/SuccessDialog/SuccessDialog";
import { useToast } from "../../context/ToastContext";
import { useCategories, useProducts } from "../../hooks/useInventory";
import ProductCard from "./ProductCard";
import ProductFormModal from "./ProductFormModal";
import ProductDetailsModal from "./ProductDetailsModal";
import CategoriesModal from "./CategoriesModal";
import MovementModal from "./MovementModal";
import styles from "./InventoryPage.module.css";

const STOCK_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "low", label: "Estoque baixo" },
  { value: "out", label: "Sem estoque" },
  { value: "ok", label: "Estoque OK" },
];

export default function InventoryPage() {
  const { addToast } = useToast();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [stock, setStock] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createdProduct, setCreatedProduct] = useState(null);
  const [detailsId, setDetailsId] = useState(null);
  const [movementProduct, setMovementProduct] = useState(null);
  const [movementSuccess, setMovementSuccess] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const params = {
    search,
    page,
    pageSize: 6,
    stock: stock || undefined,
    categoryIds: selectedCategories.length
      ? selectedCategories.join(",")
      : undefined,
  };

  const { data, isLoading, isError, isFetching, refetch } = useProducts(params);
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  const categoryOptions = (categoriesData?.items || []).map((category) => ({
    value: category.id,
    label: category.name,
  }));

  function runSearch() {
    setSearch(searchDraft.trim());
    setPage(1);
  }

  function clearFilters() {
    setSelectedCategories([]);
    setStock("");
    setPage(1);
  }

  function openMovement(product) {
    setMovementProduct(product);
  }

  function handleMovementSuccess() {
    setMovementProduct(null);
    setMovementSuccess(true);
    setDetailsId(null);
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Estoque"
        subtitle="Controle por lotes com baixa FIFO/PEPS"
        actions={
          <>
            <Button
              variant="secondary"
              iconLeft="ticket"
              onClick={() => setCategoriesOpen(true)}
            >
              Menu de categorias
            </Button>
            <Button iconLeft="plus" onClick={() => setCreateOpen(true)}>
              Criar produto
            </Button>
          </>
        }
      />

      <SearchBar
        value={searchDraft}
        onChange={setSearchDraft}
        onSubmit={runSearch}
        placeholder="Pesquisar produto..."
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((current) => !current)}
      />

      {filtersOpen ? (
        <FilterPanel onClear={clearFilters}>
          <MultiSelect
            label="Categorias"
            options={categoryOptions}
            value={selectedCategories}
            onChange={(value) => {
              setSelectedCategories(value);
              setPage(1);
            }}
            placeholder={
              categoriesLoading ? "Carregando categorias..." : "Todos"
            }
          />
          <Select
            id="filtro-estoque"
            label="Situação do estoque"
            options={STOCK_OPTIONS}
            value={stock}
            onChange={(event) => {
              setStock(event.target.value);
              setPage(1);
            }}
          />
        </FilterPanel>
      ) : null}

      {isLoading ? (
        <LoadingState message="Carregando produtos..." />
      ) : isError ? (
        <ErrorState
          message="Não foi possível carregar os produtos."
          onRetry={refetch}
        />
      ) : data?.items?.length ? (
        <>
          <div
            className={styles.grid}
            aria-busy={isFetching ? "true" : undefined}
          >
            {data.items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDetails={(item) => setDetailsId(item.id)}
                onMovement={openMovement}
                onPending={(label) =>
                  addToast(
                    `${label}: a tela de edição ainda não foi especificada no SDD.`,
                    "info",
                  )
                }
              />
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EmptyState
          title={
            search || selectedCategories.length || stock
              ? "Nenhum produto encontrado."
              : "Nenhum produto cadastrado."
          }
          description={
            search || selectedCategories.length || stock
              ? "Ajuste a pesquisa ou limpe os filtros para ver mais produtos."
              : "Cadastre o primeiro produto para começar a controlar o estoque."
          }
          icon="box"
          action={
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
          }
        />
      )}

      {createOpen ? (
        <ProductFormModal
          onClose={() => setCreateOpen(false)}
          onCreated={(product) => {
            setCreateOpen(false);
            setCreatedProduct(product);
          }}
        />
      ) : null}

      {createdProduct ? (
        <SuccessDialog
          title="Produto criado com sucesso!"
          message={`"${createdProduct.name}" foi adicionado ao estoque com quantidade inicial zero. Registre uma movimentação de reabastecimento para incluir unidades.`}
          buttonLabel="Voltar"
          onClose={() => setCreatedProduct(null)}
        />
      ) : null}

      {detailsId ? (
        <ProductDetailsModal
          productId={detailsId}
          onClose={() => setDetailsId(null)}
          onMovement={openMovement}
        />
      ) : null}

      {movementProduct ? (
        <MovementModal
          product={movementProduct}
          onClose={() => setMovementProduct(null)}
          onSuccess={handleMovementSuccess}
        />
      ) : null}

      {movementSuccess ? (
        <SuccessDialog
          title="Movimentação realizada com sucesso!"
          message="O saldo do produto foi atualizado."
          buttonLabel="OK"
          onClose={() => setMovementSuccess(false)}
        />
      ) : null}

      {categoriesOpen ? (
        <CategoriesModal onClose={() => setCategoriesOpen(false)} />
      ) : null}
    </div>
  );
}
