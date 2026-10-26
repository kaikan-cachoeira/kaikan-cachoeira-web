import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { comporChave, queryKeys } from "@/shared/query/keys";
import type { ParametrosPaginacao } from "@/shared/models/paginacao";
import type {
  AtualizarCategoriaPayload,
  CriarCategoriaPayload,
  CriarMovimentacaoPayload,
  CriarProdutoPayload,
  ParametrosProdutos,
  Produto,
  AtualizarProdutoPayload,
} from "../models";
import {
  atualizarCategoria,
  criarCategoria,
  excluirCategoria,
  listarCategorias,
} from "../services/categorias";
import {
  criarMovimentacao,
  criarProduto,
  excluirProduto,
  listarEventosReuniao,
  listarProdutos,
  listarTiposMovimentacao,
  listarLotesProduto,
  listarMovimentacoesProduto,
  obterProduto,
  atualizarProduto,
  listarMovimentacoesLote,
} from "../services/inventario";

export function useProdutosQuery(params: ParametrosProdutos) {
  return useQuery({
    queryKey: comporChave(queryKeys.produtos, params),
    queryFn: () => listarProdutos(params),
  });
}

export function useProdutoQuery(id?: number | null) {
  return useQuery({
    queryKey: comporChave(queryKeys.produtos, "detalhe", id),
    queryFn: () => obterProduto(id as number),
    enabled: Boolean(id),
  });
}

export function useMovimentacoesLoteQuery(
  lotId: number | undefined,
  params: ParametrosPaginacao,
) {
  return useQuery({
    queryKey: comporChave(queryKeys.produtos, "lote", lotId, params),
    queryFn: () => listarMovimentacoesLote(lotId as number, params),
    enabled: Boolean(lotId),
  });
}

export function useTiposMovimentacaoQuery() {
  return useQuery({
    queryKey: comporChave(queryKeys.produtos, "tipos-movimentacao"),
    queryFn: listarTiposMovimentacao,
  });
}

export function useReunioesQuery(enabled = true) {
  return useQuery({
    queryKey: comporChave(queryKeys.eventos, "reunioes-estoque"),
    queryFn: listarEventosReuniao,
    enabled,
  });
}

export function useLotesProdutoQuery(produtoId?: number | null) {
  return useQuery({
    queryKey: comporChave(queryKeys.produtos, "lotes", produtoId),
    queryFn: () => listarLotesProduto(produtoId as number),
    enabled: Boolean(produtoId),
  });
}

export function useMovimentacoesProdutoQuery(
  produtoId: number | undefined,
  params: ParametrosPaginacao,
) {
  return useQuery({
    queryKey: comporChave(queryKeys.produtos, "movimentacoes", produtoId, params),
    queryFn: () => listarMovimentacoesProduto(produtoId as number, params),
    enabled: Boolean(produtoId),
  });
}

export function useCategoriasQuery(search = "") {
  return useQuery({
    queryKey: comporChave(queryKeys.categorias, search),
    queryFn: () => listarCategorias(search),
  });
}

export function useProdutoMutations() {
  const queryClient = useQueryClient();

  const criar = useMutation({
    mutationFn: ({
      payload,
      arquivo,
    }: {
      payload: CriarProdutoPayload;
      arquivo?: File | null;
    }) => criarProduto(payload, arquivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.produtos });
    },
  });

  const atualizar = useMutation({
    mutationFn: ({
      id,
      payload,
      arquivo,
    }: {
      id: number;
      payload: AtualizarProdutoPayload;
      arquivo?: File | null;
    }) => atualizarProduto(id, payload, arquivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.produtos });
    },
  });

  const movimentar = useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: number;
      payload: CriarMovimentacaoPayload;
    }) => criarMovimentacao(productId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.produtos });
      queryClient.invalidateQueries({
        queryKey: comporChave(queryKeys.produtos, "detalhe", variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: comporChave(queryKeys.produtos, "lotes", variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: comporChave(queryKeys.produtos, "movimentacoes", variables.productId),
      });
    },
  });

  const excluir = useMutation({
    mutationFn: (id: number) => excluirProduto(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.produtos });
      queryClient.removeQueries({
        queryKey: comporChave(queryKeys.produtos, "detalhe", id),
      });
    },
  });

  return {
    criarProduto: criar,
    atualizarProduto: atualizar,
    criarMovimentacao: movimentar,
    excluirProduto: excluir,
  };
}

export function useCategoriaMutations() {
  const queryClient = useQueryClient();

  const criar = useMutation({
    mutationFn: (payload: CriarCategoriaPayload) => criarCategoria(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
    },
  });

  const atualizar = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: AtualizarCategoriaPayload;
    }) => atualizarCategoria(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
      queryClient.invalidateQueries({ queryKey: queryKeys.produtos });
    },
  });

  const excluir = useMutation({
    mutationFn: (id: number) => excluirCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
      queryClient.invalidateQueries({ queryKey: queryKeys.produtos });
    },
  });

  return {
    criarCategoria: criar,
    atualizarCategoria: atualizar,
    excluirCategoria: excluir,
  };
}

export function useInventario() {
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [stock, setStock] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Produto | null>(null);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [movementProduct, setMovementProduct] = useState<Produto | null>(null);
  const [movementSuccess, setMovementSuccess] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const [editProduct, setEditProduct] = useState<Produto | null>(null);
  const [updatedProduct, setUpdatedProduct] = useState<Produto | null>(null);

  const params = useMemo<ParametrosProdutos>(
    () => ({
      search,
      page,
      pageSize: 6,
      stock: stock || undefined,
      categoryIds: selectedCategories.length
        ? selectedCategories.join(",")
        : undefined,
    }),
    [search, page, stock, selectedCategories],
  );

  const produtosQuery = useProdutosQuery(params);
  const categoriasQuery = useCategoriasQuery();

  const categoryOptions = (categoriasQuery.data?.items || []).map(
    (category) => ({
      value: String(category.id),
      label: category.nome,
    }),
  );

  function runSearch() {
    setSearch(searchDraft.trim());
    setPage(1);
  }

  function clearFilters() {
    setSelectedCategories([]);
    setStock("");
    setPage(1);
  }

  function clearAll() {
    clearFilters();
    setSearchDraft("");
    setSearch("");
  }

  function openMovement(product: Produto) {
    setMovementProduct(product);
  }

  function handleMovementSuccess() {
    setMovementProduct(null);
    setMovementSuccess(true);
    setDetailsId(null);
  }

  return {
    searchDraft,
    setSearchDraft,
    search,
    page,
    filtersOpen,
    setFiltersOpen,
    selectedCategories,
    setSelectedCategories,
    stock,
    setStock,
    setPage,
    createOpen,
    setCreateOpen,
    createdProduct,
    setCreatedProduct,
    detailsId,
    setDetailsId,
    movementProduct,
    setMovementProduct,
    movementSuccess,
    setMovementSuccess,
    categoriesOpen,
    setCategoriesOpen,
    params,
    produtosQuery,
    categoriasQuery,
    categoryOptions,
    runSearch,
    clearFilters,
    clearAll,
    openMovement,
    handleMovementSuccess,
    editProduct, 
    setEditProduct, 
    updatedProduct, 
    setUpdatedProduct,
  };
}
