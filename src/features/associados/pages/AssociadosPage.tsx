import PageHeader from "@/shared/components/PageHeader/PageHeader";
import BarraPesquisa from "@/shared/components/BarraPesquisa/BarraPesquisa";
import PainelFiltros from "@/shared/components/Filtros/PainelFiltros";
import Selecao from "@/shared/components/Formulario/Selecao";
import Entrada from "@/shared/components/Formulario/Entrada";
import Botao from "@/shared/components/Botao/Botao";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
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
import { formatarMoeda, iniciais, pluralizar } from "@/shared/lib/formatacao";
import type { StatusAnuidade, TipoAssociado } from "../models";
import { calcularIdade, formatarDataNascimento } from "../utils/idade";
import { useAssociadosPagina } from "../hooks/useAssociadosPagina";
import AssociadoModal from "../components/AssociadoModal";
import AnuidadesModal from "../components/AnuidadesModal";
import ConfiguracaoAnuidadeModal from "../components/ConfiguracaoAnuidadeModal";
import PagamentoModal from "../components/PagamentoModal";
import HistoricoPagamentosModal from "../components/HistoricoPagamentosModal";
import styles from "./AssociadosPage.module.css";

const OPCOES_TIPO = [
  { value: "TITULAR", label: "Titular" },
  { value: "DEPENDENTE", label: "Dependente" },
];

const OPCOES_STATUS = [
  { value: "PAGO", label: "Pago" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "ISENTO", label: "Isento" },
];

const STATUS_ANUIDADE: Record<
  StatusAnuidade,
  { label: string; variant: string }
> = {
  PAGO: { label: "Pago", variant: "success" },
  PENDENTE: { label: "Pendente", variant: "warning" },
  ISENTO: { label: "Isento", variant: "muted" },
};

function tipoAssociado(tipo: TipoAssociado): string {
  return tipo === "TITULAR" ? "Titular" : "Dependente";
}

export default function AssociadosPage() {
  const {
    searchDraft,
    setSearchDraft,
    setPage,
    filtersOpen,
    setFiltersOpen,
    anoEscolhido,
    setAnoEscolhido,
    tipo,
    setTipo,
    status,
    setStatus,
    idadeMin,
    setIdadeMin,
    idadeMax,
    setIdadeMax,
    associadosQuery,
    configuracoesQuery,
    configuracaoSelecionada,
    opcoesAno,
    modalAssociado,
    abrirCriar,
    abrirEditar,
    fecharModal,
    fluxoAnuidades,
    abrirAnuidades,
    criarConfiguracao,
    editarConfiguracao,
    voltarParaListaAnuidades,
    fecharAnuidades,
    fluxoPagamentos,
    abrirHistoricoPagamentos,
    abrirPagamento,
    abrirPagamentoDoHistorico,
    fecharFluxoPagamentos,
    configuracaoCriada,
    configuracaoExcluida,
    runSearch,
    clearFilters,
    clearAll,
    hasFilters,
  } = useAssociadosPagina();

  const { data, isLoading, isError, refetch } = associadosQuery;

  function alterarAno(valor: string) {
    const anoSelecionado = Number(valor);
    setAnoEscolhido(
      valor && Number.isInteger(anoSelecionado) ? anoSelecionado : undefined,
    );
  }

  function alterarTipo(valor: string) {
    setTipo(
      valor === "TITULAR" || valor === "DEPENDENTE"
        ? valor
        : undefined,
    );
  }

  function alterarStatus(valor: string) {
    setStatus(
      valor === "PAGO" || valor === "PENDENTE" || valor === "ISENTO"
        ? valor
        : undefined,
    );
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        subtitle="Cadastre associados e acompanhe o pagamento das anuidades"
        actions={
          <>
            <Botao
              variant="secondary"
              iconLeft="calendar"
              onClick={abrirAnuidades}
            >
              Ver anuidades
            </Botao>
            <Botao iconLeft="plus" onClick={abrirCriar}>
              Registrar associado
            </Botao>
          </>
        }
      />

      <BarraPesquisa
        value={searchDraft}
        onChange={setSearchDraft}
        onSubmit={runSearch}
        placeholder="Pesquisar associado ou titular..."
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((current) => !current)}
      />

      {filtersOpen ? (
        <PainelFiltros onClear={clearFilters} columns={4}>
          <Entrada
            label="Idade a partir de"
            type="number"
            min={0}
            step={1}
            value={idadeMin}
            onChange={(event) => setIdadeMin(event.target.value)}
          />
          <Entrada
            label="Idade até"
            type="number"
            min={0}
            step={1}
            value={idadeMax}
            onChange={(event) => setIdadeMax(event.target.value)}
          />
          <Selecao
            label="Tipo"
            options={OPCOES_TIPO}
            placeholder="Todos"
            value={tipo ?? ""}
            onChange={(event) => alterarTipo(event.target.value)}
          />
          <Selecao
            label="Status da anuidade"
            options={OPCOES_STATUS}
            placeholder="Todos"
            value={status ?? ""}
            onChange={(event) => alterarStatus(event.target.value)}
          />
        </PainelFiltros>
      ) : null}

      {configuracoesQuery.isLoading || isLoading ? (
        <EstadoCarregando message="Carregando associados..." />
      ) : isError ? (
        <EstadoErro
          message="Não foi possível carregar os associados."
          onRetry={refetch}
        />
      ) : data ? (
        <>
          <div className={styles.summary}>
            <span>
              <strong>{data.total}</strong>{" "}
              {pluralizar("associado", data.total)}{" "}
              {pluralizar("encontrado", data.total)}
            </span>
            {opcoesAno.length ? (
              <Selecao
                className={styles.yearSelect}
                label="Ano da anuidade"
                aria-label="Ano da anuidade"
                options={opcoesAno}
                value={String(anoEscolhido ?? opcoesAno[0]?.value ?? "")}
                onChange={(event) => alterarAno(event.target.value)}
              />
            ) : null}
          </div>

          {data.items.length ? (
            <>
              <div className={styles.tabelaContainer}>
                <Tabela caption="Associados" className={styles.tabela}>
                  <Cabecalho>
                    <Linha>
                      <CelulaCabecalho>Associado</CelulaCabecalho>
                      <CelulaCabecalho className={styles.hideContact}>
                        Contato
                      </CelulaCabecalho>
                      <CelulaCabecalho className={styles.hideAge}>
                        Idade
                      </CelulaCabecalho>
                      <CelulaCabecalho className={styles.hideType}>
                        Tipo
                      </CelulaCabecalho>
                      <CelulaCabecalho>Anuidade</CelulaCabecalho>
                      <CelulaCabecalho numeric>Valor / pago</CelulaCabecalho>
                      <CelulaCabecalho className={styles.actionsCell}>
                        Ações
                      </CelulaCabecalho>
                    </Linha>
                  </Cabecalho>
                  <Corpo>
                    {data.items.map((associado) => {
                      const anuidade = associado.anuidade;
                      const statusAnuidade = anuidade
                        ? STATUS_ANUIDADE[anuidade.status]
                        : null;
                      const idade = calcularIdade(associado.dataNascimento);
                      const tipo = tipoAssociado(associado.tipo);

                      return (
                        <Linha key={associado.id}>
                          <Celula>
                            <div className={styles.associateCell}>
                              <span className={styles.avatar} aria-hidden="true">
                                {iniciais(associado.nome)}
                              </span>
                              <span className={styles.associateDetails}>
                                <span className={styles.memberName}>
                                  {associado.nome}
                                </span>
                                {associado.tipo === "DEPENDENTE" ? (
                                  <span className={styles.secondary}>
                                    Dependente de{" "}
                                    {associado.titularNome || "titular não informado"}
                                  </span>
                                ) : null}
                              </span>
                              <span className={styles.infoCompacta}>
                                <span className={styles.infoCompactaSemIdade}>
                                  {tipo} ·{" "}
                                  <span className={styles.phone}>
                                    {associado.numeroContato}
                                  </span>
                                </span>
                                <span className={styles.infoCompactaComIdade}>
                                  {tipo} ·{" "}
                                  <span className={styles.ageValue}>
                                    {idade} anos
                                  </span>{" "}
                                  ·{" "}
                                  <span className={styles.phone}>
                                    {associado.numeroContato}
                                  </span>
                                </span>
                              </span>
                            </div>
                          </Celula>
                          <Celula className={`${styles.hideContact} ${styles.contactCell}`}>
                            {associado.numeroContato}
                          </Celula>
                          <Celula className={`${styles.hideAge} ${styles.ageCell}`}>
                            <span>{idade} anos</span>
                            <span className={styles.secondary}>
                              {formatarDataNascimento(associado.dataNascimento)}
                            </span>
                          </Celula>
                          <Celula className={styles.hideType}>
                            <Etiqueta variant="neutral">{tipo}</Etiqueta>
                          </Celula>
                          <Celula>
                            <span className={styles.mobileLabel}>Anuidade</span>
                            {associado.tipo === "DEPENDENTE" ? (
                              <Etiqueta
                                variant="muted"
                                className={styles.annualTag}
                              >
                                Incluído no titular
                              </Etiqueta>
                            ) : statusAnuidade ? (
                              <Etiqueta variant={statusAnuidade.variant}>
                                {statusAnuidade.label}
                              </Etiqueta>
                            ) : (
                              <Etiqueta variant="muted">Sem anuidade</Etiqueta>
                            )}
                          </Celula>
                          <Celula numeric className={styles.valueCell}>
                            <span className={styles.mobileLabel}>Valor / pago</span>
                            {anuidade ? (
                              <>
                                <span className={styles.money}>
                                  {formatarMoeda(anuidade.valor)}
                                </span>
                                <span className={styles.secondary}>
                                  <span className={styles.money}>
                                    {formatarMoeda(anuidade.totalPago)}
                                  </span>{" "}
                                  recebido
                                </span>
                              </>
                            ) : (
                              "—"
                            )}
                          </Celula>
                          <Celula className={styles.actionsCell}>
                            <div className={styles.actions}>
                              <Botao
                                variant="secondary"
                                size="compact"
                                iconLeft="edit"
                                aria-label={`Editar ${associado.nome}`}
                                onClick={() => abrirEditar(associado)}
                              >
                                Editar
                              </Botao>
                              {associado.tipo === "TITULAR" &&
                              configuracaoSelecionada ? (
                                <>
                                  <Botao
                                    variant="tertiary"
                                    size="compact"
                                    aria-label={`Ver pagamentos de ${associado.nome}`}
                                    onClick={() =>
                                      abrirHistoricoPagamentos(associado)
                                    }
                                  >
                                    Ver pagamentos
                                  </Botao>
                                  {(!anuidade ||
                                    anuidade.status === "PENDENTE") ? (
                                    <Botao
                                      size="compact"
                                      aria-label={`Pagar anuidade de ${associado.nome}`}
                                      onClick={() => abrirPagamento(associado)}
                                    >
                                      Pagar
                                    </Botao>
                                  ) : null}
                                </>
                              ) : null}
                            </div>
                          </Celula>
                        </Linha>
                      );
                    })}
                  </Corpo>
                </Tabela>
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
                hasFilters
                  ? "Nenhum associado encontrado."
                  : "Nenhum associado registrado."
              }
              icon="users"
              action={
                hasFilters ? (
                  <Botao variant="secondary" onClick={clearAll}>
                    Limpar filtros
                  </Botao>
                ) : (
                  <Botao iconLeft="plus" onClick={abrirCriar}>
                    Registrar associado
                  </Botao>
                )
              }
            />
          )}
        </>
      ) : (
        <EstadoCarregando message="Carregando associados..." />
      )}
      {modalAssociado ? (
        <AssociadoModal
          associado={
            modalAssociado.modo === "editar"
              ? modalAssociado.associado
              : undefined
          }
          onClose={fecharModal}
        />
      ) : null}
      {fluxoAnuidades?.tela === "lista" ? (
        <AnuidadesModal
          onClose={fecharAnuidades}
          onCriar={criarConfiguracao}
          onEditar={editarConfiguracao}
          onConfiguracaoExcluida={configuracaoExcluida}
        />
      ) : null}
      {fluxoAnuidades?.tela === "criar" ? (
        <ConfiguracaoAnuidadeModal
          onClose={voltarParaListaAnuidades}
          onCreated={configuracaoCriada}
        />
      ) : null}
      {fluxoAnuidades?.tela === "editar" ? (
        <ConfiguracaoAnuidadeModal
          configuracao={fluxoAnuidades.configuracao}
          onClose={voltarParaListaAnuidades}
        />
      ) : null}
      {fluxoPagamentos?.tela === "historico" && configuracaoSelecionada ? (
        <HistoricoPagamentosModal
          associado={fluxoPagamentos.associado}
          ano={configuracaoSelecionada.ano}
          onRegistrarPagamento={abrirPagamentoDoHistorico}
          onClose={fecharFluxoPagamentos}
        />
      ) : null}
      {fluxoPagamentos?.tela === "pagar" && configuracaoSelecionada ? (
        <PagamentoModal
          associado={fluxoPagamentos.associado}
          configuracao={configuracaoSelecionada}
          onClose={fecharFluxoPagamentos}
        />
      ) : null}
    </div>
  );
}
