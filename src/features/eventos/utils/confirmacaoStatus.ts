import type { Evento, StatusEventoCodigo } from "../models";

interface ConfirmacaoStatus {
  title: string;
  message: string;
  confirmLabel: string;
}

type CriadorConfirmacao = (nome: string) => ConfirmacaoStatus;

const CONFIRMACOES: Record<string, CriadorConfirmacao> = {
  "NAO_INICIADO->EM_ANDAMENTO": (nome) => ({
    title: "Iniciar evento",
    message: `Deseja iniciar o evento "${nome}"? Ele passará a ser o evento em andamento e as vendas e lançamentos de caixa serão associados a ele.`,
    confirmLabel: "Iniciar evento",
  }),
  "EM_ANDAMENTO->ENCERRADO": (nome) => ({
    title: "Encerrar evento",
    message: `Deseja encerrar o evento "${nome}"? Novas vendas e lançamentos deixarão de ser associados ao evento em andamento.`,
    confirmLabel: "Encerrar evento",
  }),
  "EM_ANDAMENTO->NAO_INICIADO": (nome) => ({
    title: "Desfazer início",
    message: `Deseja desfazer o início do evento "${nome}"? Ele voltará para a situação "Não iniciado".`,
    confirmLabel: "Desfazer início",
  }),
  "ENCERRADO->EM_ANDAMENTO": (nome) => ({
    title: "Reabrir evento",
    message: `Deseja reabrir o evento "${nome}"? Ele voltará para a situação "Em andamento".`,
    confirmLabel: "Reabrir evento",
  }),
};

export function obterConfirmacaoStatus(
  event: Evento,
  nextStatus: StatusEventoCodigo,
): ConfirmacaoStatus | null {
  const createConfirmation =
    CONFIRMACOES[`${event.status.codigo}->${nextStatus}`];
  return createConfirmation ? createConfirmation(event.nome) : null;
}
