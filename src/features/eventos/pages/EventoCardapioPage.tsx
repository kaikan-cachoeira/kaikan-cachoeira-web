import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import ConfirmacaoDialog from "@/shared/components/ConfirmacaoDialog/ConfirmacaoDialog";
import { mensagemErro } from "@/shared/api/erros";
import { resolverUrlApi } from "@/shared/api/urls";
import { useEventoMutations } from "../hooks/useEventos";
import { useEventoCardapio } from "../hooks/useEventoCardapio";
import type { ItemCardapio } from "../models";
import { varianteStatus } from "../utils/statusEvento";
import {
  formatarMoeda,
  formatarNumero,
  formatarPeriodo,
} from "@/shared/lib/formatacao";
import AdicionarProdutoCardapioModal from "../components/AdicionarProdutoCardapioModal";
import styles from "./EventoCardapioPage.module.css";

const ORIGEM_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "ESTOQUE", label: "Estoque" },
  { value: "PRODUZIDO", label: "Produzido" },
];

interface MenuAcoes {
  item: ItemCardapio;
  top: number;
  left: number;
}

export default function EventoCardapioPage() {
  const { id: paramId } = useParams();
  const id = Number(paramId);
  const idValido = Number.isFinite(id) && id > 0;
  const { addToast } = useToast();
  const { excluirProduto } = useEventoMutations();
  const [actionsMenu, setActionsMenu] = useState<MenuAcoes | null>(null);
  const [editTarget, setEditTarget] = useState<ItemCardapio | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ItemCardapio | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuItemRef = useRef<ItemCardapio | null>(null);
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
  } = useEventoCardapio(idValido ? id : undefined);
  const activeMenuItemId = actionsMenu?.item.id;
  const podeEditar =
    event?.tipoEvento === "EVENTO" &&
    event.status.codigo === "NAO_INICIADO";

  function closeActionsMenu(returnFocus = false) {
    setActionsMenu(null);
    menuItemRef.current = null;
    if (returnFocus) triggerRef.current?.focus();
  }

  function toggleActionsMenu(
    item: ItemCardapio,
    trigger: HTMLButtonElement,
  ) {
    if (actionsMenu?.item.id === item.id) {
      closeActionsMenu();
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const width = 184;
    const height = 96;
    const left = Math.max(
      8,
      Math.min(rect.right - width, window.innerWidth - width - 8),
    );
    let top = rect.bottom + 4;
    if (top + height > window.innerHeight - 8) {
      top = Math.max(8, rect.top - height - 4);
    }
    triggerRef.current = trigger;
    menuItemRef.current = item;
    setActionsMenu({ item, top, left });
  }

  useEffect(() => {
    if (!activeMenuItemId) return undefined;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        closeActionsMenu();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeActionsMenu(true);
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      const options = menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      );
      if (!options?.length) return;
      event.preventDefault();
      const currentIndex = Array.from(options).indexOf(
        document.activeElement as HTMLButtonElement,
      );
      const nextIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? options.length - 1
            : event.key === "ArrowDown"
              ? (currentIndex + 1) % options.length
              : (currentIndex - 1 + options.length) % options.length;
      options[nextIndex]?.focus();
    }

    function updatePosition() {
      const item = menuItemRef.current;
      const trigger = triggerRef.current;
      if (!item || !trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = 184;
      const height = 96;
      const left = Math.max(
        8,
        Math.min(rect.right - width, window.innerWidth - width - 8),
      );
      let top = rect.bottom + 4;
      if (top + height > window.innerHeight - 8) {
        top = Math.max(8, rect.top - height - 4);
      }
      setActionsMenu({ item, top, left });
    }

    const focusFrame = window.requestAnimationFrame(() => {
      menuRef.current
        ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
        ?.focus();
    });
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [activeMenuItemId]);

  async function confirmDelete() {
    if (!idValido || !deleteTarget) return;
    try {
      await excluirProduto.mutateAsync({
        eventId: id,
        itemId: deleteTarget.id,
      });
      addToast("Produto excluído do cardápio.");
      setDeleteTarget(null);
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível excluir o produto do cardápio."),
        "error",
      );
    }
  }

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
          podeEditar ? (
            <>
              <Botao
                variant="secondary"
                iconLeft="ticket"
                onClick={() => setCategoriesOpen(true)}
              >
                Menu de categorias
              </Botao>
              <Botao iconLeft="plus" onClick={() => openAdd("ESTOQUE")}>
                Adicionar produto
              </Botao>
            </>
          ) : undefined
        }
      >
        {event ? (
          <div className={styles.eventContext}>
            <span>{event.nome}</span>
            <span className={styles.eventMeta}>
              {formatarPeriodo(event.dataHoraInicio, event.dataHoraEncerramento)}
            </span>
            <Etiqueta variant={varianteStatus(event.status.codigo)} dot>
              {event.status.descricao}
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
              ...categories.map((categoria) => ({
                value: categoria,
                label: categoria,
              })),
            ]}
            value={category}
            onChange={(changeEvent) => changeCategory(changeEvent.target.value)}
          />
          <Selecao
            id="cardapio-filtro-origem"
            label="Origem"
            options={ORIGEM_OPTIONS}
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
                <CelulaCabecalho>Origem</CelulaCabecalho>
                <CelulaCabecalho numeric>Previsto</CelulaCabecalho>
                <CelulaCabecalho numeric>Vendido</CelulaCabecalho>
                <CelulaCabecalho numeric>Restante</CelulaCabecalho>
                <CelulaCabecalho numeric>Preço</CelulaCabecalho>
                <CelulaCabecalho numeric>Desconto</CelulaCabecalho>
                <CelulaCabecalho numeric>Custo ingredientes</CelulaCabecalho>
                {podeEditar ? <CelulaCabecalho>Ações</CelulaCabecalho> : null}
              </Linha>
            </Cabecalho>
            <Corpo>
              {visible.map((item) => {
                const foto = resolverUrlApi(item.fotoUrl);
                return (
                  <Linha key={item.id}>
                    <Celula>
                      <div className={styles.productCell}>
                        {foto ? (
                          <img
                            className={styles.productPhoto}
                            src={foto}
                            alt={`Foto de ${item.nome}`}
                          />
                        ) : null}
                        <div>
                          <span className={styles.productName}>
                            {item.nome}
                          </span>
                          <span className={styles.productType}>
                            {item.origem === "ESTOQUE"
                              ? "produto do estoque"
                              : "produzido no evento"}
                          </span>
                        </div>
                      </div>
                    </Celula>
                    <Celula>{item.categoria || "—"}</Celula>
                    <Celula>
                      {item.origem === "ESTOQUE" ? "Estoque" : "Produzido"}
                    </Celula>
                    <Celula numeric>
                      {item.quantidadePrevista === null ||
                      item.quantidadePrevista === undefined
                        ? "—"
                        : formatarNumero(item.quantidadePrevista)}
                    </Celula>
                    <Celula numeric>
                      {formatarNumero(item.quantidadeVendida)}
                    </Celula>
                    <Celula numeric>
                      {item.restantePrevisto === null ||
                      item.restantePrevisto === undefined
                        ? "—"
                        : formatarNumero(item.restantePrevisto)}
                    </Celula>
                    <Celula numeric>{formatarMoeda(item.precoVenda)}</Celula>
                    <Celula numeric>{formatarMoeda(item.desconto)}</Celula>
                    <Celula numeric>
                      {item.custoTotalIngredientes === null ||
                      item.custoTotalIngredientes === undefined
                        ? "—"
                        : formatarMoeda(item.custoTotalIngredientes)}
                    </Celula>
                    {podeEditar ? (
                      <Celula>
                        <button
                          type="button"
                          className={styles.moreButton}
                          id={`menu-trigger-${item.id}`}
                          aria-label={`Mais opções de ${item.nome}`}
                          aria-haspopup="menu"
                          aria-expanded={actionsMenu?.item.id === item.id}
                          aria-controls={
                            actionsMenu?.item.id === item.id
                              ? `menu-produto-${item.id}`
                              : undefined
                          }
                          onClick={(event) =>
                            toggleActionsMenu(item, event.currentTarget)
                          }
                        >
                          <Icone name="more-vertical" size={20} />
                        </button>
                      </Celula>
                    ) : null}
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
              <Botao variant="secondary" onClick={clearAll}>
                Limpar filtros
              </Botao>
            ) : podeEditar ? (
              <Botao onClick={() => openAdd("ESTOQUE")}>
                Adicionar produto
              </Botao>
            ) : undefined
          }
        />
      )}

      {addOpen && idValido && podeEditar ? (
        <AdicionarProdutoCardapioModal
          eventId={id}
          initialType={addType}
          onClose={() => setAddOpen(false)}
        />
      ) : null}

      {editTarget && idValido && podeEditar ? (
        <AdicionarProdutoCardapioModal
          eventId={id}
          item={editTarget}
          onClose={() => setEditTarget(null)}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmacaoDialog
          title="Excluir produto do cardápio"
          message={`Deseja excluir "${deleteTarget.nome}" do cardápio deste evento?`}
          confirmLabel="Excluir"
          destructive
          loading={excluirProduto.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      ) : null}

      {categoriesOpen ? (
        <CategoriasModal onClose={() => setCategoriesOpen(false)} />
      ) : null}

      {actionsMenu
        ? createPortal(
            <div
              ref={menuRef}
              id={`menu-produto-${actionsMenu.item.id}`}
              className={styles.actionsMenu}
              role="menu"
              aria-labelledby={`menu-trigger-${actionsMenu.item.id}`}
              style={{ top: actionsMenu.top, left: actionsMenu.left }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setEditTarget(actionsMenu.item);
                  closeActionsMenu();
                }}
              >
                <Icone name="edit" size={16} />
                Editar produto
              </button>
              <button
                type="button"
                role="menuitem"
                className={styles.dangerMenuItem}
                onClick={() => {
                  setDeleteTarget(actionsMenu.item);
                  closeActionsMenu();
                }}
              >
                <Icone name="trash" size={16} />
                Excluir produto
              </button>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
