import { useQuery } from "@tanstack/react-query";
import { PERMISSOES, temPermissao } from "@/shared/permissoes/permissoes";
import { usePermissoes } from "@/shared/permissoes/usePermissoes";
import { comporChave, queryKeys } from "@/shared/query/keys";
import { obterClimaEvento } from "../services/clima";

export function useClimaEventoQuery(
  id?: number | null,
  enabled = true,
  emAndamento = false,
) {
  const permissoes = usePermissoes();
  const podeVerClima = temPermissao(permissoes, PERMISSOES.relatoriosMenu);
  const idValido = typeof id === "number" && Number.isSafeInteger(id) && id > 0;

  return useQuery({
    queryKey: comporChave(queryKeys.eventos, "climas", id),
    queryFn: () => obterClimaEvento(id as number),
    enabled: enabled && idValido && podeVerClima,
    retry: false,
    refetchInterval: emAndamento ? 60_000 : false,
  });
}
