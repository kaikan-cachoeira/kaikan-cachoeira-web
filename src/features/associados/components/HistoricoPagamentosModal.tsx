import { useState } from "react";
import Botao from "@/shared/components/Botao/Botao";
import ConfirmacaoDialog from "@/shared/components/ConfirmacaoDialog/ConfirmacaoDialog";
import { EstadoCarregando, EstadoErro } from "@/shared/components/Estado/Estado";
import Etiqueta from "@/shared/components/Etiqueta/Etiqueta";
import Modal from "@/shared/components/Modal/Modal";
import { useToast } from "@/shared/components/Toast/ToastProvider";
import { mensagemErro } from "@/shared/api/erros";
import {
  formatarDataHora,
  formatarMoeda,
} from "@/shared/lib/formatacao";
import type { Associado, PagamentoAnuidade, StatusAnuidade } from "../models";
import {
  useConfiguracoesAnuidadeQuery,
  usePagamentoAnuidadeMutations,
  usePagamentosAnuidadeQuery,
} from "../hooks/useAnuidades";
import styles from "./HistoricoPagamentosModal.module.css";

interface HistoricoPagamentosModalProps {
  associado: Associado;
  ano: number;
  onRegistrarPagamento: () => void;
  onClose: () => void;
}

const STATUS: Record<StatusAnuidade, { label: string; variant: string }> = {
  PAGO: { label: "Pago", variant: "success" },
  PENDENTE: { label: "Pendente", variant: "warning" },
  ISENTO: { label: "Isento", variant: "muted" },
};

export default function HistoricoPagamentosModal({
  associado,
  ano,
  onRegistrarPagamento,
  onClose,
}: HistoricoPagamentosModalProps) {
  const [pagamentoParaExcluir, setPagamentoParaExcluir] =
    useState<PagamentoAnuidade | null>(null);
  const { addToast } = useToast();
  const historicoQuery = usePagamentosAnuidadeQuery(associado.id, ano);
  const configuracoesQuery = useConfiguracoesAnuidadeQuery();
  const { excluirPagamento } = usePagamentoAnuidadeMutations();
  const isLoading =
    historicoQuery.isLoading || configuracoesQuery.isLoading;
  const isError = historicoQuery.isError || configuracoesQuery.isError;
  const historico = historicoQuery.data;
  const anuidade = historico?.anuidade ?? null;
  const configuracao = configuracoesQuery.data?.find(
    (item) => item.ano === ano,
  );
  const totalAnuidade = anuidade?.valor ?? configuracao?.valor ?? 0;
  const totalRecebido = anuidade?.totalPago ?? 0;
  const status = anuidade?.status ?? "PENDENTE";
  const statusInfo = STATUS[status];
  const podeRegistrar =
    associado.tipo === "TITULAR" &&
    historico !== undefined &&
    (!anuidade || anuidade.status === "PENDENTE");
  const isDeleting = excluirPagamento.isPending;

  async function confirmarExclusao() {
    if (!pagamentoParaExcluir) return;
    try {
      await excluirPagamento.mutateAsync(pagamentoParaExcluir.id);
      setPagamentoParaExcluir(null);
      addToast("Pagamento excluído.");
    } catch (error) {
      addToast(
        mensagemErro(error, "Não foi possível excluir o pagamento."),
        "error",
      );
    }
  }

  function tentarNovamente() {
    if (historicoQuery.isError) void historicoQuery.refetch();
    if (configuracoesQuery.isError) void configuracoesQuery.refetch();
  }

  return (
    <>
      <Modal
        title="Pagamentos da anuidade"
        subtitle={`${associado.nome} · ${ano}`}
        onClose={isDeleting ? undefined : onClose}
        showClose={!isDeleting}
        closeOnOverlay={!isDeleting}
        size="large"
        footer={
          <>
            <Botao
              variant="secondary"
              onClick={onClose}
              disabled={isDeleting}
            >
              Fechar
            </Botao>
            {podeRegistrar ? (
              <Botao onClick={onRegistrarPagamento} disabled={isDeleting}>
                Registrar pagamento
              </Botao>
            ) : null}
          </>
        }
      >
        {isLoading ? (
          <EstadoCarregando message="Carregando pagamentos..." />
        ) : isError ? (
          <EstadoErro
            message="Não foi possível carregar o histórico de pagamentos."
            onRetry={tentarNovamente}
          />
        ) : historico ? (
          <div className={styles.content}>
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span>Total da anuidade</span>
                <strong>{formatarMoeda(totalAnuidade)}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Total recebido</span>
                <strong>{formatarMoeda(totalRecebido)}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Status</span>
                <Etiqueta variant={statusInfo.variant}>
                  {statusInfo.label}
                </Etiqueta>
              </div>
            </div>

            {historico.pagamentos.length ? (
              <ul className={styles.payments}>
                {historico.pagamentos.map((pagamento) => (
                  <li className={styles.payment} key={pagamento.id}>
                    <div className={styles.paymentInfo}>
                      <strong>{formatarMoeda(pagamento.valor)}</strong>
                      <span>
                        Registrado em {formatarDataHora(pagamento.criadoEm)}
                      </span>
                    </div>
                    <Botao
                      variant="danger"
                      size="compact"
                      iconLeft="trash"
                      aria-label={`Excluir pagamento de ${formatarMoeda(
                        pagamento.valor,
                      )}`}
                      onClick={() => setPagamentoParaExcluir(pagamento)}
                    >
                      Excluir pagamento
                    </Botao>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>
                Nenhum pagamento registrado nesta anuidade.
              </p>
            )}
          </div>
        ) : null}
      </Modal>

      {pagamentoParaExcluir ? (
        <ConfirmacaoDialog
          title="Excluir pagamento"
          message="O status da anuidade será recalculado após a exclusão deste pagamento."
          confirmLabel="Excluir pagamento"
          destructive
          loading={isDeleting}
          onConfirm={() => void confirmarExclusao()}
          onCancel={() => setPagamentoParaExcluir(null)}
        />
      ) : null}
    </>
  );
}
