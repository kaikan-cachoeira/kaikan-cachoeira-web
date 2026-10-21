import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelSale, createSale, listSales } from "../services/sales";

export function useSales(params) {
  return useQuery({
    queryKey: ["sales", params],
    queryFn: () => listSales(params),
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["event"] });
      queryClient.invalidateQueries({ queryKey: ["event-menu"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useCancelSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["event"] });
      queryClient.invalidateQueries({ queryKey: ["event-menu"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
