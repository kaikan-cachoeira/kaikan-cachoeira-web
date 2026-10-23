import { useEventoAtualQuery } from "@/features/eventos";

export function useHome() {
  const eventoQuery = useEventoAtualQuery();
  return {
    evento: eventoQuery.data,
    carregando: eventoQuery.isLoading,
    erro: eventoQuery.isError,
    recarregar: eventoQuery.refetch,
  };
}
