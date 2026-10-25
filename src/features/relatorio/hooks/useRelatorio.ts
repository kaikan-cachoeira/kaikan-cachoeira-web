import { useQuery } from "@tanstack/react-query";
import { comporChave, queryKeys } from "@/shared/query/keys";
import { useEventosQuery } from "@/features/eventos";
import { listarProdutos } from "@/features/inventario/services/inventario";
import { listarFiados } from "@/features/caixa/services/fiados";
import { listarDoacoes } from "@/features/doacoes/services/doacoes";
import { listarProdutosMaisVendidos } from "../services/relatorio";

async function listarTodasDoacoes(eventIds: string) {
  const pageSize = 100;
  const firstPage = await listarDoacoes({ eventIds, page: 1, pageSize });
  const items = [...firstPage.items];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const response = await listarDoacoes({ eventIds, page, pageSize });
    items.push(...response.items);
  }

  return { items, total: firstPage.total };
}

export interface FiltrosRelatorio {
  from: string;
  to: string;
  types: string[];
}

export function useRelatorio(filtros: FiltrosRelatorio) {
  const eventTypes = filtros.types.map((tipo) =>
    tipo === "Reunião" ? "REUNIAO" : "EVENTO",
  );
  const eventParams = {
    statuses: "EM_ANDAMENTO,ENCERRADO",
    types: eventTypes.length ? eventTypes.join(",") : undefined,
    from: filtros.from || undefined,
    to: filtros.to || undefined,
    pageSize: 100,
  };
  const eventosQuery = useEventosQuery(eventParams);

  const productsParams = {
    types: filtros.types.length ? filtros.types.join(",") : undefined,
    from: eventParams.from,
    to: eventParams.to,
    limit: 5,
  };
  const produtosQuery = useQuery({
    queryKey: comporChave(queryKeys.eventos, "relatorio", "produtos", productsParams),
    queryFn: () => listarProdutosMaisVendidos(productsParams),
  });

  const estoqueBaixoQuery = useQuery({
    queryKey: comporChave(queryKeys.eventos, "relatorio", "estoque-baixo"),
    queryFn: async () => {
      const resposta = await listarProdutos({ stock: "low", pageSize: 1 });
      return resposta.total;
    },
  });
  const semEstoqueQuery = useQuery({
    queryKey: comporChave(queryKeys.eventos, "relatorio", "sem-estoque"),
    queryFn: async () => {
      const resposta = await listarProdutos({ stock: "out", pageSize: 1 });
      return resposta.total;
    },
  });
  const fiadosQuery = useQuery({
    queryKey: comporChave(queryKeys.eventos, "relatorio", "fiados"),
    queryFn: () => listarFiados({ status: "pending", pageSize: 1 }),
  });

  const events = eventosQuery.data?.items || [];
  const eventIds = events.map((event) => event.id);
  const donationsQuery = useQuery({
    queryKey: comporChave(queryKeys.eventos, "relatorio", "doacoes", eventIds),
    queryFn: () => listarTodasDoacoes(eventIds.join(",")),
    enabled: eventIds.length > 0,
  });

  return {
    eventosQuery,
    produtosQuery,
    estoqueBaixoQuery,
    semEstoqueQuery,
    fiadosQuery,
    donationsQuery,
  };
}
