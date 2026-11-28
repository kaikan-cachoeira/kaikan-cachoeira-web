import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useClimaEventoQuery, type Evento } from "@/features/eventos";
import { PERMISSOES, temPermissao } from "@/shared/permissoes/permissoes";
import { usePermissoes } from "@/shared/permissoes/usePermissoes";
import { comporChave, queryKeys } from "@/shared/query/keys";
import { cruzarClimaEVendasPorHora } from "../domain/climaVendas";
import { listarTodasVendasEvento } from "../services/vendas";

export function useClimaVendas(evento?: Evento | null) {
  const permissoes = usePermissoes();
  const podeVerClima = temPermissao(permissoes, PERMISSOES.relatoriosMenu);
  const podeLerVendas = temPermissao(permissoes, PERMISSOES.eventosMenu);
  const id = evento?.id;
  const idValido = typeof id === "number" && Number.isSafeInteger(id) && id > 0;
  const habilitado =
    idValido && evento?.tipoEvento === "EVENTO" && podeVerClima;

  const emAndamento = evento?.status.codigo === "EM_ANDAMENTO";
  const climaQuery = useClimaEventoQuery(id, habilitado, emAndamento);
  const climaDisponivel = climaQuery.isSuccess && climaQuery.data.itens.length > 0;
  const vendasQuery = useQuery({
    queryKey: comporChave(queryKeys.vendas, "evento", id, "lista-completa"),
    queryFn: () => listarTodasVendasEvento(id as number),
    enabled: habilitado && podeLerVendas && climaDisponivel,
    retry: false,
    refetchInterval: emAndamento ? 60_000 : false,
  });

  const pontos = useMemo(() => {
    if (!habilitado || !climaQuery.data) return undefined;
    if (!climaQuery.data.itens.length) return [];
    if (!vendasQuery.isSuccess) return undefined;

    return cruzarClimaEVendasPorHora(
      id as number,
      climaQuery.data.itens,
      vendasQuery.data,
    );
  }, [habilitado, id, climaQuery.data, vendasQuery.data, vendasQuery.isSuccess]);

  return { climaQuery, vendasQuery, pontos };
}
