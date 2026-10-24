import BarraPesquisa from "@/shared/components/BarraPesquisa/BarraPesquisa";
import Botao from "@/shared/components/Botao/Botao";
import {
  EstadoCarregando,
  EstadoErro,
  EstadoVazio,
} from "@/shared/components/Estado/Estado";
import PainelFiltros from "@/shared/components/Filtros/PainelFiltros";
import Selecao from "@/shared/components/Formulario/Selecao";
import SelecaoMultipla from "@/shared/components/Formulario/SelecaoMultipla";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import Paginacao from "@/shared/components/Paginacao/Paginacao";
import SucessoDialog from "@/shared/components/SucessoDialog/SucessoDialog";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import MovimentacaoModal from "../components/MovimentacaoModal";
import ProdutoCard from "../components/ProdutoCard";
import ProdutoDetalhesModal from "../components/ProdutoDetalhesModal";
import ProdutoFormModal from "../components/ProdutoFormModal";
import CategoriasModal from "../widgets/CategoriasModal";
import { useInventario } from "../hooks/useInventario";
import styles from "./InventarioPage.module.css";

const OPCOES_ESTOQUE = [
  { value: "", label: "Todos" },
  { value: "low", label: "Estoque baixo" },
  { value: "out", label: "Sem estoque" },
  { value: "ok", label: "Estoque OK" },
];

export default function InventarioPage() {
  const { addToast } = useToast();
  const {
    searchDraft,
    setSearchDraft,
    search,
    filtersOpen,
    setFiltersOpen,
    selectedCategories,
    setSelectedCategories,
    stock,
    setStock,
    setPage,
    createOpen,
    setCreateOpen,
    createdProduct,
    setCreatedProduct,
    detailsId,
    setDetailsId,
    movementProduct,
    setMovementProduct,
    movementSuccess,
    setMovementSuccess,
    categoriesOpen,
    setCategoriesOpen,
    produtosQuery,
    categoriasQuery,
    categoryOptions,
    runSearch,
    clearFilters,
    clearAll,
    openMovement,
    handleMovementSuccess,
  } = useInventario();

  const { data, isLoading, isError, isFetching, refetch } = produtosQuery;
  const { isLoading: categoriesLoading } = categoriasQuery;

  return (
    <div className={styles.stack}>
      <PageHeader
        subtitle="Controle por lotes com baixa FIFO/PEPS"
        actions={
          <>
            <Botao
              variant="secondary"
              iconLeft="ticket"
              onClick={ () => setCategoriesOpen(true)}
            >
              Menu de categorias
            </Botao>
            <Botao iconLeft="plus" onClick={() => setCreateOpen(true)}>
              Criar produto
            </Botao>
          </>
        }
      />

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
          <Selecao
            id="filtro-estoque"
            label="Situação do estoque"
            options={OPCOES_ESTOQUE}
            value={stock}
            onChange={(event) => {
              setStock(event.target.value);
              setPage(1);
            }}
          />
        </PainelFiltros>
      ) : null}

      {isLoading ? (
        <EstadoCarregando message="Carregando produtos..." />
      ) : isError ? (
        <EstadoErro
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
              <ProdutoCard
                key={product.id}
                produto={product}
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
          <Paginacao
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EstadoVazio
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
            <Botao variant="secondary" onClick={clearAll}>
              Limpar filtros
            </Botao>
          }
        />
      )}

      {createOpen ? (
        <ProdutoFormModal
          onClose={() => setCreateOpen(false)}
          onCreated={(product) => {
            setCreateOpen(false);
            setCreatedProduct(product);
          }}
        />
      ) : null}

      {createdProduct ? (
        <SucessoDialog
          title="Produto criado com sucesso!"
          message={`"${createdProduct.name}" foi adicionado ao estoque com quantidade inicial zero. Registre uma movimentação de reabastecimento para incluir unidades.`}
          buttonLabel="Voltar"
          onClose={() => setCreatedProduct(null)}
        />
      ) : null}

      {detailsId ? (
        <ProdutoDetalhesModal
          productId={detailsId}
          onClose={() => setDetailsId(null)}
          onMovement={openMovement}
        />
      ) : null}

      {movementProduct ? (
        <MovimentacaoModal
          produto={movementProduct}
          onClose={() => setMovementProduct?.(null)}
          onSuccess={handleMovementSuccess}
        />
      ) : null}

      {movementSuccess ? (
        <SucessoDialog
          title="Movimentação realizada com sucesso!"
          message="O saldo do produto foi atualizado."
          buttonLabel="OK"
          onClose={() => setMovementSuccess(false)}
        />
      ) : null}

      {categoriesOpen ? (
        <CategoriasModal onClose={() => setCategoriesOpen(false)} />
      ) : null}
    </div>
  );
}
