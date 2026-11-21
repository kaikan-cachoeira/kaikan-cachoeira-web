import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { comporChave, queryKeys } from "@/shared/query/keys";
import type {
  AlterarIsencaoPayload,
  RegistrarPagamentoPayload,
  SalvarConfiguracaoAnuidadePayload,
} from "../models";
import {
  atualizarConfiguracaoAnuidade,
  alterarIsencaoAnuidade,
  criarConfiguracaoAnuidade,
  excluirConfiguracaoAnuidade,
  excluirPagamentoAnuidade,
  listarPagamentosAnuidade,
  listarConfiguracoesAnuidade,
  registrarPagamentoAnuidade,
} from "../services/anuidades";

export function useConfiguracoesAnuidadeQuery() {
  return useQuery({
    queryKey: comporChave(queryKeys.anuidades, "configuracoes"),
    queryFn: listarConfiguracoesAnuidade,
  });
}

export function usePagamentosAnuidadeQuery(
  associadoId: number | null,
  ano: number | undefined,
) {
  return useQuery({
    queryKey: comporChave(
      queryKeys.anuidades,
      "pagamentos",
      associadoId,
      ano,
    ),
    queryFn: () => {
      if (associadoId === null || ano === undefined) {
        throw new Error("Informe o associado e o ano para consultar pagamentos.");
      }
      return listarPagamentosAnuidade(associadoId, ano);
    },
    enabled: associadoId !== null && ano !== undefined,
  });
}

export function useConfiguracaoAnuidadeMutations() {
  const queryClient = useQueryClient();

  function invalidarConsultas() {
    queryClient.invalidateQueries({ queryKey: queryKeys.anuidades });
    queryClient.invalidateQueries({ queryKey: queryKeys.associados });
  }

  const criar = useMutation({
    mutationFn: (payload: SalvarConfiguracaoAnuidadePayload) =>
      criarConfiguracaoAnuidade(payload),
    onSuccess: invalidarConsultas,
  });

  const atualizar = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: SalvarConfiguracaoAnuidadePayload;
    }) => atualizarConfiguracaoAnuidade(id, payload),
    onSuccess: invalidarConsultas,
  });

  const excluir = useMutation({
    mutationFn: (id: number) => excluirConfiguracaoAnuidade(id),
    onSuccess: invalidarConsultas,
  });

  return {
    criarConfiguracao: criar,
    atualizarConfiguracao: atualizar,
    excluirConfiguracao: excluir,
  };
}

export function usePagamentoAnuidadeMutations() {
  const queryClient = useQueryClient();

  function invalidarConsultas() {
    queryClient.invalidateQueries({ queryKey: queryKeys.anuidades });
    queryClient.invalidateQueries({ queryKey: queryKeys.associados });
  }

  const registrarPagamento = useMutation({
    mutationFn: (payload: RegistrarPagamentoPayload) =>
      registrarPagamentoAnuidade(payload),
    onSuccess: invalidarConsultas,
  });

  const excluirPagamento = useMutation({
    mutationFn: (id: number) => excluirPagamentoAnuidade(id),
    onSuccess: invalidarConsultas,
  });

  const alterarIsencao = useMutation({
    mutationFn: (payload: AlterarIsencaoPayload) =>
      alterarIsencaoAnuidade(payload),
    onSuccess: invalidarConsultas,
  });

  return { registrarPagamento, excluirPagamento, alterarIsencao };
}
