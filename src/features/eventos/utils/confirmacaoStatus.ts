import type { Evento } from "../models";

interface ConfirmacaoStatus {
  title: string;
  message: string;
  confirmLabel: string;
}

type CriadorConfirmacao = (nome: string) => ConfirmacaoStatus;

const CONFIRMACOES: Record<string, CriadorConfirmacao> = {
  "Não iniciado->Em andamento": (nome) => ({
    title: "Iniciar evento",
    message: `Deseja iniciar o evento "${nome}"? Ele passará a ser o evento em andamento e as vendas e lançamentos de caixa serão associados a ele.`,
    confirmLabel: "Iniciar evento",
  }),
  "Em andamento->Encerrado": (nome) => ({
    title: "Encerrar evento",
    message: `Deseja encerrar o evento "${nome}"? Novas vendas e lançamentos deixarão de ser associados ao evento em andamento.`,
    confirmLabel: "Encerrar evento",
  }),
  "Em andamento->Não iniciado": (nome) => ({
    title: "Desfazer início",
    message: `Deseja desfazer o início do evento "${nome}"? Ele voltará para a situação "Não iniciado".`,
    confirmLabel: "Desfazer início",
  }),
  "Encerrado->Em andamento": (nome) => ({
    title: "Reabrir evento",
    message: `Deseja reabrir o evento "${nome}"? Ele voltará para a situação "Em andamento".`,
    confirmLabel: "Reabrir evento",
  }),
};

export function obterConfirmacaoStatus(
  event: Evento,
  nextStatus: string,
): ConfirmacaoStatus | null {
  const createConfirmation = CONFIRMACOES[`${event.status}->${nextStatus}`];
  return createConfirmation ? createConfirmation(event.name) : null;
}
