import { Link } from "react-router-dom";
import PageHeader from "@/shared/components/PageHeader/PageHeader";
import Abas from "@/shared/components/Abas/Abas";
import BarraPesquisa from "@/shared/components/BarraPesquisa/BarraPesquisa";
import Botao from "@/shared/components/Botao/Botao";
import {
  EstadoVazio,
  EstadoErro,
  EstadoCarregando,
} from "@/shared/components/Estado/Estado";
import { useVendas } from "../hooks/useVendas";
import VendaProdutoCard from "../components/VendaProdutoCard";
import ResumoVenda from "../components/ResumoVenda";
import DescontoModal from "../components/DescontoModal";
import styles from "./Vendas.module.css";

const TABS = [
  { to: "/registro-vendas", label: "Registro de vendas", end: true },
  { to: "/registro-vendas/historico", label: "Histórico de vendas" },
];

export default function RegistroVendasPage() {
  const {
    event,
    eventLoading,
    eventError,
    refetchEvent,
    menuLoading,
    menuError,
    refetchMenu,
    items,
    categories,
    filtered,
    searchDraft,
    setSearchDraft,
    category,
    setCategory,
    runSearch,
    discountItem,
    setDiscountItem,
    aplicarDescontoNoItem,
    createSale,
    confirmSale,
    subtitle,
  } = useVendas({ carregarCardapio: true });

  return (
    <div className={styles.page}>
      <PageHeader subtitle={subtitle} />

      {eventLoading ? (
        <EstadoCarregando message="Carregando evento em andamento..." />
      ) : eventError ? (
        <EstadoErro
          message="Não foi possível carregar o evento em andamento."
          onRetry={refetchEvent}
        />
      ) : !event ? (
        <div className={styles.noEvent}>
          <Abas items={TABS} label="Seções do registro de venda" />
          <EstadoVazio
            title="Nenhum evento em andamento."
            description="Inicie um evento para registrar vendas no PDV."
            icon="calendar"
            action={
              <Botao as={Link} to="/eventos">
                Ir para eventos
              </Botao>
            }
          />
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.main}>
            <Abas items={TABS} label="Seções do registro de venda" />

            <BarraPesquisa
              value={searchDraft}
              onChange={setSearchDraft}
              onSubmit={runSearch}
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
              <EstadoCarregando message="Carregando cardápio..." />
            ) : menuError ? (
              <EstadoErro
                message="Não foi possível carregar o cardápio do evento."
                onRetry={refetchMenu}
              />
            ) : filtered.length ? (
              <div className={styles.productGrid}>
                {filtered.map((item) => (
                  <VendaProdutoCard
                    key={item.id}
                    item={item}
                    onDiscount={setDiscountItem}
                  />
                ))}
              </div>
            ) : (
              <EstadoVazio
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
                  <Botao
                    as={Link}
                    to={`/eventos/${event.id}/cardapio`}
                    variant="secondary"
                  >
                    Ir para o cardápio
                  </Botao>
                }
              />
            )}
          </div>

          <ResumoVenda
            onConfirm={confirmSale}
            confirming={createSale.isPending}
          />
        </div>
      )}

      {discountItem ? (
        <DescontoModal
          item={discountItem}
          basePrice={discountItem.price}
          onClose={() => setDiscountItem(null)}
          onApply={aplicarDescontoNoItem}
        />
      ) : null}
    </div>
  );
}
