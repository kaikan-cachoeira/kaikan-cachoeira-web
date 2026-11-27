import { useQuery } from "@tanstack/react-query";
import { comporChave, queryKeys } from "@/shared/query/keys";
import { carregarTodasPaginas } from "@/shared/lib/carregarTodasPaginas";
import { fimDoDiaISO, inicioDoDiaISO } from "@/features/eventos/utils/datas";
import { useEventosListaCompletaQuery } from "@/features/eventos";
import { listarTodosProdutos } from "@/features/inventario/services/inventario";
import { obterResumoFiados } from "@/features/caixa/services/fiados";
import { listarDoacoes } from "@/features/doacoes/services/doacoes";
import { listarProdutosMaisVendidos, obterRelatorioGeral } from "../services/relatorio";

async function listarTodasDoacoes(eventIds: string) {
  const items = await carregarTodasPaginas((page) =>
    listarDoacoes({
      eventIds,
      page,
      pageSize: 100,
    }),
  );

  return { items, total: items.length };
}

async function listarTodosProdutosEstoque() {
  return listarTodosProdutos();
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
  const reportParams = {
    dataInicio: filtros.from ? inicioDoDiaISO(filtros.from) || undefined : undefined,
    dataFim: filtros.to ? fimDoDiaISO(filtros.to) || undefined : undefined,
    tipos: eventTypes.length ? eventTypes.join(",") : undefined,
  };
  const relatorioGeralQuery = useQuery({
    queryKey: comporChave(queryKeys.eventos, "relatorio", "geral", reportParams),
    queryFn: () => obterRelatorioGeral(reportParams),
  });
  const eventosTodosQuery = useEventosListaCompletaQuery();
  const todosEventIds = (eventosTodosQuery.data || []).map((event) => event.id);

  const productsParams = {
    types: filtros.types.length ? filtros.types.join(",") : undefined,
    from: filtros.from || undefined,
    to: filtros.to || undefined,
    limit: 5,
  };
  const produtosQuery = useQuery({
    queryKey: comporChave(queryKeys.eventos, "relatorio", "produtos", productsParams),
    queryFn: () => listarProdutosMaisVendidos(productsParams),
  });

  const estoqueBaixoQuery = useQuery({
    queryKey: comporChave(queryKeys.eventos, "relatorio", "estoque-baixo"),
    queryFn: async () => {
      const produtos = await listarTodosProdutosEstoque();
      return produtos.filter(
        (produto) =>
          produto.estoqueMinimo !== null &&
          produto.estoqueMinimo !== undefined &&
          produto.quantidadeAtual <= produto.estoqueMinimo,
      ).length;
    },
  });
  const semEstoqueQuery = useQuery({
    queryKey: comporChave(queryKeys.eventos, "relatorio", "sem-estoque"),
    queryFn: async () => {
      const produtos = await listarTodosProdutosEstoque();
      return produtos.filter((produto) => produto.quantidadeAtual === 0).length;
    },
  });
  const fiadosQuery = useQuery({
    queryKey: comporChave(
      queryKeys.eventos,
      "relatorio",
      "fiados",
      todosEventIds.join(","),
    ),
    queryFn: () =>
      obterResumoFiados({
        status: "pending",
        eventIds: todosEventIds.join(","),
      }),
    enabled: todosEventIds.length > 0,
  });

  const eventIds = (relatorioGeralQuery.data?.itens || []).map(
    (event) => event.eventoId,
  );
  const donationsQuery = useQuery({
    queryKey: comporChave(queryKeys.eventos, "relatorio", "doacoes", eventIds),
    queryFn: () => listarTodasDoacoes(eventIds.join(",")),
    enabled: eventIds.length > 0,
  });

  return {
    relatorioGeralQuery,
    produtosQuery,
    estoqueBaixoQuery,
    semEstoqueQuery,
    fiadosQuery,
    donationsQuery,
  };
}
