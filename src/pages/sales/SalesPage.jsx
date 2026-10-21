import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader";
import Tabs from "../../components/Tabs/Tabs";
import SearchBar from "../../components/SearchBar/SearchBar";
import Button from "../../components/Button/Button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/State/State";
import { useToast } from "../../context/ToastContext";
import { useSale } from "../../context/SaleContext";
import { useEventMenu, useOngoingEvent } from "../../hooks/useEvents";
import { useCreateSale } from "../../hooks/useSales";
import { apiErrorMessage } from "../../services/api";
import SaleProductCard from "./SaleProductCard";
import SaleSummary from "./SaleSummary";
import DiscountModal from "./DiscountModal";
import styles from "./SalesPage.module.css";

const TABS = [
  { to: "/registro-vendas", label: "Registro de vendas", end: true },
  { to: "/registro-vendas/historico", label: "Histórico de vendas" },
];

export default function SalesPage() {
  const { addToast } = useToast();
  const { summary, applyDiscount, clear } = useSale();
  const { data: event, isLoading: eventLoading, isError: eventError, refetch: refetchEvent } =
    useOngoingEvent();
  const { data: menuData, isLoading: menuLoading, isError: menuError, refetch: refetchMenu } =
    useEventMenu(event?.id);
  const createSale = useCreateSale();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [discountItem, setDiscountItem] = useState(null);
  const lastEventId = useRef(event?.id);

  useEffect(() => {
    if (lastEventId.current !== event?.id) {
      clear();
      lastEventId.current = event?.id;
    }
  }, [event?.id]);

  const items = useMemo(() => menuData?.items || [], [menuData]);
  const categories = useMemo(() => {
    const names = [];
    items.forEach((item) => {
      if (!names.includes(item.category)) names.push(item.category);
    });
    return ["Todos", ...names];
  }, [items]);

  const filtered = useMemo(() => {
    const term = search
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return items
      .filter((item) => category === "Todos" || item.category === category)
      .filter((item) =>
        term
          ? item.name
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .includes(term)
          : true,
      );
  }, [items, category, search]);

  async function confirmSale() {
    if (!event || summary.items.length === 0) return;
    try {
      await createSale.mutateAsync({
        eventId: event.id,
        items: summary.items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          originalPrice: item.originalPrice,
        })),
      });
      addToast("Venda registrada com sucesso.");
      clear();
    } catch (error) {
      addToast(
        apiErrorMessage(error, "Não foi possível registrar a venda."),
        "error",
      );
    }
  }

  const subtitle = event
    ? `Evento em andamento: ${event.name}`
    : "Nenhum evento em andamento";

  return (
    <div className={styles.page}>
      <PageHeader title="Registro de venda" subtitle={subtitle} />

      {eventLoading ? (
        <LoadingState message="Carregando evento em andamento..." />
      ) : eventError ? (
        <ErrorState
          message="Não foi possível carregar o evento em andamento."
          onRetry={refetchEvent}
        />
      ) : !event ? (
        <div className={styles.noEvent}>
          <Tabs items={TABS} label="Seções do registro de venda" />
          <EmptyState
            title="Nenhum evento em andamento."
            description="Inicie um evento para registrar vendas no PDV."
            icon="calendar"
            action={
              <Button as={Link} to="/eventos">
                Ir para eventos
              </Button>
            }
          />
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.main}>
            <Tabs items={TABS} label="Seções do registro de venda" />

            <SearchBar
              value={searchDraft}
              onChange={setSearchDraft}
              onSubmit={() => setSearch(searchDraft.trim())}
              placeholder="Pesquisar produto..."
              showFilter={false}
            />

            {categories.length > 1 ? (
              <div className={styles.categoryPills} role="group" aria-label="Categorias">
                {categories.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`${styles.pill} ${
                      category === name ? styles.pillActive : ""
                    }`}
                    aria-pressed={category === name}
                    onClick={() => setCategory(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            ) : null}

            {menuLoading ? (
              <LoadingState message="Carregando cardápio..." />
            ) : menuError ? (
              <ErrorState
                message="Não foi possível carregar o cardápio do evento."
                onRetry={refetchMenu}
              />
            ) : filtered.length ? (
              <div className={styles.productGrid}>
                {filtered.map((item) => (
                  <SaleProductCard
                    key={item.id}
                    item={item}
                    onDiscount={setDiscountItem}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={
                  items.length
                    ? "Nenhum produto encontrado."
                    : "Cardápio vazio."
                }
                description={
                  items.length
                    ? "Ajuste a pesquisa ou selecione outra categoria."
                    : "Adicione produtos ao cardápio do evento para começar a vender."
                }
                icon="bag"
                action={
                  <Button
                    as={Link}
                    to={`/eventos/${event.id}/cardapio`}
                    variant="secondary"
                  >
                    Ir para o cardápio
                  </Button>
                }
              />
            )}
          </div>

          <SaleSummary
            onConfirm={confirmSale}
            confirming={createSale.isPending}
          />
        </div>
      )}

      {discountItem ? (
        <DiscountModal
          item={discountItem}
          basePrice={discountItem.price}
          onClose={() => setDiscountItem(null)}
          onApply={(price) => {
            applyDiscount(discountItem.id, price);
            setDiscountItem(null);
          }}
        />
      ) : null}
    </div>
  );
}
