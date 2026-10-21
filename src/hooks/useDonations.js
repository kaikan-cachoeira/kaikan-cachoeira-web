import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDonation, listDonations } from "../services/donations";

export function useDonations(params) {
  return useQuery({
    queryKey: ["donations", params],
    queryFn: () => listDonations(params),
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      queryClient.invalidateQueries({ queryKey: ["event"] });
    },
  });
}
