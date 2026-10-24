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
  listarProdutos,
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

export function useProdutoQuery(id?: string | null) {
  return useQuery({
    queryKey: comporChave(queryKeys.produtos, "detalhe", id),
    queryFn: () => obterProduto(id as string),
    enabled: Boolean(id),
  });
}

export function useMovimentacoesLoteQuery(
  lotId: string | undefined,
  params: ParametrosPaginacao,
) {
  return useQuery({
    queryKey: comporChave(queryKeys.produtos, "lote", lotId, params),
    queryFn: () => listarMovimentacoesLote(lotId as string, params),
    enabled: Boolean(lotId),
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
    mutationFn: (payload: CriarProdutoPayload) => criarProduto(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.produtos });
    },
  });

  const atualizar = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AtualizarProdutoPayload;
    }) => atualizarProduto(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.produtos });
    },
  });

  const movimentar = useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string;
      payload: CriarMovimentacaoPayload;
    }) => criarMovimentacao(productId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.produtos });
      queryClient.invalidateQueries({
        queryKey: comporChave(queryKeys.produtos, "detalhe", variables.productId),
      });
    },
  });

  return {
    criarProduto: criar,
    atualizarProduto: atualizar,
    criarMovimentacao: movimentar,
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
      id: string;
      payload: AtualizarCategoriaPayload;
    }) => atualizarCategoria(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
      queryClient.invalidateQueries({ queryKey: queryKeys.produtos });
    },
  });

  const excluir = useMutation({
    mutationFn: (id: string) => excluirCategoria(id),
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
  const [detailsId, setDetailsId] = useState<string | null>(null);
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
      value: category.id,
      label: category.name,
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
