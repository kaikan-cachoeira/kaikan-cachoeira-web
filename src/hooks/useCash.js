import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelCashEntry,
  createCashEntry,
  listCash,
  listFiados,
  settleFiado,
  unsettleFiado,
} from "../services/cash";

export function useCash(params) {
  return useQuery({
    queryKey: ["cash", params],
    queryFn: () => listCash(params),
  });
}

export function useFiados(params) {
  return useQuery({
    queryKey: ["fiados", params],
    queryFn: () => listFiados(params),
  });
}

export function useCreateCashEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCashEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash"] });
      queryClient.invalidateQueries({ queryKey: ["fiados"] });
    },
  });
}

export function useCancelCashEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelCashEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash"] });
      queryClient.invalidateQueries({ queryKey: ["fiados"] });
    },
  });
}

export function useSettleFiado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => settleFiado(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiados"] });
      queryClient.invalidateQueries({ queryKey: ["cash"] });
    },
  });
}

export function useUnsettleFiado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unsettleFiado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiados"] });
      queryClient.invalidateQueries({ queryKey: ["cash"] });
    },
  });
}
