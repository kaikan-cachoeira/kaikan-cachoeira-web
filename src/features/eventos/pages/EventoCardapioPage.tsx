import { Link, useParams } from "react-router-dom";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import BarraPesquisa from "@/shared/components/BarraPesquisa/BarraPesquisa";
import PainelFiltros from "@/shared/components/Filtros/PainelFiltros";
import Selecao from "@/shared/components/Formulario/Selecao";
import Botao from "@/shared/components/Botao/Botao";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import Icone from "@/shared/components/Icone/Icone";
import Paginacao from "@/shared/components/Paginacao/Paginacao";
import { CategoriasModal } from "@/features/inventario";
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
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { useEventoCardapio } from "../hooks/useEventoCardapio";
import {
  formatarMoeda,
  formatarNumero,
  formatarPeriodo,
} from "@/shared/lib/formatacao";
import AdicionarProdutoCardapioModal from "../components/AdicionarProdutoCardapioModal";
import styles from "./EventoCardapioPage.module.css";

const TYPE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "ready", label: "Produto pronto" },
  { value: "made", label: "Feito na hora" },
];


export default function EventoCardapioPage() {
  const { id } = useParams();
  const { addToast } = useToast();
  const {
    event,
    isLoading,
    isError,
    refetch,
    categories,
    filtered,
    category,
    visible,
    totalPages,
    safePage,
    searchDraft,
    setSearchDraft,
    filtersOpen,
    setFiltersOpen,
    type,
    changeCategory,
    changeType,
    setPage,
    addOpen,
    setAddOpen,
    addType,
    categoriesOpen,
    setCategoriesOpen,
    runSearch,
    clearFilters,
    clearAll,
    openAdd,
    hasFilters,
  } = useEventoCardapio(id);

  return (
    <div className={styles.stack}>
      <Link to={`/eventos/${id}`} className={styles.backLink}>
        <Icone name="arrow-left" size={18} />
        Voltar para o evento
      </Link>

      <PageHeader
        title="Produtos do cardápio"
        subtitle="Controle dos produtos vendidos no baiten do evento"
        actions={
          <>
            <Botao
              variant="secondary"
              iconLeft="ticket"
              onClick={() => setCategoriesOpen(true)}
            >
              Menu de categorias
            </Botao>
            <Botao iconLeft="plus" onClick={() => openAdd("ready")}>
              Adicionar produto
            </Botao>
          </>
        }
      >
        {event ? (
          <div className={styles.eventContext}>
            <span>{event.name}</span>
            <span className={styles.eventMeta}>
              {formatarPeriodo(event.start, event.end)}
            </span>
            <Etiqueta
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
            </Etiqueta>
          </div>
        ) : null}
      </PageHeader>

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
          <Selecao
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
            onChange={(changeEvent) => changeCategory(changeEvent.target.value)}
          />
          <Selecao
            id="cardapio-filtro-tipo"
            label="Tipo"
            options={TYPE_OPTIONS}
            value={type}
            onChange={(changeEvent) => changeType(changeEvent.target.value)}
          />
        </PainelFiltros>
      ) : null}

      {isLoading ? (
        <EstadoCarregando message="Carregando cardápio..." />
      ) : isError ? (
        <EstadoErro
          message="Não foi possível carregar o cardápio do evento."
          onRetry={refetch}
        />
      ) : filtered.length ? (
        <>
          <Tabela caption="Produtos do cardápio do evento">
            <Cabecalho>
              <Linha>
                <CelulaCabecalho>Produto</CelulaCabecalho>
                <CelulaCabecalho>Categoria</CelulaCabecalho>
                <CelulaCabecalho numeric>Previsto</CelulaCabecalho>
                <CelulaCabecalho numeric>Vendido</CelulaCabecalho>
                <CelulaCabecalho numeric>Preço de venda</CelulaCabecalho>
                <CelulaCabecalho numeric>Receita</CelulaCabecalho>
                <CelulaCabecalho numeric>Custo total</CelulaCabecalho>
                <CelulaCabecalho numeric>Descontos</CelulaCabecalho>
                <CelulaCabecalho numeric>Lucro líquido</CelulaCabecalho>
                <CelulaCabecalho>Ações</CelulaCabecalho>
              </Linha>
            </Cabecalho>
            <Corpo>
              {visible.map((item) => {
                const revenue = Math.max(
                  0,
                  item.price * item.sold - item.discounts,
                );
                const profit = revenue - item.costTotal;
                return (
                  <Linha key={item.id}>
                    <Celula>
                      <span className={styles.productName}>{item.name}</span>
                      <span className={styles.productType}>
                        {item.type === "ready"
                          ? "produto pronto"
                          : "feito na hora"}
                      </span>
                    </Celula>
                    <Celula>{item.category}</Celula>
                    <Celula numeric>
                      {item.expected === null || item.expected === undefined
                        ? "—"
                        : formatarNumero(item.expected)}
                    </Celula>
                    <Celula numeric>{formatarNumero(item.sold)}</Celula>
                    <Celula numeric>{formatarMoeda(item.price)}</Celula>
                    <Celula numeric>{formatarMoeda(revenue)}</Celula>
                    <Celula numeric>{formatarMoeda(item.costTotal)}</Celula>
                    <Celula numeric>{formatarMoeda(item.discounts)}</Celula>
                    <Celula numeric>
                      <span
                        className={
                          profit >= 0 ? styles.positive : styles.negative
                        }
                      >
                        {formatarMoeda(profit)}
                      </span>
                    </Celula>
                    <Celula>
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
                        <Icone name="more-vertical" size={20} />
                      </button>
                    </Celula>
                  </Linha>
                );
              })}
            </Corpo>
          </Tabela>
          <Paginacao
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EstadoVazio
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
              <Botao
                variant="secondary"
                onClick={clearAll}
              >
                Limpar filtros
              </Botao>
            ) : (
              <Botao onClick={() => openAdd("ready")}>
                Adicionar produto
              </Botao>
            )
          }
        />
      )}

      {addOpen && id ? (
        <AdicionarProdutoCardapioModal
          eventId={id}
          categories={categories}
          initialType={addType}
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {categoriesOpen ? (
        <CategoriasModal onClose={() => setCategoriesOpen(false)} />
      ) : null}
    </div>
  );
}
