import { useEventoAtualQuery } from "@/features/eventos";
import { PERMISSOES, temPermissao } from "@/shared/permissoes/permissoes";
import { usePermissoes } from "@/shared/permissoes/usePermissoes";

export function useHome() {
  const permissoes = usePermissoes();
  const podeVerEventos = temPermissao(permissoes, PERMISSOES.eventosLeitura);
  const eventoQuery = useEventoAtualQuery(podeVerEventos);
  return {
    evento: eventoQuery.data,
    carregando: eventoQuery.isLoading,
    erro: eventoQuery.isError,
    recarregar: eventoQuery.refetch,
    podeVerEventos,
  };
}
